'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Settings,
  Shield,
  Clock,
  Building,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { OrganizationSettings } from '@/lib/types';

export default function SettingsModule() {
  const { db, currentUser, dispatch, showToast } = usePortal();

  const [activeSettingsTab, setActiveSettingsTab] = useState<'ORGANIZATION' | 'POLICIES' | 'AUDIT'>('ORGANIZATION');

  // Form State initialized from db.settings
  const [name, setName] = useState(db?.settings.name || 'Centre for International Strategic Dialogue');
  const [abbrev, setAbbrev] = useState(db?.settings.abbreviation || 'CISD');
  const [hq, setHq] = useState(db?.settings.headquarters || 'Diplomatic Enclave, Abuja, Nigeria');
  const [tagline, setTagline] = useState(db?.settings.tagline || 'Bridging Nations Through Impartial Strategic Foresight');
  const [email, setEmail] = useState(db?.settings.email || 'secretariat@cisdialogue.org');
  const [phone, setPhone] = useState(db?.settings.phone || '+234 9 461 9000');
  const [minOfficeDays, setMinOfficeDays] = useState(db?.settings.hybridPolicy.minimumOfficeDays || 3);
  const [annualEntitlement, setAnnualEntitlement] = useState(db?.settings.leaveEntitlements.annual || 21);
  const [sickEntitlement, setSickEntitlement] = useState(db?.settings.leaveEntitlements.sick || 12);
  const [casualEntitlement, setCasualEntitlement] = useState(db?.settings.leaveEntitlements.casual || 5);

  if (!db) return null;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: OrganizationSettings = {
      ...db.settings,
      name,
      abbreviation: abbrev,
      headquarters: hq,
      tagline,
      email,
      phone,
      hybridPolicy: {
        ...db.settings.hybridPolicy,
        minimumOfficeDays: Number(minOfficeDays)
      },
      leaveEntitlements: {
        ...db.settings.leaveEntitlements,
        annual: Number(annualEntitlement),
        sick: Number(sickEntitlement),
        casual: Number(casualEntitlement)
      }
    };

    const res = await dispatch('UPDATE_SETTINGS', updatedSettings);
    if (res.success) {
      showToast('Institutional governance settings updated and saved to database', 'success');
    }
  };

  const handleResetToFactory = async () => {
    if (confirm('Are you sure you want to restore the official CISD institutional factory seed dataset?')) {
      const res = await dispatch('RESET_DATABASE', {});
      if (res.success) {
        showToast('Database reset to official institutional seed state', 'info');
      }
    }
  };

  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4 max-w-xl mx-auto my-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
          <Shield className="h-8 w-8 text-amber-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Security Clearance Required</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Portal Configuration, Leave Quota Governance, and System Audit Logs are strictly restricted to the{' '}
            <strong className="text-cisd-navy-900">Super Administrator (Executive Director)</strong>.
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 max-w-sm mx-auto">
          Current Access Level: <strong className="text-slate-800">{currentUser.role.replace('_', ' ')}</strong> ({currentUser.firstName} {currentUser.lastName})
        </div>
        <p className="text-[11px] text-slate-400">
          To test Super Administrator controls, use the Role Switcher in the top navigation bar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Portal Configuration & Audit Governance</h2>
          <p className="text-xs text-slate-500">
            Institutional metadata, working parameters, regulatory leave policies, and security audit trails
          </p>
        </div>

        <button
          onClick={handleResetToFactory}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition self-start sm:self-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Seed Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold space-x-6">
        <button
          onClick={() => setActiveSettingsTab('ORGANIZATION')}
          className={`pb-3 border-b-2 transition ${
            activeSettingsTab === 'ORGANIZATION'
              ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Institution Profile
        </button>
        <button
          onClick={() => setActiveSettingsTab('POLICIES')}
          className={`pb-3 border-b-2 transition ${
            activeSettingsTab === 'POLICIES'
              ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Work & Leave Policies
        </button>
        <button
          onClick={() => setActiveSettingsTab('AUDIT')}
          className={`pb-3 border-b-2 transition ${
            activeSettingsTab === 'AUDIT'
              ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          System Audit Trail ({db.auditLogs.length})
        </button>
      </div>

      {/* 1. ORGANIZATION PROFILE SETTINGS */}
      {activeSettingsTab === 'ORGANIZATION' && (
        <form onSubmit={handleSaveSettings} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Institutional Identification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Acronym / Abbreviation</label>
                <input
                  type="text"
                  required
                  value={abbrev}
                  onChange={(e) => setAbbrev(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Institutional Motto & Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Headquarters Physical Address</label>
                <input
                  type="text"
                  value={hq}
                  onChange={(e) => setHq(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Secretariat Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Diplomatic Switchboard Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-5 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition"
            >
              <Save className="h-4 w-4 text-cisd-gold-400" />
              Save Institutional Settings
            </button>
          </div>
        </form>
      )}

      {/* 2. POLICIES SETTINGS */}
      {activeSettingsTab === 'POLICIES' && (
        <form onSubmit={handleSaveSettings} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Hybrid Work Framework Rules</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Minimum Office Days Per Week</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={minOfficeDays}
                  onChange={(e) => setMinOfficeDays(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default CISD requirement is 3 days on-site.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandatory Institutional On-Site Days</label>
                <div className="flex gap-2 mt-2">
                  <span className="rounded bg-cisd-navy-900 text-white text-[10px] font-bold px-2.5 py-1">Monday</span>
                  <span className="rounded bg-cisd-navy-900 text-white text-[10px] font-bold px-2.5 py-1">Thursday</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Annual Leave Quota Ceilings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Annual Leave (Days)</label>
                <input
                  type="number"
                  value={annualEntitlement}
                  onChange={(e) => setAnnualEntitlement(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Annual Sick Leave (Days)</label>
                <input
                  type="number"
                  value={sickEntitlement}
                  onChange={(e) => setSickEntitlement(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Casual Leave (Days)</label>
                <input
                  type="number"
                  value={casualEntitlement}
                  onChange={(e) => setCasualEntitlement(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-5 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition"
            >
              <Save className="h-4 w-4 text-cisd-gold-400" />
              Update Policy Defaults
            </button>
          </div>
        </form>
      )}

      {/* 3. AUDIT TRAIL */}
      {activeSettingsTab === 'AUDIT' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Immutable Regulatory Audit Trail</h3>
              <p className="text-xs text-slate-500">Every biometric clock-in, leave approval, and administrative mutation is timestamped</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Zero-Trust Logging Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Operational Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{log.userName}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-cisd-navy-900">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">{log.module}</td>
                    <td className="py-2.5 px-3 text-slate-600 leading-snug">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
