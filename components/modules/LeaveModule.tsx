'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  CalendarDays,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Filter,
  Users,
  Search,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  X
} from 'lucide-react';
import { LeaveType, LeaveStatus, LeaveRequest } from '@/lib/types';

export default function LeaveModule() {
  const { db, currentUser, dispatch, showToast } = usePortal();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLeaveForDetail, setSelectedLeaveForDetail] = useState<LeaveRequest | null>(null);

  // Apply Form
  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [startDate, setStartDate] = useState('2026-11-16');
  const [endDate, setEndDate] = useState('2026-11-20');
  const [daysCount, setDaysCount] = useState(5);
  const [handoverEmpId, setHandoverEmpId] = useState('');
  const [reason, setReason] = useState('');

  // Review modal notes
  const [reviewNotes, setReviewNotes] = useState('');

  if (!db) return null;

  const myBalance = db.leaveBalances.find(b => b.employeeId === currentUser.id) || {
    employeeId: currentUser.id,
    annualTotal: 21,
    annualUsed: 0,
    sickTotal: 12,
    sickUsed: 0,
    casualTotal: 5,
    casualUsed: 0,
    maternityPaternityTotal: 0,
    maternityPaternityUsed: 0,
    unpaidUsed: 0
  };

  const role = currentUser.role || 'SUPER_ADMIN';
  const teamMemberIds = db.employees.filter(e => e.departmentId === currentUser.departmentId).map(e => e.id);

  // Filter requests based on role
  const filteredLeaves = db.leaveRequests.filter(l => {
    // If EMPLOYEE: only show personal leave history
    if (role === 'EMPLOYEE' && l.employeeId !== currentUser.id) return false;
    // If LINE_MANAGER: show department staff + own
    if (role === 'LINE_MANAGER' && !teamMemberIds.includes(l.employeeId) && l.employeeId !== currentUser.id) return false;

    const emp = db.employees.find(e => e.id === l.employeeId);
    if (!emp) return false;
    const matchStatus = filterStatus === 'ALL' || l.status === filterStatus;
    const matchType = filterType === 'ALL' || l.leaveType === filterType;
    const matchSearch =
      emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  // Approvals queue tailored strictly by role
  const pendingLeaves = role === 'EMPLOYEE'
    ? []
    : role === 'LINE_MANAGER'
    ? db.leaveRequests.filter(l => l.status === 'PENDING' && teamMemberIds.includes(l.employeeId) && l.employeeId !== currentUser.id)
    : db.leaveRequests.filter(l => l.status === 'PENDING');

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('APPLY_LEAVE', {
      employeeId: currentUser.id,
      leaveType,
      startDate,
      endDate,
      daysCount: Number(daysCount),
      handoverEmployeeId: handoverEmpId || undefined,
      reason
    });
    if (res.success) {
      showToast('Leave application submitted for approval', 'success');
      setShowApplyModal(false);
      setReason('');
    }
  };

  const handleReviewAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await dispatch('REVIEW_LEAVE', {
      id,
      status,
      notes: reviewNotes || (status === 'APPROVED' ? 'Approved by HR Directorate' : 'Application declined')
    });
    if (res.success) {
      showToast(`Leave application ${status.toLowerCase()} successfully`, 'success');
      setSelectedLeaveForDetail(null);
      setReviewNotes('');
    }
  };

  const toggleFilterType = (type: string) => {
    if (filterType === type) {
      setFilterType('ALL');
    } else {
      setFilterType(type);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Leave Management & Time-Off</h2>
          <p className="text-xs text-slate-500">
            Track annual entitlements, public holidays, handover protocols, and team availability
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-cisd-gold-400" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Entitlement Cards (Interactive Click-to-Filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Annual Leave */}
        <div
          onClick={() => toggleFilterType('ANNUAL')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition space-y-2 hover:scale-[1.02] ${
            filterType === 'ANNUAL'
              ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
              : 'border-emerald-200/80 bg-white hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Annual Leave</span>
            <span className="rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5">
              {filterType === 'ANNUAL' ? 'Filtering' : 'Accrued'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900">{myBalance.annualTotal - myBalance.annualUsed}</span>
            <span className="text-xs text-slate-400 font-medium">days left of {myBalance.annualTotal}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (myBalance.annualUsed / myBalance.annualTotal) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">{myBalance.annualUsed} days taken this calendar cycle</p>
        </div>

        {/* Sick Leave */}
        <div
          onClick={() => toggleFilterType('SICK')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition space-y-2 hover:scale-[1.02] ${
            filterType === 'SICK'
              ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
              : 'border-blue-200/80 bg-white hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Sick Leave</span>
            <span className="rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5">
              {filterType === 'SICK' ? 'Filtering' : 'Medical'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-900">{myBalance.sickTotal - myBalance.sickUsed}</span>
            <span className="text-xs text-slate-400 font-medium">days left of {myBalance.sickTotal}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (myBalance.sickUsed / myBalance.sickTotal) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">{myBalance.sickUsed} days utilized</p>
        </div>

        {/* Casual Leave */}
        <div
          onClick={() => toggleFilterType('CASUAL')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition space-y-2 hover:scale-[1.02] ${
            filterType === 'CASUAL'
              ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
              : 'border-amber-200/80 bg-white hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Casual Leave</span>
            <span className="rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5">
              {filterType === 'CASUAL' ? 'Filtering' : 'Emergency'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">{myBalance.casualTotal - myBalance.casualUsed}</span>
            <span className="text-xs text-slate-400 font-medium">days left of {myBalance.casualTotal}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (myBalance.casualUsed / myBalance.casualTotal) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">{myBalance.casualUsed} days utilized</p>
        </div>

        {/* Study & Other */}
        <div
          onClick={() => toggleFilterType('STUDY')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition space-y-2 hover:scale-[1.02] ${
            filterType === 'STUDY'
              ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
              : 'border-purple-200/80 bg-white hover:border-purple-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Study & Other</span>
            <span className="rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5">
              {filterType === 'STUDY' ? 'Filtering' : 'Research'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-900">{myBalance.unpaidUsed}</span>
            <span className="text-xs text-slate-400 font-medium">days taken</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: '20%' }} />
          </div>
          <p className="text-[10px] text-slate-500">Requires executive directorate approval</p>
        </div>
      </div>

      {/* Pending Approvals Section for Managers and HR */}
      {(role === 'SUPER_ADMIN' || role === 'HR_ADMIN' || role === 'LINE_MANAGER') && pendingLeaves.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                {role === 'LINE_MANAGER' ? 'Directorate Action Required: Team Leave Approvals' : 'Awaiting Executive & Managerial Sign-Off'} ({pendingLeaves.length})
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-800">Action Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingLeaves.map(leave => {
              const emp = db.employees.find(e => e.id === leave.employeeId);
              const dept = db.departments.find(d => d.id === emp?.departmentId);
              const handover = db.employees.find(e => e.id === leave.handoverEmployeeId);
              return (
                <div key={leave.id} className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp?.avatar}
                        alt={emp?.firstName}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{emp?.firstName} {emp?.lastName}</h4>
                        <p className="text-[11px] text-slate-500">{dept?.name}</p>
                      </div>
                    </div>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {leave.leaveType}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2 text-xs space-y-1">
                    <p className="text-slate-700">
                      <strong>Period:</strong> {leave.startDate} to {leave.endDate} ({leave.daysCount} working days)
                    </p>
                    {handover && (
                      <p className="text-slate-600">
                        <strong>Handover Contact:</strong> {handover.firstName} {handover.lastName}
                      </p>
                    )}
                    <p className="text-slate-500 italic">&ldquo;{leave.reason}&rdquo;</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleReviewAction(leave.id, 'REJECTED')}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleReviewAction(leave.id, 'APPROVED')}
                      className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                    >
                      Approve Leave
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historical Leave Applications Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-slate-100 pb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff name or reason..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {filterType !== 'ALL' && (
              <button
                onClick={() => setFilterType('ALL')}
                className="text-xs font-bold text-cisd-navy-900 bg-slate-100 px-2 py-1 rounded-lg"
              >
                Clear Type Filter ({filterType}) &times;
              </button>
            )}

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
            >
              <option value="ALL">All Leave Types</option>
              <option value="ANNUAL">Annual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="STUDY">Study Leave</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Handover Officer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.map(leave => {
                const emp = db.employees.find(e => e.id === leave.employeeId);
                const handover = db.employees.find(e => e.id === leave.handoverEmployeeId);
                return (
                  <tr
                    key={leave.id}
                    onClick={() => setSelectedLeaveForDetail(leave)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp?.avatar}
                          alt={emp?.firstName}
                          className="h-7 w-7 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{emp?.firstName} {emp?.lastName}</p>
                          <p className="text-[10px] text-slate-400">{emp?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{leave.leaveType}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {leave.startDate} <span className="text-slate-400">&rarr;</span> {leave.endDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{leave.daysCount} days</td>
                    <td className="py-3 px-4 text-slate-600">
                      {handover ? `${handover.firstName} ${handover.lastName}` : 'Direct Directorate'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        leave.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {leave.approvalNotes || leave.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Detail & Review Modal */}
      {selectedLeaveForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-cisd-navy-100 text-cisd-navy-900 text-[10px] font-bold px-2 py-0.5">
                  Leave Record Detail
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {db.employees.find(e => e.id === selectedLeaveForDetail.employeeId)?.firstName}{' '}
                  {db.employees.find(e => e.id === selectedLeaveForDetail.employeeId)?.lastName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLeaveForDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Classification</span>
                  <strong className="text-slate-800">{selectedLeaveForDetail.leaveType}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Working Days</span>
                  <strong className="text-slate-800">{selectedLeaveForDetail.daysCount} Days</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Commencement</span>
                  <span className="text-slate-700">{selectedLeaveForDetail.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Conclusion</span>
                  <span className="text-slate-700">{selectedLeaveForDetail.endDate}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Reason & Reachability</span>
                <p className="bg-slate-50 p-2.5 rounded-lg text-slate-600 italic">
                  &ldquo;{selectedLeaveForDetail.reason}&rdquo;
                </p>
              </div>

              {selectedLeaveForDetail.approvalNotes && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Executive Approval Notes</span>
                  <p className="bg-emerald-50 p-2.5 rounded-lg text-emerald-800 font-medium">
                    {selectedLeaveForDetail.approvalNotes}
                  </p>
                </div>
              )}

              {selectedLeaveForDetail.status === 'PENDING' && (
                <div className="pt-2 border-t flex justify-end gap-2">
                  <button
                    onClick={() => handleReviewAction(selectedLeaveForDetail.id, 'REJECTED')}
                    className="rounded-lg border px-3 py-1.5 font-bold text-rose-600 hover:bg-rose-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleReviewAction(selectedLeaveForDetail.id, 'APPROVED')}
                    className="rounded-lg bg-emerald-600 px-4 py-1.5 font-bold text-white hover:bg-emerald-700 shadow"
                  >
                    Approve Leave
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setSelectedLeaveForDetail(null)}
                className="rounded-lg border px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Formal Leave Application</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Classification</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  <option value="ANNUAL">Annual Leave (21 days)</option>
                  <option value="SICK">Sick / Medical Leave (12 days)</option>
                  <option value="CASUAL">Casual Leave (5 days)</option>
                  <option value="MATERNITY">Maternity Leave (90 days)</option>
                  <option value="PATERNITY">Paternity Leave (14 days)</option>
                  <option value="STUDY">Study & Research Leave</option>
                  <option value="UNPAID">Leave Without Pay</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (Working Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  value={daysCount}
                  onChange={(e) => setDaysCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Handover Colleague / Duty Delegate</label>
                <select
                  value={handoverEmpId}
                  onChange={(e) => setHandoverEmpId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  <option value="">Select Colleague...</option>
                  {db.employees.filter(e => e.id !== currentUser.id).map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason & Contact Details in Absence</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detail reasons and emergency reachability..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
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
