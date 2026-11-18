'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  Filter,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  ExecutiveReportType, 
  OrganizationArm, 
  getOrganizationArmConfig, 
  sanitizeCsvCell,
  PayrollRecord 
} from '@/lib/types';

export default function ReportsModule() {
  const { db, currentUser, showToast } = usePortal();

  const [reportType, setReportType] = useState<ExecutiveReportType>('HEADCOUNT');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterArm, setFilterArm] = useState<'ALL' | OrganizationArm>('ALL');
  const [filterMonth, setFilterMonth] = useState('2026-11');

  if (!db) return null;

  // Block non-authorized staff from institutional reports
  if (currentUser.role === 'EMPLOYEE') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4 max-w-xl mx-auto my-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <BarChart3 className="h-8 w-8 text-cisd-navy-900" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Institutional Reports Access</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aggregated institutional statistical reports and CSV exports are reserved for Directorate Heads, Finance, HR Administration, and the Executive Director.
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 max-w-sm mx-auto">
          Your role: <strong className="text-slate-800">{currentUser.role.replace('_', ' ')}</strong> ({currentUser.firstName} {currentUser.lastName})
        </div>
        <p className="text-[11px] text-slate-400">
          To view your personal activity, check your Timesheets, Attendance terminal, or Personal Dossier.
        </p>
      </div>
    );
  }

  // Defensive BOLA Scoping: Line Managers are locked to their assigned sister arm
  const isLineManager = currentUser.role === 'LINE_MANAGER';
  const effectiveArm: 'ALL' | OrganizationArm = isLineManager 
    ? (currentUser.organizationArm || 'CENTRAL_HOLDING') 
    : filterArm;

  // Check if caller can access financial/compensation reports
  const canViewPayroll = ['FINANCE', 'HR_ADMIN', 'SUPER_ADMIN', 'EXECUTIVE'].includes(currentUser.role);

  // Filtered employees based on effectiveArm and filterDept
  const employees = db.employees.filter(e => {
    const matchesArm = effectiveArm === 'ALL' || e.organizationArm === effectiveArm;
    const matchesDept = filterDept === 'ALL' || e.departmentId === filterDept;
    return matchesArm && matchesDept;
  });
  const employeeIds = employees.map(e => e.id);

  // Scoped attendance
  const attendanceRecords = db.attendanceRecords.filter(a => employeeIds.includes(a.employeeId));

  // Scoped leave requests
  const leaveRequests = db.leaveRequests.filter(l => employeeIds.includes(l.employeeId));

  // Scoped assets (items assigned to scoped employees, or pool items if group-wide)
  const scopedAssets = db.assets.filter(a => {
    if (effectiveArm === 'ALL') return true;
    if (!a.assignedToId) return false;
    const assignee = db.employees.find(e => e.id === a.assignedToId);
    return assignee?.organizationArm === effectiveArm;
  });

  // Scoped timesheets
  const scopedTimesheets = db.timesheets.filter(t => employeeIds.includes(t.employeeId));

  // Scoped payroll records for active month
  const scopedPayroll: PayrollRecord[] = (db.payrollRecords || []).filter(p => {
    const matchesMonth = p.month === filterMonth;
    const matchesArm = effectiveArm === 'ALL' || p.organizationArm === effectiveArm;
    return matchesMonth && matchesArm;
  });

  // Available payroll months in database
  const availableMonths = Array.from(new Set((db.payrollRecords || []).map(p => p.month)));
  if (!availableMonths.includes('2026-11')) availableMonths.push('2026-11');
  if (!availableMonths.includes('2026-12')) availableMonths.push('2026-12');
  availableMonths.sort().reverse();

  // Financial aggregates in NGN
  const totalGrossPay = scopedPayroll.reduce((acc, p) => acc + (p.grossPay || p.grossSalary || 0), 0);
  const totalNetPay = scopedPayroll.reduce((acc, p) => acc + (p.netPay || p.netSalary || 0), 0);
  const totalPayeTax = scopedPayroll.reduce((acc, p) => acc + (p.taxPAYE || p.payeTax || 0), 0);
  const totalPension = scopedPayroll.reduce((acc, p) => acc + (p.pension || 0), 0);

  const formatNaira = (val: number) => {
    return '₦' + Number(val || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[] = [];

    if (reportType === 'HEADCOUNT') {
      headers = ['Employee ID,First Name,Last Name,Email,Entity,Department,Designation,Status,Type,Join Date'];
      rows = employees.map(e => {
        const d = db.departments.find(dept => dept.id === e.departmentId)?.name || '';
        const arm = getOrganizationArmConfig(e.organizationArm).displayName;
        return [
          sanitizeCsvCell(e.employeeId),
          sanitizeCsvCell(e.firstName),
          sanitizeCsvCell(e.lastName),
          sanitizeCsvCell(e.email),
          sanitizeCsvCell(arm),
          sanitizeCsvCell(d),
          sanitizeCsvCell(e.designation),
          sanitizeCsvCell(e.status),
          sanitizeCsvCell(e.employmentType),
          sanitizeCsvCell(e.joinDate)
        ].join(',');
      });
    } else if (reportType === 'ATTENDANCE') {
      headers = ['Date,Staff Name,ID,Entity,Status,Modality,Location,Hours'];
      rows = attendanceRecords.map(r => {
        const emp = db.employees.find(e => e.id === r.employeeId);
        const arm = getOrganizationArmConfig(emp?.organizationArm).displayName;
        return [
          sanitizeCsvCell(r.date),
          sanitizeCsvCell(`${emp?.firstName || ''} ${emp?.lastName || ''}`),
          sanitizeCsvCell(emp?.employeeId || ''),
          sanitizeCsvCell(arm),
          sanitizeCsvCell(r.status),
          sanitizeCsvCell(r.workType),
          sanitizeCsvCell(r.locationName),
          sanitizeCsvCell(r.workingHours)
        ].join(',');
      });
    } else if (reportType === 'LEAVE') {
      headers = ['Staff Name,ID,Entity,Leave Type,Start Date,End Date,Days,Status,Reason'];
      rows = leaveRequests.map(l => {
        const emp = db.employees.find(e => e.id === l.employeeId);
        const arm = getOrganizationArmConfig(emp?.organizationArm).displayName;
        return [
          sanitizeCsvCell(`${emp?.firstName || ''} ${emp?.lastName || ''}`),
          sanitizeCsvCell(emp?.employeeId || ''),
          sanitizeCsvCell(arm),
          sanitizeCsvCell(l.leaveType),
          sanitizeCsvCell(l.startDate),
          sanitizeCsvCell(l.endDate),
          sanitizeCsvCell(l.daysCount),
          sanitizeCsvCell(l.status),
          sanitizeCsvCell(l.reason)
        ].join(',');
      });
    } else if (reportType === 'ASSETS') {
      headers = ['Asset Code,Name,Category,Serial Number,Entity,Assigned Staff,Status,Condition,Location'];
      rows = scopedAssets.map(a => {
        const emp = db.employees.find(e => e.id === a.assignedToId);
        const arm = emp ? getOrganizationArmConfig(emp.organizationArm).displayName : 'Central Inventory Pool';
        return [
          sanitizeCsvCell(a.assetCode),
          sanitizeCsvCell(a.name),
          sanitizeCsvCell(a.category),
          sanitizeCsvCell(a.serialNumber),
          sanitizeCsvCell(arm),
          sanitizeCsvCell(emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned'),
          sanitizeCsvCell(a.status),
          sanitizeCsvCell(a.condition),
          sanitizeCsvCell(a.location)
        ].join(',');
      });
    } else if (reportType === 'PROJECTS') {
      headers = ['Staff Name,ID,Entity,Period Start,Period End,Initiatives,Status,Hours Logged'];
      rows = scopedTimesheets.map(ts => {
        const emp = db.employees.find(e => e.id === ts.employeeId);
        const arm = getOrganizationArmConfig(emp?.organizationArm).displayName;
        const projectNames = ts.entries.map(ent => ent.projectName).join('; ');
        return [
          sanitizeCsvCell(`${emp?.firstName || ''} ${emp?.lastName || ''}`),
          sanitizeCsvCell(emp?.employeeId || ''),
          sanitizeCsvCell(arm),
          sanitizeCsvCell(ts.weekStartDate),
          sanitizeCsvCell(ts.weekEndDate),
          sanitizeCsvCell(projectNames),
          sanitizeCsvCell(ts.status),
          sanitizeCsvCell(ts.totalHours)
        ].join(',');
      });
    } else if (reportType === 'PAYROLL') {
      if (!canViewPayroll) {
        showToast('Unauthorized: Only Finance and Executive roles can export payroll data.', 'error');
        return;
      }
      headers = ['Employee ID,Staff Name,Entity,Month,Basic Salary (NGN),Allowances (NGN),Gross Pay (NGN),PAYE Tax (NGN),Pension 8% (NGN),Net Pay (NGN),Status'];
      rows = scopedPayroll.map(p => {
        const emp = db.employees.find(e => e.id === p.employeeId);
        const arm = getOrganizationArmConfig(emp?.organizationArm || p.organizationArm).displayName;
        const allowances = (p.housingAllowance || 0) + (p.transportAllowance || 0) + (p.utilityAllowance || 0) + (p.otherAllowances || 0);
        return [
          sanitizeCsvCell(emp?.employeeId || p.employeeId),
          sanitizeCsvCell(`${emp?.firstName || ''} ${emp?.lastName || ''}`),
          sanitizeCsvCell(arm),
          sanitizeCsvCell(p.month),
          sanitizeCsvCell(p.basicSalary || 0),
          sanitizeCsvCell(allowances),
          sanitizeCsvCell(p.grossPay || p.grossSalary || 0),
          sanitizeCsvCell(p.taxPAYE || p.payeTax || 0),
          sanitizeCsvCell(p.pension || 0),
          sanitizeCsvCell(p.netPay || p.netSalary || 0),
          sanitizeCsvCell(p.status)
        ].join(',');
      });
    }

    // Build RFC 4180 CSV blob with UTF-8 BOM
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const armSlug = effectiveArm === 'ALL' ? 'Tripartite_Group' : effectiveArm;
    link.setAttribute('download', `${armSlug}_${reportType}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${reportType.toLowerCase()} analytical report to CSV`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cisd-navy-900 text-cisd-gold-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
              Executive Analytics
            </span>
            <span className="text-xs text-slate-400">&bull; Tripartite Group Reporting</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Institutional Analytics & Executive Reports
          </h2>
          <p className="text-xs text-slate-500">
            Export comprehensive multi-entity workforce metrics, attendance logs, leave liabilities, and group payroll rollups
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition"
          >
            <Download className="h-4 w-4 text-cisd-gold-400" />
            Export Selected CSV
          </button>
        </div>
      </div>

      {/* Report Switcher & Filter Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs no-print">
        {/* Top: Report Type Selection */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'HEADCOUNT', label: 'Headcount & Demographics', icon: Users },
            { id: 'ATTENDANCE', label: 'Attendance & Punctuality', icon: Clock },
            { id: 'LEAVE', label: 'Leave & Absence Utilization', icon: Calendar },
            { id: 'ASSETS', label: 'Assets & Property Custody', icon: Building },
            { id: 'PROJECTS', label: 'Timesheets & Project Hours', icon: BarChart3 },
            ...(canViewPayroll ? [{ id: 'PAYROLL', label: 'Payroll & Remuneration Rollup', icon: Wallet }] : [])
          ].map(rep => {
            const Icon = rep.icon;
            const isSelected = reportType === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => setReportType(rep.id as any)}
                className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cisd-navy-900 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-cisd-gold-400' : 'text-slate-500'}`} />
                <span>{rep.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom: Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Entity Filter (Locked for Line Managers) */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Entity Scope:
            </span>
            {isLineManager ? (
              <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 font-bold border border-purple-200">
                {getOrganizationArmConfig(effectiveArm === 'ALL' ? undefined : effectiveArm).displayName} (Locked to your unit)
              </span>
            ) : (
              <select
                value={filterArm}
                onChange={(e) => setFilterArm(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-cisd-navy-500"
              >
                <option value="ALL">All Arms (Tripartite Group-Wide)</option>
                <option value="SWITCH_ADVISORY">Switch Advisory (Strategy & Consulting)</option>
                <option value="CISD">CISD (Centre for Inclusive Social Development)</option>
                <option value="GX_MEDIA">GX Media House (Creative & Media)</option>
                <option value="CENTRAL_HOLDING">Central Holding & Executive Office</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Month Parameter for Payroll */}
            {reportType === 'PAYROLL' && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Period:</span>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700 font-bold"
                >
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Directorate:</span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700 font-medium"
              >
                <option value="ALL">All Directorates</option>
                {db.departments
                  .filter(d => effectiveArm === 'ALL' || d.organizationArm === effectiveArm)
                  .map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Report Body */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {/* Printable Official Header */}
        <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-cisd-navy-900 text-base tracking-wider">TOSIN HR PORTAL</span>
              <span className="text-xs text-slate-400 font-bold uppercase">&bull; Tripartite Executive Record</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Switch Advisory &bull; CISD &bull; GX Media House &bull; {reportType} Report
            </h3>
            <p className="text-xs text-slate-500">
              Scope: {effectiveArm === 'ALL' ? 'Tripartite Group-Wide' : getOrganizationArmConfig(effectiveArm).displayName}
              {reportType === 'PAYROLL' ? ` &bull; Payroll Period: ${filterMonth}` : ''}
              {filterDept !== 'ALL' ? ` &bull; Directorate: ${filterDept}` : ''}
            </p>
          </div>
          <div className="text-right">
            <span className="rounded bg-cisd-gold-100 text-cisd-gold-800 text-[10px] font-bold px-2 py-0.5 uppercase">
              Official Executive Copy
            </span>
            <p className="text-[10px] text-slate-400 mt-1">ISO: {new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        {/* 1. Headcount & Demographics */}
        {reportType === 'HEADCOUNT' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Scoped Headcount</span>
                <span className="text-2xl font-black text-slate-900">{employees.length}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Time Staff</span>
                <span className="text-2xl font-black text-cisd-navy-900">
                  {employees.filter(e => e.employmentType === 'FULL_TIME').length}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Senior Fellows</span>
                <span className="text-2xl font-black text-emerald-600">
                  {employees.filter(e => e.employmentType === 'FELLOW').length}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contract Specialists</span>
                <span className="text-2xl font-black text-amber-600">
                  {employees.filter(e => e.employmentType === 'CONTRACT').length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Staff Member</th>
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Entity</th>
                    <th className="py-2 px-3">Directorate</th>
                    <th className="py-2 px-3">Designation</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Location</th>
                    <th className="py-2 px-3">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map(emp => {
                    const dept = db.departments.find(d => d.id === emp.departmentId);
                    const armCfg = getOrganizationArmConfig(emp.organizationArm);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{emp.firstName} {emp.lastName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{emp.employeeId}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold border ${armCfg.badgeClass}`}>
                            {armCfg.shortLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{dept?.name}</td>
                        <td className="py-2.5 px-3 text-slate-700">{emp.designation}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-700">{emp.status}</td>
                        <td className="py-2.5 px-3 text-slate-500">{emp.workLocation}</td>
                        <td className="py-2.5 px-3 text-slate-600">{emp.joinDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Attendance & Punctuality */}
        {reportType === 'ATTENDANCE' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recorded Shifts</span>
                <span className="text-2xl font-black text-slate-900">{attendanceRecords.length}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">On-Site Shifts</span>
                <span className="text-2xl font-black text-emerald-600">
                  {attendanceRecords.filter(a => a.workType === 'OFFICE').length}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Remote Shifts</span>
                <span className="text-2xl font-black text-blue-600">
                  {attendanceRecords.filter(a => a.workType === 'REMOTE').length}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lateness Flagged</span>
                <span className="text-2xl font-black text-amber-600">
                  {attendanceRecords.filter(a => a.status === 'LATE').length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Staff Member</th>
                    <th className="py-2 px-3">Entity</th>
                    <th className="py-2 px-3">Clock In</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Modality</th>
                    <th className="py-2 px-3">Location</th>
                    <th className="py-2 px-3 text-right">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.map(r => {
                    const emp = db.employees.find(e => e.id === r.employeeId);
                    const armCfg = getOrganizationArmConfig(emp?.organizationArm);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-medium">{r.date}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{emp?.firstName} {emp?.lastName}</td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold border ${armCfg.badgeClass}`}>
                            {armCfg.shortLabel}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono">{r.clockIn}</td>
                        <td className="py-2 px-3 font-semibold">{r.status}</td>
                        <td className="py-2 px-3">{r.workType}</td>
                        <td className="py-2 px-3 text-slate-500">{r.locationName}</td>
                        <td className="py-2 px-3 text-right font-bold">{r.workingHours}h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Leave Utilization */}
        {reportType === 'LEAVE' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Staff Member</th>
                    <th className="py-2 px-3">Entity</th>
                    <th className="py-2 px-3">Leave Type</th>
                    <th className="py-2 px-3">Dates</th>
                    <th className="py-2 px-3">Days</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveRequests.map(l => {
                    const emp = db.employees.find(e => e.id === l.employeeId);
                    const armCfg = getOrganizationArmConfig(emp?.organizationArm);
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{emp?.firstName} {emp?.lastName}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold border ${armCfg.badgeClass}`}>
                            {armCfg.shortLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{l.leaveType}</td>
                        <td className="py-2.5 px-3 text-slate-600">{l.startDate} &rarr; {l.endDate}</td>
                        <td className="py-2.5 px-3 font-bold">{l.daysCount} days</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            l.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 line-clamp-1">{l.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Assets & Property Custody */}
        {reportType === 'ASSETS' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Asset Code</th>
                    <th className="py-2 px-3">Hardware / Item</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Serial Number</th>
                    <th className="py-2 px-3">Entity Custody</th>
                    <th className="py-2 px-3">Assigned Staff</th>
                    <th className="py-2 px-3">Condition</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedAssets.map(a => {
                    const emp = db.employees.find(e => e.id === a.assignedToId);
                    const armCfg = emp ? getOrganizationArmConfig(emp.organizationArm) : null;
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{a.assetCode}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{a.name}</td>
                        <td className="py-2.5 px-3">{a.category}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{a.serialNumber}</td>
                        <td className="py-2.5 px-3">
                          {armCfg ? (
                            <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold border ${armCfg.badgeClass}`}>
                              {armCfg.displayName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Central Pool</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">{emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned'}</td>
                        <td className="py-2.5 px-3">{a.condition}</td>
                        <td className="py-2.5 px-3 font-semibold">{a.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Timesheets & Project Hours */}
        {reportType === 'PROJECTS' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Staff Member</th>
                    <th className="py-2 px-3">Entity</th>
                    <th className="py-2 px-3">Period</th>
                    <th className="py-2 px-3">Strategic Initiatives</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Hours Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedTimesheets.map(ts => {
                    const emp = db.employees.find(e => e.id === ts.employeeId);
                    const armCfg = getOrganizationArmConfig(emp?.organizationArm);
                    return (
                      <tr key={ts.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{emp?.firstName} {emp?.lastName}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold border ${armCfg.badgeClass}`}>
                            {armCfg.shortLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{ts.weekStartDate} &rarr; {ts.weekEndDate}</td>
                        <td className="py-2.5 px-3 text-slate-600">{ts.entries.map(e => e.projectName).join(', ')}</td>
                        <td className="py-2.5 px-3 font-semibold">{ts.status}</td>
                        <td className="py-2.5 px-3 text-right font-black text-cisd-navy-900">{ts.totalHours}h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Payroll & Remuneration Rollup (Restricted to Finance & Senior Leadership) */}
        {reportType === 'PAYROLL' && (
          <div className="space-y-5">
            {!canViewPayroll ? (
              <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                <ShieldAlert className="h-8 w-8 text-rose-600 mx-auto" />
                <h4 className="font-bold text-rose-900 text-sm">Privileged Financial Document</h4>
                <p className="text-xs text-rose-700 max-w-md mx-auto">
                  Group payroll records are strictly restricted to Finance, HR Administration, and Executive Director clearance.
                </p>
              </div>
            ) : (
              <>
                {/* Financial Summary KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                  <div className="rounded-xl bg-slate-900 text-white p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Gross Pay</span>
                    <span className="text-lg font-black text-cisd-gold-300">{formatNaira(totalGrossPay)}</span>
                    <span className="text-[10px] text-slate-400 block">{scopedPayroll.length} Personnel</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Net Disbursement</span>
                    <span className="text-lg font-black text-emerald-700">{formatNaira(totalNetPay)}</span>
                    <span className="text-[10px] text-slate-500 block">Direct Bank Credit</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Statutory PAYE Tax</span>
                    <span className="text-lg font-black text-amber-700">{formatNaira(totalPayeTax)}</span>
                    <span className="text-[10px] text-slate-500 block">Remittance Liability</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pension 8% (Employee)</span>
                    <span className="text-lg font-black text-blue-700">{formatNaira(totalPension)}</span>
                    <span className="text-[10px] text-slate-500 block">PFA Remittance</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cycle Governance</span>
                    <span className="text-base font-black text-slate-900 block truncate">
                      {scopedPayroll[0]?.status || 'DISBURSED'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Sealed & Audited
                    </span>
                  </div>
                </div>

                {/* Itemized Payroll Rollup Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[850px]">
                    <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Staff Member</th>
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">Entity</th>
                        <th className="py-2.5 px-3 text-right">Basic Salary</th>
                        <th className="py-2.5 px-3 text-right">Gross Pay</th>
                        <th className="py-2.5 px-3 text-right">PAYE Tax</th>
                        <th className="py-2.5 px-3 text-right">Pension (8%)</th>
                        <th className="py-2.5 px-3 text-right">Net Pay</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {scopedPayroll.map(record => {
                        const emp = db.employees.find(e => e.id === record.employeeId);
                        const armCfg = getOrganizationArmConfig(emp?.organizationArm || record.organizationArm);
                        return (
                          <tr key={record.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {emp?.firstName || 'Staff'} {emp?.lastName || ''}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{emp?.employeeId || record.employeeId}</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold border ${armCfg.badgeClass}`}>
                                {armCfg.shortLabel}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatNaira(record.basicSalary)}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatNaira(record.grossPay || record.grossSalary || 0)}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-rose-700">{formatNaira(record.taxPAYE || record.payeTax || 0)}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-blue-700">{formatNaira(record.pension || 0)}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">{formatNaira(record.netPay || record.netSalary || 0)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
