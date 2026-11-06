'use client';

import React, { useState } from 'react';
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
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { Timesheet, TimesheetEntry } from '@/lib/types';

export default function TimesheetsModule() {
  const { db, currentUser, dispatch, showToast } = usePortal();

  const [selectedWeek, setSelectedWeek] = useState('2026-11-02');
  const [entries, setEntries] = useState<TimesheetEntry[]>([
    {
      projectId: 'prj-1',
      projectName: 'Sahel Security Strategic Dialogue',
      activity: 'Policy analysis & ministerial non-paper preparation',
      mon: 5,
      tue: 6,
      wed: 5,
      thu: 6,
      fri: 4,
      totalHours: 26
    },
    {
      projectId: 'prj-2',
      projectName: 'AfCFTA Critical Minerals Consensus',
      activity: 'Stakeholder bilateral dialogue prep & synthesis',
      mon: 3,
      tue: 2,
      wed: 3,
      thu: 2,
      fri: 4,
      totalHours: 14
    }
  ]);

  if (!db) return null;

  // Calculate current week hours
  const totalWeeklyHours = entries.reduce((acc, curr) => acc + curr.totalHours, 0);

  // Check if current user has an existing submitted/approved timesheet for this week
  const existingTimesheet = db.timesheets.find(
    t => t.employeeId === currentUser.id && t.weekStartDate === selectedWeek
  );

  const role = currentUser.role || 'SUPER_ADMIN';
  const teamMemberIds = db.employees.filter(e => e.departmentId === currentUser.departmentId).map(e => e.id);

  const pendingTimesheets = role === 'EMPLOYEE'
    ? []
    : role === 'LINE_MANAGER'
    ? db.timesheets.filter(t => t.status === 'SUBMITTED' && teamMemberIds.includes(t.employeeId) && t.employeeId !== currentUser.id)
    : db.timesheets.filter(t => t.status === 'SUBMITTED');

  const handleHourChange = (index: number, day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri', val: number) => {
    const updated = [...entries];
    updated[index][day] = Number(val) || 0;
    updated[index].totalHours =
      Number(updated[index].mon) +
      Number(updated[index].tue) +
      Number(updated[index].wed) +
      Number(updated[index].thu) +
      Number(updated[index].fri);
    setEntries(updated);
  };

  const handleAddProjectRow = () => {
    setEntries([
      ...entries,
      {
        projectId: `prj-${Date.now()}`,
        projectName: 'Energy Transition & Gulf-Africa Policy Working Group',
        activity: 'Economic modeling and strategic brief development',
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
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSubmitTimesheet = async () => {
    if (totalWeeklyHours === 0) {
      showToast('Please log at least one hour before submitting', 'error');
      return;
    }
    const res = await dispatch('SUBMIT_TIMESHEET', {
      employeeId: currentUser.id,
      weekStartDate: selectedWeek,
      weekEndDate: '2026-11-06',
      entries
    });
    if (res.success) {
      showToast(`Submitted ${totalWeeklyHours} project hours for approval`, 'success');
    }
  };

  const handleReviewTimesheet = async (timesheetId: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await dispatch('REVIEW_TIMESHEET', {
      id: timesheetId,
      status
    });
    if (res.success) {
      showToast(`Weekly timesheet ${status.toLowerCase()}`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Timesheets & Project Time Accounting</h2>
          <p className="text-xs text-slate-500">
            Log analytical research hours, diplomatic missions, project deliverables, and donor grant hours
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Week of:</span>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 shadow-sm"
          >
            <option value="2026-11-02">02 Nov – 06 Nov 2026 (Current)</option>
            <option value="2026-10-26">26 Oct – 30 Oct 2026</option>
            <option value="2026-10-19">19 Oct – 23 Oct 2026</option>
          </select>
        </div>
      </div>

      {/* Pending Timesheets Review Queue for Line Managers & HR */}
      {(role === 'SUPER_ADMIN' || role === 'HR_ADMIN' || role === 'LINE_MANAGER') && pendingTimesheets.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {role === 'LINE_MANAGER' ? 'Directorate Action Required: Team Timesheets Review' : 'Pending Timesheet Approvals'} ({pendingTimesheets.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingTimesheets.map(ts => {
              const emp = db.employees.find(e => e.id === ts.employeeId);
              const dept = db.departments.find(d => d.id === emp?.departmentId);

              return (
                <div key={ts.id} className="rounded-xl border border-amber-100 bg-white p-3.5 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <img src={emp?.avatar} alt={emp?.firstName} className="h-8 w-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{emp?.firstName} {emp?.lastName}</p>
                        <p className="text-[10px] text-slate-400">{dept?.name}</p>
                      </div>
                    </div>
                    <span className="rounded bg-cisd-navy-900 text-white font-bold text-xs px-2 py-0.5">
                      {ts.totalHours} Hours
                    </span>
                  </div>

                  <div className="rounded bg-slate-50 p-2 text-[11px] text-slate-600 space-y-1">
                    <p><strong>Period:</strong> {ts.weekStartDate} to {ts.weekEndDate}</p>
                    <p className="truncate"><strong>Projects:</strong> {ts.entries.map(e => e.projectName).join(', ')}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleReviewTimesheet(ts.id, 'REJECTED')}
                      className="rounded-lg border px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleReviewTimesheet(ts.id, 'APPROVED')}
                      className="rounded-lg bg-emerald-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                    >
                      Approve Hours
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Timesheet Editor Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Log Strategic Dialogue Project Hours: {currentUser.firstName} {currentUser.lastName}
            </h3>
            <p className="text-xs text-slate-500">Record billable & grant hours per activity (Monday – Friday)</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Week Total:</span>
            <span className="rounded-xl bg-cisd-navy-900 text-white font-black text-sm px-3 py-1">
              {totalWeeklyHours} / 40.0 Hours
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-3 w-1/4">Project Initiative</th>
                <th className="py-3 px-3 w-1/4">Task Activity</th>
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
              {entries.map((entry, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={entry.projectName}
                      onChange={(e) => {
                        const updated = [...entries];
                        updated[idx].projectName = e.target.value;
                        setEntries(updated);
                      }}
                      className="w-full rounded-lg border border-slate-200 p-1.5 font-bold text-slate-900 text-xs"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={entry.activity}
                      onChange={(e) => {
                        const updated = [...entries];
                        updated[idx].activity = e.target.value;
                        setEntries(updated);
                      }}
                      className="w-full rounded-lg border border-slate-200 p-1.5 text-slate-600 text-xs"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={entry.mon}
                      onChange={(e) => handleHourChange(idx, 'mon', Number(e.target.value))}
                      className="w-12 text-center rounded-lg border border-slate-200 p-1 text-xs font-bold text-slate-800"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={entry.tue}
                      onChange={(e) => handleHourChange(idx, 'tue', Number(e.target.value))}
                      className="w-12 text-center rounded-lg border border-slate-200 p-1 text-xs font-bold text-slate-800"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={entry.wed}
                      onChange={(e) => handleHourChange(idx, 'wed', Number(e.target.value))}
                      className="w-12 text-center rounded-lg border border-slate-200 p-1 text-xs font-bold text-slate-800"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={entry.thu}
                      onChange={(e) => handleHourChange(idx, 'thu', Number(e.target.value))}
                      className="w-12 text-center rounded-lg border border-slate-200 p-1 text-xs font-bold text-slate-800"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={entry.fri}
                      onChange={(e) => handleHourChange(idx, 'fri', Number(e.target.value))}
                      className="w-12 text-center rounded-lg border border-slate-200 p-1 text-xs font-bold text-slate-800"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center font-black text-cisd-navy-900 text-sm">
                    {entry.totalHours}h
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition"
                      title="Remove Row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={handleAddProjectRow}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <Plus className="h-4 w-4" />
            Add Project Row
          </button>

          <div className="flex items-center gap-3">
            {existingTimesheet ? (
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                existingTimesheet.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                existingTimesheet.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                'bg-slate-100 text-slate-800'
              }`}>
                Timesheet Status: {existingTimesheet.status}
              </span>
            ) : (
              <button
                onClick={handleSubmitTimesheet}
                className="rounded-xl bg-cisd-navy-900 px-5 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition"
              >
                Submit for Manager Approval
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
