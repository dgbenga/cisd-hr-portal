'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Users,
  Building2,
  CalendarDays,
  CalendarRange,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Briefcase,
  ChevronRight,
  Plus,
  PlusCircle,
  FileText,
  Cake,
  Award,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Send,
  MessagesSquare,
  Shield,
  Laptop,
  CheckSquare,
  UserCheck,
  UserPlus,
  Play,
  CheckCheck,
  Video,
  Timer
} from 'lucide-react';
import { UserRole, TaskStatus } from '@/lib/types';

export default function DashboardModule() {
  const { db, currentUser, setActiveTab, setSelectedEmployeeIdForModal, dispatch, showToast } = usePortal();

  const [quickLeaveModal, setQuickLeaveModal] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [birthdayGreeting, setBirthdayGreeting] = useState('Wishing you a tremendous birthday filled with joy and diplomatic triumphs!');
  const [leaveType, setLeaveType] = useState<'ANNUAL' | 'SICK' | 'CASUAL'>('ANNUAL');
  const [leaveStart, setLeaveStart] = useState('2026-11-16');
  const [leaveEnd, setLeaveEnd] = useState('2026-11-20');
  const [leaveDays, setLeaveDays] = useState(5);
  const [leaveReason, setLeaveReason] = useState('');

  if (!db) return null;

  const role: UserRole = currentUser.role || 'SUPER_ADMIN';

  // Global counts
  const totalHeadcount = db.employees.length;
  const activeStaff = db.employees.filter(e => e.status === 'ACTIVE' || e.status === 'ON_PROBATION').length;
  const probationStaff = db.employees.filter(e => e.status === 'ON_PROBATION');

  const todayStr = '2026-11-05';
  const attendanceToday = db.attendanceRecords.filter(a => a.date === todayStr);
  const inOfficeToday = attendanceToday.filter(a => a.workType === 'OFFICE' && a.status !== 'ON_LEAVE').length;
  const remoteToday = attendanceToday.filter(a => a.workType === 'REMOTE').length;
  const lateToday = attendanceToday.filter(a => a.status === 'LATE').length;

  const allPendingLeaves = db.leaveRequests.filter(l => l.status === 'PENDING');
  const allPendingTimesheets = db.timesheets.filter(t => t.status === 'SUBMITTED');
  const overdueTasks = db.tasks.filter(t => t.status === 'OVERDUE');

  // Department-specific for Line Manager
  const myDepartment = db.departments.find(d => d.id === currentUser.departmentId);
  const teamMembers = db.employees.filter(e => e.departmentId === currentUser.departmentId);
  const teamMemberIds = teamMembers.map(e => e.id);
  const teamAttendanceToday = attendanceToday.filter(a => teamMemberIds.includes(a.employeeId));
  const teamInOfficeToday = teamAttendanceToday.filter(a => a.workType === 'OFFICE').length;
  const teamRemoteToday = teamAttendanceToday.filter(a => a.workType === 'REMOTE').length;
  const teamPendingLeaves = allPendingLeaves.filter(l => teamMemberIds.includes(l.employeeId));
  const teamPendingTimesheets = allPendingTimesheets.filter(t => teamMemberIds.includes(t.employeeId));
  const teamTasks = db.tasks.filter(t => teamMemberIds.includes(t.assignedToId));

  // Employee-specific
  const myAttendance = attendanceToday.find(a => a.employeeId === currentUser.id);
  const myBalance = db.leaveBalances.find(b => b.employeeId === currentUser.id) || {
    annualTotal: 21,
    annualUsed: 3,
    sickTotal: 12,
    sickUsed: 1,
    casualTotal: 5,
    casualUsed: 0
  };
  const myTasks = db.tasks.filter(t => t.assignedToId === currentUser.id);
  const mySchedule = db.hybridSchedules.find(s => s.employeeId === currentUser.id);
  const myTimesheetThisWeek = db.timesheets.find(t => t.employeeId === currentUser.id && t.weekStartDate === '2026-11-02');
  const myAssets = db.assets.filter(a => a.assignedToId === currentUser.id);
  const myMeetings = db.meetings.filter(m => m.participantIds.includes(currentUser.id));

  // Quick actions handlers
  const handleQuickLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('APPLY_LEAVE', {
      employeeId: currentUser.id,
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      daysCount: leaveDays,
      reason: leaveReason
    });
    if (res.success) {
      showToast('Leave application submitted for approval', 'success');
      setQuickLeaveModal(false);
      setLeaveReason('');
    }
  };

  const handleQuickApproveLeave = async (id: string) => {
    const res = await dispatch('REVIEW_LEAVE', {
      id,
      status: 'APPROVED',
      notes: `Approved by ${currentUser.firstName} ${currentUser.lastName} (${currentUser.role.replace('_', ' ')})`
    });
    if (res.success) {
      showToast('Leave request approved', 'success');
    }
  };

  const handleClockInAction = async (workType: 'OFFICE' | 'REMOTE') => {
    const res = await dispatch('CLOCK_IN', {
      employeeId: currentUser.id,
      workType,
      locationName: workType === 'OFFICE' ? 'Abuja Head Office' : 'Remote Telework Station'
    });
    if (res.success) {
      showToast(`Clocked in successfully (${workType})`, 'success');
    }
  };

  const handleClockOutAction = async () => {
    const res = await dispatch('CLOCK_OUT', { employeeId: currentUser.id });
    if (res.success) {
      showToast('Shift concluded and working hours recorded.', 'success');
    }
  };

  const handleUpdateMyTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const res = await dispatch('UPDATE_TASK', {
      id: taskId,
      status: newStatus,
      progressPercentage: newStatus === 'COMPLETED' ? 100 : undefined
    });
    if (res.success) {
      showToast(`Task marked as ${newStatus.replace('_', ' ')}`, 'info');
    }
  };

  const handleSendBirthdayGreeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('CREATE_ANNOUNCEMENT', {
      title: 'Birthday Greetings to Babatunde Fashina!',
      category: 'CELEBRATION',
      content: `${birthdayGreeting} — Sent by ${currentUser.firstName} ${currentUser.lastName} on behalf of CISD.`,
      priority: 'NORMAL'
    });
    if (res.success) {
      showToast('Birthday celebration message broadcasted to noticeboard!', 'success');
      setShowBirthdayModal(false);
    }
  };

  // ==========================================
  // VIEW 1: SUPER_ADMIN (Executive Command Center)
  // ==========================================
  if (role === 'SUPER_ADMIN') {
    return (
      <div className="space-y-6">
        {/* Executive Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cisd-navy-950 via-cisd-navy-900 to-cisd-navy-800 p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-cisd-gold-500 text-cisd-navy-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Executive Command Center &bull; Super Admin
                </span>
                <span className="text-xs text-slate-300">&bull; Thursday, 05 November 2026</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Welcome, {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Centre for International Strategic Dialogue executive oversight active. Total institutional workforce of{' '}
                <span className="font-semibold text-cisd-gold-300">{totalHeadcount} diplomats and fellows</span>. Today{' '}
                <span className="font-semibold text-cisd-gold-300">{inOfficeToday} personnel</span> are on-site at Abuja HQ and{' '}
                <span className="font-semibold text-cisd-gold-300">{remoteToday}</span> are on multilateral field missions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setQuickLeaveModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-cisd-gold-500 px-3.5 py-2 text-xs font-bold text-cisd-navy-950 hover:bg-cisd-gold-400 shadow transition"
              >
                <PlusCircle className="h-4 w-4" />
                Executive Leave
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <Sparkles className="h-4 w-4 text-cisd-gold-400" />
                Broadcast Notice
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <Shield className="h-4 w-4" />
                Audit Controls
              </button>
            </div>
          </div>
        </div>

        {/* Executive KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <div onClick={() => setActiveTab('employees')} className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition space-y-1 hover:border-cisd-navy-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Workforce</span>
            <p className="text-2xl font-black text-slate-900">{totalHeadcount}</p>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> 100% Retained
            </span>
          </div>

          <div onClick={() => setActiveTab('attendance')} className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition space-y-1 hover:border-cisd-navy-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">On-Site Today</span>
            <p className="text-2xl font-black text-emerald-600">{inOfficeToday}</p>
            <span className="text-[10px] text-slate-500">Abuja HQ</span>
          </div>

          <div onClick={() => setActiveTab('hybrid')} className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition space-y-1 hover:border-cisd-navy-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remote / Mission</span>
            <p className="text-2xl font-black text-blue-600">{remoteToday}</p>
            <span className="text-[10px] text-slate-500">Field Diplomats</span>
          </div>

          <div onClick={() => setActiveTab('leave')} className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition space-y-1 hover:border-cisd-navy-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Approvals</span>
            <p className="text-2xl font-black text-amber-600">{allPendingLeaves.length}</p>
            <span className="text-[10px] text-amber-600 font-semibold">{allPendingLeaves.length} require sign-off</span>
          </div>

          <div onClick={() => setActiveTab('attendance')} className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition space-y-1 hover:border-cisd-navy-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Punctuality</span>
            <p className="text-2xl font-black text-slate-900">
              {Math.round(((attendanceToday.length - lateToday) / (attendanceToday.length || 1)) * 100)}%
            </p>
            <span className="text-[10px] text-slate-500">{lateToday} late arrival</span>
          </div>

          <div onClick={() => setActiveTab('tasks')} className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition space-y-1 hover:border-cisd-navy-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Strategic Tasks</span>
            <p className="text-2xl font-black text-slate-900">{db.tasks.length}</p>
            <span className="text-[10px] text-rose-600 font-semibold">{overdueTasks.length} overdue</span>
          </div>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Global Pending Sign-Offs */}
            {allPendingLeaves.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Executive Action Required: Pending Leave Approvals ({allPendingLeaves.length})
                    </h3>
                  </div>
                  <button onClick={() => setActiveTab('leave')} className="text-xs font-semibold text-amber-800 hover:underline">
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {allPendingLeaves.map(leave => {
                    const emp = db.employees.find(e => e.id === leave.employeeId);
                    const dept = db.departments.find(d => d.id === emp?.departmentId);
                    return (
                      <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-3.5 border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <img src={emp?.avatar} alt={emp?.firstName} className="h-9 w-9 rounded-full object-cover border" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">
                              {emp?.firstName} {emp?.lastName} <span className="text-slate-400 font-normal">({dept?.name})</span>
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {leave.daysCount} days of {leave.leaveType} leave ({leave.startDate} to {leave.endDate})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleQuickApproveLeave(leave.id)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setActiveTab('leave')}
                            className="rounded-lg border bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Departmental Allocation & Structure */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Strategic Directorates & Governance</h3>
                  <p className="text-xs text-slate-500">Resource allocation across the 5 core divisions</p>
                </div>
                <button onClick={() => setActiveTab('departments')} className="text-xs font-semibold text-cisd-navy-900 hover:underline flex items-center gap-1">
                  Manage Directorates <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {db.departments.map(dept => {
                  const members = db.employees.filter(e => e.departmentId === dept.id);
                  const head = db.employees.find(e => e.id === dept.headId);
                  return (
                    <div key={dept.id} onClick={() => setActiveTab('departments')} className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 hover:bg-slate-100/70 transition">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 text-xs">{dept.name}</span>
                        <span className="rounded bg-cisd-navy-900 text-white font-mono text-[9px] px-1.5 py-0.5">{dept.code}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{dept.description}</p>
                      <div className="flex justify-between items-center text-[10px] pt-2 mt-2 border-t border-slate-200/60 text-slate-600">
                        <span>Lead: <strong className="text-slate-800">{head?.firstName} {head?.lastName}</strong></span>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 font-bold text-slate-700">{members.length} Staff</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategic Deliverables & Roadmaps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">Institutional Deliverables & Policy Non-Papers</h3>
                <button onClick={() => setActiveTab('tasks')} className="text-xs font-semibold text-cisd-navy-900 hover:underline">
                  View Kanban Board
                </button>
              </div>
              <div className="space-y-2">
                {db.tasks.slice(0, 4).map(task => {
                  const assignee = db.employees.find(e => e.id === task.assignedToId);
                  return (
                    <div key={task.id} onClick={() => setActiveTab('tasks')} className="cursor-pointer flex items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-slate-100/80 transition">
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs truncate">{task.title}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            task.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">Lead: {assignee?.firstName} {assignee?.lastName} &bull; Due: {task.dueDate}</p>
                      </div>
                      <span className="text-xs font-bold text-cisd-navy-900">{task.progressPercentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Dialogues, Notices, Birthdays */}
          <div className="space-y-6">
            {/* Upcoming Diplomatic Dialogues */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MessagesSquare className="h-4 w-4 text-cisd-navy-900" />
                  Diplomatic Sessions
                </h3>
                <button onClick={() => setActiveTab('meetings')} className="text-[11px] font-semibold text-cisd-navy-900 hover:underline">
                  Calendar
                </button>
              </div>
              <div className="space-y-2.5">
                {db.meetings.slice(0, 3).map(m => (
                  <div key={m.id} onClick={() => setActiveTab('meetings')} className="cursor-pointer rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition space-y-1">
                    <span className="font-bold text-slate-900 text-xs block">{m.title}</span>
                    <p className="text-[11px] text-slate-500">{m.date} &bull; {m.startTime} &bull; {m.location}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Institutional Notices */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-cisd-gold-600" />
                  Noticeboard
                </h3>
                <button onClick={() => setActiveTab('announcements')} className="text-[11px] font-semibold text-cisd-navy-900 hover:underline">
                  All
                </button>
              </div>
              <div className="space-y-2">
                {db.announcements.slice(0, 2).map(ann => (
                  <div key={ann.id} onClick={() => setActiveTab('announcements')} className="cursor-pointer rounded-xl bg-slate-50/60 p-3 hover:bg-slate-100 transition space-y-1">
                    <span className="font-bold text-slate-900 text-xs block truncate">{ann.title}</span>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Birthdays */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Cake className="h-4 w-4 text-rose-500" />
                Staff Birthdays
              </h3>
              <div className="rounded-xl bg-rose-50/50 border border-rose-100 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80" alt="Babatunde Fashina" className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Babatunde Fashina</p>
                    <p className="text-[10px] text-rose-600 font-bold">Birthday Today &bull; 05 Nov</p>
                  </div>
                </div>
                <button onClick={() => setShowBirthdayModal(true)} className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 shadow-sm">
                  Wish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: HR_ADMIN (HR Operations Command Center)
  // ==========================================
  if (role === 'HR_ADMIN') {
    return (
      <div className="space-y-6">
        {/* HR Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-cisd-navy-900 to-slate-900 p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-500 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  HR Operations & Workforce Command Center
                </span>
                <span className="text-xs text-slate-300">&bull; Director of HR & Administration</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                HR Workspace: {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Overseeing workforce compliance, recruitment pipelines, indoctrination tracking, and leave entitlement liabilities.
                Currently <span className="font-semibold text-cisd-gold-300">{probationStaff.length} new hires</span> are under 90-day probation monitoring.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('recruitment')}
                className="flex items-center gap-1.5 rounded-xl bg-cisd-gold-500 px-3.5 py-2 text-xs font-bold text-cisd-navy-950 hover:bg-cisd-gold-400 shadow transition"
              >
                <Plus className="h-4 w-4" />
                Post Vacancy
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <UserPlus className="h-4 w-4" />
                Add Staff
              </button>
              <button
                onClick={() => setActiveTab('onboarding')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <UserCheck className="h-4 w-4" />
                Onboarding ({probationStaff.length})
              </button>
            </div>
          </div>
        </div>

        {/* HR KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <div onClick={() => setActiveTab('employees')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-400 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Workforce</span>
            <p className="text-2xl font-black text-slate-900">{totalHeadcount}</p>
            <span className="text-[10px] text-slate-500">{activeStaff} active staff</span>
          </div>

          <div onClick={() => setActiveTab('onboarding')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-400 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">On Probation</span>
            <p className="text-2xl font-black text-amber-600">{probationStaff.length}</p>
            <span className="text-[10px] text-amber-600 font-semibold">Under orientation</span>
          </div>

          <div onClick={() => setActiveTab('recruitment')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-400 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Open Vacancies</span>
            <p className="text-2xl font-black text-blue-600">{db.recruitmentJobs.filter(j => j.status === 'OPEN').length}</p>
            <span className="text-[10px] text-slate-500">Active ATS searches</span>
          </div>

          <div onClick={() => setActiveTab('recruitment')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-400 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Candidates</span>
            <p className="text-2xl font-black text-purple-600">{db.candidates.length}</p>
            <span className="text-[10px] text-purple-600 font-semibold">In applicant pipeline</span>
          </div>

          <div onClick={() => setActiveTab('leave')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-400 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Leave Requests</span>
            <p className="text-2xl font-black text-amber-600">{allPendingLeaves.length}</p>
            <span className="text-[10px] text-amber-600 font-semibold">Awaiting HR review</span>
          </div>

          <div onClick={() => setActiveTab('attendance')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-400 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Attendance Rate</span>
            <p className="text-2xl font-black text-emerald-600">93%</p>
            <span className="text-[10px] text-slate-500">{inOfficeToday} in office today</span>
          </div>
        </div>

        {/* HR Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* HR Approvals Queue */}
            {allPendingLeaves.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      HR Review Required: Employee Leave Applications ({allPendingLeaves.length})
                    </h3>
                  </div>
                  <button onClick={() => setActiveTab('leave')} className="text-xs font-semibold text-amber-800 hover:underline">
                    Manage Leave
                  </button>
                </div>

                <div className="space-y-2">
                  {allPendingLeaves.map(leave => {
                    const emp = db.employees.find(e => e.id === leave.employeeId);
                    const dept = db.departments.find(d => d.id === emp?.departmentId);
                    return (
                      <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-3.5 border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <img src={emp?.avatar} alt={emp?.firstName} className="h-9 w-9 rounded-full object-cover border" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">
                              {emp?.firstName} {emp?.lastName} &bull; <span className="text-slate-500">{dept?.name}</span>
                            </p>
                            <p className="text-[11px] text-slate-600 font-medium">
                              {leave.daysCount} days of {leave.leaveType} ({leave.startDate} to {leave.endDate})
                            </p>
                            <p className="text-[10px] text-slate-400 italic">&ldquo;{leave.reason}&rdquo;</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleQuickApproveLeave(leave.id)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setActiveTab('leave')}
                            className="rounded-lg border bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Hire Onboarding Tracker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">New Hire Indoctrination & 90-Day Probation</h3>
                  <p className="text-xs text-slate-500">Live milestones and security clearance sign-offs</p>
                </div>
                <button onClick={() => setActiveTab('onboarding')} className="text-xs font-semibold text-cisd-navy-900 hover:underline flex items-center gap-1">
                  Onboarding Module <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {db.onboardingProcesses.map(proc => {
                  const emp = db.employees.find(e => e.id === proc.employeeId);
                  return (
                    <div key={proc.id} onClick={() => setActiveTab('onboarding')} className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50 p-3.5 hover:bg-slate-100/70 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={emp?.avatar} alt={emp?.firstName} className="h-8 w-8 rounded-full object-cover border" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{emp?.firstName} {emp?.lastName}</p>
                            <p className="text-[10px] text-slate-500">{emp?.designation}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-cisd-navy-900">{proc.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-cisd-navy-900 h-full rounded-full" style={{ width: `${proc.progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Recruitment Requisitions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">Active Recruitment Vacancies</h3>
                <button onClick={() => setActiveTab('recruitment')} className="text-xs font-semibold text-cisd-navy-900 hover:underline">
                  ATS Pipeline
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {db.recruitmentJobs.map(job => (
                  <div key={job.id} onClick={() => setActiveTab('recruitment')} className="cursor-pointer rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition space-y-1">
                    <span className="font-bold text-slate-900 text-xs block">{job.title}</span>
                    <p className="text-[11px] text-slate-500">{job.salaryRange}</p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                      {job.openings} Open Seat &bull; Closes {job.deadline}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: HR Training & Notices */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-cisd-navy-900" />
                  CISD Academy Masterclasses
                </h3>
                <button onClick={() => setActiveTab('training')} className="text-[11px] font-semibold text-cisd-navy-900 hover:underline">
                  Academy
                </button>
              </div>
              <div className="space-y-2">
                {db.trainingCourses.map(c => (
                  <div key={c.id} onClick={() => setActiveTab('training')} className="cursor-pointer rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition space-y-1">
                    <span className="font-bold text-slate-900 text-xs block">{c.title}</span>
                    <p className="text-[10px] text-slate-500">{c.instructor} &bull; {c.durationHours} hrs</p>
                    <span className="text-[10px] text-cisd-gold-800 font-bold block">
                      {c.enrolledEmployeeIds.length} / {c.maxParticipants} Seats Enrolled
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Noticeboard */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">Circulars & Announcements</h3>
                <button onClick={() => setActiveTab('announcements')} className="text-[11px] font-semibold text-cisd-navy-900 hover:underline">
                  All
                </button>
              </div>
              <div className="space-y-2">
                {db.announcements.slice(0, 3).map(ann => (
                  <div key={ann.id} onClick={() => setActiveTab('announcements')} className="cursor-pointer rounded-xl bg-slate-50 p-2.5 hover:bg-slate-100 transition space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs block truncate">{ann.title}</span>
                    <span className="text-[10px] text-slate-400">{ann.publishDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: LINE_MANAGER (Department Directorate Command Center)
  // ==========================================
  if (role === 'LINE_MANAGER') {
    return (
      <div className="space-y-6">
        {/* Manager Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-cisd-navy-900 to-slate-900 p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-purple-500 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Directorate Command Center &bull; Line Manager
                </span>
                <span className="text-xs text-slate-300">&bull; {myDepartment?.name || 'Directorate'}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Manager Workspace: {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Supervising {teamMembers.length} researchers, fellows, and technical associates in the {myDepartment?.name}.
                Today <span className="font-semibold text-cisd-gold-300">{teamInOfficeToday} team members</span> are on-site in Abuja and{' '}
                <span className="font-semibold text-cisd-gold-300">{teamRemoteToday}</span> are on remote/field assignment.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setQuickLeaveModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-cisd-gold-500 px-3.5 py-2 text-xs font-bold text-cisd-navy-950 hover:bg-cisd-gold-400 shadow transition"
              >
                <PlusCircle className="h-4 w-4" />
                My Leave
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <Briefcase className="h-4 w-4" />
                Assign Task
              </button>
              <button
                onClick={() => setActiveTab('hybrid')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <CalendarRange className="h-4 w-4" />
                Team Roster
              </button>
            </div>
          </div>
        </div>

        {/* Manager KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <div onClick={() => setActiveTab('employees')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-purple-300 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Team Size</span>
            <p className="text-2xl font-black text-slate-900">{teamMembers.length}</p>
            <span className="text-[10px] text-slate-500">In my directorate</span>
          </div>

          <div onClick={() => setActiveTab('hybrid')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-purple-300 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Team In-Office</span>
            <p className="text-2xl font-black text-emerald-600">{teamInOfficeToday}</p>
            <span className="text-[10px] text-slate-500">On-site today</span>
          </div>

          <div onClick={() => setActiveTab('hybrid')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-purple-300 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Team Remote</span>
            <p className="text-2xl font-black text-blue-600">{teamRemoteToday}</p>
            <span className="text-[10px] text-slate-500">Telework / Field</span>
          </div>

          <div onClick={() => setActiveTab('leave')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-purple-300 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Team Leave Req</span>
            <p className="text-2xl font-black text-amber-600">{teamPendingLeaves.length}</p>
            <span className="text-[10px] text-amber-600 font-semibold">Requires my approval</span>
          </div>

          <div onClick={() => setActiveTab('timesheets')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-purple-300 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Team Timesheets</span>
            <p className="text-2xl font-black text-indigo-600">{teamPendingTimesheets.length}</p>
            <span className="text-[10px] text-indigo-600 font-semibold">Awaiting sign-off</span>
          </div>

          <div onClick={() => setActiveTab('tasks')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-purple-300 transition space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Team Tasks</span>
            <p className="text-2xl font-black text-slate-900">{teamTasks.length}</p>
            <span className="text-[10px] text-slate-500">Active deliverables</span>
          </div>
        </div>

        {/* Manager Operational Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Team Pending Approvals Queue */}
            {teamPendingLeaves.length > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Directorate Action Required: Team Leave Requests ({teamPendingLeaves.length})
                    </h3>
                  </div>
                  <button onClick={() => setActiveTab('leave')} className="text-xs font-semibold text-amber-800 hover:underline">
                    Team Leaves
                  </button>
                </div>

                <div className="space-y-2">
                  {teamPendingLeaves.map(leave => {
                    const emp = db.employees.find(e => e.id === leave.employeeId);
                    return (
                      <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-3.5 border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <img src={emp?.avatar} alt={emp?.firstName} className="h-9 w-9 rounded-full object-cover border" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{emp?.firstName} {emp?.lastName}</p>
                            <p className="text-[11px] text-slate-600">
                              {leave.daysCount} days of {leave.leaveType} ({leave.startDate} to {leave.endDate})
                            </p>
                            <p className="text-[10px] text-slate-400 italic">&ldquo;{leave.reason}&rdquo;</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleQuickApproveLeave(leave.id)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                          >
                            Approve for Team
                          </button>
                          <button
                            onClick={() => setActiveTab('leave')}
                            className="rounded-lg border bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  All team leave requests for {myDepartment?.name} are currently reviewed and up to date!
                </span>
                <button onClick={() => setActiveTab('leave')} className="text-emerald-800 font-semibold hover:underline">
                  Leave History
                </button>
              </div>
            )}

            {/* Team Presence Grid */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Team Roster: Today&apos;s Modality</h3>
                  <p className="text-xs text-slate-500">Live seat check for {myDepartment?.name}</p>
                </div>
                <button onClick={() => setActiveTab('hybrid')} className="text-xs font-semibold text-cisd-navy-900 hover:underline">
                  Full Roster
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamMembers.map(emp => {
                  const att = attendanceToday.find(a => a.employeeId === emp.id);
                  const isOffice = att?.workType === 'OFFICE' || (!att && emp.id !== currentUser.id);

                  return (
                    <div key={emp.id} onClick={() => setSelectedEmployeeIdForModal(emp.id)} className="cursor-pointer flex items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition">
                      <div className="flex items-center gap-2.5">
                        <img src={emp.avatar} alt={emp.firstName} className="h-8 w-8 rounded-full object-cover border" />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[10px] text-slate-400">{emp.designation}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isOffice ? 'bg-cisd-navy-900 text-white' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isOffice ? 'Office HQ' : 'Remote'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Directorate Deliverables */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">Directorate Deliverables</h3>
                <button onClick={() => setActiveTab('tasks')} className="text-xs font-semibold text-cisd-navy-900 hover:underline">
                  Manage Deliverables
                </button>
              </div>
              <div className="space-y-2">
                {teamTasks.map(t => {
                  const assignee = db.employees.find(e => e.id === t.assignedToId);
                  return (
                    <div key={t.id} onClick={() => setActiveTab('tasks')} className="cursor-pointer flex items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition">
                      <div className="min-w-0 flex-1 pr-3">
                        <span className="font-bold text-slate-900 text-xs block truncate">{t.title}</span>
                        <p className="text-[10px] text-slate-500">Assigned: {assignee?.firstName} {assignee?.lastName} &bull; Due: {t.dueDate}</p>
                      </div>
                      <span className="text-xs font-bold text-cisd-navy-900">{t.progressPercentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Team Meetings */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MessagesSquare className="h-4 w-4 text-purple-700" />
                  Upcoming Sessions
                </h3>
                <button onClick={() => setActiveTab('meetings')} className="text-[11px] font-semibold text-cisd-navy-900 hover:underline">
                  Schedule
                </button>
              </div>
              <div className="space-y-2">
                {db.meetings.slice(0, 3).map(m => (
                  <div key={m.id} onClick={() => setActiveTab('meetings')} className="cursor-pointer rounded-xl bg-slate-50 p-2.5 hover:bg-slate-100 transition space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs block truncate">{m.title}</span>
                    <span className="text-[10px] text-slate-400">{m.date} &bull; {m.startTime}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notices */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Sparkles className="h-4 w-4 text-cisd-gold-600" />
                Notices & Announcements
              </h3>
              <div className="space-y-2">
                {db.announcements.slice(0, 2).map(ann => (
                  <div key={ann.id} onClick={() => setActiveTab('announcements')} className="cursor-pointer rounded-xl bg-slate-50/60 p-2.5 hover:bg-slate-100 transition space-y-1">
                    <span className="font-bold text-slate-900 text-xs block truncate">{ann.title}</span>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: EMPLOYEE (Self-Service Workspace)
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Employee Personal Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cisd-navy-950 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                Staff Self-Service Workspace
              </span>
              <span className="text-xs text-slate-300">&bull; {currentUser.designation}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Hello, {currentUser.firstName} {currentUser.lastName}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Member of the <span className="font-semibold text-cisd-gold-300">{myDepartment?.name}</span>.
              Manage your personal working hours, leave balance, assigned deliverables, and upcoming multilateral sessions.
            </p>
          </div>

          {/* Personal Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {!myAttendance ? (
              <button
                onClick={() => handleClockInAction('OFFICE')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 shadow transition"
              >
                <Clock className="h-4 w-4" />
                Clock In (Office)
              </button>
            ) : !myAttendance.clockOut ? (
              <button
                onClick={handleClockOutAction}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow transition"
              >
                <Clock className="h-4 w-4" />
                End Shift (Clock Out)
              </button>
            ) : (
              <span className="rounded-xl bg-white/20 px-3.5 py-2 text-xs font-bold text-white">
                Shift Completed
              </span>
            )}

            <button
              onClick={() => setQuickLeaveModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-cisd-gold-500 px-3.5 py-2 text-xs font-bold text-cisd-navy-950 hover:bg-cisd-gold-400 shadow transition"
            >
              <PlusCircle className="h-4 w-4" />
              Apply Leave
            </button>

            <button
              onClick={() => setActiveTab('timesheets')}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              <Timer className="h-4 w-4" />
              Log Timesheet
            </button>
          </div>
        </div>
      </div>

      {/* Employee Personal Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's Attendance */}
        <div onClick={() => setActiveTab('attendance')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-300 transition space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Attendance Today</span>
          <p className="text-base font-black text-slate-900 mt-1">
            {myAttendance ? `${myAttendance.clockIn}` : 'Not Clocked In'}
          </p>
          <span className={`text-[10px] font-semibold ${myAttendance ? 'text-emerald-600' : 'text-amber-600'}`}>
            {myAttendance ? `${myAttendance.workType} Session` : 'Threshold 08:30'}
          </span>
        </div>

        {/* Annual Leave Left */}
        <div onClick={() => setActiveTab('leave')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-300 transition space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Annual Leave</span>
          <p className="text-2xl font-black text-emerald-600">{myBalance.annualTotal - myBalance.annualUsed}</p>
          <span className="text-[10px] text-slate-500">days left of {myBalance.annualTotal}</span>
        </div>

        {/* Sick Leave Left */}
        <div onClick={() => setActiveTab('leave')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-300 transition space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Medical Leave</span>
          <p className="text-2xl font-black text-blue-600">{myBalance.sickTotal - myBalance.sickUsed}</p>
          <span className="text-[10px] text-slate-500">days available</span>
        </div>

        {/* Assigned Deliverables */}
        <div onClick={() => setActiveTab('tasks')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-300 transition space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">My Deliverables</span>
          <p className="text-2xl font-black text-slate-900">{myTasks.length}</p>
          <span className="text-[10px] text-cisd-navy-800 font-semibold">{myTasks.filter(t => t.status !== 'COMPLETED').length} active</span>
        </div>

        {/* Project Hours This Week */}
        <div onClick={() => setActiveTab('timesheets')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-300 transition space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Timesheet Hours</span>
          <p className="text-2xl font-black text-indigo-600">
            {myTimesheetThisWeek ? `${myTimesheetThisWeek.totalHours}h` : '40h'}
          </p>
          <span className="text-[10px] text-slate-500">Logged this cycle</span>
        </div>

        {/* Hardware in Custody */}
        <div onClick={() => setActiveTab('assets')} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-300 transition space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Assigned Assets</span>
          <p className="text-2xl font-black text-slate-900">{myAssets.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Under personal custody</span>
        </div>
      </div>

      {/* Main 2-Column Section for Employee */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Deliverables & Weekly Roster */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Active Tasks & Deliverables */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">My Strategic Deliverables & Deadlines</h3>
                <p className="text-xs text-slate-500">Track and update your research milestones and policy non-papers</p>
              </div>
              <button onClick={() => setActiveTab('tasks')} className="text-xs font-semibold text-cisd-navy-900 hover:underline">
                View All Deliverables
              </button>
            </div>

            {myTasks.length > 0 ? (
              <div className="space-y-3">
                {myTasks.map(task => {
                  const isDone = task.status === 'COMPLETED';
                  return (
                    <div key={task.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2 hover:bg-slate-50 transition">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            task.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                          <h4 className={`font-bold text-xs mt-1 ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </h4>
                        </div>

                        <button
                          onClick={() => handleUpdateMyTaskStatus(task.id, isDone ? 'IN_PROGRESS' : 'COMPLETED')}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition shadow-xs ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-cisd-navy-900 text-white hover:bg-cisd-navy-800'
                          }`}
                        >
                          {isDone ? <CheckCheck className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          {isDone ? 'Completed' : 'Mark Done'}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">{task.description}</p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>Target Deadline: <strong className="text-slate-700">{task.dueDate}</strong></span>
                        <span className="font-bold text-cisd-navy-900">{task.progressPercentage}% progress</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-500 italic">
                You have no pending deliverables assigned at this moment.
              </div>
            )}
          </div>

          {/* My Weekly Office/Remote Schedule */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">My Weekly Working Schedule</h3>
                <p className="text-xs text-slate-500">Week of 02 Nov – 06 Nov 2026</p>
              </div>
              <button onClick={() => setActiveTab('hybrid')} className="text-xs font-semibold text-cisd-navy-900 hover:underline">
                Request Shift
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[
                { day: 'Mon', date: '02', mod: mySchedule?.monday || 'OFFICE' },
                { day: 'Tue', date: '03', mod: mySchedule?.tuesday || 'OFFICE' },
                { day: 'Wed', date: '04', mod: mySchedule?.wednesday || 'OFFICE' },
                { day: 'Thu (Today)', date: '05', mod: mySchedule?.thursday || 'OFFICE', isToday: true },
                { day: 'Fri', date: '06', mod: mySchedule?.friday || 'REMOTE' }
              ].map((d, i) => (
                <div key={i} className={`rounded-xl border p-2.5 space-y-1 ${
                  d.isToday ? 'border-cisd-gold-500 bg-cisd-gold-50/30' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  <span className="text-[10px] text-slate-500 font-bold block">{d.day}</span>
                  <span className="text-sm font-black text-slate-900 block">{d.date}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-block ${
                    d.mod === 'OFFICE' ? 'bg-cisd-navy-900 text-white' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {d.mod}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Meetings, Hardware, Notices */}
        <div className="space-y-6">
          {/* My Next Meeting / Dialogue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <MessagesSquare className="h-4 w-4 text-cisd-navy-900" />
              My Upcoming Sessions
            </h3>
            {myMeetings.length > 0 ? (
              <div className="space-y-2.5">
                {myMeetings.map(m => (
                  <div key={m.id} className="rounded-xl bg-slate-50 p-3 space-y-2 border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block leading-snug">{m.title}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.date} &bull; {m.startTime} – {m.endTime}</p>
                    </div>
                    {m.isVirtual && m.virtualLink && (
                      <a
                        href={m.virtualLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1 rounded-lg bg-blue-50 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join Virtual Room
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-xs text-center py-2">No meetings scheduled today.</p>
            )}
          </div>

          {/* My Hardware in Custody */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Laptop className="h-4 w-4 text-cisd-navy-900" />
                My Assigned Hardware
              </h3>
              <button onClick={() => setActiveTab('assets')} className="text-[10px] text-slate-500 hover:underline">
                Registry
              </button>
            </div>
            <div className="space-y-2">
              {myAssets.map(a => (
                <div key={a.id} className="rounded-xl bg-slate-50 p-2.5 text-xs space-y-0.5 border border-slate-100">
                  <span className="font-bold text-slate-900 block truncate">{a.name}</span>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>SN: {a.serialNumber}</span>
                    <span className="font-semibold text-emerald-700">{a.condition}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Circulars */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sparkles className="h-4 w-4 text-cisd-gold-600" />
              Notices
            </h3>
            <div className="space-y-2">
              {db.announcements.slice(0, 2).map(ann => (
                <div key={ann.id} onClick={() => setActiveTab('announcements')} className="cursor-pointer rounded-xl bg-slate-50 p-2.5 hover:bg-slate-100 transition space-y-0.5">
                  <span className="font-bold text-slate-900 text-xs block truncate">{ann.title}</span>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Leave Application Modal */}
      {quickLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Apply for Leave</h3>
              <button onClick={() => setQuickLeaveModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleQuickLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  <option value="ANNUAL">Annual Leave ({myBalance.annualTotal - myBalance.annualUsed} days left)</option>
                  <option value="SICK">Sick Leave ({myBalance.sickTotal - myBalance.sickUsed} days left)</option>
                  <option value="CASUAL">Casual Leave ({myBalance.casualTotal - myBalance.casualUsed} days left)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (Working Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason & Emergency Reachability</label>
                <textarea
                  rows={2}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Operational justification and contact details..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setQuickLeaveModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
