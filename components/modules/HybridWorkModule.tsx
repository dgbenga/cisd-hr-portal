'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  CalendarRange,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  Users,
  ShieldCheck,
  Calendar,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { WorkDaySchedule, HybridSchedule } from '@/lib/types';

export default function HybridWorkModule() {
  const { db, currentUser, setSelectedEmployeeIdForModal, dispatch, showToast } = usePortal();

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isLineManager = currentUser.role === 'LINE_MANAGER';
  const isHRAdmin = currentUser.role === 'HR_ADMIN';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'>('thursday');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTargetDate, setSwapTargetDate] = useState('2026-11-06');
  const [swapOriginal, setSwapOriginal] = useState<WorkDaySchedule>('OFFICE');
  const [swapRequested, setSwapRequested] = useState<WorkDaySchedule>('REMOTE');
  const [swapReason, setSwapReason] = useState('');

  if (!db) return null;

  // Day label mapping
  const daysInfo = [
    { key: 'monday' as const, label: 'Monday', date: '02 Nov' },
    { key: 'tuesday' as const, label: 'Tuesday', date: '03 Nov' },
    { key: 'wednesday' as const, label: 'Wednesday', date: '04 Nov' },
    { key: 'thursday' as const, label: 'Thursday (Today)', date: '05 Nov', isToday: true },
    { key: 'friday' as const, label: 'Friday', date: '06 Nov' }
  ];

  // Calculate office vs remote count for selected day
  const officePersonnel = db.employees.filter(emp => {
    const sch = db.hybridSchedules.find(s => s.employeeId === emp.id);
    return sch ? sch[selectedDayOfWeek] === 'OFFICE' : true;
  });

  const remotePersonnel = db.employees.filter(emp => {
    const sch = db.hybridSchedules.find(s => s.employeeId === emp.id);
    return sch ? sch[selectedDayOfWeek] === 'REMOTE' : false;
  });

  // Collect pending change requests scoped by role
  const pendingRequests: Array<{ scheduleId: string; employeeId: string; request: any }> = [];
  db.hybridSchedules.forEach(sch => {
    sch.changeRequests?.filter(r => r.status === 'PENDING').forEach(r => {
      if (isEmployee) {
        if (sch.employeeId === currentUser.id) {
          pendingRequests.push({ scheduleId: sch.id, employeeId: sch.employeeId, request: r });
        }
      } else if (isLineManager) {
        const emp = db.employees.find(e => e.id === sch.employeeId);
        if (emp?.departmentId === currentUser.departmentId) {
          pendingRequests.push({ scheduleId: sch.id, employeeId: sch.employeeId, request: r });
        }
      } else {
        pendingRequests.push({ scheduleId: sch.id, employeeId: sch.employeeId, request: r });
      }
    });
  });

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('REQUEST_HYBRID_CHANGE', {
      employeeId: currentUser.id,
      targetDate: swapTargetDate,
      originalStatus: swapOriginal,
      requestedStatus: swapRequested,
      reason: swapReason
    });
    if (res.success) {
      showToast('Schedule adjustment request submitted to your Line Manager', 'success');
      setShowSwapModal(false);
      setSwapReason('');
    }
  };

  const handleReviewChange = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await dispatch('REVIEW_HYBRID_CHANGE', {
      id: requestId,
      status
    });
    if (res.success) {
      showToast(`Hybrid schedule change ${status.toLowerCase()}`, 'success');
    }
  };

  const handleToggleDay = async (empId: string, day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday') => {
    const sch = db.hybridSchedules.find(s => s.employeeId === empId) || {
      employeeId: empId,
      weekStartDate: '2026-11-02',
      monday: 'OFFICE',
      tuesday: 'OFFICE',
      wednesday: 'OFFICE',
      thursday: 'OFFICE',
      friday: 'REMOTE'
    };

    const nextModality: WorkDaySchedule = sch[day] === 'OFFICE' ? 'REMOTE' : 'OFFICE';
    const updated = {
      employeeId: empId,
      monday: sch.monday,
      tuesday: sch.tuesday,
      wednesday: sch.wednesday,
      thursday: sch.thursday,
      friday: sch.friday,
      [day]: nextModality
    };

    const res = await dispatch('UPDATE_HYBRID_SCHEDULE', updated);
    if (res.success) {
      const emp = db.employees.find(e => e.id === empId);
      showToast(`Toggled ${day.toUpperCase()} for ${emp?.firstName}: ${nextModality}`, 'info');
    }
  };

  const mySchedule = db.hybridSchedules.find(s => s.employeeId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Policy & Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cisd-navy-950 to-cisd-navy-900 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cisd-gold-500/20 px-2 py-0.5 text-[10px] font-bold text-cisd-gold-300 uppercase tracking-wide">
                CISD Institutional Work Policy
              </span>
              <span className="text-xs text-slate-300">&bull; 3 Days Office / 2 Days Remote Framework</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">CISD Hybrid Work Roster & Office Calendar</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Maintains institutional collaboration, diplomatic confidentiality, and modern workplace flexibility.
              Mondays and Thursdays are designated core on-site days for executive dialogue briefings.
            </p>
          </div>

          <button
            onClick={() => setShowSwapModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-cisd-gold-500 px-4 py-2 text-xs font-bold text-cisd-navy-950 hover:bg-cisd-gold-400 shadow transition self-start md:self-auto"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Request Schedule Shift
          </button>
        </div>
      </div>

      {/* Pending Schedule Shift Approvals */}
      {pendingRequests.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {isEmployee
                ? `Your Active Schedule Shift Requests (${pendingRequests.length})`
                : `Pending Hybrid Schedule Shift Requests (${pendingRequests.length})`}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingRequests.map(item => {
              const emp = db.employees.find(e => e.id === item.employeeId);
              const dept = db.departments.find(d => d.id === emp?.departmentId);
              return (
                <div key={item.request.id} className="rounded-xl border border-amber-100 bg-white p-3.5 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{emp?.firstName} {emp?.lastName}</p>
                      <p className="text-[11px] text-slate-500">{dept?.name}</p>
                    </div>
                    <span className="rounded bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5">
                      Shift Target: {item.request.targetDate}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2 text-xs space-y-1">
                    <p className="text-slate-700">
                      <strong>Modality Shift:</strong> {item.request.originalStatus} &rarr; <span className="font-bold text-cisd-navy-900">{item.request.requestedStatus}</span>
                    </p>
                    <p className="text-slate-500 italic">&ldquo;{item.request.reason}&rdquo;</p>
                  </div>

                  {!isEmployee ? (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleReviewChange(item.request.id, 'REJECTED')}
                        className="rounded-lg border px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleReviewChange(item.request.id, 'APPROVED')}
                        className="rounded-lg bg-emerald-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                      >
                        Approve Shift
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400">Reviewing Authority: Line Manager</span>
                      <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 font-bold">
                        Under Review
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* "Who is in the office today?" Daily Calendar Switcher */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Expected On-Site Roster: {daysInfo.find(d => d.key === selectedDayOfWeek)?.label} ({daysInfo.find(d => d.key === selectedDayOfWeek)?.date})
              </h3>
              <p className="text-xs text-slate-500">Live seat and security access roster for Abuja Head Office</p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
              {daysInfo.map(d => (
                <button
                  key={d.key}
                  onClick={() => setSelectedDayOfWeek(d.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedDayOfWeek === d.key
                      ? 'bg-cisd-navy-900 text-white shadow'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Office vs Remote Personnel Cards for Selected Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* In Office */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-xs">
                  Expected in Abuja Head Office ({officePersonnel.length})
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                On-Site
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {officePersonnel.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployeeIdForModal(emp.id)}
                  className="cursor-pointer flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-white p-2.5 hover:shadow-sm transition"
                >
                  <img
                    src={emp.avatar}
                    alt={emp.firstName}
                    className="h-8 w-8 rounded-full object-cover border"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{emp.designation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remote / Field */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-xs">
                  Stationed Remotely / Foreign Mission ({remotePersonnel.length})
                </h4>
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                Remote
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {remotePersonnel.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployeeIdForModal(emp.id)}
                  className="cursor-pointer flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-white p-2.5 hover:shadow-sm transition"
                >
                  <img
                    src={emp.avatar}
                    alt={emp.firstName}
                    className="h-8 w-8 rounded-full object-cover border"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{emp.workLocation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Master Matrix Table with Click-to-Toggle Cells */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Weekly Roster Matrix: All Staff Members</h3>
            <p className="text-xs text-slate-500">
              Week of 02 November – 06 November 2026 &bull; <strong className="text-cisd-navy-900">Click any day badge</strong> to toggle Office/Remote schedule
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Staff: {db.employees.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3 text-center">Mon (02)</th>
                <th className="py-3 px-3 text-center">Tue (03)</th>
                <th className="py-3 px-3 text-center">Wed (04)</th>
                <th className="py-3 px-3 text-center">Thu (05 - Today)</th>
                <th className="py-3 px-3 text-center">Fri (06)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.employees.map(emp => {
                const sch = db.hybridSchedules.find(s => s.employeeId === emp.id);
                const isMe = emp.id === currentUser.id;

                const renderInteractiveCell = (day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday') => {
                  const status: WorkDaySchedule = sch ? sch[day] : (day === 'friday' ? 'REMOTE' : 'OFFICE');
                  const isOffice = status === 'OFFICE';
                  const canToggle = isSuperAdmin || isHRAdmin || (isLineManager && emp.departmentId === currentUser.departmentId);

                  return (
                    <button
                      type="button"
                      disabled={!canToggle}
                      onClick={() => {
                        if (!canToggle) {
                          showToast('Staff schedule adjustments require a Schedule Shift Request or Directorate approval', 'info');
                          return;
                        }
                        handleToggleDay(emp.id, day);
                      }}
                      title={canToggle ? `Click to flip to ${isOffice ? 'Remote' : 'Office'}` : `Assigned Schedule: ${status}`}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition shadow-xs ${
                        canToggle ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default opacity-90'
                      } ${
                        isOffice
                          ? 'bg-cisd-navy-900 text-white'
                          : 'bg-sky-100 text-sky-900 border border-sky-300'
                      }`}
                    >
                      {isOffice ? (
                        <>
                          <Building2 className="h-3 w-3 text-cisd-gold-400" />
                          Office
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3 text-sky-700" />
                          Remote
                        </>
                      )}
                    </button>
                  );
                };

                return (
                  <tr key={emp.id} className={`hover:bg-slate-50/70 transition ${isMe ? 'bg-cisd-gold-50/40' : ''}`}>
                    <td className="py-3 px-4">
                      <div
                        onClick={() => setSelectedEmployeeIdForModal(emp.id)}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <img
                          src={emp.avatar}
                          alt={emp.firstName}
                          className="h-7 w-7 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-bold text-slate-900">
                            {emp.firstName} {emp.lastName}{' '}
                            {isMe && <span className="text-[10px] font-bold text-cisd-gold-700">(You)</span>}
                          </p>
                          <p className="text-[10px] text-slate-400">{emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">{renderInteractiveCell('monday')}</td>
                    <td className="py-3 px-3 text-center">{renderInteractiveCell('tuesday')}</td>
                    <td className="py-3 px-3 text-center">{renderInteractiveCell('wednesday')}</td>
                    <td className="py-3 px-3 text-center bg-slate-100/50">{renderInteractiveCell('thursday')}</td>
                    <td className="py-3 px-3 text-center">{renderInteractiveCell('friday')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Shift Request Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Request Hybrid Schedule Shift</h3>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRequestChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Shift Date</label>
                <input
                  type="date"
                  required
                  value={swapTargetDate}
                  onChange={(e) => setSwapTargetDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Modality</label>
                  <select
                    value={swapOriginal}
                    onChange={(e) => setSwapOriginal(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="OFFICE">Office</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Requested Modality</label>
                  <select
                    value={swapRequested}
                    onChange={(e) => setSwapRequested(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="OFFICE">Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Justification</label>
                <textarea
                  rows={3}
                  required
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder="e.g. Field consultation, off-site donor meeting, specialized report drafting..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
