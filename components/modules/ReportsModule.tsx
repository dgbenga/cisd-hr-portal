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
  PieChart
} from 'lucide-react';

export default function ReportsModule() {
  const { db, currentUser, showToast } = usePortal();

  const [reportType, setReportType] = useState<'HEADCOUNT' | 'ATTENDANCE' | 'LEAVE' | 'ASSETS' | 'PROJECTS'>('HEADCOUNT');
  const [filterDept, setFilterDept] = useState('ALL');

  if (!db) return null;

  if (currentUser.role === 'EMPLOYEE') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4 max-w-xl mx-auto my-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <BarChart3 className="h-8 w-8 text-cisd-navy-900" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Institutional Reports Access</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aggregated institutional statistical reports and CSV exports are available to Directorate Heads, HR Administration, and the Super Administrator.
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 max-w-sm mx-auto">
          Your role: <strong className="text-slate-800">{currentUser.role.replace('_', ' ')}</strong> ({currentUser.firstName} {currentUser.lastName})
        </div>
        <p className="text-[11px] text-slate-400">
          To view your personal activity, check your Timesheets, Attendance terminal, or 360 Profile dossier.
        </p>
      </div>
    );
  }

  // Department filter
  const employees = db.employees.filter(e => filterDept === 'ALL' || e.departmentId === filterDept);

  // Total working hours
  const totalHoursLogged = db.timesheets.reduce((acc, curr) => acc + curr.totalHours, 0);

  // Total Assets Value / Inventory
  const assignedAssetsCount = db.assets.filter(a => a.status === 'ASSIGNED').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[] = [];

    if (reportType === 'HEADCOUNT') {
      headers = ['Employee ID,First Name,Last Name,Email,Department,Designation,Status,Type,Joined'];
      rows = employees.map(e => {
        const d = db.departments.find(dept => dept.id === e.departmentId)?.name || '';
        return `"${e.employeeId}","${e.firstName}","${e.lastName}","${e.email}","${d}","${e.designation}","${e.status}","${e.employmentType}","${e.joinDate}"`;
      });
    } else if (reportType === 'ATTENDANCE') {
      headers = ['Date,Staff Name,ID,Status,Modality,Location,Hours'];
      rows = db.attendanceRecords.map(r => {
        const emp = db.employees.find(e => e.id === r.employeeId);
        return `"${r.date}","${emp?.firstName} ${emp?.lastName}","${emp?.employeeId}","${r.status}","${r.workType}","${r.locationName}","${r.workingHours}"`;
      });
    } else if (reportType === 'LEAVE') {
      headers = ['Staff Name,Leave Type,Start Date,End Date,Days,Status,Reason'];
      rows = db.leaveRequests.map(l => {
        const emp = db.employees.find(e => e.id === l.employeeId);
        return `"${emp?.firstName} ${emp?.lastName}","${l.leaveType}","${l.startDate}","${l.endDate}","${l.daysCount}","${l.status}","${l.reason}"`;
      });
    } else {
      headers = ['Asset Code,Name,Category,Serial Number,Status,Condition,Location'];
      rows = db.assets.map(a => `"${a.assetCode}","${a.name}","${a.category}","${a.serialNumber}","${a.status}","${a.condition}","${a.location}"`);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CISD_${reportType}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${reportType.toLowerCase()} analytical report to CSV`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Institutional Analytics & Executive Reports</h2>
          <p className="text-xs text-slate-500">
            Export comprehensive HR metrics, attendance logs, leave liabilities, and project timesheet summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'HEADCOUNT', label: 'Headcount & Demographics' },
            { id: 'ATTENDANCE', label: 'Attendance & Punctuality' },
            { id: 'LEAVE', label: 'Leave & Absence Utilization' },
            { id: 'ASSETS', label: 'Assets & Property Custody' },
            { id: 'PROJECTS', label: 'Timesheets & Project Hours' }
          ].map(rep => (
            <button
              key={rep.id}
              onClick={() => setReportType(rep.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                reportType === rep.id
                  ? 'bg-cisd-navy-900 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {rep.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Division:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
          >
            <option value="ALL">All Directorates</option>
            {db.departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Body */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {/* Printable Official Header */}
        <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-cisd-navy-900 text-base tracking-wider">CISD</span>
              <span className="text-xs text-slate-400 font-bold uppercase">&bull; Executive Statistical Report</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Centre for International Strategic Dialogue &bull; {reportType} Report
            </h3>
            <p className="text-xs text-slate-500">Generated on: 05 November 2026 &bull; Scope: {filterDept === 'ALL' ? 'Institution-wide' : filterDept}</p>
          </div>
          <div className="text-right">
            <span className="rounded bg-cisd-gold-100 text-cisd-gold-800 text-[10px] font-bold px-2 py-0.5 uppercase">
              Official Institutional Record
            </span>
          </div>
        </div>

        {/* 1. Headcount & Demographics */}
        {reportType === 'HEADCOUNT' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Headcount</span>
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

            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2 px-3">Staff Member</th>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Department</th>
                  <th className="py-2 px-3">Designation</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(emp => {
                  const dept = db.departments.find(d => d.id === emp.departmentId);
                  return (
                    <tr key={emp.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{emp.firstName} {emp.lastName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{emp.employeeId}</td>
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
        )}

        {/* 2. Attendance & Punctuality */}
        {reportType === 'ATTENDANCE' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recorded Shifts</span>
                <span className="text-2xl font-black text-slate-900">{db.attendanceRecords.length}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Punctuality Rate</span>
                <span className="text-2xl font-black text-emerald-600">93.4%</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Remote Shifts</span>
                <span className="text-2xl font-black text-blue-600">
                  {db.attendanceRecords.filter(a => a.workType === 'REMOTE').length}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Adjustments Handled</span>
                <span className="text-2xl font-black text-amber-600">{db.attendanceCorrections.length}</span>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Staff Member</th>
                  <th className="py-2 px-3">Clock In</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Modality</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3 text-right">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.attendanceRecords.map(r => {
                  const emp = db.employees.find(e => e.id === r.employeeId);
                  return (
                    <tr key={r.id}>
                      <td className="py-2 px-3 font-medium">{r.date}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{emp?.firstName} {emp?.lastName}</td>
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
        )}

        {/* 3. Leave Utilization */}
        {reportType === 'LEAVE' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2 px-3">Staff Member</th>
                  <th className="py-2 px-3">Annual (Taken / Total)</th>
                  <th className="py-2 px-3">Sick Leave Used</th>
                  <th className="py-2 px-3">Casual Used</th>
                  <th className="py-2 px-3">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.leaveBalances.map(b => {
                  const emp = db.employees.find(e => e.id === b.employeeId);
                  return (
                    <tr key={b.employeeId}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{emp?.firstName} {emp?.lastName}</td>
                      <td className="py-2.5 px-3">{b.annualUsed} / {b.annualTotal} days</td>
                      <td className="py-2.5 px-3">{b.sickUsed} days</td>
                      <td className="py-2.5 px-3">{b.casualUsed} days</td>
                      <td className="py-2.5 px-3 font-black text-emerald-700">{b.annualTotal - b.annualUsed} days left</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Assets & Property Custody */}
        {reportType === 'ASSETS' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2 px-3">Asset Code</th>
                  <th className="py-2 px-3">Hardware / Item</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Serial Number</th>
                  <th className="py-2 px-3">Assigned Staff</th>
                  <th className="py-2 px-3">Condition</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.assets.map(a => {
                  const emp = db.employees.find(e => e.id === a.assignedToId);
                  return (
                    <tr key={a.id}>
                      <td className="py-2.5 px-3 font-mono font-bold">{a.assetCode}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{a.name}</td>
                      <td className="py-2.5 px-3">{a.category}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{a.serialNumber}</td>
                      <td className="py-2.5 px-3">{emp ? `${emp.firstName} ${emp.lastName}` : 'In Pool'}</td>
                      <td className="py-2.5 px-3">{a.condition}</td>
                      <td className="py-2.5 px-3 font-semibold">{a.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Timesheets & Project Hours */}
        {reportType === 'PROJECTS' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2 px-3">Staff Member</th>
                  <th className="py-2 px-3">Period</th>
                  <th className="py-2 px-3">Strategic Project Initiatives</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Total Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.timesheets.map(ts => {
                  const emp = db.employees.find(e => e.id === ts.employeeId);
                  return (
                    <tr key={ts.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{emp?.firstName} {emp?.lastName}</td>
                      <td className="py-2.5 px-3">{ts.weekStartDate} to {ts.weekEndDate}</td>
                      <td className="py-2.5 px-3 text-slate-600">{ts.entries.map(e => e.projectName).join(', ')}</td>
                      <td className="py-2.5 px-3 font-semibold">{ts.status}</td>
                      <td className="py-2.5 px-3 text-right font-black text-cisd-navy-900">{ts.totalHours}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
