/**
 * ==============================================================================
 * CISD HR PORTAL - SQLITE RELATIONAL DATABASE ENGINE
 * ==============================================================================
 * 
 * ARCHITECTURAL SPECIFICATION:
 * - Engine: better-sqlite3 with WAL (Write-Ahead Logging) mode enabled.
 * - Storage: `data/cisd.sqlite` on the local persistent filesystem.
 * - Concurrency: Non-blocking reads while writing, thread-safe synchronous I/O.
 * - Foreign Keys: Enabled with PRAGMA foreign_keys = ON.
 * - Transactions: Atomic multi-table updates (e.g., Hiring pipeline auto-provisions
 *   employee, leave balance, hybrid roster, and onboarding tasks in 1 transaction).
 * ==============================================================================
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  Department,
  Employee,
  AttendanceRecord,
  AttendanceCorrection,
  LeaveRequest,
  LeaveBalance,
  HybridSchedule,
  Task,
  Meeting,
  Asset,
  RecruitmentJob,
  Candidate,
  OnboardingProcess,
  DocumentRecord,
  PerformanceReview,
  TrainingCourse,
  Announcement,
  Timesheet,
  OrganizationSettings,
  SystemAuditLog
} from './types';
import {
  initialDepartments,
  initialEmployees,
  initialAttendanceRecords,
  initialAttendanceCorrections,
  initialLeaveBalances,
  initialLeaveRequests,
  initialHybridSchedules,
  initialTasks,
  initialMeetings,
  initialAssets,
  initialRecruitmentJobs,
  initialCandidates,
  initialOnboardingProcesses,
  initialDocuments,
  initialPerformanceReviews,
  initialTrainingCourses,
  initialAnnouncements,
  initialTimesheets,
  initialSettings,
  initialAuditLogs
} from './initial-data';
import { DatabaseSchema } from './db';

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? '/tmp/cisd-data' : path.join(process.cwd(), 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'cisd.sqlite');

let dbInstance: Database.Database | null = null;

/**
 * Ensures the data directory exists
 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // When running on Vercel serverless, copy the pre-seeded SQLite file to /tmp on cold start
  if (isVercel && !fs.existsSync(SQLITE_FILE)) {
    const seedSqlite = path.join(process.cwd(), 'data', 'cisd.sqlite');
    if (fs.existsSync(seedSqlite)) {
      try {
        fs.copyFileSync(seedSqlite, SQLITE_FILE);
      } catch (e) {
        console.warn('[Vercel Setup] Could not copy seed sqlite to /tmp:', e);
      }
    }
  }
}

/**
 * Retrieves or initializes the SQLite database singleton
 */
export function getSqliteDb(): Database.Database {
  if (dbInstance) return dbInstance;

  ensureDataDir();
  dbInstance = new Database(SQLITE_FILE);

  // Performance and concurrency tuning
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');
  dbInstance.pragma('synchronous = NORMAL');

  initSqliteSchema(dbInstance);
  return dbInstance;
}

/**
 * Creates all normalized relational tables if they do not exist
 */
function initSqliteSchema(db: Database.Database): void {
  db.exec(`
    -- 1. DEPARTMENTS
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      head_id TEXT,
      description TEXT,
      location TEXT,
      budget TEXT,
      organization_arm TEXT
    );

    -- 2. EMPLOYEES
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      employee_id TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      avatar TEXT,
      department_id TEXT,
      designation TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      employment_type TEXT NOT NULL,
      join_date TEXT NOT NULL,
      probation_end_date TEXT,
      work_location TEXT,
      reporting_manager_id TEXT,
      grade_level TEXT,
      salary_grade TEXT,
      password TEXT,
      organization_arm TEXT,
      access_level TEXT,
      personal_info TEXT,
      education TEXT,
      work_experience TEXT,
      emergency_contacts TEXT,
      dependants TEXT
    );

    -- 3. ATTENDANCE RECORDS
    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      clock_in TEXT NOT NULL,
      clock_out TEXT,
      status TEXT NOT NULL,
      work_type TEXT NOT NULL,
      location_name TEXT,
      working_hours REAL DEFAULT 8.0,
      lateness_minutes INTEGER DEFAULT 0,
      notes TEXT
    );

    -- 4. ATTENDANCE CORRECTIONS
    CREATE TABLE IF NOT EXISTS attendance_corrections (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      requested_clock_in TEXT NOT NULL,
      requested_clock_out TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL,
      reviewed_by TEXT,
      reviewed_at TEXT
    );

    -- 5. LEAVE BALANCES
    CREATE TABLE IF NOT EXISTS leave_balances (
      employee_id TEXT PRIMARY KEY,
      annual_total INTEGER DEFAULT 21,
      annual_used INTEGER DEFAULT 0,
      sick_total INTEGER DEFAULT 12,
      sick_used INTEGER DEFAULT 0,
      casual_total INTEGER DEFAULT 5,
      casual_used INTEGER DEFAULT 0,
      maternity_paternity_total INTEGER DEFAULT 0,
      maternity_paternity_used INTEGER DEFAULT 0,
      unpaid_used INTEGER DEFAULT 0
    );

    -- 6. LEAVE REQUESTS
    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days_count INTEGER NOT NULL,
      reason TEXT NOT NULL,
      handover_employee_id TEXT,
      status TEXT NOT NULL,
      applied_date TEXT NOT NULL,
      approved_by TEXT,
      approval_notes TEXT
    );

    -- 7. HYBRID SCHEDULES
    CREATE TABLE IF NOT EXISTS hybrid_schedules (
      id TEXT PRIMARY KEY,
      employee_id TEXT UNIQUE NOT NULL,
      week_start_date TEXT NOT NULL,
      monday TEXT NOT NULL,
      tuesday TEXT NOT NULL,
      wednesday TEXT NOT NULL,
      thursday TEXT NOT NULL,
      friday TEXT NOT NULL,
      status TEXT NOT NULL,
      change_requests TEXT
    );

    -- 8. TASKS
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      department_id TEXT NOT NULL DEFAULT 'dept-1',
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      due_date TEXT NOT NULL,
      assigned_to_id TEXT NOT NULL,
      created_by_id TEXT NOT NULL,
      progress_percentage INTEGER DEFAULT 0,
      project_tag TEXT,
      completed_at TEXT
    );

    -- 9. MEETINGS
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT NOT NULL,
      is_virtual INTEGER DEFAULT 0,
      virtual_link TEXT,
      organizer_id TEXT NOT NULL,
      participant_ids TEXT NOT NULL,
      minutes TEXT,
      action_items TEXT
    );

    -- 10. ASSETS
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      asset_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      serial_number TEXT NOT NULL,
      acquisition_date TEXT NOT NULL,
      assigned_to_id TEXT,
      assigned_date TEXT,
      condition TEXT NOT NULL,
      status TEXT NOT NULL,
      location TEXT NOT NULL,
      maintenance_logs TEXT
    );

    -- 11. RECRUITMENT JOBS
    CREATE TABLE IF NOT EXISTS recruitment_jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department_id TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      experience TEXT NOT NULL,
      openings INTEGER DEFAULT 1,
      deadline TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      salary_range TEXT NOT NULL
    );

    -- 12. CANDIDATES
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      applied_date TEXT NOT NULL,
      stage TEXT NOT NULL,
      resume_url TEXT,
      interview_notes TEXT,
      rating INTEGER DEFAULT 3,
      offer_details TEXT
    );

    -- 13. ONBOARDING PROCESSES
    CREATE TABLE IF NOT EXISTS onboarding_processes (
      id TEXT PRIMARY KEY,
      employee_id TEXT UNIQUE NOT NULL,
      start_date TEXT NOT NULL,
      target_completion_date TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      status TEXT NOT NULL,
      tasks TEXT NOT NULL
    );

    -- 14. DOCUMENTS
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size TEXT NOT NULL,
      uploaded_date TEXT NOT NULL,
      uploaded_by_id TEXT NOT NULL,
      employee_id TEXT,
      is_company_wide INTEGER DEFAULT 0,
      download_url TEXT NOT NULL,
      description TEXT
    );

    -- 15. PERFORMANCE REVIEWS
    CREATE TABLE IF NOT EXISTS performance_reviews (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      reviewer_id TEXT NOT NULL,
      cycle TEXT NOT NULL,
      status TEXT NOT NULL,
      self_rating REAL DEFAULT 0,
      manager_rating REAL DEFAULT 0,
      kpi_ratings TEXT,
      strengths TEXT,
      areas_for_growth TEXT,
      development_plan TEXT,
      final_score REAL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- 16. TRAINING COURSES
    CREATE TABLE IF NOT EXISTS training_courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      code TEXT NOT NULL,
      category TEXT NOT NULL,
      instructor TEXT NOT NULL,
      duration_hours REAL NOT NULL,
      schedule_date TEXT NOT NULL,
      max_participants INTEGER NOT NULL,
      enrolled_employee_ids TEXT NOT NULL,
      completed_employee_ids TEXT NOT NULL,
      description TEXT NOT NULL
    );

    -- 17. ANNOUNCEMENTS
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT NOT NULL,
      publish_date TEXT NOT NULL,
      author_id TEXT NOT NULL,
      target_department_id TEXT,
      target_arm TEXT,
      acknowledge_count INTEGER DEFAULT 0
    );

    -- 18. TIMESHEETS
    CREATE TABLE IF NOT EXISTS timesheets (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      week_start_date TEXT NOT NULL,
      week_end_date TEXT NOT NULL,
      status TEXT NOT NULL,
      submitted_at TEXT,
      approved_by TEXT,
      entries TEXT NOT NULL,
      total_hours REAL DEFAULT 0
    );

    -- 19. ORGANIZATION SETTINGS
    CREATE TABLE IF NOT EXISTS organization_settings (
      id TEXT PRIMARY KEY,
      settings_json TEXT NOT NULL
    );

    -- 20. SYSTEM AUDIT LOGS
    CREATE TABLE IF NOT EXISTS system_audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT NOT NULL
    );

    -- INDEXES FOR PERFORMANCE
    CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance_records(employee_id, date);
    CREATE INDEX IF NOT EXISTS idx_leave_emp ON leave_requests(employee_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assigned_to_id);
    CREATE INDEX IF NOT EXISTS idx_assets_assigned ON assets(assigned_to_id);
    CREATE INDEX IF NOT EXISTS idx_audit_time ON system_audit_logs(timestamp);
  `);

  // Migrations: Ensure newer columns exist
  try { db.exec('ALTER TABLE employees ADD COLUMN password TEXT;'); } catch (_) {}
  try { db.exec('ALTER TABLE employees ADD COLUMN organization_arm TEXT;'); } catch (_) {}
  try { db.exec('ALTER TABLE employees ADD COLUMN access_level TEXT;'); } catch (_) {}
  try { db.exec('ALTER TABLE departments ADD COLUMN organization_arm TEXT;'); } catch (_) {}
  try { db.exec('ALTER TABLE announcements ADD COLUMN target_arm TEXT;'); } catch (_) {}

  // Auto-seed or upgrade migration
  let shouldReseed = false;
  const count = db.prepare('SELECT count(*) as c FROM employees').get() as { c: number };
  if (count.c === 0) {
    shouldReseed = true;
  } else {
    // Check if legacy persona 'Dr. Amina' exists
    const legacy = db.prepare("SELECT count(*) as c FROM employees WHERE email = 'amina.bello@cisdialogue.org'").get() as { c: number };
    if (legacy.c > 0) {
      shouldReseed = true;
    }
  }

  if (shouldReseed) {
    console.log('[CISD SQLite Migration] Seeding tripartite organization roster (Switch, CISD, GX Media)...');
    seedSqliteDatabase(db);
    try {
      db.pragma('user_version = 1');
      db.pragma('wal_checkpoint(TRUNCATE)');
    } catch (_) {}
  }
}

/**
 * Seeds the SQLite tables with initial fictional institutional data
 */
export function seedSqliteDatabase(db: Database.Database): void {
  const seedTx = db.transaction(() => {
    // Clear all existing records
    db.prepare('DELETE FROM departments').run();
    db.prepare('DELETE FROM employees').run();
    db.prepare('DELETE FROM attendance_records').run();
    db.prepare('DELETE FROM attendance_corrections').run();
    db.prepare('DELETE FROM leave_balances').run();
    db.prepare('DELETE FROM leave_requests').run();
    db.prepare('DELETE FROM hybrid_schedules').run();
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM meetings').run();
    db.prepare('DELETE FROM assets').run();
    db.prepare('DELETE FROM recruitment_jobs').run();
    db.prepare('DELETE FROM candidates').run();
    db.prepare('DELETE FROM onboarding_processes').run();
    db.prepare('DELETE FROM documents').run();
    db.prepare('DELETE FROM performance_reviews').run();
    db.prepare('DELETE FROM training_courses').run();
    db.prepare('DELETE FROM announcements').run();
    db.prepare('DELETE FROM timesheets').run();
    db.prepare('DELETE FROM organization_settings').run();
    db.prepare('DELETE FROM system_audit_logs').run();

    // 1. Departments
    const insertDept = db.prepare(`
      INSERT INTO departments (id, name, code, head_id, description, location, budget, organization_arm)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of initialDepartments) {
      insertDept.run(d.id, d.name, d.code, d.headId, d.description, d.location, d.budget, d.organizationArm || null);
    }

    // 2. Employees
    const insertEmp = db.prepare(`
      INSERT INTO employees (
        id, employee_id, first_name, last_name, email, phone, avatar,
        department_id, designation, role, status, employment_type, join_date,
        probation_end_date, work_location, reporting_manager_id, grade_level,
        salary_grade, password, organization_arm, access_level, personal_info, education, work_experience, emergency_contacts, dependants
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const e of initialEmployees) {
      insertEmp.run(
        e.id, e.employeeId, e.firstName, e.lastName, e.email, e.phone, e.avatar,
        e.departmentId, e.designation, e.role, e.status, e.employmentType, e.joinDate,
        e.probationEndDate || null, e.workLocation, e.reportingManagerId || null, e.gradeLevel,
        e.salaryGrade || null,
        e.password || null,
        e.organizationArm || null,
        e.accessLevel || null,
        JSON.stringify(e.personalInfo),
        JSON.stringify(e.education),
        JSON.stringify(e.workExperience),
        JSON.stringify(e.emergencyContacts),
        JSON.stringify(e.dependants)
      );
    }

    // 3. Attendance
    const insertAtt = db.prepare(`
      INSERT INTO attendance_records (
        id, employee_id, date, clock_in, clock_out, status, work_type, location_name, working_hours, lateness_minutes, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of initialAttendanceRecords) {
      insertAtt.run(a.id, a.employeeId, a.date, a.clockIn, a.clockOut || null, a.status, a.workType, a.locationName, a.workingHours, a.latenessMinutes, a.notes || null);
    }

    // 4. Corrections
    const insertCorr = db.prepare(`
      INSERT INTO attendance_corrections (
        id, employee_id, date, requested_clock_in, requested_clock_out, reason, status, reviewed_by, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of initialAttendanceCorrections) {
      insertCorr.run(c.id, c.employeeId, c.date, c.requestedClockIn, c.requestedClockOut, c.reason, c.status, c.reviewedBy || null, c.reviewedAt || null);
    }

    // 5. Leave Balances
    const insertBal = db.prepare(`
      INSERT INTO leave_balances (
        employee_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used,
        maternity_paternity_total, maternity_paternity_used, unpaid_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const b of initialLeaveBalances) {
      insertBal.run(b.employeeId, b.annualTotal, b.annualUsed, b.sickTotal, b.sickUsed, b.casualTotal, b.casualUsed, b.maternityPaternityTotal, b.maternityPaternityUsed, b.unpaidUsed);
    }

    // 6. Leave Requests
    const insertReq = db.prepare(`
      INSERT INTO leave_requests (
        id, employee_id, leave_type, start_date, end_date, days_count, reason,
        handover_employee_id, status, applied_date, approved_by, approval_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const l of initialLeaveRequests) {
      insertReq.run(l.id, l.employeeId, l.leaveType, l.startDate, l.endDate, l.daysCount, l.reason, l.handoverEmployeeId || null, l.status, l.appliedDate, l.approvedBy || null, l.approvalNotes || null);
    }

    // 7. Hybrid Schedules
    const insertSch = db.prepare(`
      INSERT INTO hybrid_schedules (
        id, employee_id, week_start_date, monday, tuesday, wednesday, thursday, friday, status, change_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of initialHybridSchedules) {
      insertSch.run(s.id, s.employeeId, s.weekStartDate, s.monday, s.tuesday, s.wednesday, s.thursday, s.friday, s.status, JSON.stringify(s.changeRequests || []));
    }

    // 8. Tasks
    const insertTask = db.prepare(`
      INSERT INTO tasks (
        id, title, description, department_id, priority, status, due_date, assigned_to_id, created_by_id, progress_percentage, project_tag, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of initialTasks) {
      insertTask.run(t.id, t.title, t.description, t.departmentId || 'dept-1', t.priority, t.status, t.dueDate, t.assignedToId, t.createdById, t.progressPercentage, t.projectTag || null, t.completedAt || null);
    }

    // 9. Meetings
    const insertMeeting = db.prepare(`
      INSERT INTO meetings (
        id, title, description, type, date, start_time, end_time, location, is_virtual, virtual_link, organizer_id, participant_ids, minutes, action_items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of initialMeetings) {
      insertMeeting.run(
        m.id, m.title, m.description, m.type, m.date, m.startTime, m.endTime, m.location,
        m.isVirtual ? 1 : 0, m.virtualLink || null, m.organizerId, JSON.stringify(m.participantIds),
        m.minutes || null, JSON.stringify(m.actionItems || [])
      );
    }

    // 10. Assets
    const insertAsset = db.prepare(`
      INSERT INTO assets (
        id, asset_code, name, category, serial_number, acquisition_date, assigned_to_id, assigned_date, condition, status, location, maintenance_logs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of initialAssets) {
      insertAsset.run(
        a.id, a.assetCode, a.name, a.category, a.serialNumber, a.acquisitionDate,
        a.assignedToId || null, a.assignedDate || null, a.condition, a.status, a.location,
        JSON.stringify(a.maintenanceLogs || [])
      );
    }

    // 11. Recruitment Jobs
    const insertJob = db.prepare(`
      INSERT INTO recruitment_jobs (
        id, title, department_id, type, location, experience, openings, deadline, status, description, requirements, salary_range
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const j of initialRecruitmentJobs) {
      insertJob.run(j.id, j.title, j.departmentId, j.type, j.location, j.experience, j.openings, j.deadline, j.status, j.description, JSON.stringify(j.requirements), j.salaryRange);
    }

    // 12. Candidates
    const insertCand = db.prepare(`
      INSERT INTO candidates (
        id, job_id, full_name, email, phone, applied_date, stage, resume_url, interview_notes, rating, offer_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of initialCandidates) {
      insertCand.run(
        c.id, c.jobId, c.fullName, c.email, c.phone, c.appliedDate, c.stage,
        c.resumeUrl || null, c.interviewNotes || null, c.rating, JSON.stringify(c.offerDetails || null)
      );
    }

    // 13. Onboarding
    const insertOnb = db.prepare(`
      INSERT INTO onboarding_processes (
        id, employee_id, start_date, target_completion_date, progress, status, tasks
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const o of initialOnboardingProcesses) {
      insertOnb.run(o.id, o.employeeId, o.startDate, o.targetCompletionDate, o.progress, o.status, JSON.stringify(o.tasks));
    }

    // 14. Documents
    const insertDoc = db.prepare(`
      INSERT INTO documents (
        id, title, category, file_type, file_size, uploaded_date, uploaded_by_id, employee_id, is_company_wide, download_url, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of initialDocuments) {
      insertDoc.run(
        d.id, d.title, d.category, d.fileType, d.fileSize, d.uploadedDate, d.uploadedById,
        d.employeeId || null, d.isCompanyWide ? 1 : 0, d.downloadUrl, d.description || null
      );
    }

    // 15. Performance Reviews
    const insertReview = db.prepare(`
      INSERT INTO performance_reviews (
        id, employee_id, reviewer_id, cycle, status, self_rating, manager_rating, kpi_ratings, strengths, areas_for_growth, development_plan, final_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of initialPerformanceReviews) {
      insertReview.run(
        p.id, p.employeeId, p.reviewerId, p.cycle, p.status, p.selfRating, p.managerRating,
        JSON.stringify(p.kpiRatings), p.strengths, p.areasForGrowth, p.developmentPlan, p.finalScore, p.createdAt
      );
    }

    // 16. Training
    const insertCourse = db.prepare(`
      INSERT INTO training_courses (
        id, title, code, category, instructor, duration_hours, schedule_date, max_participants, enrolled_employee_ids, completed_employee_ids, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const tr of initialTrainingCourses) {
      insertCourse.run(
        tr.id, tr.title, tr.code, tr.category, tr.instructor, tr.durationHours, tr.scheduleDate,
        tr.maxParticipants, JSON.stringify(tr.enrolledEmployeeIds), JSON.stringify(tr.completedEmployeeIds), tr.description
      );
    }

    // 17. Announcements
    const insertAnn = db.prepare(`
      INSERT INTO announcements (
        id, title, category, content, priority, publish_date, author_id, target_department_id, target_arm, acknowledge_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const an of initialAnnouncements) {
      insertAnn.run(
        an.id, an.title, an.category, an.content, an.priority, an.publishDate, an.authorId,
        an.targetDepartmentId || null, an.targetArm || null, an.acknowledgeCount
      );
    }

    // 18. Timesheets
    const insertTs = db.prepare(`
      INSERT INTO timesheets (
        id, employee_id, week_start_date, week_end_date, status, submitted_at, approved_by, entries, total_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ts of initialTimesheets) {
      insertTs.run(
        ts.id, ts.employeeId, ts.weekStartDate, ts.weekEndDate, ts.status,
        ts.submittedAt || null, ts.approvedBy || null, JSON.stringify(ts.entries), ts.totalHours
      );
    }

    // 19. Settings
    db.prepare(`
      INSERT INTO organization_settings (id, settings_json)
      VALUES (?, ?)
    `).run('cisd-settings', JSON.stringify(initialSettings));

    // 20. Audit Logs
    const insertLog = db.prepare(`
      INSERT INTO system_audit_logs (
        id, timestamp, user_id, user_name, action, module, details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const al of initialAuditLogs) {
      insertLog.run(al.id, al.timestamp, al.userId, al.userName, al.action, al.module, al.details);
    }
  });

  seedTx();
}

/**
 * Returns a fully typed DatabaseSchema snapshot from the SQLite relational tables
 */
export function getSqliteDatabaseSnapshot(): DatabaseSchema {
  const db = getSqliteDb();

  // 1. Departments
  const deptRows = db.prepare('SELECT * FROM departments').all() as any[];
  const departments: Department[] = deptRows.map(r => ({
    id: r.id,
    name: r.name,
    code: r.code,
    headId: r.head_id || '',
    description: r.description || '',
    location: r.location || '',
    budget: r.budget || '',
    organizationArm: r.organization_arm || undefined
  }));

  // 2. Employees
  const empRows = db.prepare('SELECT * FROM employees').all() as any[];
  const employees: Employee[] = empRows.map(r => ({
    id: r.id,
    employeeId: r.employee_id,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone || '',
    avatar: r.avatar || '',
    departmentId: r.department_id || '',
    designation: r.designation,
    role: r.role,
    accessLevel: r.access_level || undefined,
    organizationArm: r.organization_arm || undefined,
    status: r.status,
    employmentType: r.employment_type,
    joinDate: r.join_date,
    probationEndDate: r.probation_end_date || undefined,
    workLocation: r.work_location || '',
    reportingManagerId: r.reporting_manager_id || undefined,
    gradeLevel: r.grade_level || '',
    salaryGrade: r.salary_grade || undefined,
    password: r.password || undefined,
    personalInfo: r.personal_info ? JSON.parse(r.personal_info) : {},
    education: r.education ? JSON.parse(r.education) : [],
    workExperience: r.work_experience ? JSON.parse(r.work_experience) : [],
    emergencyContacts: r.emergency_contacts ? JSON.parse(r.emergency_contacts) : [],
    dependants: r.dependants ? JSON.parse(r.dependants) : []
  }));

  // 3. Attendance
  const attRows = db.prepare('SELECT * FROM attendance_records ORDER BY date DESC').all() as any[];
  const attendanceRecords: AttendanceRecord[] = attRows.map(r => ({
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    clockIn: r.clock_in,
    clockOut: r.clock_out || undefined,
    status: r.status,
    workType: r.work_type,
    locationName: r.location_name || '',
    workingHours: r.working_hours,
    latenessMinutes: r.lateness_minutes,
    notes: r.notes || undefined
  }));

  // 4. Corrections
  const corrRows = db.prepare('SELECT * FROM attendance_corrections').all() as any[];
  const attendanceCorrections: AttendanceCorrection[] = corrRows.map(r => ({
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    requestedClockIn: r.requested_clock_in,
    requestedClockOut: r.requested_clock_out,
    reason: r.reason,
    status: r.status,
    reviewedBy: r.reviewed_by || undefined,
    reviewedAt: r.reviewed_at || undefined
  }));

  // 5. Leave Balances
  const balRows = db.prepare('SELECT * FROM leave_balances').all() as any[];
  const leaveBalances: LeaveBalance[] = balRows.map(r => ({
    employeeId: r.employee_id,
    annualTotal: r.annual_total,
    annualUsed: r.annual_used,
    sickTotal: r.sick_total,
    sickUsed: r.sick_used,
    casualTotal: r.casual_total,
    casualUsed: r.casual_used,
    maternityPaternityTotal: r.maternity_paternity_total,
    maternityPaternityUsed: r.maternity_paternity_used,
    unpaidUsed: r.unpaid_used
  }));

  // 6. Leave Requests
  const reqRows = db.prepare('SELECT * FROM leave_requests ORDER BY applied_date DESC').all() as any[];
  const leaveRequests: LeaveRequest[] = reqRows.map(r => ({
    id: r.id,
    employeeId: r.employee_id,
    leaveType: r.leave_type,
    startDate: r.start_date,
    endDate: r.end_date,
    daysCount: r.days_count,
    reason: r.reason,
    handoverEmployeeId: r.handover_employee_id || undefined,
    status: r.status,
    appliedDate: r.applied_date,
    approvedBy: r.approved_by || undefined,
    approvalNotes: r.approval_notes || undefined
  }));

  // 7. Hybrid Schedules
  const schRows = db.prepare('SELECT * FROM hybrid_schedules').all() as any[];
  const hybridSchedules: HybridSchedule[] = schRows.map(r => ({
    id: r.id,
    employeeId: r.employee_id,
    weekStartDate: r.week_start_date,
    monday: r.monday,
    tuesday: r.tuesday,
    wednesday: r.wednesday,
    thursday: r.thursday,
    friday: r.friday,
    status: r.status,
    changeRequests: r.change_requests ? JSON.parse(r.change_requests) : []
  }));

  // 8. Tasks
  const taskRows = db.prepare('SELECT * FROM tasks ORDER BY due_date ASC').all() as any[];
  const tasks: Task[] = taskRows.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description || '',
    departmentId: r.department_id || 'dept-1',
    priority: r.priority,
    status: r.status,
    dueDate: r.due_date,
    assignedToId: r.assigned_to_id,
    createdById: r.created_by_id,
    progressPercentage: r.progress_percentage,
    projectTag: r.project_tag || undefined,
    completedAt: r.completed_at || undefined
  }));

  // 9. Meetings
  const meetRows = db.prepare('SELECT * FROM meetings ORDER BY date ASC, start_time ASC').all() as any[];
  const meetings: Meeting[] = meetRows.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description || '',
    type: r.type,
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    location: r.location,
    isVirtual: Boolean(r.is_virtual),
    virtualLink: r.virtual_link || undefined,
    organizerId: r.organizer_id,
    participantIds: r.participant_ids ? JSON.parse(r.participant_ids) : [],
    minutes: r.minutes || undefined,
    actionItems: r.action_items ? JSON.parse(r.action_items) : []
  }));

  // 10. Assets
  const assetRows = db.prepare('SELECT * FROM assets ORDER BY asset_code ASC').all() as any[];
  const assets: Asset[] = assetRows.map(r => ({
    id: r.id,
    assetCode: r.asset_code,
    name: r.name,
    category: r.category,
    serialNumber: r.serial_number,
    acquisitionDate: r.acquisition_date,
    assignedToId: r.assigned_to_id || undefined,
    assignedDate: r.assigned_date || undefined,
    condition: r.condition,
    status: r.status,
    location: r.location,
    maintenanceLogs: r.maintenance_logs ? JSON.parse(r.maintenance_logs) : []
  }));

  // 11. Recruitment Jobs
  const jobRows = db.prepare('SELECT * FROM recruitment_jobs').all() as any[];
  const recruitmentJobs: RecruitmentJob[] = jobRows.map(r => ({
    id: r.id,
    title: r.title,
    departmentId: r.department_id,
    type: r.type,
    location: r.location,
    experience: r.experience,
    openings: r.openings,
    deadline: r.deadline,
    status: r.status,
    description: r.description,
    requirements: r.requirements ? JSON.parse(r.requirements) : [],
    salaryRange: r.salary_range
  }));

  // 12. Candidates
  const candRows = db.prepare('SELECT * FROM candidates ORDER BY applied_date DESC').all() as any[];
  const candidates: Candidate[] = candRows.map(r => ({
    id: r.id,
    jobId: r.job_id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    appliedDate: r.applied_date,
    stage: r.stage,
    resumeUrl: r.resume_url || undefined,
    interviewNotes: r.interview_notes || undefined,
    rating: r.rating,
    offerDetails: r.offer_details ? JSON.parse(r.offer_details) : undefined
  }));

  // 13. Onboarding
  const onbRows = db.prepare('SELECT * FROM onboarding_processes').all() as any[];
  const onboardingProcesses: OnboardingProcess[] = onbRows.map(r => ({
    id: r.id,
    employeeId: r.employee_id,
    startDate: r.start_date,
    targetCompletionDate: r.target_completion_date,
    progress: r.progress,
    status: r.status,
    tasks: r.tasks ? JSON.parse(r.tasks) : []
  }));

  // 14. Documents
  const docRows = db.prepare('SELECT * FROM documents ORDER BY uploaded_date DESC').all() as any[];
  const documents: DocumentRecord[] = docRows.map(r => ({
    id: r.id,
    title: r.title,
    category: r.category,
    fileType: r.file_type,
    fileSize: r.file_size,
    uploadedDate: r.uploaded_date,
    uploadedById: r.uploaded_by_id,
    employeeId: r.employee_id || undefined,
    isCompanyWide: Boolean(r.is_company_wide),
    downloadUrl: r.download_url,
    description: r.description || undefined
  }));

  // 15. Performance Reviews
  const revRows = db.prepare('SELECT * FROM performance_reviews ORDER BY created_at DESC').all() as any[];
  const performanceReviews: PerformanceReview[] = revRows.map(r => ({
    id: r.id,
    employeeId: r.employee_id,
    reviewerId: r.reviewer_id,
    cycle: r.cycle,
    status: r.status,
    selfRating: r.self_rating,
    managerRating: r.manager_rating,
    kpiRatings: r.kpi_ratings ? JSON.parse(r.kpi_ratings) : [],
    strengths: r.strengths || '',
    areasForGrowth: r.areas_for_growth || '',
    developmentPlan: r.development_plan || '',
    finalScore: r.final_score,
    createdAt: r.created_at
  }));

  // 16. Training
  const trRows = db.prepare('SELECT * FROM training_courses').all() as any[];
  const trainingCourses: TrainingCourse[] = trRows.map(r => ({
    id: r.id,
    title: r.title,
    code: r.code,
    category: r.category,
    instructor: r.instructor,
    durationHours: r.duration_hours,
    scheduleDate: r.schedule_date,
    maxParticipants: r.max_participants,
    enrolledEmployeeIds: r.enrolled_employee_ids ? JSON.parse(r.enrolled_employee_ids) : [],
    completedEmployeeIds: r.completed_employee_ids ? JSON.parse(r.completed_employee_ids) : [],
    description: r.description
  }));

  // 17. Announcements
  const annRows = db.prepare('SELECT * FROM announcements ORDER BY publish_date DESC').all() as any[];
  const announcements: Announcement[] = annRows.map(r => ({
    id: r.id,
    title: r.title,
    category: r.category,
    content: r.content,
    priority: r.priority,
    publishDate: r.publish_date,
    authorId: r.author_id,
    targetDepartmentId: r.target_department_id || undefined,
    targetArm: r.target_arm || undefined,
    acknowledgeCount: r.acknowledge_count
  }));

  // 18. Timesheets
  const tsRows = db.prepare('SELECT * FROM timesheets ORDER BY week_start_date DESC').all() as any[];
  const timesheets: Timesheet[] = tsRows.map(r => ({
    id: r.id,
    employeeId: r.employee_id,
    weekStartDate: r.week_start_date,
    weekEndDate: r.week_end_date,
    status: r.status,
    submittedAt: r.submitted_at || undefined,
    approvedBy: r.approved_by || undefined,
    entries: r.entries ? JSON.parse(r.entries) : [],
    totalHours: r.total_hours
  }));

  // 19. Settings
  const settingsRow = db.prepare('SELECT settings_json FROM organization_settings WHERE id = ?').get('cisd-settings') as any;
  const settings: OrganizationSettings = settingsRow ? JSON.parse(settingsRow.settings_json) : initialSettings;

  // 20. Audit Logs
  const logRows = db.prepare('SELECT * FROM system_audit_logs ORDER BY timestamp DESC LIMIT 250').all() as any[];
  const auditLogs: SystemAuditLog[] = logRows.map(r => ({
    id: r.id,
    timestamp: r.timestamp,
    userId: r.user_id,
    userName: r.user_name,
    action: r.action,
    module: r.module,
    details: r.details
  }));

  return {
    departments,
    employees,
    attendanceRecords,
    attendanceCorrections,
    leaveBalances,
    leaveRequests,
    hybridSchedules,
    tasks,
    meetings,
    assets,
    recruitmentJobs,
    candidates,
    onboardingProcesses,
    documents,
    performanceReviews,
    trainingCourses,
    announcements,
    timesheets,
    settings,
    auditLogs
  };
}

/**
 * Inserts a compliance audit log directly into SQLite
 */
export function insertSqliteAuditLog(
  action: string,
  module: string,
  details: string,
  userId = 'emp-1',
  userName = 'System Administrator'
): SystemAuditLog {
  const db = getSqliteDb();
  const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.prepare(`
    INSERT INTO system_audit_logs (id, timestamp, user_id, user_name, action, module, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, timestamp, userId, userName, action, module, details);

  return { id, timestamp, userId, userName, action, module, details };
}

/**
 * Persists the entire database schema into SQLite using an atomic transaction
 */
export function saveDatabaseSnapshotToSqlite(data: DatabaseSchema): void {
  const db = getSqliteDb();

  const syncTx = db.transaction(() => {
    // 1. Departments
    db.prepare('DELETE FROM departments').run();
    const insertDept = db.prepare(`
      INSERT INTO departments (id, name, code, head_id, description, location, budget, organization_arm)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of data.departments || []) {
      insertDept.run(d.id, d.name, d.code, d.headId || null, d.description || null, d.location || null, d.budget || null, d.organizationArm || null);
    }

    // 2. Employees
    db.prepare('DELETE FROM employees').run();
    const insertEmp = db.prepare(`
      INSERT INTO employees (
        id, employee_id, first_name, last_name, email, phone, avatar,
        department_id, designation, role, status, employment_type, join_date,
        probation_end_date, work_location, reporting_manager_id, grade_level,
        salary_grade, password, organization_arm, access_level, personal_info, education, work_experience, emergency_contacts, dependants
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const e of data.employees || []) {
      insertEmp.run(
        e.id, e.employeeId, e.firstName, e.lastName, e.email, e.phone || null, e.avatar || null,
        e.departmentId || null, e.designation, e.role, e.status, e.employmentType, e.joinDate,
        e.probationEndDate || null, e.workLocation || null, e.reportingManagerId || null, e.gradeLevel || null,
        e.salaryGrade || null,
        e.password || null,
        e.organizationArm || null,
        e.accessLevel || null,
        JSON.stringify(e.personalInfo || {}),
        JSON.stringify(e.education || []),
        JSON.stringify(e.workExperience || []),
        JSON.stringify(e.emergencyContacts || []),
        JSON.stringify(e.dependants || [])
      );
    }

    // 3. Attendance
    db.prepare('DELETE FROM attendance_records').run();
    const insertAtt = db.prepare(`
      INSERT INTO attendance_records (
        id, employee_id, date, clock_in, clock_out, status, work_type, location_name, working_hours, lateness_minutes, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of data.attendanceRecords || []) {
      insertAtt.run(a.id, a.employeeId, a.date, a.clockIn, a.clockOut || null, a.status, a.workType, a.locationName || null, a.workingHours || 8.0, a.latenessMinutes || 0, a.notes || null);
    }

    // 4. Corrections
    db.prepare('DELETE FROM attendance_corrections').run();
    const insertCorr = db.prepare(`
      INSERT INTO attendance_corrections (
        id, employee_id, date, requested_clock_in, requested_clock_out, reason, status, reviewed_by, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of data.attendanceCorrections || []) {
      insertCorr.run(c.id, c.employeeId, c.date, c.requestedClockIn, c.requestedClockOut, c.reason, c.status, c.reviewedBy || null, c.reviewedAt || null);
    }

    // 5. Leave Balances
    db.prepare('DELETE FROM leave_balances').run();
    const insertBal = db.prepare(`
      INSERT INTO leave_balances (
        employee_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used,
        maternity_paternity_total, maternity_paternity_used, unpaid_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const b of data.leaveBalances || []) {
      insertBal.run(b.employeeId, b.annualTotal, b.annualUsed, b.sickTotal, b.sickUsed, b.casualTotal, b.casualUsed, b.maternityPaternityTotal || 0, b.maternityPaternityUsed || 0, b.unpaidUsed || 0);
    }

    // 6. Leave Requests
    db.prepare('DELETE FROM leave_requests').run();
    const insertReq = db.prepare(`
      INSERT INTO leave_requests (
        id, employee_id, leave_type, start_date, end_date, days_count, reason,
        handover_employee_id, status, applied_date, approved_by, approval_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const l of data.leaveRequests || []) {
      insertReq.run(l.id, l.employeeId, l.leaveType, l.startDate, l.endDate, l.daysCount, l.reason, l.handoverEmployeeId || null, l.status, l.appliedDate, l.approvedBy || null, l.approvalNotes || null);
    }

    // 7. Hybrid Schedules
    db.prepare('DELETE FROM hybrid_schedules').run();
    const insertSch = db.prepare(`
      INSERT INTO hybrid_schedules (
        id, employee_id, week_start_date, monday, tuesday, wednesday, thursday, friday, status, change_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of data.hybridSchedules || []) {
      insertSch.run(s.id, s.employeeId, s.weekStartDate, s.monday, s.tuesday, s.wednesday, s.thursday, s.friday, s.status, JSON.stringify(s.changeRequests || []));
    }

    // 8. Tasks
    db.prepare('DELETE FROM tasks').run();
    const insertTask = db.prepare(`
      INSERT INTO tasks (
        id, title, description, department_id, priority, status, due_date, assigned_to_id, created_by_id, progress_percentage, project_tag, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of data.tasks || []) {
      insertTask.run(t.id, t.title, t.description, t.departmentId || 'dept-1', t.priority, t.status, t.dueDate, t.assignedToId, t.createdById, t.progressPercentage || 0, t.projectTag || null, t.completedAt || null);
    }

    // 9. Meetings
    db.prepare('DELETE FROM meetings').run();
    const insertMeeting = db.prepare(`
      INSERT INTO meetings (
        id, title, description, type, date, start_time, end_time, location, is_virtual, virtual_link, organizer_id, participant_ids, minutes, action_items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of data.meetings || []) {
      insertMeeting.run(
        m.id, m.title, m.description, m.type, m.date, m.startTime, m.endTime, m.location,
        m.isVirtual ? 1 : 0, m.virtualLink || null, m.organizerId, JSON.stringify(m.participantIds || []),
        m.minutes || null, JSON.stringify(m.actionItems || [])
      );
    }

    // 10. Assets
    db.prepare('DELETE FROM assets').run();
    const insertAsset = db.prepare(`
      INSERT INTO assets (
        id, asset_code, name, category, serial_number, acquisition_date, assigned_to_id, assigned_date, condition, status, location, maintenance_logs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of data.assets || []) {
      insertAsset.run(
        a.id, a.assetCode, a.name, a.category, a.serialNumber, a.acquisitionDate,
        a.assignedToId || null, a.assignedDate || null, a.condition, a.status, a.location,
        JSON.stringify(a.maintenanceLogs || [])
      );
    }

    // 11. Recruitment Jobs
    db.prepare('DELETE FROM recruitment_jobs').run();
    const insertJob = db.prepare(`
      INSERT INTO recruitment_jobs (
        id, title, department_id, type, location, experience, openings, deadline, status, description, requirements, salary_range
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const j of data.recruitmentJobs || []) {
      insertJob.run(j.id, j.title, j.departmentId, j.type, j.location, j.experience, j.openings || 1, j.deadline, j.status, j.description, JSON.stringify(j.requirements || []), j.salaryRange);
    }

    // 12. Candidates
    db.prepare('DELETE FROM candidates').run();
    const insertCand = db.prepare(`
      INSERT INTO candidates (
        id, job_id, full_name, email, phone, applied_date, stage, resume_url, interview_notes, rating, offer_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of data.candidates || []) {
      insertCand.run(
        c.id, c.jobId, c.fullName, c.email, c.phone, c.appliedDate, c.stage,
        c.resumeUrl || null, c.interviewNotes || null, c.rating || 3, JSON.stringify(c.offerDetails || null)
      );
    }

    // 13. Onboarding
    db.prepare('DELETE FROM onboarding_processes').run();
    const insertOnb = db.prepare(`
      INSERT INTO onboarding_processes (
        id, employee_id, start_date, target_completion_date, progress, status, tasks
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const o of data.onboardingProcesses || []) {
      insertOnb.run(o.id, o.employeeId, o.startDate, o.targetCompletionDate, o.progress || 0, o.status, JSON.stringify(o.tasks || []));
    }

    // 14. Documents
    db.prepare('DELETE FROM documents').run();
    const insertDoc = db.prepare(`
      INSERT INTO documents (
        id, title, category, file_type, file_size, uploaded_date, uploaded_by_id, employee_id, is_company_wide, download_url, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of data.documents || []) {
      insertDoc.run(
        d.id, d.title, d.category, d.fileType, d.fileSize, d.uploadedDate, d.uploadedById,
        d.employeeId || null, d.isCompanyWide ? 1 : 0, d.downloadUrl, d.description || null
      );
    }

    // 15. Performance Reviews
    db.prepare('DELETE FROM performance_reviews').run();
    const insertReview = db.prepare(`
      INSERT INTO performance_reviews (
        id, employee_id, reviewer_id, cycle, status, self_rating, manager_rating, kpi_ratings, strengths, areas_for_growth, development_plan, final_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of data.performanceReviews || []) {
      insertReview.run(
        p.id, p.employeeId, p.reviewerId, p.cycle, p.status, p.selfRating || 0, p.managerRating || 0,
        JSON.stringify(p.kpiRatings || []), p.strengths || '', p.areasForGrowth || '', p.developmentPlan || '', p.finalScore || 0, p.createdAt
      );
    }

    // 16. Training
    db.prepare('DELETE FROM training_courses').run();
    const insertCourse = db.prepare(`
      INSERT INTO training_courses (
        id, title, code, category, instructor, duration_hours, schedule_date, max_participants, enrolled_employee_ids, completed_employee_ids, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const tr of data.trainingCourses || []) {
      insertCourse.run(
        tr.id, tr.title, tr.code, tr.category, tr.instructor, tr.durationHours, tr.scheduleDate,
        tr.maxParticipants, JSON.stringify(tr.enrolledEmployeeIds || []), JSON.stringify(tr.completedEmployeeIds || []), tr.description
      );
    }

    // 17. Announcements
    db.prepare('DELETE FROM announcements').run();
    const insertAnn = db.prepare(`
      INSERT INTO announcements (
        id, title, category, content, priority, publish_date, author_id, target_department_id, target_arm, acknowledge_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const an of data.announcements || []) {
      insertAnn.run(
        an.id, an.title, an.category, an.content, an.priority, an.publishDate, an.authorId,
        an.targetDepartmentId || null, an.targetArm || null, an.acknowledgeCount || 0
      );
    }

    // 18. Timesheets
    db.prepare('DELETE FROM timesheets').run();
    const insertTs = db.prepare(`
      INSERT INTO timesheets (
        id, employee_id, week_start_date, week_end_date, status, submitted_at, approved_by, entries, total_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ts of data.timesheets || []) {
      insertTs.run(
        ts.id, ts.employeeId, ts.weekStartDate, ts.weekEndDate, ts.status,
        ts.submittedAt || null, ts.approvedBy || null, JSON.stringify(ts.entries || []), ts.totalHours || 0
      );
    }

    // 19. Settings
    if (data.settings) {
      db.prepare('DELETE FROM organization_settings').run();
      db.prepare(`
        INSERT INTO organization_settings (id, settings_json)
        VALUES (?, ?)
      `).run('cisd-settings', JSON.stringify(data.settings));
    }

    // 20. Audit Logs
    if (data.auditLogs && data.auditLogs.length > 0) {
      db.prepare('DELETE FROM system_audit_logs').run();
      const insertLog = db.prepare(`
        INSERT INTO system_audit_logs (
          id, timestamp, user_id, user_name, action, module, details
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const al of data.auditLogs) {
        insertLog.run(al.id, al.timestamp, al.userId, al.userName, al.action, al.module, al.details);
      }
    }
  });

  syncTx();
}
