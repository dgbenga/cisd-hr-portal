'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Clock,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Download,
  Filter,
  Users,
  Search,
  BarChart3,
  TrendingUp,
  Award,
  Globe,
  Shield,
  Sparkles,
  Check,
  X,
  ArrowUpRight,
  UserCheck,
  CalendarDays,
  Percent,
  ChevronDown
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Employee } from '@/lib/types';

export default function AttendanceModule() {
  const { db, currentUser, dispatch, showToast } = usePortal();

  // Active sub-tab: SIGN_IN (Live presence & personal sign in), ANALYTICS (Monthly organization analytics), REGISTER (Daily logs), CORRECTIONS (Adjustments)
  const [activeSubTab, setActiveSubTab] = useState<'SIGN_IN' | 'ANALYTICS' | 'REGISTER' | 'CORRECTIONS'>('SIGN_IN');

  const todayStr = '2026-11-05';
  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isLineManager = currentUser.role === 'LINE_MANAGER';

  // State for Live Sign-In & Who's in Today
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterDeptFilter, setRosterDeptFilter] = useState('ALL');
  const [rosterModalityFilter, setRosterModalityFilter] = useState<'ALL' | 'OFFICE' | 'REMOTE' | 'LATE' | 'NOT_CHECKED_IN'>('ALL');

  // State for Monthly Analytics
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [analyticsDeptFilter, setAnalyticsDeptFilter] = useState('ALL');

  // State for Daily Register
  const [filterDate, setFilterDate] = useState('2026-11-05');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [registerSearch, setRegisterSearch] = useState('');

  // State for Correction Modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [corDate, setCorDate] = useState('2026-11-04');
  const [corIn, setCorIn] = useState('08:30');
  const [corOut, setCorOut] = useState('17:00');
  const [corReason, setCorReason] = useState('');

  if (!db) return null;

  const myRecordToday = db.attendanceRecords.find(a => a.employeeId === currentUser.id && a.date === todayStr);

  // Clock Actions
  const handleClockIn = async (workType: 'OFFICE' | 'REMOTE', locationName: string) => {
    const res = await dispatch('CLOCK_IN', {
      employeeId: currentUser.id,
      workType,
      locationName
    });
    if (res.success) {
      showToast(`Clocked in successfully (${workType} &bull; ${locationName})`, 'success');
    }
  };

  const handleClockOut = async () => {
    const res = await dispatch('CLOCK_OUT', { employeeId: currentUser.id });
    if (res.success) {
      showToast('Shift ended successfully. Hours recorded.', 'success');
    }
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('REQUEST_CORRECTION', {
      employeeId: currentUser.id,
      date: corDate,
      requestedClockIn: corIn,
      requestedClockOut: corOut,
      reason: corReason
    });
    if (res.success) {
      showToast('Attendance correction request submitted to HR Director', 'success');
      setShowCorrectionModal(false);
      setCorReason('');
    }
  };

  const handleReviewCorrection = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await dispatch('REVIEW_CORRECTION', { id, status });
    if (res.success) {
      showToast(`Correction request ${status.toLowerCase()}`, 'success');
    }
  };

  // --- LIVE SIGN-IN ROSTER FOR TODAY ---
  const todayRecords = db.attendanceRecords.filter(r => r.date === todayStr);
  const checkedInCount = todayRecords.length;
  const inOfficeToday = todayRecords.filter(r => r.workType === 'OFFICE' && r.status !== 'ON_LEAVE').length;
  const remoteToday = todayRecords.filter(r => r.workType === 'REMOTE').length;
  const onLeaveToday = todayRecords.filter(r => r.status === 'ON_LEAVE').length;
  const notCheckedInCount = Math.max(0, db.employees.length - checkedInCount);

  const liveStaffRoster = db.employees.map(emp => {
    const record = todayRecords.find(r => r.employeeId === emp.id);
    const dept = db.departments.find(d => d.id === emp.departmentId);
    return {
      employee: emp,
      department: dept,
      record,
      hasClockedIn: !!record,
      isClockedOut: !!record?.clockOut,
      clockIn: record?.clockIn,
      clockOut: record?.clockOut,
      status: (record?.status || 'NOT_CHECKED_IN') as AttendanceStatus | 'NOT_CHECKED_IN',
      workType: record?.workType,
      locationName: record?.locationName || 'Not Checked In',
      workingHours: record?.workingHours || 0
    };
  }).filter(item => {
    const matchesDept = rosterDeptFilter === 'ALL' || item.employee.departmentId === rosterDeptFilter;
    let matchesModality = true;
    if (rosterModalityFilter === 'OFFICE') matchesModality = item.workType === 'OFFICE';
    else if (rosterModalityFilter === 'REMOTE') matchesModality = item.workType === 'REMOTE';
    else if (rosterModalityFilter === 'LATE') matchesModality = item.status === 'LATE';
    else if (rosterModalityFilter === 'NOT_CHECKED_IN') matchesModality = !item.hasClockedIn;

    const q = rosterSearch.toLowerCase();
    const matchesSearch =
      !q ||
      item.employee.firstName.toLowerCase().includes(q) ||
      item.employee.lastName.toLowerCase().includes(q) ||
      item.employee.employeeId.toLowerCase().includes(q) ||
      item.employee.designation.toLowerCase().includes(q) ||
      (item.department?.name.toLowerCase().includes(q) ?? false);

    return matchesDept && matchesModality && matchesSearch;
  });

  // --- MONTHLY ANALYTICS CALCULATIONS (VISIBLE TO EVERYONE) ---
  const monthRecords = db.attendanceRecords.filter(r => r.date.startsWith(selectedMonth));
  const monthOffice = monthRecords.filter(r => r.workType === 'OFFICE' && r.status !== 'ON_LEAVE').length;
  const monthRemote = monthRecords.filter(r => r.workType === 'REMOTE' && r.status !== 'ON_LEAVE').length;
  const monthLate = monthRecords.filter(r => r.status === 'LATE' || (r.latenessMinutes && r.latenessMinutes > 0)).length;
  const monthLeave = monthRecords.filter(r => r.status === 'ON_LEAVE').length;
  const monthTotalWorking = monthOffice + monthRemote;
  const monthPunctualityPct = monthTotalWorking > 0 ? Math.round(((monthTotalWorking - monthLate) / monthTotalWorking) * 100) : 100;
  const monthTotalHours = monthRecords.reduce((acc, curr) => acc + (curr.workingHours || 0), 0);
  const avgDailyHours = monthTotalWorking > 0 ? (monthTotalHours / monthTotalWorking).toFixed(1) : '8.0';

  // Day-by-Day volume trend in selected month
  const monthDates = Array.from(new Set(monthRecords.map(r => r.date))).sort();
  const dailyTrend = monthDates.map(date => {
    const dayRecords = monthRecords.filter(r => r.date === date);
    const office = dayRecords.filter(r => r.workType === 'OFFICE' && r.status !== 'ON_LEAVE').length;
    const remote = dayRecords.filter(r => r.workType === 'REMOTE').length;
    const late = dayRecords.filter(r => r.status === 'LATE').length;
    return {
      date,
      displayDate: date.split('-').slice(1).join('/'),
      total: dayRecords.length,
      office,
      remote,
      late
    };
  });

  // Directorate comparison in selected month
  const directorateAnalytics = db.departments.map(dept => {
    const deptEmps = db.employees.filter(e => e.departmentId === dept.id);
    const deptEmpIds = deptEmps.map(e => e.id);
    const deptRecs = monthRecords.filter(r => deptEmpIds.includes(r.employeeId));
    const office = deptRecs.filter(r => r.workType === 'OFFICE' && r.status !== 'ON_LEAVE').length;
    const remote = deptRecs.filter(r => r.workType === 'REMOTE').length;
    const late = deptRecs.filter(r => r.status === 'LATE' || (r.latenessMinutes && r.latenessMinutes > 0)).length;
    const total = office + remote;
    const punctuality = total > 0 ? Math.round(((total - late) / total) * 100) : 100;
    return {
      dept,
      headcount: deptEmps.length,
      total,
      office,
      remote,
      late,
      punctuality
    };
  });

  // Staff-by-Staff monthly summary table
  const staffMonthlyAnalytics = db.employees.filter(emp => {
    if (analyticsDeptFilter === 'ALL') return true;
    return emp.departmentId === analyticsDeptFilter;
  }).map(emp => {
    const empRecs = monthRecords.filter(r => r.employeeId === emp.id);
    const dept = db.departments.find(d => d.id === emp.departmentId);
    const officeDays = empRecs.filter(r => r.workType === 'OFFICE' && r.status !== 'ON_LEAVE').length;
    const remoteDays = empRecs.filter(r => r.workType === 'REMOTE').length;
    const lateDays = empRecs.filter(r => r.status === 'LATE' || (r.latenessMinutes && r.latenessMinutes > 0)).length;
    const leaveDays = empRecs.filter(r => r.status === 'ON_LEAVE').length;
    const totalDays = officeDays + remoteDays;
    const hours = empRecs.reduce((acc, curr) => acc + (curr.workingHours || 0), 0);
    const punctuality = totalDays > 0 ? Math.round(((totalDays - lateDays) / totalDays) * 100) : 100;

    let scoreBadge = 'Exemplary';
    let badgeColor = 'bg-emerald-100 text-emerald-800';
    if (punctuality < 85) {
      scoreBadge = 'Needs Review';
      badgeColor = 'bg-rose-100 text-rose-800';
    } else if (punctuality < 95) {
      scoreBadge = 'Compliant';
      badgeColor = 'bg-blue-100 text-blue-800';
    }

    return {
      emp,
      dept,
      officeDays,
      remoteDays,
      lateDays,
      leaveDays,
      totalDays,
      hours: hours.toFixed(1),
      punctuality,
      scoreBadge,
      badgeColor
    };
  }).sort((a, b) => b.punctuality - a.punctuality);

  // --- DAILY REGISTER (FILTERED) ---
  const registerRecords = db.attendanceRecords.filter(r => {
    const emp = db.employees.find(e => e.id === r.employeeId);
    if (!emp) return false;
    if (filterDate && r.date !== filterDate) return false;
    if (filterDept !== 'ALL' && emp.departmentId !== filterDept) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;

    const q = registerSearch.toLowerCase();
    if (q) {
      const match =
        emp.firstName.toLowerCase().includes(q) ||
        emp.lastName.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date,Staff Name,Employee ID,Department,Clock In,Clock Out,Status,Work Modality,Location,Hours'];
    const rows = registerRecords.map(r => {
      const emp = db.employees.find(e => e.id === r.employeeId);
      const dept = db.departments.find(d => d.id === emp?.departmentId)?.name || '';
      return `"${r.date}","${emp?.firstName} ${emp?.lastName}","${emp?.employeeId}","${dept}","${r.clockIn}","${r.clockOut || 'Active'}","${r.status}","${r.workType}","${r.locationName}","${r.workingHours}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CISD_Attendance_${filterDate || 'Report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported attendance records to CSV', 'success');
  };

  // Pending Corrections
  const pendingCorrections = (db.attendanceCorrections || []).filter(c => {
    if (c.status !== 'PENDING') return false;
    if (isEmployee) return c.employeeId === currentUser.id;
    if (isLineManager) {
      const emp = db.employees.find(e => e.id === c.employeeId);
      return emp?.departmentId === currentUser.departmentId;
    }
    return true; // Super Admin & HR Admin
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Workforce Attendance & Sign-In Station</h2>
          <p className="text-xs text-slate-500">
            Daily workforce sign-in terminal, organization-wide live presence board, and institutional monthly attendance analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{checkedInCount} / {db.employees.length} Signed In Today</span>
          </div>
          <button
            onClick={() => setShowCorrectionModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <FileEdit className="h-3.5 w-3.5 text-cisd-navy-800" />
            Request Adjustment
          </button>
        </div>
      </div>

      {/* Primary Sub-Tabs Navigation (Visible to Everyone) */}
      <div className="flex flex-wrap border-b border-slate-200 text-xs font-bold gap-6">
        <button
          onClick={() => setActiveSubTab('SIGN_IN')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'SIGN_IN'
              ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Sign In & Live Presence</span>
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px]">
            {checkedInCount} Active
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('ANALYTICS')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'ANALYTICS'
              ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Monthly Attendance Analytics</span>
          <span className="rounded-full bg-cisd-gold-100 text-cisd-gold-800 px-2 py-0.5 text-[10px] font-bold">
            {monthPunctualityPct}% On-Time
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('REGISTER')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'REGISTER'
              ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          <span>Daily Attendance Register</span>
        </button>

        <button
          onClick={() => setActiveSubTab('CORRECTIONS')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'CORRECTIONS'
              ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileEdit className="h-4 w-4" />
          <span>Adjustments & Approvals</span>
          {pendingCorrections.length > 0 && (
            <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px]">
              {pendingCorrections.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SIGN IN TERMINAL & LIVE BOARD ("WHO'S IN TODAY")                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'SIGN_IN' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Banner: Personal Interactive Sign-In Station */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-cisd-navy-950 via-slate-900 to-cisd-navy-900 p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-cisd-gold-500/20 text-cisd-gold-400 border border-cisd-gold-500/30 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase">
                    Diplomatic Work Terminal
                  </span>
                  <span className="text-xs text-slate-400">&bull; Today: Thursday, 05 Nov 2026</span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Welcome, {currentUser.firstName} {currentUser.lastName}</span>
                  <span className="text-xs font-normal text-slate-400">({currentUser.designation})</span>
                </h3>
                <p className="text-xs text-slate-300">
                  {myRecordToday ? (
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>
                        Signed in at <strong className="text-white font-mono">{myRecordToday.clockIn}</strong> ({myRecordToday.workType} &bull; {myRecordToday.locationName})
                        {myRecordToday.clockOut && ` &bull; Shift concluded at ${myRecordToday.clockOut}`}
                      </span>
                    </span>
                  ) : (
                    <span className="text-amber-200 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                      You have not clocked in for your shift yet. Official morning threshold is 08:30 AM.
                    </span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {!myRecordToday ? (
                  <>
                    <button
                      onClick={() => handleClockIn('OFFICE', 'Abuja Head Office')}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cisd-gold-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-md transition transform active:scale-95"
                    >
                      <Building2 className="h-4 w-4" />
                      Sign In: Office HQ
                    </button>
                    <button
                      onClick={() => handleClockIn('REMOTE', 'Approved Home Station')}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur transition"
                    >
                      <MapPin className="h-4 w-4 text-blue-400" />
                      Sign In: Remote
                    </button>
                    <button
                      onClick={() => handleClockIn('OFFICE', 'Diplomatic Field Mission')}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur transition"
                    >
                      <Globe className="h-4 w-4 text-emerald-400" />
                      Sign In: Field Mission
                    </button>
                  </>
                ) : !myRecordToday.clockOut ? (
                  <button
                    onClick={handleClockOut}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md transition transform active:scale-95"
                  >
                    <Clock className="h-4 w-4" />
                    Clock Out & Conclude Shift
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 border border-white/20">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Daily Shift Concluded ({myRecordToday.workingHours} hrs)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Live Presence KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Staff</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{db.employees.length}</p>
              <span className="text-[10px] text-slate-500">Active personnel roster</span>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Signed In Today</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{checkedInCount}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">{Math.round((checkedInCount / db.employees.length) * 100)}% Participation</span>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">At Office HQ</span>
              <p className="text-2xl font-black text-blue-700 mt-1">{inOfficeToday}</p>
              <span className="text-[10px] text-blue-600 font-semibold">Physical presence</span>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Remote Station</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">{remoteToday}</p>
              <span className="text-[10px] text-indigo-600 font-semibold">Telework / Mission</span>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Not Checked In</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{notCheckedInCount}</p>
              <span className="text-[10px] text-amber-600 font-semibold">Pending sign in</span>
            </div>
          </div>

          {/* Live Roster Search & Filter Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search colleagues by name, employee ID, or designation..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cisd-navy-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={rosterDeptFilter}
                onChange={(e) => setRosterDeptFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-slate-700 font-medium"
              >
                <option value="ALL">All Directorates</option>
                {db.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={rosterModalityFilter}
                onChange={(e) => setRosterModalityFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-slate-700 font-medium"
              >
                <option value="ALL">All Presence Types</option>
                <option value="OFFICE">In Office (HQ)</option>
                <option value="REMOTE">Remote Station</option>
                <option value="LATE">Late Check-Ins</option>
                <option value="NOT_CHECKED_IN">Not Signed In</option>
              </select>
            </div>
          </div>

          {/* Live Roster Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span>Who&apos;s Signed In Today</span>
                </h4>
                <p className="text-[11px] text-slate-500">Live organization presence across all directorates &mdash; visible to all staff</p>
              </div>
              <span className="text-xs font-mono text-slate-400">Showing {liveStaffRoster.length} staff</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveStaffRoster.map(item => (
                <div
                  key={item.employee.id}
                  className={`rounded-xl border p-3.5 transition flex items-start gap-3 ${
                    item.hasClockedIn
                      ? 'border-slate-200 bg-white hover:border-cisd-navy-300 shadow-sm'
                      : 'border-dashed border-slate-200 bg-slate-50/60 opacity-80'
                  }`}
                >
                  <img
                    src={item.employee.avatar}
                    alt={item.employee.firstName}
                    className="h-10 w-10 rounded-full object-cover border flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {item.employee.firstName} {item.employee.lastName}
                      </p>
                      <span className="font-mono text-[10px] text-slate-400 font-bold">
                        {item.employee.employeeId}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate">{item.employee.designation}</p>
                    <p className="text-[10px] text-cisd-gold-700 font-semibold truncate">{item.department?.name}</p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {item.hasClockedIn ? (
                        <>
                          <div className="flex items-center gap-1 font-mono text-slate-700 font-semibold">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{item.clockIn}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                            item.status === 'REMOTE' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {item.workType === 'REMOTE' ? 'Remote' : item.status === 'LATE' ? 'Late Arrival' : 'In Office'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-400 italic">Not signed in yet</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                            Awaiting Arrival
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MONTHLY ATTENDANCE ANALYTICS (VISIBLE TO ALL STAFF)                */}
      {/* ========================================================================= */}
      {activeSubTab === 'ANALYTICS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Month Selector & Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cisd-navy-50 text-cisd-navy-900 border border-cisd-navy-200">
                <BarChart3 className="h-5 w-5 text-cisd-navy-800" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Monthly Attendance Intelligence</h3>
                <p className="text-[11px] text-slate-500">
                  Full institutional attendance analytics &mdash; visible to all employees and leadership
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-slate-800 font-bold"
              >
                <option value="2026-11">November 2026 (Active Month)</option>
                <option value="2026-10">October 2026 (Prior Cycle)</option>
              </select>

              <select
                value={analyticsDeptFilter}
                onChange={(e) => setAnalyticsDeptFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-slate-700 font-medium"
              >
                <option value="ALL">All Directorates</option>
                {db.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Top 4 Monthly KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Punctuality</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">{monthPunctualityPct}%</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>On-time arrival threshold</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Working Logs</span>
              <p className="text-3xl font-black text-cisd-navy-900 mt-1">{monthTotalWorking}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>{monthOffice} Office &bull; {monthRemote} Remote</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Daily Hours</span>
              <p className="text-3xl font-black text-blue-600 mt-1">{avgDailyHours}h</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>{monthTotalHours.toFixed(0)} aggregate hours logged</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Late Arrival Rate</span>
              <p className="text-3xl font-black text-amber-600 mt-1">{100 - monthPunctualityPct}%</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
                <span>{monthLate} delayed arrivals recorded</span>
              </div>
            </div>
          </div>

          {/* Visual Trend: Daily Attendance Volume in the Month */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cisd-navy-900" />
                  <span>Day-by-Day Attendance Volume ({selectedMonth})</span>
                </h4>
                <p className="text-[11px] text-slate-500">Turnout across recorded working days in the monthly cycle</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-sm bg-cisd-navy-900" />
                  Office HQ
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                  Remote
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                  Late
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {dailyTrend.map(d => (
                <div key={d.date} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center space-y-1">
                  <p className="font-mono text-xs font-black text-slate-800">{d.displayDate}</p>
                  <p className="text-xl font-black text-cisd-navy-950">{d.total} <span className="text-[10px] text-slate-400 font-normal">staff</span></p>
                  <div className="flex justify-center gap-1 text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200/60">
                    <span className="text-cisd-navy-900">{d.office} off</span> &bull;
                    <span className="text-blue-600">{d.remote} rem</span> &bull;
                    <span className="text-amber-600">{d.late} late</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Directorate Performance Comparison */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Directorate Attendance & Punctuality Benchmark</h4>
              <p className="text-[11px] text-slate-500">Comparative attendance compliance across CISD operational departments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {directorateAnalytics.map(d => (
                <div key={d.dept.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <p className="font-bold text-slate-900 text-xs line-clamp-1">{d.dept.name}</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-cisd-navy-900">{d.punctuality}%</span>
                    <span className="text-[10px] font-semibold text-slate-500">{d.headcount} staff</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${d.punctuality >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${d.punctuality}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>{d.office} Office</span>
                    <span>{d.remote} Remote</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff-by-Staff Monthly Summary Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Personnel Monthly Attendance Matrix ({selectedMonth})</h4>
                <p className="text-[11px] text-slate-500">Complete staff presence, remote days, hours, and compliance scores</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition self-start sm:self-auto"
              >
                <Download className="h-3.5 w-3.5" />
                Export Monthly Matrix
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Directorate</th>
                    <th className="py-3 px-4 text-center">Office Days</th>
                    <th className="py-3 px-4 text-center">Remote Days</th>
                    <th className="py-3 px-4 text-center">Late Check-Ins</th>
                    <th className="py-3 px-4 text-center">Approved Leaves</th>
                    <th className="py-3 px-4 text-center">Total Hours</th>
                    <th className="py-3 px-4 text-right">Punctuality %</th>
                    <th className="py-3 px-4 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffMonthlyAnalytics.map(item => (
                    <tr key={item.emp.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.emp.avatar}
                            alt={item.emp.firstName}
                            className="h-7 w-7 rounded-full object-cover border"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.emp.firstName} {item.emp.lastName}</p>
                            <p className="text-[10px] font-mono text-slate-400">{item.emp.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{item.dept?.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{item.officeDays}</td>
                      <td className="py-3 px-4 text-center text-blue-700 font-bold">{item.remoteDays}</td>
                      <td className="py-3 px-4 text-center text-amber-700 font-bold">{item.lateDays}</td>
                      <td className="py-3 px-4 text-center text-purple-700 font-bold">{item.leaveDays}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{item.hours} hrs</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700">{item.punctuality}%</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.badgeColor}`}>
                          {item.scoreBadge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DAILY REGISTER & DETAILED LOGS                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'REGISTER' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filter and Date Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterDate('2026-11-05')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  filterDate === '2026-11-05' ? 'bg-cisd-navy-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Today (05 Nov)
              </button>
              <button
                onClick={() => setFilterDate('2026-11-04')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  filterDate === '2026-11-04' ? 'bg-cisd-navy-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yesterday (04 Nov)
              </button>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-slate-700"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search staff name or ID..."
                value={registerSearch}
                onChange={(e) => setRegisterSearch(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700 focus:bg-white"
              />

              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
              >
                <option value="ALL">All Directorates</option>
                {db.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="REMOTE">Remote</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Download className="h-3.5 w-3.5" />
                CSV Export
              </button>
            </div>
          </div>

          {/* Attendance Register Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Attendance Register: {filterDate} ({registerRecords.length} Records)
              </h3>
              <span className="text-xs text-slate-400">Official standard hours: 08:30 – 17:00</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Clock In</th>
                    <th className="py-3 px-4">Clock Out</th>
                    <th className="py-3 px-4">Modality & Station</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registerRecords.map(r => {
                    const emp = db.employees.find(e => e.id === r.employeeId);
                    const dept = db.departments.find(d => d.id === emp?.departmentId);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
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
                        <td className="py-3 px-4 text-slate-600">{dept?.name}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.clockIn}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{r.clockOut || 'Shift Active'}</td>
                        <td className="py-3 px-4">
                          <span className="text-slate-700 font-medium">{r.locationName}</span>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">{r.workType}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                            r.status === 'REMOTE' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{r.workingHours} hrs</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ADJUSTMENTS & CORRECTIONS                                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'CORRECTIONS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Attendance Adjustment & Correction Requests</h3>
              <p className="text-xs text-slate-500">Submit or review missed clock-ins and diplomatic mission exceptions</p>
            </div>
            <button
              onClick={() => setShowCorrectionModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow"
            >
              <FileEdit className="h-3.5 w-3.5 text-cisd-gold-400" />
              New Adjustment Request
            </button>
          </div>

          {pendingCorrections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingCorrections.map(c => {
                const emp = db.employees.find(e => e.id === c.employeeId);
                const dept = db.departments.find(d => d.id === emp?.departmentId);

                return (
                  <div key={c.id} className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp?.avatar}
                          alt={emp?.firstName}
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{emp?.firstName} {emp?.lastName}</p>
                          <p className="text-[11px] text-slate-500">{dept?.name}</p>
                        </div>
                      </div>
                      <span className="rounded bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5">
                        Date: {c.date}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-100">
                      <p className="text-slate-700">
                        <strong>Requested Times:</strong> In {c.requestedClockIn} &bull; Out {c.requestedClockOut}
                      </p>
                      <p className="text-slate-600 italic">&ldquo;{c.reason}&rdquo;</p>
                    </div>

                    {!isEmployee ? (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleReviewCorrection(c.id, 'REJECTED')}
                          className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleReviewCorrection(c.id, 'APPROVED')}
                          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                        >
                          Approve Correction
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400">Reviewing Authority: HR Administrator</span>
                        <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 font-bold">
                          Pending Approval
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">No Pending Adjustments</p>
              <p>All attendance records and time adjustments are currently up to date.</p>
            </div>
          )}
        </div>
      )}

      {/* Adjustment Request Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-cisd-navy-900" />
                <h3 className="font-bold text-slate-900 text-sm">Request Attendance Adjustment</h3>
              </div>
              <button onClick={() => setShowCorrectionModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitCorrection} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date Requiring Adjustment</label>
                <input
                  type="date"
                  required
                  value={corDate}
                  onChange={(e) => setCorDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Actual Clock-In</label>
                  <input
                    type="time"
                    required
                    value={corIn}
                    onChange={(e) => setCorIn(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Actual Clock-Out</label>
                  <input
                    type="time"
                    required
                    value={corOut}
                    onChange={(e) => setCorOut(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Adjustment</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Field mission, biometric terminal sync delay, offsite diplomatic meeting..."
                  value={corReason}
                  onChange={(e) => setCorReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
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
