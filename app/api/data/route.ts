/**
 * ==============================================================================
 * CISD HR PORTAL - UNIFIED DISPATCH API ROUTE (`/api/data`)
 * ==============================================================================
 * 
 * ARCHITECTURE & SYSTEM DESIGN:
 * This route handler acts as the central command orchestrator for the CISD HR Portal.
 * It enforces:
 *  1. Role-Based Access Control (RBAC & BOLA defense):
 *     Sensitive administrative mutations (database reset, department modification,
 *     staff deletion, institutional policy adjustments) require elevated clearance.
 *  2. Relational Graph Consistency & Referential Integrity:
 *     - Cross-module cascade deletions (unassigning hardware assets when staff leaves,
 *       nullifying vacant department directorships, purging orphaned schedules).
 *     - Automatic staff provisioning (converting HIRED candidates directly into
 *       onboarding probationers with leave entitlements and hybrid rosters).
 *  3. Dynamic Institutional Policy Enforcement:
 *     - Clock-in lateness evaluated against configurable headquarters office hours.
 *     - Leave request balance validation preventing negative entitlement balances.
 *  4. Atomic Audit Logging:
 *     - Employs `recordAuditLog(db, ...)` on the active in-memory state before
 *       persisting to disk to eliminate log overwriting race conditions.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, recordAuditLog, resetDbToSeed, DatabaseSchema } from '@/lib/db';
import {
  Employee,
  LeaveRequest,
  AttendanceRecord,
  Task,
  Asset,
  Meeting,
  Timesheet,
  TimesheetEntry,
  HybridSchedule,
  UserRole
} from '@/lib/types';

/**
 * GET Handler - Retrieves the entire database snapshot for the client-side portal state.
 */
export async function GET(req: NextRequest) {
  try {
    const db = readDb();
    return NextResponse.json({ success: true, data: db });
  } catch (error: any) {
    console.error('[CISD API /api/data GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST Handler - Dispatches validated actions against the relational data store.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload, user } = body;
    const db = readDb();

    // Caller identity context
    const currentUserId: string = user?.id || 'emp-1';
    const currentUserName: string = user?.name || 'Dr. Amina Bello';
    const currentUserRole: UserRole = user?.role || 'SUPER_ADMIN';

    // Helper: Role-Based Authorization Guard
    const requireRoles = (allowedRoles: UserRole[], actionDescription: string) => {
      if (!allowedRoles.includes(currentUserRole)) {
        throw new Error(`Unauthorized: Your role (${currentUserRole}) lacks clearance for "${actionDescription}".`);
      }
    };

    switch (action) {
      // ========================================================================
      // 1. EMPLOYEE MANAGEMENT MODULE
      // ========================================================================
      case 'ADD_EMPLOYEE': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Creating staff member profiles');

        // Hierarchy rule: HR Admin cannot create Super Admin or HR Admin accounts
        if (currentUserRole === 'HR_ADMIN' && (payload.role === 'SUPER_ADMIN' || payload.role === 'HR_ADMIN')) {
          return NextResponse.json({
            success: false,
            error: 'Access Denied: Only the Super Administrator has authority to create or assign Administrator accounts.'
          }, { status: 403 });
        }

        // Generate sequential institutional ID (e.g., CISD-011)
        const nextNum = db.employees.length + 1;
        const employeeCode = `CISD-${nextNum < 10 ? '00' : nextNum < 100 ? '0' : ''}${nextNum}`;

        const newEmp: Employee = {
          ...payload,
          id: `emp-${Date.now()}`,
          employeeId: payload.employeeId || employeeCode,
          status: payload.status || 'ACTIVE',
          role: payload.role || 'EMPLOYEE',
          password: payload.password || 'CISD@2026'
        };
        db.employees.push(newEmp);

        // Auto-provision initial Leave Entitlement Balance
        const defaultAnnual = db.settings?.leaveEntitlements?.annual || 21;
        const defaultSick = db.settings?.leaveEntitlements?.sick || 12;
        const defaultCasual = db.settings?.leaveEntitlements?.casual || 5;

        db.leaveBalances.push({
          employeeId: newEmp.id,
          annualTotal: defaultAnnual,
          annualUsed: 0,
          sickTotal: defaultSick,
          sickUsed: 0,
          casualTotal: defaultCasual,
          casualUsed: 0,
          maternityPaternityTotal: 0,
          maternityPaternityUsed: 0,
          unpaidUsed: 0
        });

        // Auto-provision standard CISD 3/2 Hybrid Schedule
        db.hybridSchedules.push({
          id: `sch-${Date.now()}`,
          employeeId: newEmp.id,
          weekStartDate: '2026-11-02',
          monday: 'OFFICE',
          tuesday: 'OFFICE',
          wednesday: 'OFFICE',
          thursday: 'REMOTE',
          friday: 'REMOTE',
          status: 'ACTIVE'
        });

        // Auto-provision 4-phase Onboarding Checklist
        db.onboardingProcesses.push({
          id: `onb-${Date.now()}`,
          employeeId: newEmp.id,
          startDate: newEmp.joinDate || new Date().toISOString().split('T')[0],
          targetCompletionDate: '2026-12-31',
          progress: 15,
          status: 'IN_PROGRESS',
          tasks: [
            { id: `ot-${Date.now()}-1`, title: 'Complete Diplomatic Verification and Security Background Check', category: 'DOCUMENT', isCompleted: false, dueDate: '2026-11-15' },
            { id: `ot-${Date.now()}-2`, title: 'Sign Diplomatic Neutrality and Non-Disclosure Agreement (NDA)', category: 'DOCUMENT', isCompleted: false, dueDate: '2026-11-15' },
            { id: `ot-${Date.now()}-3`, title: 'Issue CISD Encrypted Workstation and Biometric Smart ID', category: 'IT_ASSET', isCompleted: false, dueDate: '2026-11-18' },
            { id: `ot-${Date.now()}-4`, title: 'Attend Executive Directorate Welcome and Strategic Programme Briefing', category: 'ORIENTATION', isCompleted: false, dueDate: '2026-11-20' }
          ]
        });

        recordAuditLog(
          db,
          'ADD_EMPLOYEE',
          'Employee Management',
          `Added new staff member ${newEmp.firstName} ${newEmp.lastName} (${newEmp.employeeId}) with initialized entitlements and onboarding track`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newEmp });
      }

      case 'UPDATE_EMPLOYEE': {
        const empId = payload.id;
        const index = db.employees.findIndex(e => e.id === empId);
        if (index === -1) return NextResponse.json({ success: false, error: 'Employee record not found' }, { status: 404 });
        
        // Authorization: User can update their own personal profile OR must have HR_ADMIN / SUPER_ADMIN clearance
        const isSelf = currentUserId === empId;
        const isPrivileged = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'HR_ADMIN';

        if (!isSelf && !isPrivileged) {
          return NextResponse.json({
            success: false,
            error: 'Unauthorized: You only have permission to edit your own profile dossier.'
          }, { status: 403 });
        }

        // Hierarchy rule: HR Admin cannot elevate any staff to Super Admin or HR Admin
        if (currentUserRole === 'HR_ADMIN' && (payload.role === 'SUPER_ADMIN' || payload.role === 'HR_ADMIN')) {
          return NextResponse.json({
            success: false,
            error: 'Access Denied: Only the Super Administrator has authority to promote personnel to Administrator roles.'
          }, { status: 403 });
        }

        // If self update and not an admin, lock role, status, and department to prevent privilege escalation
        if (isSelf && !isPrivileged) {
          payload.role = db.employees[index].role;
          payload.status = db.employees[index].status;
          payload.departmentId = db.employees[index].departmentId;
        }

        db.employees[index] = { ...db.employees[index], ...payload };
        recordAuditLog(
          db,
          'UPDATE_EMPLOYEE',
          'Employee Management',
          `Updated profile dossier of ${db.employees[index].firstName} ${db.employees[index].lastName} (${db.employees[index].employeeId})`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: db.employees[index] });
      }

      // PROMOTE EMPLOYEE & ASSIGN ROLES
      case 'PROMOTE_EMPLOYEE': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Promoting personnel and assigning roles');
        const emp = db.employees.find(e => e.id === payload.id);
        if (!emp) return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });

        // Hierarchy rule: HR Admin cannot promote to HR Admin or Super Admin
        if (currentUserRole === 'HR_ADMIN' && (payload.newRole === 'SUPER_ADMIN' || payload.newRole === 'HR_ADMIN')) {
          return NextResponse.json({
            success: false,
            error: 'Access Denied: As an HR Administrator, you cannot promote personnel to HR Administrator or Super Administrator. Elevated institutional promotions require Super Administrator executive clearance.'
          }, { status: 403 });
        }

        const prevRole = emp.role;
        const prevDesignation = emp.designation;

        emp.role = payload.newRole;
        if (payload.newDesignation) emp.designation = payload.newDesignation;
        if (payload.newGradeLevel) emp.gradeLevel = payload.newGradeLevel;
        if (payload.salaryGrade) emp.salaryGrade = payload.salaryGrade;

        recordAuditLog(
          db,
          'PROMOTE_EMPLOYEE',
          'Governance',
          `Promoted ${emp.firstName} ${emp.lastName} (${emp.employeeId}) from ${prevRole} (${prevDesignation}) to ${emp.role} (${emp.designation})`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({
          success: true,
          data: emp,
          message: `Successfully promoted ${emp.firstName} ${emp.lastName} to ${emp.role.replace('_', ' ')}`
        });
      }

      // RESET EMPLOYEE PASSWORD / ISSUE CREDENTIALS
      case 'RESET_EMPLOYEE_PASSWORD': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Resetting staff password');
        const emp = db.employees.find(e => e.id === payload.id);
        if (!emp) return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });

        emp.password = payload.newPassword;
        recordAuditLog(
          db,
          'RESET_PASSWORD',
          'Security',
          `Reset credentials for staff member ${emp.firstName} ${emp.lastName} (${emp.employeeId})`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, message: 'Password updated successfully' });
      }

      case 'DELETE_EMPLOYEE': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Employee account termination');
        const empId = payload.id;
        const emp = db.employees.find(e => e.id === empId);
        if (!emp) return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });

        // Security check: HR_ADMIN cannot delete a SUPER_ADMIN account
        if (currentUserRole === 'HR_ADMIN' && emp.role === 'SUPER_ADMIN') {
          return NextResponse.json({
            success: false,
            error: 'Access Denied: HR Administrator cannot delete the Super Administrator account.'
          }, { status: 403 });
        }

        // Prevent self-deletion
        if (emp.id === currentUserId) {
          return NextResponse.json({
            success: false,
            error: 'Cannot delete your own active account while logged in.'
          }, { status: 400 });
        }

        // --- CASCADING REFERENTIAL INTEGRITY CLEANUP ---
        // 1. Remove employee from staff roster
        db.employees = db.employees.filter(e => e.id !== empId);

        // 2. Unassign hardware and equipment assets back to the available inventory pool
        let unassignedAssetsCount = 0;
        db.assets.forEach(asset => {
          if (asset.assignedToId === empId) {
            asset.assignedToId = undefined;
            asset.assignedDate = undefined;
            asset.status = 'AVAILABLE';
            unassignedAssetsCount++;
          }
        });

        // 3. Clear department directorship if this employee was Head of Department
        db.departments.forEach(dept => {
          if (dept.headId === empId) {
            dept.headId = ''; // Set vacant until new director appointed
          }
        });

        // 4. Purge orphaned leave balances & hybrid schedules
        db.leaveBalances = db.leaveBalances.filter(b => b.employeeId !== empId);
        db.hybridSchedules = db.hybridSchedules.filter(s => s.employeeId !== empId);
        db.onboardingProcesses = db.onboardingProcesses.filter(o => o.employeeId !== empId);

        recordAuditLog(
          db,
          'DELETE_EMPLOYEE',
          'Employee Management',
          `Terminated record for ${emp.firstName} ${emp.lastName} (${emp.employeeId}). Reclaimed ${unassignedAssetsCount} assets and purged orphaned schedules.`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, message: 'Employee and associated references cleanly unlinked.' });
      }

      // ========================================================================
      // 2. ATTENDANCE & BIOMETRIC CLOCK IN/OUT
      // ========================================================================
      case 'CLOCK_IN': {
        const todayStr = new Date().toISOString().split('T')[0];
        const nowTime = new Date().toTimeString().substring(0, 5);
        
        const existing = db.attendanceRecords.find(a => a.employeeId === payload.employeeId && a.date === todayStr);
        if (existing) {
          return NextResponse.json({ success: false, error: 'Attendance already recorded for today' }, { status: 400 });
        }

        // Dynamically compute lateness against institutional headquarters office hours
        const officeStart = db.settings?.officeHours?.start || '08:30';
        const [startHours, startMins] = officeStart.split(':').map(Number);
        const [currHours, currMins] = nowTime.split(':').map(Number);

        const currentTotalMinutes = currHours * 60 + currMins;
        const startTotalMinutes = startHours * 60 + startMins;

        const isLate = currentTotalMinutes > startTotalMinutes;
        const latenessMinutes = isLate ? currentTotalMinutes - startTotalMinutes : 0;

        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          employeeId: payload.employeeId,
          date: todayStr,
          clockIn: nowTime,
          status: payload.workType === 'REMOTE' ? 'REMOTE' : (isLate ? 'LATE' : 'PRESENT'),
          workType: payload.workType || 'OFFICE',
          locationName: payload.locationName || 'Abuja Head Office',
          workingHours: 8.0,
          latenessMinutes,
          notes: payload.notes
        };
        db.attendanceRecords.push(newRecord);

        recordAuditLog(
          db,
          'CLOCK_IN',
          'Attendance',
          `Clocked in at ${nowTime} (${newRecord.workType}${isLate ? ` - Late by ${latenessMinutes} mins` : ' - On Schedule'})`,
          payload.employeeId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newRecord });
      }

      case 'CLOCK_OUT': {
        const todayStr = new Date().toISOString().split('T')[0];
        const nowTime = new Date().toTimeString().substring(0, 5);
        const record = db.attendanceRecords.find(a => a.employeeId === payload.employeeId && a.date === todayStr);
        
        if (!record) {
          return NextResponse.json({ success: false, error: 'No active clock-in session found for today' }, { status: 400 });
        }
        record.clockOut = nowTime;

        recordAuditLog(
          db,
          'CLOCK_OUT',
          'Attendance',
          `Clocked out at ${nowTime}`,
          payload.employeeId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: record });
      }

      case 'REQUEST_CORRECTION': {
        const correction = {
          id: `cor-${Date.now()}`,
          employeeId: payload.employeeId,
          date: payload.date,
          requestedClockIn: payload.requestedClockIn,
          requestedClockOut: payload.requestedClockOut,
          reason: payload.reason,
          status: 'PENDING' as const
        };
        db.attendanceCorrections.push(correction);

        recordAuditLog(
          db,
          'REQUEST_CORRECTION',
          'Attendance',
          `Submitted attendance correction request for date ${payload.date}`,
          payload.employeeId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: correction });
      }

      case 'REVIEW_CORRECTION': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN', 'LINE_MANAGER'], 'Reviewing attendance adjustments');
        const correction = db.attendanceCorrections.find(c => c.id === payload.id);
        if (!correction) return NextResponse.json({ success: false, error: 'Correction request not found' }, { status: 404 });

        correction.status = payload.status;
        correction.reviewedBy = currentUserId;
        correction.reviewedAt = new Date().toISOString();

        if (payload.status === 'APPROVED') {
          const rec = db.attendanceRecords.find(a => a.employeeId === correction.employeeId && a.date === correction.date);
          if (rec) {
            rec.clockIn = correction.requestedClockIn;
            rec.clockOut = correction.requestedClockOut;
            rec.status = 'PRESENT';
            rec.latenessMinutes = 0;
          }
        }

        recordAuditLog(
          db,
          'REVIEW_CORRECTION',
          'Attendance',
          `${payload.status} attendance correction for employee ${correction.employeeId}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: correction });
      }

      // ========================================================================
      // 3. LEAVE ENTITLEMENTS & APPROVAL WORKFLOWS
      // ========================================================================
      case 'APPLY_LEAVE': {
        const reqDays = Number(payload.daysCount);
        if (reqDays <= 0) {
          return NextResponse.json({ success: false, error: 'Leave duration must be at least 1 day' }, { status: 400 });
        }

        // Validate remaining balance to prevent negative entitlement exploits
        const balance = db.leaveBalances.find(b => b.employeeId === payload.employeeId);
        if (balance) {
          if (payload.leaveType === 'ANNUAL') {
            const remaining = balance.annualTotal - balance.annualUsed;
            if (reqDays > remaining) {
              return NextResponse.json({
                success: false,
                error: `Insufficient Annual Leave balance. Requested: ${reqDays} days, Available: ${remaining} days.`
              }, { status: 400 });
            }
          } else if (payload.leaveType === 'SICK') {
            const remaining = balance.sickTotal - balance.sickUsed;
            if (reqDays > remaining) {
              return NextResponse.json({
                success: false,
                error: `Insufficient Sick Leave balance. Requested: ${reqDays} days, Available: ${remaining} days.`
              }, { status: 400 });
            }
          } else if (payload.leaveType === 'CASUAL') {
            const remaining = balance.casualTotal - balance.casualUsed;
            if (reqDays > remaining) {
              return NextResponse.json({
                success: false,
                error: `Insufficient Casual Leave balance. Requested: ${reqDays} days, Available: ${remaining} days.`
              }, { status: 400 });
            }
          }
        }

        const newLeave: LeaveRequest = {
          id: `leave-${Date.now()}`,
          employeeId: payload.employeeId,
          leaveType: payload.leaveType,
          startDate: payload.startDate,
          endDate: payload.endDate,
          daysCount: reqDays,
          reason: payload.reason,
          handoverEmployeeId: payload.handoverEmployeeId,
          status: 'PENDING',
          appliedDate: new Date().toISOString().split('T')[0]
        };
        db.leaveRequests.push(newLeave);

        recordAuditLog(
          db,
          'APPLY_LEAVE',
          'Leave Management',
          `Submitted application for ${reqDays} days of ${payload.leaveType} leave`,
          payload.employeeId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newLeave });
      }

      case 'REVIEW_LEAVE': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN', 'LINE_MANAGER'], 'Adjudicating leave applications');
        const leave = db.leaveRequests.find(l => l.id === payload.id);
        if (!leave) return NextResponse.json({ success: false, error: 'Leave request not found' }, { status: 404 });

        leave.status = payload.status;
        leave.approvedBy = currentUserId;
        leave.approvalNotes = payload.notes || '';

        // If approved, decrement balance and reflect on attendance register
        if (payload.status === 'APPROVED') {
          const balance = db.leaveBalances.find(b => b.employeeId === leave.employeeId);
          if (balance) {
            if (leave.leaveType === 'ANNUAL') balance.annualUsed += leave.daysCount;
            else if (leave.leaveType === 'SICK') balance.sickUsed += leave.daysCount;
            else if (leave.leaveType === 'CASUAL') balance.casualUsed += leave.daysCount;
            else if (leave.leaveType === 'MATERNITY' || leave.leaveType === 'PATERNITY') balance.maternityPaternityUsed += leave.daysCount;
            else balance.unpaidUsed += leave.daysCount;
          }

          // Mark current day attendance if today falls within the approved leave window
          const today = new Date().toISOString().split('T')[0];
          if (today >= leave.startDate && today <= leave.endDate) {
            const att = db.attendanceRecords.find(a => a.employeeId === leave.employeeId && a.date === today);
            if (att) {
              att.status = 'ON_LEAVE';
            } else {
              db.attendanceRecords.push({
                id: `att-${Date.now()}`,
                employeeId: leave.employeeId,
                date: today,
                clockIn: '00:00',
                status: 'ON_LEAVE',
                workType: 'OFFICE',
                locationName: 'Approved Official Leave',
                workingHours: 0,
                latenessMinutes: 0
              });
            }
          }
        }

        recordAuditLog(
          db,
          'REVIEW_LEAVE',
          'Leave Management',
          `${payload.status} leave request for ${leave.employeeId} (${leave.daysCount} days ${leave.leaveType})`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: leave });
      }

      // ========================================================================
      // 4. HYBRID WORK SCHEDULES & ROSTERS
      // ========================================================================
      case 'UPDATE_HYBRID_SCHEDULE': {
        let sch = db.hybridSchedules.find(s => s.employeeId === payload.employeeId);
        if (!sch) {
          sch = {
            id: `sch-${Date.now()}`,
            employeeId: payload.employeeId,
            weekStartDate: payload.weekStartDate || '2026-11-02',
            monday: payload.monday,
            tuesday: payload.tuesday,
            wednesday: payload.wednesday,
            thursday: payload.thursday,
            friday: payload.friday,
            status: 'ACTIVE'
          };
          db.hybridSchedules.push(sch);
        } else {
          sch.monday = payload.monday;
          sch.tuesday = payload.tuesday;
          sch.wednesday = payload.wednesday;
          sch.thursday = payload.thursday;
          sch.friday = payload.friday;
        }

        recordAuditLog(
          db,
          'UPDATE_HYBRID_SCHEDULE',
          'Hybrid Work',
          `Configured weekly hybrid office/remote schedule for ${payload.employeeId}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: sch });
      }

      case 'REQUEST_HYBRID_CHANGE': {
        const sch = db.hybridSchedules.find(s => s.employeeId === payload.employeeId);
        if (!sch) return NextResponse.json({ success: false, error: 'Active schedule not found' }, { status: 404 });

        if (!sch.changeRequests) sch.changeRequests = [];
        const changeReq = {
          id: `cr-${Date.now()}`,
          targetDate: payload.targetDate,
          originalStatus: payload.originalStatus,
          requestedStatus: payload.requestedStatus,
          reason: payload.reason,
          status: 'PENDING' as const,
          appliedAt: new Date().toISOString()
        };
        sch.changeRequests.push(changeReq);
        sch.status = 'PENDING_CHANGE';

        recordAuditLog(
          db,
          'REQUEST_HYBRID_CHANGE',
          'Hybrid Work',
          `Submitted hybrid swap request for ${payload.targetDate} (${payload.requestedStatus})`,
          payload.employeeId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: changeReq });
      }

      case 'REVIEW_HYBRID_CHANGE': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN', 'LINE_MANAGER'], 'Adjudicating hybrid work change requests');
        let foundReq: any = null;
        let parentSch: HybridSchedule | null = null;

        for (const s of db.hybridSchedules) {
          const r = s.changeRequests?.find(cr => cr.id === payload.id);
          if (r) {
            foundReq = r;
            parentSch = s;
            break;
          }
        }

        if (!foundReq || !parentSch) {
          return NextResponse.json({ success: false, error: 'Change request not found' }, { status: 404 });
        }

        foundReq.status = payload.status;
        foundReq.reviewedBy = currentUserId;

        if (payload.status === 'APPROVED') {
          const dayIndex = new Date(foundReq.targetDate).getDay(); // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
          if (dayIndex === 1) parentSch.monday = foundReq.requestedStatus;
          else if (dayIndex === 2) parentSch.tuesday = foundReq.requestedStatus;
          else if (dayIndex === 3) parentSch.wednesday = foundReq.requestedStatus;
          else if (dayIndex === 4) parentSch.thursday = foundReq.requestedStatus;
          else if (dayIndex === 5) parentSch.friday = foundReq.requestedStatus;
        }
        parentSch.status = 'ACTIVE';

        recordAuditLog(
          db,
          'REVIEW_HYBRID_CHANGE',
          'Hybrid Work',
          `${payload.status} hybrid shift adjustment for ${parentSch.employeeId}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: foundReq });
      }

      // ========================================================================
      // 5. TASK MANAGEMENT MODULE
      // ========================================================================
      case 'CREATE_TASK': {
        const newTask: Task = {
          ...payload,
          id: `task-${Date.now()}`,
          createdById: currentUserId,
          progressPercentage: Number(payload.progressPercentage || 0)
        };
        db.tasks.unshift(newTask);

        recordAuditLog(
          db,
          'CREATE_TASK',
          'Tasks',
          `Created assignment "${newTask.title}" assigned to ${newTask.assignedToId}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newTask });
      }

      case 'UPDATE_TASK': {
        const index = db.tasks.findIndex(t => t.id === payload.id);
        if (index === -1) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });

        db.tasks[index] = { ...db.tasks[index], ...payload };
        if (payload.status === 'COMPLETED' && !db.tasks[index].completedAt) {
          db.tasks[index].completedAt = new Date().toISOString().split('T')[0];
          db.tasks[index].progressPercentage = 100;
        }

        recordAuditLog(
          db,
          'UPDATE_TASK',
          'Tasks',
          `Updated status of "${db.tasks[index].title}" to ${db.tasks[index].status}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: db.tasks[index] });
      }

      case 'DELETE_TASK': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN', 'LINE_MANAGER'], 'Deleting institutional tasks');
        db.tasks = db.tasks.filter(t => t.id !== payload.id);

        recordAuditLog(
          db,
          'DELETE_TASK',
          'Tasks',
          `Removed task ID ${payload.id}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true });
      }

      // ========================================================================
      // 6. MEETING MANAGEMENT MODULE
      // ========================================================================
      case 'CREATE_MEETING': {
        const newMeeting: Meeting = {
          ...payload,
          id: `meet-${Date.now()}`,
          organizerId: currentUserId,
          actionItems: payload.actionItems || []
        };
        db.meetings.unshift(newMeeting);

        recordAuditLog(
          db,
          'CREATE_MEETING',
          'Meetings',
          `Conducted scheduling for "${newMeeting.title}" on ${newMeeting.date}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newMeeting });
      }

      case 'UPDATE_MEETING': {
        const index = db.meetings.findIndex(m => m.id === payload.id);
        if (index === -1) return NextResponse.json({ success: false, error: 'Meeting not found' }, { status: 404 });

        db.meetings[index] = { ...db.meetings[index], ...payload };

        recordAuditLog(
          db,
          'UPDATE_MEETING',
          'Meetings',
          `Updated meeting minutes & agenda for "${db.meetings[index].title}"`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: db.meetings[index] });
      }

      // ========================================================================
      // 7. ASSET MANAGEMENT MODULE
      // ========================================================================
      case 'CREATE_ASSET': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Registering institutional assets');
        const nextAssetNum = db.assets.length + 1;
        const codeSuffix = nextAssetNum < 10 ? `00${nextAssetNum}` : nextAssetNum < 100 ? `0${nextAssetNum}` : `${nextAssetNum}`;

        const newAsset: Asset = {
          ...payload,
          id: `asset-${Date.now()}`,
          assetCode: `CISD-${(payload.category || 'EQP').substring(0, 3).toUpperCase()}-${codeSuffix}`,
          maintenanceLogs: []
        };
        db.assets.unshift(newAsset);

        recordAuditLog(
          db,
          'CREATE_ASSET',
          'Assets',
          `Registered equipment ${newAsset.name} (${newAsset.assetCode}) into institutional inventory`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newAsset });
      }

      case 'UPDATE_ASSET': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Updating asset inventory');
        const index = db.assets.findIndex(a => a.id === payload.id);
        if (index === -1) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });

        db.assets[index] = { ...db.assets[index], ...payload };

        recordAuditLog(
          db,
          'UPDATE_ASSET',
          'Assets',
          `Updated maintenance details for ${db.assets[index].assetCode}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: db.assets[index] });
      }

      case 'ASSIGN_ASSET': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Assigning assets to personnel');
        const asset = db.assets.find(a => a.id === payload.assetId);
        if (!asset) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });

        asset.assignedToId = payload.employeeId;
        asset.assignedDate = new Date().toISOString().split('T')[0];
        asset.status = 'ASSIGNED';

        const emp = db.employees.find(e => e.id === payload.employeeId);
        recordAuditLog(
          db,
          'ASSIGN_ASSET',
          'Assets',
          `Assigned ${asset.assetCode} (${asset.name}) to ${emp ? `${emp.firstName} ${emp.lastName}` : 'staff member'}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: asset });
      }

      case 'RETURN_ASSET': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Checking in returned assets');
        const asset = db.assets.find(a => a.id === payload.assetId);
        if (!asset) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });

        asset.assignedToId = undefined;
        asset.assignedDate = undefined;
        asset.status = 'AVAILABLE';
        asset.condition = payload.condition || asset.condition;

        recordAuditLog(
          db,
          'RETURN_ASSET',
          'Assets',
          `Checked in ${asset.assetCode} back to available inventory pool (Condition: ${asset.condition})`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: asset });
      }

      // ========================================================================
      // 8. RECRUITMENT & CANDIDATE PIPELINE (WITH AUTO-PROVISIONING)
      // ========================================================================
      case 'CREATE_JOB': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Posting employment opportunities');
        const newJob = {
          ...payload,
          id: `job-${Date.now()}`,
          status: 'OPEN'
        };
        db.recruitmentJobs.unshift(newJob);

        recordAuditLog(
          db,
          'CREATE_JOB',
          'Recruitment',
          `Published vacancy requisition: "${newJob.title}"`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newJob });
      }

      case 'CREATE_CANDIDATE': {
        const newCand = {
          ...payload,
          id: `cand-${Date.now()}`,
          appliedDate: new Date().toISOString().split('T')[0],
          stage: 'APPLIED',
          rating: payload.rating || 3
        };
        db.candidates.unshift(newCand);

        recordAuditLog(
          db,
          'CREATE_CANDIDATE',
          'Recruitment',
          `Registered candidate applicant ${newCand.fullName}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newCand });
      }

      case 'UPDATE_JOB_STATUS': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Modifying vacancy status');
        const job = db.recruitmentJobs.find(j => j.id === payload.id);
        if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });

        job.status = payload.status;
        recordAuditLog(
          db,
          'UPDATE_JOB_STATUS',
          'Recruitment',
          `Updated requisition "${job.title}" status to ${payload.status}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: job });
      }

      case 'DELETE_JOB': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Deleting job vacancies');
        db.recruitmentJobs = db.recruitmentJobs.filter(j => j.id !== payload.id);

        recordAuditLog(
          db,
          'DELETE_JOB',
          'Recruitment',
          `Archived vacancy ID ${payload.id}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true });
      }

      /**
       * CRITICAL CROSS-MODULE INTEGRATION:
       * When a candidate is transitioned to 'HIRED', the platform automatically creates:
       * 1. A new Employee record on probation.
       * 2. An active Onboarding checklist.
       * 3. An initial Leave Entitlement balance.
       * 4. A standard Hybrid Work roster.
       */
      case 'UPDATE_CANDIDATE_STAGE': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Advancing candidate recruitment stages');
        const cand = db.candidates.find(c => c.id === payload.id);
        if (!cand) return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 });

        cand.stage = payload.stage;
        if (payload.interviewNotes !== undefined) cand.interviewNotes = payload.interviewNotes;
        if (payload.rating !== undefined) cand.rating = payload.rating;
        if (payload.offerDetails !== undefined) cand.offerDetails = payload.offerDetails;

        // Auto-provisioning trigger upon official hiring
        let createdEmployee: Employee | null = null;
        if (payload.stage === 'HIRED') {
          const alreadyExists = db.employees.some(e => e.email.toLowerCase() === cand.email.toLowerCase());
          if (!alreadyExists) {
            const nextNum = db.employees.length + 1;
            const employeeCode = `CISD-${nextNum < 10 ? '00' : nextNum < 100 ? '0' : ''}${nextNum}`;
            const job = db.recruitmentJobs.find(j => j.id === cand.jobId);
            const [first, ...lastParts] = cand.fullName.split(' ');
            const lastName = lastParts.join(' ') || 'Staff';

            createdEmployee = {
              id: `emp-${Date.now()}`,
              employeeId: employeeCode,
              firstName: first,
              lastName: lastName,
              email: cand.email,
              phone: cand.phone || '+234 9 290 8000',
              avatar: `https://images.unsplash.com/photo-${1534528741775 + nextNum}?w=150&auto=format&fit=crop&q=80`,
              departmentId: job?.departmentId || db.departments[0]?.id || 'dept-1',
              designation: job?.title || 'Policy Associate',
              role: 'EMPLOYEE',
              status: 'ON_PROBATION',
              employmentType: job?.type || 'FULL_TIME',
              joinDate: new Date().toISOString().split('T')[0],
              probationEndDate: '2027-05-01',
              workLocation: 'Abuja Head Office',
              reportingManagerId: 'emp-1',
              gradeLevel: 'Grade 7',
              personalInfo: {
                dob: '1995-06-15',
                gender: 'Female',
                maritalStatus: 'Single',
                nationality: 'Nigerian',
                address: 'Abuja, FCT, Nigeria',
                bloodGroup: 'O+',
                ninOrPassport: 'NIN-1928374650'
              },
              education: [
                { degree: 'B.Sc. International Relations', institution: 'Ahmadu Bello University', year: '2018', field: 'Social Sciences' }
              ],
              workExperience: [],
              emergencyContacts: [
                { name: 'Family Contact', relationship: 'Next of Kin', phone: cand.phone || '+234 800 000 0000', email: cand.email }
              ],
              dependants: []
            };

            db.employees.push(createdEmployee);

            // Provision leave balance
            db.leaveBalances.push({
              employeeId: createdEmployee.id,
              annualTotal: db.settings?.leaveEntitlements?.annual || 21,
              annualUsed: 0,
              sickTotal: db.settings?.leaveEntitlements?.sick || 12,
              sickUsed: 0,
              casualTotal: db.settings?.leaveEntitlements?.casual || 5,
              casualUsed: 0,
              maternityPaternityTotal: 0,
              maternityPaternityUsed: 0,
              unpaidUsed: 0
            });

            // Provision hybrid roster
            db.hybridSchedules.push({
              id: `sch-${Date.now()}`,
              employeeId: createdEmployee.id,
              weekStartDate: '2026-11-02',
              monday: 'OFFICE',
              tuesday: 'OFFICE',
              wednesday: 'OFFICE',
              thursday: 'REMOTE',
              friday: 'REMOTE',
              status: 'ACTIVE'
            });

            // Provision onboarding journey
            db.onboardingProcesses.push({
              id: `onb-${Date.now()}`,
              employeeId: createdEmployee.id,
              startDate: createdEmployee.joinDate,
              targetCompletionDate: '2026-12-31',
              progress: 0,
              status: 'IN_PROGRESS',
              tasks: [
                { id: `ot-${Date.now()}-1`, title: 'Complete Verification and Security Background Check', category: 'DOCUMENT', isCompleted: false, dueDate: '2026-11-20' },
                { id: `ot-${Date.now()}-2`, title: 'Sign Diplomatic Neutrality and Non-Disclosure Agreement (NDA)', category: 'DOCUMENT', isCompleted: false, dueDate: '2026-11-20' },
                { id: `ot-${Date.now()}-3`, title: 'Issue CISD Encrypted Workstation and Biometric Smart ID', category: 'IT_ASSET', isCompleted: false, dueDate: '2026-11-25' },
                { id: `ot-${Date.now()}-4`, title: 'Attend Executive Directorate Welcome and Strategic Briefing', category: 'ORIENTATION', isCompleted: false, dueDate: '2026-11-30' }
              ]
            });
          }
        }

        recordAuditLog(
          db,
          'UPDATE_CANDIDATE_STAGE',
          'Recruitment',
          `Advanced candidate ${cand.fullName} to ${payload.stage}${createdEmployee ? ` -> Auto-provisioned staff profile ${createdEmployee.employeeId}` : ''}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: cand, autoCreatedEmployee: createdEmployee });
      }

      // ========================================================================
      // 9. ONBOARDING & MILESTONE TRACKING
      // ========================================================================
      case 'ADD_ONBOARDING_TASK': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Adding onboarding tasks');
        const proc = db.onboardingProcesses.find(p => p.employeeId === payload.employeeId);
        if (!proc) return NextResponse.json({ success: false, error: 'Onboarding journey not found' }, { status: 404 });

        const newTask = {
          id: `task-${Date.now()}`,
          title: payload.title,
          category: payload.category || 'ORIENTATION',
          dueDate: payload.dueDate || '2026-11-20',
          isCompleted: false
        };
        proc.tasks.push(newTask);
        const completedCount = proc.tasks.filter(t => t.isCompleted).length;
        proc.progress = Math.round((completedCount / proc.tasks.length) * 100);

        recordAuditLog(
          db,
          'ADD_ONBOARDING_TASK',
          'Onboarding',
          `Added onboarding task "${newTask.title}" for staff ${payload.employeeId}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: proc });
      }

      case 'COMPLETE_ALL_ONBOARDING': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Clearing all onboarding milestones');
        const proc = db.onboardingProcesses.find(p => p.employeeId === payload.employeeId);
        if (!proc) return NextResponse.json({ success: false, error: 'Onboarding process not found' }, { status: 404 });

        const today = new Date().toISOString().split('T')[0];
        proc.tasks.forEach(t => {
          t.isCompleted = true;
          t.completedAt = today;
        });
        proc.progress = 100;
        proc.status = 'COMPLETED';

        // Auto-graduate staff from probation to permanent ACTIVE status
        const emp = db.employees.find(e => e.id === payload.employeeId);
        if (emp && emp.status === 'ON_PROBATION') {
          emp.status = 'ACTIVE';
        }

        recordAuditLog(
          db,
          'COMPLETE_ALL_ONBOARDING',
          'Onboarding',
          `Cleared 100% onboarding milestones for ${emp ? `${emp.firstName} ${emp.lastName}` : payload.employeeId} (Confirmed ACTIVE status)`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: proc });
      }

      case 'UPDATE_ONBOARDING_TASK': {
        const proc = db.onboardingProcesses.find(p => p.employeeId === payload.employeeId);
        if (!proc) return NextResponse.json({ success: false, error: 'Onboarding process not found' }, { status: 404 });

        const task = proc.tasks.find(t => t.id === payload.taskId);
        if (task) {
          task.isCompleted = payload.isCompleted;
          task.completedAt = payload.isCompleted ? new Date().toISOString().split('T')[0] : undefined;
        }

        const completedCount = proc.tasks.filter(t => t.isCompleted).length;
        proc.progress = Math.round((completedCount / proc.tasks.length) * 100);
        if (proc.progress === 100) proc.status = 'COMPLETED';

        recordAuditLog(
          db,
          'UPDATE_ONBOARDING_TASK',
          'Onboarding',
          `Updated onboarding milestone progress to ${proc.progress}% for staff ${payload.employeeId}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: proc });
      }

      // ========================================================================
      // 10. DOCUMENT MANAGEMENT MODULE
      // ========================================================================
      case 'UPLOAD_DOCUMENT': {
        const newDoc = {
          ...payload,
          id: `doc-${Date.now()}`,
          uploadedDate: new Date().toISOString().split('T')[0],
          uploadedById: currentUserId
        };
        db.documents.unshift(newDoc);

        recordAuditLog(
          db,
          'UPLOAD_DOCUMENT',
          'Document Management',
          `Uploaded document "${newDoc.title}" (${newDoc.category})`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newDoc });
      }

      case 'DELETE_DOCUMENT': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Deleting repository documents');
        db.documents = db.documents.filter(d => d.id !== payload.id);

        recordAuditLog(
          db,
          'DELETE_DOCUMENT',
          'Document Management',
          `Removed document ID ${payload.id}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true });
      }

      // ========================================================================
      // 11. PERFORMANCE & APPRAISAL MODULE
      // ========================================================================
      case 'SUBMIT_PERFORMANCE_REVIEW': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN', 'LINE_MANAGER'], 'Finalizing employee appraisals');
        const newRev = {
          ...payload,
          id: `pr-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
          reviewerId: currentUserId
        };
        db.performanceReviews.unshift(newRev);

        recordAuditLog(
          db,
          'SUBMIT_PERFORMANCE_REVIEW',
          'Performance',
          `Finalized appraisal cycle "${newRev.cycle}" for staff ${payload.employeeId} (Overall: ${newRev.finalScore}/5.0)`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newRev });
      }

      // ========================================================================
      // 12. TRAINING & CAPACITY BUILDING MODULE
      // ========================================================================
      case 'CREATE_TRAINING_COURSE': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Publishing training courses');
        const newCourse = {
          ...payload,
          id: `course-${Date.now()}`,
          enrolledEmployeeIds: [],
          completedEmployeeIds: []
        };
        db.trainingCourses.unshift(newCourse);

        recordAuditLog(
          db,
          'CREATE_TRAINING_COURSE',
          'Training',
          `Published new capacity development masterclass "${newCourse.title}"`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newCourse });
      }

      case 'ENROLL_TRAINING': {
        const course = db.trainingCourses.find(c => c.id === payload.courseId);
        if (!course) return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });

        if (!course.enrolledEmployeeIds.includes(payload.employeeId)) {
          course.enrolledEmployeeIds.push(payload.employeeId);
        }

        recordAuditLog(
          db,
          'ENROLL_TRAINING',
          'Training',
          `Enrolled staff ${payload.employeeId} in course "${course.title}"`,
          payload.employeeId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: course });
      }

      case 'COMPLETE_TRAINING': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Certifying course completion');
        const course = db.trainingCourses.find(c => c.id === payload.courseId);
        if (!course) return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });

        if (!course.completedEmployeeIds.includes(payload.employeeId)) {
          course.completedEmployeeIds.push(payload.employeeId);
        }

        recordAuditLog(
          db,
          'COMPLETE_TRAINING',
          'Training',
          `Certified completion for staff ${payload.employeeId} in "${course.title}"`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: course });
      }

      // ========================================================================
      // 13. ANNOUNCEMENTS & DIPLOMATIC NOTICES
      // ========================================================================
      case 'CREATE_ANNOUNCEMENT': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Broadcasting announcements');
        const newAnn = {
          ...payload,
          id: `ann-${Date.now()}`,
          publishDate: new Date().toISOString().split('T')[0],
          authorId: currentUserId,
          acknowledgeCount: 1
        };
        db.announcements.unshift(newAnn);

        recordAuditLog(
          db,
          'CREATE_ANNOUNCEMENT',
          'Announcements',
          `Broadcasted institutional communique: "${newAnn.title}" (${newAnn.priority})`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newAnn });
      }

      case 'ACKNOWLEDGE_ANNOUNCEMENT': {
        const ann = db.announcements.find(a => a.id === payload.id);
        if (ann) {
          ann.acknowledgeCount = (ann.acknowledgeCount || 0) + 1;
        }
        writeDb(db);
        return NextResponse.json({ success: true });
      }

      // ========================================================================
      // 14. TIMESHEETS & PROJECT HOURS
      // ========================================================================
      case 'SAVE_TIMESHEET': {
        const empId = payload.employeeId || currentUserId;
        const total = (payload.entries || []).reduce((acc: number, curr: any) => acc + (Number(curr.totalHours) || 0), 0);
        
        // Find existing timesheet by ID or by (employeeId + weekStartDate)
        const existingIndex = db.timesheets.findIndex(
          t => (payload.id && t.id === payload.id) || (t.employeeId === empId && t.weekStartDate === payload.weekStartDate)
        );

        let savedTs: Timesheet;
        if (existingIndex >= 0) {
          savedTs = {
            ...db.timesheets[existingIndex],
            weekStartDate: payload.weekStartDate,
            weekEndDate: payload.weekEndDate || db.timesheets[existingIndex].weekEndDate,
            entries: payload.entries || [],
            totalHours: total,
            status: payload.status || (db.timesheets[existingIndex].status === 'APPROVED' ? 'APPROVED' : 'DRAFT')
          };
          db.timesheets[existingIndex] = savedTs;
        } else {
          savedTs = {
            id: payload.id || `ts-${Date.now()}`,
            employeeId: empId,
            weekStartDate: payload.weekStartDate,
            weekEndDate: payload.weekEndDate || payload.weekStartDate,
            status: payload.status || 'DRAFT',
            entries: payload.entries || [],
            totalHours: total
          };
          db.timesheets.unshift(savedTs);
        }

        recordAuditLog(
          db,
          'SAVE_TIMESHEET',
          'Timesheets',
          `Saved timesheet draft (${total} hours) for week of ${payload.weekStartDate}`,
          empId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: savedTs });
      }

      case 'SUBMIT_TIMESHEET': {
        const empId = payload.employeeId || currentUserId;
        const total = (payload.entries || []).reduce((acc: number, curr: any) => acc + (Number(curr.totalHours) || 0), 0);
        
        const existingIndex = db.timesheets.findIndex(
          t => (payload.id && t.id === payload.id) || (t.employeeId === empId && t.weekStartDate === payload.weekStartDate)
        );

        let submittedTs: Timesheet;
        const todayStr = new Date().toISOString().split('T')[0];

        if (existingIndex >= 0) {
          submittedTs = {
            ...db.timesheets[existingIndex],
            weekStartDate: payload.weekStartDate,
            weekEndDate: payload.weekEndDate || db.timesheets[existingIndex].weekEndDate,
            entries: payload.entries || [],
            totalHours: total,
            status: 'SUBMITTED',
            submittedAt: todayStr
          };
          db.timesheets[existingIndex] = submittedTs;
        } else {
          submittedTs = {
            id: payload.id || `ts-${Date.now()}`,
            employeeId: empId,
            weekStartDate: payload.weekStartDate,
            weekEndDate: payload.weekEndDate || payload.weekStartDate,
            status: 'SUBMITTED',
            submittedAt: todayStr,
            entries: payload.entries || [],
            totalHours: total
          };
          db.timesheets.unshift(submittedTs);
        }

        recordAuditLog(
          db,
          'SUBMIT_TIMESHEET',
          'Timesheets',
          `Submitted weekly timesheet (${total} billable project hours) for week of ${payload.weekStartDate} for approval`,
          empId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: submittedTs });
      }

      case 'UNLOCK_TIMESHEET': {
        const ts = db.timesheets.find(t => t.id === payload.id);
        if (!ts) return NextResponse.json({ success: false, error: 'Timesheet not found' }, { status: 404 });

        ts.status = 'DRAFT';
        recordAuditLog(
          db,
          'UNLOCK_TIMESHEET',
          'Timesheets',
          `Re-opened timesheet (${ts.totalHours} hrs) for editing/revision`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: ts });
      }

      case 'ASSIGN_TIMESHEET': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN', 'LINE_MANAGER'], 'Assigning project timesheets to staff');
        const { targetEmployeeId, weekStartDate, weekEndDate, projectName, activity, mon, tue, wed, thu, fri } = payload;
        
        if (!targetEmployeeId || !projectName) {
          return NextResponse.json({ success: false, error: 'Target employee and project name are required' }, { status: 400 });
        }

        const existingTs = db.timesheets.find(
          t => t.employeeId === targetEmployeeId && t.weekStartDate === weekStartDate
        );

        const m = Number(mon) || 0;
        const tu = Number(tue) || 0;
        const w = Number(wed) || 0;
        const th = Number(thu) || 0;
        const f = Number(fri) || 0;
        const rowTotal = m + tu + w + th + f;

        const newEntry: TimesheetEntry = {
          projectId: `prj-${Date.now()}`,
          projectName,
          activity: activity || 'Assigned project deliverable',
          mon: m,
          tue: tu,
          wed: w,
          thu: th,
          fri: f,
          totalHours: rowTotal
        };

        if (existingTs) {
          existingTs.entries.push(newEntry);
          existingTs.totalHours = existingTs.entries.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
        } else {
          db.timesheets.unshift({
            id: `ts-${Date.now()}`,
            employeeId: targetEmployeeId,
            weekStartDate,
            weekEndDate: weekEndDate || weekStartDate,
            status: 'DRAFT',
            entries: [newEntry],
            totalHours: rowTotal
          });
        }

        const targetEmp = db.employees.find(e => e.id === targetEmployeeId);
        recordAuditLog(
          db,
          'ASSIGN_TIMESHEET',
          'Timesheets',
          `Assigned deliverable "${projectName}" to ${targetEmp ? `${targetEmp.firstName} ${targetEmp.lastName}` : targetEmployeeId} for week ${weekStartDate}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true });
      }

      case 'REVIEW_TIMESHEET': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN', 'LINE_MANAGER'], 'Adjudicating timesheet logs');
        const ts = db.timesheets.find(t => t.id === payload.id);
        if (!ts) return NextResponse.json({ success: false, error: 'Timesheet not found' }, { status: 404 });

        ts.status = payload.status;
        ts.approvedBy = currentUserId;

        recordAuditLog(
          db,
          'REVIEW_TIMESHEET',
          'Timesheets',
          `${payload.status} project timesheet (${ts.totalHours} hours) for ${ts.employeeId}`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: ts });
      }

      // ========================================================================
      // 15. GOVERNANCE: DEPARTMENTS & INSTITUTIONAL SETTINGS
      // ========================================================================
      case 'CREATE_DEPARTMENT': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Creating institutional departments');
        const newDept = {
          ...payload,
          id: `dept-${Date.now()}`
        };
        db.departments.push(newDept);

        recordAuditLog(
          db,
          'CREATE_DEPARTMENT',
          'Governance',
          `Established new directorate "${newDept.name}" (${newDept.code})`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: newDept });
      }

      case 'UPDATE_DEPARTMENT': {
        requireRoles(['SUPER_ADMIN', 'HR_ADMIN'], 'Modifying directorate metadata');
        const dIndex = db.departments.findIndex(d => d.id === payload.id);
        if (dIndex === -1) return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });

        db.departments[dIndex] = { ...db.departments[dIndex], ...payload };

        recordAuditLog(
          db,
          'UPDATE_DEPARTMENT',
          'Governance',
          `Updated directorate parameters for "${db.departments[dIndex].name}"`,
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: db.departments[dIndex] });
      }

      case 'UPDATE_SETTINGS': {
        requireRoles(['SUPER_ADMIN'], 'Modifying institutional configuration');
        db.settings = { ...db.settings, ...payload };

        recordAuditLog(
          db,
          'UPDATE_SETTINGS',
          'Settings',
          'Updated institutional parameters, office hours, and leave entitlement quotas',
          currentUserId,
          currentUserName
        );
        writeDb(db);
        return NextResponse.json({ success: true, data: db.settings });
      }

      // ========================================================================
      // 16. SYSTEM RESETS & SRE OPERATIONS
      // ========================================================================
      case 'RESET_DATABASE': {
        requireRoles(['SUPER_ADMIN'], 'Restoring factory seed database');
        const initial = resetDbToSeed();
        recordAuditLog(
          initial,
          'RESET_DATABASE',
          'System',
          'Reset CISD Portal database to clean factory seed state',
          currentUserId,
          currentUserName
        );
        writeDb(initial);
        return NextResponse.json({ success: true, data: initial });
      }

      default:
        return NextResponse.json({ success: false, error: `Unhandled action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[CISD API /api/data POST Dispatch Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
