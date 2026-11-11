'use client';

import React, { useState, useEffect } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Timer,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Save,
  Send,
  Edit3,
  Unlock,
  UserPlus,
  Building2,
  X,
  History,
  Check,
  Briefcase
} from 'lucide-react';
import { Timesheet, TimesheetEntry } from '@/lib/types';

export default function TimesheetsModule() {
  const { db, currentUser, dispatch, showToast } = usePortal();

  // Preset week options
  const weekOptions = [
    { start: '2026-11-09', end: '2026-11-13', label: '09 Nov – 13 Nov 2026 (Current Week)' },
    { start: '2026-11-02', end: '2026-11-06', label: '02 Nov – 06 Nov 2026' },
    { start: '2026-10-26', end: '2026-10-30', label: '26 Oct – 30 Oct 2026' },
    { start: '2026-10-19', end: '2026-10-23', label: '19 Oct – 23 Oct 2026' }
  ];

  const [selectedWeek, setSelectedWeek] = useState('2026-11-02');
  const [activeTab, setActiveTab] = useState<'my_timesheet' | 'team_queue' | 'history'>('my_timesheet');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assignment Modal for Team Leads, HR, and ED
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetEmpId, setAssignTargetEmpId] = useState('');
  const [assignProjectName, setAssignProjectName] = useState('');
  const [assignActivity, setAssignActivity] = useState('');
  const [assignWeekStart, setAssignWeekStart] = useState('2026-11-02');
  const [assignMon, setAssignMon] = useState(0);
  const [assignTue, setAssignTue] = useState(0);
  const [assignWed, setAssignWed] = useState(0);
  const [assignThu, setAssignThu] = useState(0);
  const [assignFri, setAssignFri] = useState(0);
  const [assignLoading, setAssignLoading] = useState(false);

  // Local table state
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);

  if (!db || !currentUser) return null;

  const role = currentUser.role || 'EMPLOYEE';
  const isExecutiveOrHR = role === 'SUPER_ADMIN' || role === 'HR_ADMIN';
  const isTeamLead = role === 'LINE_MANAGER';
  const canManageTeam = isExecutiveOrHR || isTeamLead;

  // Find existing timesheet in database for current user and selected week
  const existingTimesheet = db.timesheets?.find(
    t => t.employeeId === currentUser.id && t.weekStartDate === selectedWeek
  );

  // Sync entries whenever the selected week, current user, or database timesheets change
  useEffect(() => {
    if (existingTimesheet && existingTimesheet.entries && existingTimesheet.entries.length > 0) {
      // Clone deeply to allow responsive local edits
      setEntries(existingTimesheet.entries.map(e => ({ ...e })));
    } else {
      // Clean starter row tailored for the employee's organization arm
      setEntries([
        {
          projectId: `prj-${Date.now()}-1`,
          projectName: 'Institutional Project / Policy Implementation',
          activity: 'Policy analysis, stakeholder coordination & deliverables',
          mon: 0,
          tue: 0,
          wed: 0,
          thu: 0,
          fri: 0,
          totalHours: 0
        }
      ]);
    }
  }, [selectedWeek, currentUser.id, existingTimesheet?.id, existingTimesheet?.status, existingTimesheet?.entries]);

  // Calculate current week hours
  const totalWeeklyHours = entries.reduce((acc, curr) => acc + (Number(curr.totalHours) || 0), 0);

  // Filter team members based on department or enterprise scope
  const teamEmployees = isExecutiveOrHR
    ? db.employees
    : db.employees.filter(e => e.departmentId === currentUser.departmentId);

  const teamMemberIds = teamEmployees.map(e => e.id);

  // Pending timesheets for approval
  const pendingTimesheets = !canManageTeam
    ? []
    : isTeamLead
    ? (db.timesheets || []).filter(t => t.status === 'SUBMITTED' && teamMemberIds.includes(t.employeeId) && t.employeeId !== currentUser.id)
    : (db.timesheets || []).filter(t => t.status === 'SUBMITTED');

  // Timesheet history for current user
  const userTimesheetHistory = (db.timesheets || []).filter(t => t.employeeId === currentUser.id);

  const handleHourChange = (index: number, day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri', val: number) => {
    const updated = [...entries];
    const cleanNum = Math.max(0, Math.min(24, Number(val) || 0));
    updated[index][day] = cleanNum;
    updated[index].totalHours =
      Number(updated[index].mon || 0) +
      Number(updated[index].tue || 0) +
      Number(updated[index].wed || 0) +
      Number(updated[index].thu || 0) +
      Number(updated[index].fri || 0);
    setEntries(updated);
  };

  const handleAddProjectRow = () => {
    setEntries([
      ...entries,
      {
        projectId: `prj-${Date.now()}`,
        projectName: 'Deliverable / Strategic Initiative',
        activity: 'Technical task execution, media coverage, or advisory research',
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        totalHours: 0
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (entries.length === 1) {
      showToast('A timesheet must contain at least one project activity row', 'error');
      return;
    }
    setEntries(entries.filter((_, i) => i !== index));
  };

  // 1. SAVE DRAFT (Persists immediately to database without submitting for review)
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const selectedOption = weekOptions.find(w => w.start === selectedWeek);
      const res = await dispatch('SAVE_TIMESHEET', {
        id: existingTimesheet?.id,
        employeeId: currentUser.id,
        weekStartDate: selectedWeek,
        weekEndDate: selectedOption?.end || selectedWeek,
        entries,
        status: existingTimesheet?.status === 'APPROVED' ? 'APPROVED' : 'DRAFT'
      });

      if (res.success) {
        showToast(`Timesheet draft saved (${totalWeeklyHours} hours)`, 'success');
      } else {
        showToast(res.error || 'Failed to save timesheet', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 2. SUBMIT FOR APPROVAL
  const handleSubmitTimesheet = async () => {
    if (totalWeeklyHours === 0) {
      showToast('Please log at least one project hour before submitting', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedOption = weekOptions.find(w => w.start === selectedWeek);
      const res = await dispatch('SUBMIT_TIMESHEET', {
        id: existingTimesheet?.id,
        employeeId: currentUser.id,
        weekStartDate: selectedWeek,
        weekEndDate: selectedOption?.end || selectedWeek,
        entries
      });

      if (res.success) {
        showToast(`Submitted ${totalWeeklyHours} hours for managerial approval`, 'success');
      } else {
        showToast(res.error || 'Failed to submit timesheet', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. UNLOCK / REVISE TIMESHEET
  const handleUnlockForEdit = async () => {
    if (!existingTimesheet) return;
    const res = await dispatch('UNLOCK_TIMESHEET', { id: existingTimesheet.id });
    if (res.success) {
      showToast('Timesheet unlocked. You can now edit hours and re-save or re-submit.', 'info');
    }
  };

  // 4. MANAGER APPROVE / DECLINE
  const handleReviewTimesheet = async (timesheetId: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await dispatch('REVIEW_TIMESHEET', {
      id: timesheetId,
      status
    });
    if (res.success) {
      showToast(`Timesheet ${status === 'APPROVED' ? 'approved successfully' : 'declined'}`, 'success');
    }
  };

  // 5. ASSIGN TIMESHEET TASK (For Team Leads & HR)
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTargetEmpId || !assignProjectName) {
      showToast('Please select a staff member and provide a project name', 'error');
      return;
    }

    setAssignLoading(true);
    try {
      const selectedOption = weekOptions.find(w => w.start === assignWeekStart);
      const res = await dispatch('ASSIGN_TIMESHEET', {
        targetEmployeeId: assignTargetEmpId,
        weekStartDate: assignWeekStart,
        weekEndDate: selectedOption?.end || assignWeekStart,
        projectName: assignProjectName,
        activity: assignActivity,
        mon: assignMon,
        tue: assignTue,
        wed: assignWed,
        thu: assignThu,
        fri: assignFri
      });

      if (res.success) {
        const emp = db.employees.find(e => e.id === assignTargetEmpId);
        showToast(`Deliverable assigned to ${emp?.firstName} ${emp?.lastName} successfully`, 'success');
        setShowAssignModal(false);
        // Reset form
        setAssignProjectName('');
        setAssignActivity('');
        setAssignMon(0);
        setAssignTue(0);
        setAssignWed(0);
        setAssignThu(0);
        setAssignFri(0);
      } else {
        showToast(res.error || 'Could not assign timesheet', 'error');
      }
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Timesheets & Deliverables Accounting</h2>
            <span className="rounded-full bg-cisd-navy-50 border border-cisd-navy-200 px-2.5 py-0.5 text-[11px] font-bold text-cisd-navy-800">
              Live Relational DB
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log analytical research, media coverage deliverables, project implementation, and billable grant hours
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canManageTeam && (
            <button
              onClick={() => {
                if (teamEmployees.length > 0 && !assignTargetEmpId) {
                  setAssignTargetEmpId(teamEmployees[0].id);
                }
                setShowAssignModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-cisd-gold-500 hover:bg-cisd-gold-400 text-cisd-navy-950 px-3.5 py-2 text-xs font-bold shadow-sm transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>Assign Deliverable</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm text-xs">
            <span className="text-[11px] font-bold text-slate-500 pl-2">Week:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="rounded-lg bg-slate-50 py-1 px-2 text-xs font-semibold text-slate-800 border-0 focus:ring-1 focus:ring-cisd-navy-600"
            >
              {weekOptions.map(opt => (
                <option key={opt.start} value={opt.start}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (My Timesheet vs Team Queue vs History) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('my_timesheet')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
            activeTab === 'my_timesheet'
              ? 'bg-cisd-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Timer className="h-4 w-4" />
          <span>My Weekly Timesheet</span>
        </button>

        {canManageTeam && (
          <button
            onClick={() => setActiveTab('team_queue')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
              activeTab === 'team_queue'
                ? 'bg-cisd-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Team Approvals Queue</span>
            {pendingTimesheets.length > 0 && (
              <span className="rounded-full bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2">
                {pendingTimesheets.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
            activeTab === 'history'
              ? 'bg-cisd-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Submission History</span>
          <span className="text-[10px] text-slate-400">({userTimesheetHistory.length})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: MY WEEKLY TIMESHEET EDITOR                                    */}
      {/* ==================================================================== */}
      {activeTab === 'my_timesheet' && (
        <div className="space-y-4">
          {/* Status Ribbon */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cisd-navy-50 text-cisd-navy-900 border border-cisd-navy-100 font-bold">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">
                  Logging Period: {weekOptions.find(w => w.start === selectedWeek)?.label || selectedWeek}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-500">Employee:</span>
                  <span className="text-[11px] font-bold text-slate-800">
                    {currentUser.firstName} {currentUser.lastName} ({currentUser.employeeId})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Weekly Total</span>
                <span className="text-sm font-black text-cisd-navy-900">{totalWeeklyHours.toFixed(1)} / 40.0 hrs</span>
              </div>

              {/* Status Badge */}
              <span
                className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
                  existingTimesheet?.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : existingTimesheet?.status === 'SUBMITTED'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : existingTimesheet?.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {existingTimesheet?.status === 'APPROVED'
                  ? '✓ Approved'
                  : existingTimesheet?.status === 'SUBMITTED'
                  ? '⏳ Pending Review'
                  : existingTimesheet?.status === 'REJECTED'
                  ? '✕ Rejected'
                  : '● In Progress / Draft'}
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Project Deliverables & Daily Hours Breakdown</h3>
                <p className="text-xs text-slate-500">
                  {existingTimesheet?.status === 'SUBMITTED'
                    ? 'This timesheet is submitted and awaiting review. Click "Revise Hours" below if you need to update it.'
                    : existingTimesheet?.status === 'APPROVED'
                    ? 'This timesheet has been approved by your manager and locked.'
                    : 'Enter hours worked per initiative (Monday through Friday). Saved changes persist directly.'}
                </p>
              </div>

              {existingTimesheet?.status === 'SUBMITTED' && (
                <button
                  onClick={handleUnlockForEdit}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Unlock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Revise / Edit Hours</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-3 w-1/4">Project / Initiative</th>
                    <th className="py-3 px-3 w-1/4">Activity Description</th>
                    <th className="py-3 px-2 text-center w-14">Mon</th>
                    <th className="py-3 px-2 text-center w-14">Tue</th>
                    <th className="py-3 px-2 text-center w-14">Wed</th>
                    <th className="py-3 px-2 text-center w-14">Thu</th>
                    <th className="py-3 px-2 text-center w-14">Fri</th>
                    <th className="py-3 px-3 text-center w-20">Total</th>
                    <th className="py-3 px-2 text-right w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map((entry, idx) => {
                    const isLocked = existingTimesheet?.status === 'APPROVED' || existingTimesheet?.status === 'SUBMITTED';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            disabled={isLocked}
                            value={entry.projectName}
                            onChange={(e) => {
                              const updated = [...entries];
                              updated[idx].projectName = e.target.value;
                              setEntries(updated);
                            }}
                            placeholder="e.g. GX Media Coverage, Policy Reform"
                            className="w-full rounded-lg border border-slate-200 p-1.5 font-bold text-slate-900 text-xs disabled:bg-slate-100 disabled:text-slate-600"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            disabled={isLocked}
                            value={entry.activity}
                            onChange={(e) => {
                              const updated = [...entries];
                              updated[idx].activity = e.target.value;
                              setEntries(updated);
                            }}
                            placeholder="e.g. Stakeholder briefing, video editing"
                            className="w-full rounded-lg border border-slate-200 p-1.5 text-slate-600 text-xs disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            disabled={isLocked}
                            value={entry.mon || ''}
                            onChange={(e) => handleHourChange(idx, 'mon', Number(e.target.value))}
                            className="w-12 text-center rounded-lg border border-slate-200 p-1 text-xs font-bold text-slate-800 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            disabled={isLocked}
                            value={entry.tue || ''}
                            onChange={(e) => handleHourChange(idx, 'tue', Number(e.target.value))}
                            className="w-12 text-center rounded-lg border border-slate-200 p-1 text-xs font-bold text-slate-800 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            disabled={isLocked}
                            value={entry.wed || ''}
                            onChange={(e) => handleHourChange(idx, 'wed', Number(e.target.value))}
                            className="w-12 text-center rounded-lg border border-slate-200 p-1 text-xs font-bold text-slate-800 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            disabled={isLocked}
                            value={entry.thu || ''}
                            onChange={(e) => handleHourChange(idx, 'thu', Number(e.target.value))}
                            className="w-12 text-center rounded-lg border border-slate-200 p-1 text-xs font-bold text-slate-800 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            disabled={isLocked}
                            value={entry.fri || ''}
                            onChange={(e) => handleHourChange(idx, 'fri', Number(e.target.value))}
                            className="w-12 text-center rounded-lg border border-slate-200 p-1 text-xs font-bold text-slate-800 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center font-black text-cisd-navy-900 text-sm">
                          {entry.totalHours}h
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {!isLocked && (
                            <button
                              onClick={() => handleRemoveRow(idx)}
                              className="p-1 text-slate-300 hover:text-rose-600 transition"
                              title="Remove Deliverable Row"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAddProjectRow}
                disabled={existingTimesheet?.status === 'APPROVED' || existingTimesheet?.status === 'SUBMITTED'}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition"
              >
                <Plus className="h-4 w-4" />
                Add Project Deliverable Row
              </button>

              <div className="flex items-center gap-2">
                {/* Save Draft Button (Always allows saving current state) */}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving || existingTimesheet?.status === 'APPROVED'}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4 text-slate-500" />
                  <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                </button>

                {/* Submit / Status State */}
                {existingTimesheet?.status === 'SUBMITTED' ? (
                  <span className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 text-xs font-bold text-blue-700">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>Submitted for Approval</span>
                  </span>
                ) : existingTimesheet?.status === 'APPROVED' ? (
                  <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-700">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Approved & Locked</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitTimesheet}
                    disabled={isSubmitting || totalWeeklyHours === 0}
                    className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 hover:bg-cisd-navy-800 text-white px-5 py-2 text-xs font-bold shadow transition disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit for Manager Approval'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: TEAM APPROVALS QUEUE (FOR TEAM LEADS, HR, AND ED)             */}
      {/* ==================================================================== */}
      {activeTab === 'team_queue' && canManageTeam && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isTeamLead ? 'Directorate Action: Team Timesheet Adjudication' : 'Institutional Timesheet Review Queue'}
                </h3>
                <p className="text-xs text-slate-500">
                  Review and sign off on project hours submitted across your team
                </p>
              </div>
              <span className="rounded-xl bg-cisd-navy-50 text-cisd-navy-900 border border-cisd-navy-200 px-3 py-1 font-bold text-xs">
                {pendingTimesheets.length} Pending
              </span>
            </div>

            {pendingTimesheets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No pending timesheets awaiting review</p>
                <p className="text-[11px] text-slate-400">All submitted project hours have been adjudicated.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTimesheets.map(ts => {
                  const emp = db.employees.find(e => e.id === ts.employeeId);
                  const dept = db.departments.find(d => d.id === emp?.departmentId);

                  return (
                    <div key={ts.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 hover:border-cisd-gold-400 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                            alt={emp?.firstName}
                            className="h-9 w-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{emp?.firstName} {emp?.lastName}</p>
                            <p className="text-[10px] text-slate-500">{emp?.designation} &bull; {dept?.name}</p>
                          </div>
                        </div>

                        <span className="rounded-lg bg-cisd-navy-900 text-white font-black text-xs px-2.5 py-1">
                          {ts.totalHours} hrs
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-700 space-y-1.5 border border-slate-100">
                        <p className="font-semibold text-slate-900">Period: {ts.weekStartDate} to {ts.weekEndDate}</p>
                        <div className="space-y-1 pt-1 border-t border-slate-200">
                          {ts.entries.map((entry, i) => (
                            <div key={i} className="flex justify-between text-[10px]">
                              <span className="font-medium text-slate-800 truncate pr-2">
                                &bull; {entry.projectName}: {entry.activity}
                              </span>
                              <span className="font-bold text-slate-900">{entry.totalHours}h</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleReviewTimesheet(ts.id, 'REJECTED')}
                          className="rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-1.5 text-xs font-semibold transition"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleReviewTimesheet(ts.id, 'APPROVED')}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-xs font-bold shadow-sm transition"
                        >
                          Approve Hours
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: SUBMISSION HISTORY                                            */}
      {/* ==================================================================== */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Timesheet Submission History</h3>
            <p className="text-xs text-slate-500">Record of all past weekly logs and their approval statuses</p>
          </div>

          {userTimesheetHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No historical timesheet logs found for this account.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {userTimesheetHistory.map(ts => (
                <div key={ts.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">
                      Week of {ts.weekStartDate} – {ts.weekEndDate}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {ts.entries.length} initiative(s): {ts.entries.map(e => e.projectName).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800 text-sm">{ts.totalHours} hrs</span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border ${
                        ts.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : ts.status === 'SUBMITTED'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      {ts.status}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedWeek(ts.weekStartDate);
                        setActiveTab('my_timesheet');
                      }}
                      className="text-cisd-navy-700 hover:underline font-bold text-[11px]"
                    >
                      View / Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ASSIGN TIMESHEET TASK (TEAM LEADS & HR)                       */}
      {/* ==================================================================== */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cisd-gold-100 text-cisd-gold-800 font-bold">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Assign Project Deliverable</h4>
                  <p className="text-[10px] text-slate-500">Add project work to a staff member's weekly timesheet</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Assign To Team Member</label>
                <select
                  required
                  value={assignTargetEmpId}
                  onChange={(e) => setAssignTargetEmpId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800"
                >
                  <option value="">Select staff member...</option>
                  {teamEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Project / Deliverable Name</label>
                <input
                  type="text"
                  required
                  value={assignProjectName}
                  onChange={(e) => setAssignProjectName(e.target.value)}
                  placeholder="e.g. GX Media Video Production, Switch Advisory Policy Brief"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Activity & Terms of Reference</label>
                <textarea
                  rows={2}
                  value={assignActivity}
                  onChange={(e) => setAssignActivity(e.target.value)}
                  placeholder="Specific tasks, coverage requirements, or deliverables..."
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Target Week</label>
                <select
                  value={assignWeekStart}
                  onChange={(e) => setAssignWeekStart(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800"
                >
                  {weekOptions.map(opt => (
                    <option key={opt.start} value={opt.start}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block">Pre-Allocated Daily Hours (Optional)</label>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold text-slate-500">
                  <div>
                    <span>Mon</span>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={assignMon || ''}
                      onChange={(e) => setAssignMon(Number(e.target.value))}
                      className="w-full mt-1 rounded-lg border border-slate-200 p-1 text-center font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <span>Tue</span>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={assignTue || ''}
                      onChange={(e) => setAssignTue(Number(e.target.value))}
                      className="w-full mt-1 rounded-lg border border-slate-200 p-1 text-center font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <span>Wed</span>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={assignWed || ''}
                      onChange={(e) => setAssignWed(Number(e.target.value))}
                      className="w-full mt-1 rounded-lg border border-slate-200 p-1 text-center font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <span>Thu</span>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={assignThu || ''}
                      onChange={(e) => setAssignThu(Number(e.target.value))}
                      className="w-full mt-1 rounded-lg border border-slate-200 p-1 text-center font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <span>Fri</span>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={assignFri || ''}
                      onChange={(e) => setAssignFri(Number(e.target.value))}
                      className="w-full mt-1 rounded-lg border border-slate-200 p-1 text-center font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="rounded-xl bg-cisd-navy-900 hover:bg-cisd-navy-800 text-white px-5 py-2 font-bold transition"
                >
                  {assignLoading ? 'Assigning...' : 'Assign to Staff Timesheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
