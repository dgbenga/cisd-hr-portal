'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Network,
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  Eye,
  Shield,
  Sparkles,
  Award,
  Layers,
  ArrowDown
} from 'lucide-react';
import { OrganizationArm, getOrganizationArmConfig } from '@/lib/types';

export default function OrgChartModule() {
  const { db, setSelectedEmployeeIdForModal, setActiveTab } = usePortal();
  const [filterArm, setFilterArm] = useState<'ALL' | OrganizationArm>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!db) return null;

  // Level 1: Group Executive Director (Apex Node)
  const executiveDirector = db.employees.find(e => e.id === 'emp-1' || e.accessLevel === 'L7') || db.employees[0];

  // Level 2A: Central Shared Services & Governance
  const centralGovernanceStaff = db.employees.filter(e => 
    e.id !== executiveDirector.id && e.organizationArm === 'CENTRAL_HOLDING'
  );

  // Level 2B: Sister Entity Leads
  const switchLead = db.employees.find(e => e.id === 'emp-6') || db.employees.find(e => e.organizationArm === 'SWITCH_ADVISORY' && e.role === 'LINE_MANAGER');
  const cisdLead = db.employees.find(e => e.id === 'emp-7') || db.employees.find(e => e.organizationArm === 'CISD' && e.role === 'LINE_MANAGER');
  const gxLead = db.employees.find(e => e.id === 'emp-5') || db.employees.find(e => e.organizationArm === 'GX_MEDIA' && e.role === 'LINE_MANAGER');

  // Operational Teams under each arm
  const switchTeam = db.employees.filter(e => e.organizationArm === 'SWITCH_ADVISORY' && e.id !== switchLead?.id);
  const cisdTeam = db.employees.filter(e => e.organizationArm === 'CISD' && e.id !== cisdLead?.id);
  const gxTeam = db.employees.filter(e => e.organizationArm === 'GX_MEDIA' && e.id !== gxLead?.id);

  // Search filter predicate
  const matchesSearch = (name: string, title: string) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || title.toLowerCase().includes(q);
  };

  const isHighlighted = (empId: string) => {
    if (!searchQuery.trim()) return false;
    const emp = db.employees.find(e => e.id === empId);
    if (!emp) return false;
    return matchesSearch(`${emp.firstName} ${emp.lastName}`, emp.designation);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cisd-navy-900 text-cisd-gold-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
              Governance Architecture
            </span>
            <span className="text-xs text-slate-400">&bull; Tripartite Group Structure</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Tripartite Institutional Governance & Reporting Architecture
          </h2>
          <p className="text-xs text-slate-500">
            Interactive organizational chart illustrating executive oversight, central shared services, and operational entity branches across all 30 personnel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Find in chart..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cisd-navy-500 w-44 shadow-sm"
            />
          </div>

          <button
            onClick={() => setActiveTab('employees')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <Users className="h-3.5 w-3.5 text-cisd-navy-800" />
            Staff Directory
          </button>
        </div>
      </div>

      {/* Entity Scope Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 mr-1 flex-shrink-0">
          <Filter className="h-3 w-3" /> View Scope:
        </span>
        <button
          onClick={() => setFilterArm('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            filterArm === 'ALL'
              ? 'bg-cisd-navy-900 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>All Arms (Tripartite View)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterArm === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            30
          </span>
        </button>
        {(['SWITCH_ADVISORY', 'CISD', 'GX_MEDIA', 'CENTRAL_HOLDING'] as OrganizationArm[]).map(armKey => {
          const cfg = getOrganizationArmConfig(armKey);
          const count = db.employees.filter(e => e.organizationArm === armKey).length;
          const isSelected = filterArm === armKey;
          return (
            <button
              key={armKey}
              onClick={() => setFilterArm(armKey)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-cisd-navy-900 text-white border-cisd-navy-900 shadow'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${cfg.accentBg || 'bg-slate-400'}`} />
              <span>{cfg.displayName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visual Hierarchy Canvas Container */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm overflow-x-auto min-w-[920px]">
        
        {/* ============================================================== */}
        {/* TIER 1: APEX EXECUTIVE DIRECTORATE (Folahan Johnson - L7)       */}
        {/* ============================================================== */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => setSelectedEmployeeIdForModal(executiveDirector.id)}
            className={`cursor-pointer group relative flex flex-col items-center rounded-2xl border-2 border-cisd-gold-500 bg-gradient-to-b from-cisd-navy-950 via-cisd-navy-900 to-cisd-navy-950 p-5 text-white shadow-xl hover:shadow-2xl transition max-w-md w-full text-center ${
              isHighlighted(executiveDirector.id) ? 'ring-4 ring-cisd-gold-400 animate-pulse' : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded bg-cisd-gold-500 text-cisd-navy-950 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wide shadow">
                Executive Directorate &bull; L7
              </span>
              <span className="rounded bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 border border-white/20">
                Apex Command
              </span>
            </div>

            <img
              src={executiveDirector.avatar}
              alt={executiveDirector.firstName}
              className="h-16 w-16 rounded-full object-cover border-2 border-cisd-gold-400 shadow-md mb-2 group-hover:scale-105 transition"
            />
            <h3 className="font-black text-white text-base group-hover:text-cisd-gold-300 transition">
              {executiveDirector.firstName} {executiveDirector.lastName}
            </h3>
            <p className="text-xs text-slate-300 font-medium">{executiveDirector.designation}</p>
            <p className="text-[11px] text-cisd-gold-400 font-semibold mt-1">
              Switch Advisory &bull; CISD &bull; GX Media House &bull; Central Holding
            </p>

            <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-400 border-t border-slate-800 pt-2 w-full">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {executiveDirector.email}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {executiveDirector.phone}</span>
            </div>
          </div>

          {/* Central Connecting Vertical Line */}
          <div className="w-0.5 h-8 bg-cisd-navy-400 my-0.5" />

          {/* Horizontal Connecting Crossbar for Level 2 */}
          <div className="w-[90%] h-0.5 bg-cisd-navy-300 mb-6 hidden md:block" />
        </div>

        {/* ============================================================== */}
        {/* TIER 2: CENTRAL SHARED SERVICES & TRIPARTITE SISTER LEADS       */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

          {/* 1. CENTRAL SHARED SERVICES & GOVERNANCE */}
          {(filterArm === 'ALL' || filterArm === 'CENTRAL_HOLDING') && (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-full text-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-700 bg-slate-200/80 px-2.5 py-1 rounded-lg">
                  <Shield className="h-3.5 w-3.5 text-slate-700" />
                  Central Shared Services (4)
                </span>
              </div>

              {/* Central Governance Stack */}
              <div className="w-full space-y-2.5">
                {centralGovernanceStaff.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedEmployeeIdForModal(member.id)}
                    className={`cursor-pointer group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left hover:border-cisd-navy-400 hover:shadow-md transition ${
                      isHighlighted(member.id) ? 'ring-2 ring-cisd-gold-400 bg-amber-50/30' : ''
                    }`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.firstName}
                      className="h-10 w-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 text-slate-700 text-[9px] font-black px-1.5 py-0.2">
                          {member.accessLevel || 'L2'}
                        </span>
                        <p className="font-bold text-slate-900 text-xs truncate group-hover:text-cisd-navy-900">
                          {member.firstName} {member.lastName}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{member.designation}</p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="h-2.5 w-2.5" /> {member.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. SWITCH ADVISORY OPERATIONAL BRANCH */}
          {(filterArm === 'ALL' || filterArm === 'SWITCH_ADVISORY') && (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-full text-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Switch Advisory (8)
                </span>
              </div>

              {/* Sister Entity Lead Node */}
              {switchLead && (
                <div
                  onClick={() => setSelectedEmployeeIdForModal(switchLead.id)}
                  className={`cursor-pointer group flex flex-col items-center rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-3.5 shadow-sm hover:border-emerald-500 hover:shadow-md transition w-full text-center ${
                    isHighlighted(switchLead.id) ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <span className="rounded bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 uppercase mb-1.5">
                    Sister Entity Lead &bull; {switchLead.accessLevel || 'L5'}
                  </span>
                  <img
                    src={switchLead.avatar}
                    alt={switchLead.firstName}
                    className="h-12 w-12 rounded-full object-cover border-2 border-emerald-400 mb-1.5 group-hover:scale-105 transition"
                  />
                  <h4 className="font-black text-slate-900 text-xs group-hover:text-emerald-800">
                    {switchLead.firstName} {switchLead.lastName}
                  </h4>
                  <p className="text-[10px] text-slate-600 font-medium line-clamp-1">{switchLead.designation}</p>
                  <div className="mt-2 pt-2 border-t border-emerald-200/60 text-[10px] text-slate-500 w-full flex justify-between">
                    <span>Direct Team</span>
                    <strong className="text-emerald-800">{switchTeam.length} Specialists</strong>
                  </div>
                </div>
              )}

              {/* Subordinate Line */}
              {switchTeam.length > 0 && <div className="w-0.5 h-4 bg-emerald-300" />}

              {/* Operational Team List */}
              <div className="w-full space-y-2">
                {switchTeam.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedEmployeeIdForModal(member.id)}
                    className={`cursor-pointer group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5 text-left hover:bg-slate-50 hover:border-emerald-300 transition shadow-sm ${
                      isHighlighted(member.id) ? 'ring-2 ring-emerald-400 bg-emerald-50/30' : ''
                    }`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.firstName}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0 border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold text-slate-400">{member.accessLevel || 'L1'}</span>
                        <p className="font-bold text-slate-900 text-[11px] truncate group-hover:text-emerald-800">
                          {member.firstName} {member.lastName}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{member.designation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CISD (CENTRE FOR INCLUSIVE SOCIAL DEVELOPMENT) */}
          {(filterArm === 'ALL' || filterArm === 'CISD') && (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-full text-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  CISD (NGO / Non-Profit) (8)
                </span>
              </div>

              {/* Sister Entity Lead Node */}
              {cisdLead && (
                <div
                  onClick={() => setSelectedEmployeeIdForModal(cisdLead.id)}
                  className={`cursor-pointer group flex flex-col items-center rounded-2xl border-2 border-sky-300 bg-sky-50/40 p-3.5 shadow-sm hover:border-sky-500 hover:shadow-md transition w-full text-center ${
                    isHighlighted(cisdLead.id) ? 'ring-2 ring-sky-500' : ''
                  }`}
                >
                  <span className="rounded bg-sky-600 text-white text-[9px] font-black px-2 py-0.5 uppercase mb-1.5">
                    Sister Entity Lead &bull; {cisdLead.accessLevel || 'L6'}
                  </span>
                  <img
                    src={cisdLead.avatar}
                    alt={cisdLead.firstName}
                    className="h-12 w-12 rounded-full object-cover border-2 border-sky-400 mb-1.5 group-hover:scale-105 transition"
                  />
                  <h4 className="font-black text-slate-900 text-xs group-hover:text-sky-800">
                    {cisdLead.firstName} {cisdLead.lastName}
                  </h4>
                  <p className="text-[10px] text-slate-600 font-medium line-clamp-1">{cisdLead.designation}</p>
                  <div className="mt-2 pt-2 border-t border-sky-200/60 text-[10px] text-slate-500 w-full flex justify-between">
                    <span>Direct Team</span>
                    <strong className="text-sky-800">{cisdTeam.length} Fellows & Associates</strong>
                  </div>
                </div>
              )}

              {/* Subordinate Line */}
              {cisdTeam.length > 0 && <div className="w-0.5 h-4 bg-sky-300" />}

              {/* Operational Team List */}
              <div className="w-full space-y-2">
                {cisdTeam.map(member => {
                  const isCrossArm = member.id === 'emp-28'; // Martha Micheal cross-arm to Yaradua Phibi
                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedEmployeeIdForModal(member.id)}
                      className={`cursor-pointer group flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition shadow-sm ${
                        isCrossArm 
                          ? 'border-amber-300 bg-amber-50/30 hover:bg-amber-50' 
                          : 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-sky-300'
                      } ${isHighlighted(member.id) ? 'ring-2 ring-sky-400' : ''}`}
                    >
                      <img
                        src={member.avatar}
                        alt={member.firstName}
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0 border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-bold text-slate-400">{member.accessLevel || 'L1'}</span>
                          <p className="font-bold text-slate-900 text-[11px] truncate group-hover:text-sky-800">
                            {member.firstName} {member.lastName}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{member.designation}</p>
                        {isCrossArm && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded">
                            Admin Line: Central HR (Phibi)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. GX MEDIA HOUSE OPERATIONAL BRANCH */}
          {(filterArm === 'ALL' || filterArm === 'GX_MEDIA') && (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-full text-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  GX Media House (10)
                </span>
              </div>

              {/* Sister Entity Lead Node */}
              {gxLead && (
                <div
                  onClick={() => setSelectedEmployeeIdForModal(gxLead.id)}
                  className={`cursor-pointer group flex flex-col items-center rounded-2xl border-2 border-purple-300 bg-purple-50/40 p-3.5 shadow-sm hover:border-purple-500 hover:shadow-md transition w-full text-center ${
                    isHighlighted(gxLead.id) ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <span className="rounded bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 uppercase mb-1.5">
                    Sister Entity Lead &bull; {gxLead.accessLevel || 'L5'}
                  </span>
                  <img
                    src={gxLead.avatar}
                    alt={gxLead.firstName}
                    className="h-12 w-12 rounded-full object-cover border-2 border-purple-400 mb-1.5 group-hover:scale-105 transition"
                  />
                  <h4 className="font-black text-slate-900 text-xs group-hover:text-purple-800">
                    {gxLead.firstName} {gxLead.lastName}
                  </h4>
                  <p className="text-[10px] text-slate-600 font-medium line-clamp-1">{gxLead.designation}</p>
                  <div className="mt-2 pt-2 border-t border-purple-200/60 text-[10px] text-slate-500 w-full flex justify-between">
                    <span>Direct Team</span>
                    <strong className="text-purple-800">{gxTeam.length} Creatives & Media Staff</strong>
                  </div>
                </div>
              )}

              {/* Subordinate Line */}
              {gxTeam.length > 0 && <div className="w-0.5 h-4 bg-purple-300" />}

              {/* Operational Team List */}
              <div className="w-full space-y-2">
                {gxTeam.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedEmployeeIdForModal(member.id)}
                    className={`cursor-pointer group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5 text-left hover:bg-slate-50 hover:border-purple-300 transition shadow-sm ${
                      isHighlighted(member.id) ? 'ring-2 ring-purple-400 bg-purple-50/30' : ''
                    }`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.firstName}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0 border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold text-slate-400">{member.accessLevel || 'L1'}</span>
                        <p className="font-bold text-slate-900 text-[11px] truncate group-hover:text-purple-800">
                          {member.firstName} {member.lastName}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{member.designation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
