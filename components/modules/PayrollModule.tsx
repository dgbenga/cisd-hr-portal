'use client';

import React, { useState, useMemo } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  PayrollRecord,
  OrganizationArm,
  getOrganizationArmConfig,
  Employee
} from '@/lib/types';
import {
  Wallet,
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  FileText,
  DollarSign,
  TrendingUp,
  Landmark,
  Printer,
  X,
  Search,
  Filter,
  AlertTriangle,
  Lock,
  ChevronRight,
  Download
} from 'lucide-react';

export default function PayrollModule() {
  const { db, currentUser, dispatch, showToast } = usePortal();
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [selectedArm, setSelectedArm] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePayslip, setActivePayslip] = useState<PayrollRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const role = currentUser?.role || 'EMPLOYEE';
  const canDraft = role === 'FINANCE' || role === 'SUPER_ADMIN';
  const canAudit = role === 'HR_ADMIN' || role === 'SUPER_ADMIN';
  const canApprove = role === 'EXECUTIVE' || role === 'SUPER_ADMIN';
  const canDisburse = role === 'FINANCE' || role === 'SUPER_ADMIN';

  // Format currency helper
  const fmt = (val: number) => {
    return `₦${(val || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Safe accessor helpers
  const getGross = (r: PayrollRecord) => r.grossSalary ?? r.grossPay ?? 0;
  const getNet = (r: PayrollRecord) => r.netSalary ?? r.netPay ?? 0;
  const getTax = (r: PayrollRecord) => r.payeTax ?? r.taxPAYE ?? 0;
  const getPension = (r: PayrollRecord) => r.pensionEmployee ?? r.pension ?? 0;
  const getEmployerPension = (r: PayrollRecord) => r.pensionEmployer ?? Math.round(getGross(r) * 0.10);
  const getTotalDeductions = (r: PayrollRecord) => r.totalDeductions ?? (getTax(r) + getPension(r) + (r.otherDeductions || 0));
  const getOtherAllowances = (r: PayrollRecord) => r.otherAllowances ?? 0;
  const getBankName = (r: PayrollRecord, emp?: Employee) => r.bankName || emp?.personalInfo?.bankDetails?.bankName || 'Guaranty Trust Bank (GTBank)';
  const getAccountNumber = (r: PayrollRecord, emp?: Employee) => r.accountNumber || emp?.personalInfo?.bankDetails?.accountNumber || '0129482019';

  // Filter records by month
  const monthRecords = useMemo(() => {
    return (db?.payrollRecords || []).filter(p => p.month === selectedMonth);
  }, [db?.payrollRecords, selectedMonth]);

  // Overall workflow status for selected month
  const overallStatus = useMemo(() => {
    if (monthRecords.length === 0) return 'UNGENERATED';
    if (monthRecords.every(r => r.status === 'DISBURSED')) return 'DISBURSED';
    if (monthRecords.every(r => r.status === 'APPROVED' || r.status === 'DISBURSED')) return 'APPROVED';
    if (monthRecords.every(r => r.status === 'AUDITED' || r.status === 'APPROVED' || r.status === 'DISBURSED')) return 'AUDITED';
    return 'DRAFT';
  }, [monthRecords]);

  // Filter records by entity and search query
  const filteredRecords = useMemo(() => {
    return monthRecords.filter(r => {
      const emp = db?.employees.find(e => e.id === r.employeeId);
      if (!emp) return false;

      const matchesArm = selectedArm === 'ALL' || emp.organizationArm === selectedArm;
      const matchesSearch =
        searchQuery.trim() === '' ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesArm && matchesSearch;
    });
  }, [monthRecords, db?.employees, selectedArm, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    const gross = filteredRecords.reduce((acc, r) => acc + getGross(r), 0);
    const net = filteredRecords.reduce((acc, r) => acc + getNet(r), 0);
    const tax = filteredRecords.reduce((acc, r) => acc + getTax(r), 0);
    const employeePension = filteredRecords.reduce((acc, r) => acc + getPension(r), 0);
    const employerPension = filteredRecords.reduce((acc, r) => acc + getEmployerPension(r), 0);
    const count = filteredRecords.length;

    return {
      gross,
      net,
      tax,
      totalPension: employeePension + employerPension,
      count
    };
  }, [filteredRecords]);

  // Handlers for 4-Eyes Governance Actions
  const handleGeneratePayroll = async () => {
    setIsProcessing(true);
    try {
      const res = await dispatch('GENERATE_PAYROLL', {
        month: selectedMonth,
        entity: selectedArm === 'ALL' ? undefined : selectedArm
      });
      if (res.success) {
        showToast(`Successfully generated ${res.data?.count || ''} payroll drafts for ${selectedMonth}`, 'success');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuditPayroll = async () => {
    setIsProcessing(true);
    try {
      const res = await dispatch('AUDIT_PAYROLL', {
        month: selectedMonth,
        entity: selectedArm === 'ALL' ? undefined : selectedArm
      });
      if (res.success) {
        showToast(`HR Compliance certified: ${res.data?.count || ''} records audited`, 'success');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprovePayroll = async () => {
    setIsProcessing(true);
    try {
      const res = await dispatch('APPROVE_PAYROLL', {
        month: selectedMonth,
        entity: selectedArm === 'ALL' ? undefined : selectedArm
      });
      if (res.success) {
        showToast(`Executive authorization granted: ${res.data?.count || ''} records approved`, 'success');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisbursePayroll = async () => {
    if (!confirm(`Confirm disbursement of ${fmt(summary.net)} to ${summary.count} staff bank accounts? This action locks all records.`)) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await dispatch('DISBURSE_PAYROLL', {
        month: selectedMonth,
        entity: selectedArm === 'ALL' ? undefined : selectedArm
      });
      if (res.success) {
        showToast(`Bank disbursements executed for ${res.data?.count || ''} staff members. Records locked.`, 'success');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Draft
          </span>
        );
      case 'AUDITED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            Audited (HR)
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
            Approved (ED)
          </span>
        );
      case 'DISBURSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Disbursed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Group Payroll & Compensation Desk</h1>
              <p className="text-sm text-slate-500">
                Centralized remuneration management & 4-eyes financial governance across Tripartite arms
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="2026-11">November 2026</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
          </select>

          {/* Role-Specific 4-Eyes Governance Buttons */}
          {overallStatus === 'UNGENERATED' && canDraft && (
            <button
              onClick={handleGeneratePayroll}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              Generate Drafts
            </button>
          )}

          {overallStatus === 'DRAFT' && canAudit && (
            <button
              onClick={handleAuditPayroll}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              Audit & Certify (HR)
            </button>
          )}

          {overallStatus === 'AUDITED' && canApprove && (
            <button
              onClick={handleApprovePayroll}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Payroll (ED)
            </button>
          )}

          {overallStatus === 'APPROVED' && canDisburse && (
            <button
              onClick={handleDisbursePayroll}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Execute Bank Disbursement
            </button>
          )}

          {overallStatus === 'DISBURSED' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300">
              <Lock className="w-4 h-4 text-emerald-700" />
              Locked & Disbursed
            </div>
          )}
        </div>
      </div>

      {/* 4-Stage Governance Stepper */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span>Governance Stepper ({selectedMonth}):</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {/* Step 1: Draft */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              overallStatus !== 'UNGENERATED' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white text-xs font-bold text-amber-800 shadow-xs">1</span>
              <span>Draft (Victory)</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

            {/* Step 2: Audited */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              ['AUDITED', 'APPROVED', 'DISBURSED'].includes(overallStatus)
                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white text-xs font-bold text-blue-800 shadow-xs">2</span>
              <span>Audited (Phibi)</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

            {/* Step 3: Approved */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              ['APPROVED', 'DISBURSED'].includes(overallStatus)
                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white text-xs font-bold text-purple-800 shadow-xs">3</span>
              <span>Approved (FJ)</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

            {/* Step 4: Disbursed */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              overallStatus === 'DISBURSED'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white text-xs font-bold text-emerald-800 shadow-xs">4</span>
              <span>Disbursed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Gross Pay</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{fmt(summary.gross)}</div>
          <p className="text-xs text-slate-400 mt-1">Pre-deduction earnings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Disbursement</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-900">{fmt(summary.net)}</div>
          <p className="text-xs text-slate-400 mt-1">Net bank credit total</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">PAYE Tax Remittance</span>
            <Landmark className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{fmt(summary.tax)}</div>
          <p className="text-xs text-slate-400 mt-1">FCT-IRS / State statutory tax</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pension Total (18%)</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{fmt(summary.totalPension)}</div>
          <p className="text-xs text-slate-400 mt-1">8% Staff + 10% Employer</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Staff Count</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{summary.count} Staff</div>
          <p className="text-xs text-slate-400 mt-1">In current active view</p>
        </div>
      </div>

      {/* Entity Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Entities' },
            { id: 'SWITCH_ADVISORY', label: 'Switch Advisory' },
            { id: 'CISD', label: 'CISD (NGO)' },
            { id: 'GX_MEDIA', label: 'GX Media House' },
            { id: 'CENTRAL_HOLDING', label: 'Central Holding' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedArm(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                selectedArm === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Itemized Payroll Records Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Employee</th>
                <th className="px-4 py-3.5 font-semibold">Entity</th>
                <th className="px-4 py-3.5 font-semibold text-right">Basic (₦)</th>
                <th className="px-4 py-3.5 font-semibold text-right">Allowances (₦)</th>
                <th className="px-4 py-3.5 font-semibold text-right">Gross (₦)</th>
                <th className="px-4 py-3.5 font-semibold text-right">PAYE (₦)</th>
                <th className="px-4 py-3.5 font-semibold text-right">Pension 8% (₦)</th>
                <th className="px-4 py-3.5 font-semibold text-right text-indigo-950 font-bold">Net Salary (₦)</th>
                <th className="px-4 py-3.5 font-semibold">Bank Destination</th>
                <th className="px-4 py-3.5 font-semibold text-center">Status</th>
                <th className="px-4 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-5 py-8 text-center text-slate-400">
                    No payroll records found for this period. Click "Generate Drafts" to initialize.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => {
                  const emp = db?.employees.find(e => e.id === rec.employeeId);
                  const armConf = getOrganizationArmConfig(emp?.organizationArm);
                  const totalAllowances = (rec.housingAllowance || 0) + (rec.transportAllowance || 0) + (rec.utilityAllowance || 0) + getOtherAllowances(rec);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{emp?.firstName} {emp?.lastName}</div>
                            <div className="text-xs text-slate-400">{emp?.employeeId} • {emp?.designation}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${armConf.badgeBg} ${armConf.badgeText}`}>
                          {armConf.displayName}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right font-medium text-slate-700">
                        {fmt(rec.basicSalary)}
                      </td>

                      <td className="px-4 py-4 text-right font-medium text-slate-700">
                        {fmt(totalAllowances)}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold text-slate-900">
                        {fmt(getGross(rec))}
                      </td>

                      <td className="px-4 py-4 text-right font-medium text-amber-700">
                        {fmt(getTax(rec))}
                      </td>

                      <td className="px-4 py-4 text-right font-medium text-blue-700">
                        {fmt(getPension(rec))}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-emerald-700">
                        {fmt(getNet(rec))}
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-xs font-medium text-slate-800">{getBankName(rec, emp)}</div>
                        <div className="text-xs text-slate-400 font-mono tracking-wider">{getAccountNumber(rec, emp)}</div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(rec.status)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setActivePayslip(rec)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Slip
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Payslip Modal */}
      {activePayslip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Actions Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-sm">Official Electronic Payslip</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export
                </button>
                <button
                  onClick={() => setActivePayslip(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Container */}
            <div className="p-8 space-y-6 print:p-0">
              {/* Header Branding */}
              {(() => {
                const emp = db?.employees.find(e => e.id === activePayslip.employeeId);
                const armConf = getOrganizationArmConfig(emp?.organizationArm);

                return (
                  <div>
                    <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                      <div>
                        <div className="text-xl font-black text-slate-900 tracking-tight">
                          {armConf.displayName.toUpperCase()}
                        </div>
                        <div className="text-xs font-semibold text-slate-500">
                          Central Holding & Tripartite Operating Group • Abuja, Nigeria
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Ref: {activePayslip.id} • Currency: Nigerian Naira (NGN / ₦)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Pay Period</div>
                        <div className="text-lg font-bold text-slate-900">{activePayslip.month}</div>
                        <div className="mt-1">{getStatusBadge(activePayslip.status)}</div>
                      </div>
                    </div>

                    {/* Staff Particulars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-xs">
                      <div>
                        <div className="text-slate-400 uppercase font-medium">Employee Name</div>
                        <div className="font-bold text-slate-900 mt-0.5">{emp?.firstName} {emp?.lastName}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 uppercase font-medium">Staff ID / Grade</div>
                        <div className="font-bold text-slate-900 mt-0.5">{emp?.employeeId} ({emp?.accessLevel})</div>
                      </div>
                      <div>
                        <div className="text-slate-400 uppercase font-medium">Designation</div>
                        <div className="font-bold text-slate-900 mt-0.5">{emp?.designation}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 uppercase font-medium">Bank Details</div>
                        <div className="font-bold text-slate-900 mt-0.5">{getBankName(activePayslip, emp)}</div>
                        <div className="text-slate-500 font-mono">{getAccountNumber(activePayslip, emp)}</div>
                      </div>
                    </div>

                    {/* Earnings & Deductions Tables */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      {/* Earnings */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-100 pb-1.5 flex justify-between">
                          <span>Earnings & Allowances</span>
                          <span>Amount (₦)</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Basic Salary (45%)</span>
                            <span className="font-semibold text-slate-900">{fmt(activePayslip.basicSalary)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Housing Allowance (25%)</span>
                            <span className="font-semibold text-slate-900">{fmt(activePayslip.housingAllowance)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Transport Allowance (15%)</span>
                            <span className="font-semibold text-slate-900">{fmt(activePayslip.transportAllowance)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Utility Allowance (15%)</span>
                            <span className="font-semibold text-slate-900">{fmt(activePayslip.utilityAllowance)}</span>
                          </div>
                          {getOtherAllowances(activePayslip) > 0 && (
                            <div className="flex justify-between text-slate-600">
                              <span>Special Allowances</span>
                              <span className="font-semibold text-slate-900">{fmt(getOtherAllowances(activePayslip))}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100">
                            <span>Total Gross Earnings</span>
                            <span>{fmt(getGross(activePayslip))}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-rose-800 border-b border-rose-100 pb-1.5 flex justify-between">
                          <span>Statutory Deductions</span>
                          <span>Amount (₦)</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>PAYE Personal Income Tax</span>
                            <span className="font-semibold text-rose-700">{fmt(getTax(activePayslip))}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Employee Pension (8%)</span>
                            <span className="font-semibold text-rose-700">{fmt(getPension(activePayslip))}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 italic">
                            <span>Employer Pension (10% Co.)</span>
                            <span>{fmt(getEmployerPension(activePayslip))}</span>
                          </div>
                          <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100">
                            <span>Total Deductions</span>
                            <span className="text-rose-700">{fmt(getTotalDeductions(activePayslip))}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Net Pay Callout */}
                    <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase font-bold text-emerald-800 tracking-wider">Take-Home Net Salary</div>
                        <div className="text-xs text-emerald-600">Disbursed to verified corporate account</div>
                      </div>
                      <div className="text-2xl font-black text-emerald-900">
                        {fmt(getNet(activePayslip))}
                      </div>
                    </div>

                    {/* 4-Eyes Signatures */}
                    <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
                      <div>
                        <div className="font-script text-slate-600 text-sm italic font-semibold">Victory Kinosi</div>
                        <div className="border-t border-slate-300 mt-1 pt-1 font-bold text-slate-800">Prepared By</div>
                        <div className="text-slate-400 text-xxs">Finance & Admin Officer (L2)</div>
                      </div>

                      <div>
                        <div className="font-script text-slate-600 text-sm italic font-semibold">Yaradua Phibi</div>
                        <div className="border-t border-slate-300 mt-1 pt-1 font-bold text-slate-800">Audited By</div>
                        <div className="text-slate-400 text-xxs">Lead, HR & Operations (L4)</div>
                      </div>

                      <div>
                        <div className="font-script text-slate-600 text-sm italic font-semibold">Folahan Johnson</div>
                        <div className="border-t border-slate-300 mt-1 pt-1 font-bold text-slate-800">Authorized By</div>
                        <div className="text-slate-400 text-xxs">Executive Director (L7)</div>
                      </div>
                    </div>

                    {/* Footer note */}
                    <div className="mt-6 text-center text-xxs text-slate-400 italic">
                      This is an authenticated computer-generated payslip. Conforms to the Nigerian Labour Act and Pension Reform Act 2014.
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

