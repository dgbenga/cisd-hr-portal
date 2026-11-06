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
  Building,
  Eye,
  Shield
} from 'lucide-react';
import { Employee } from '@/lib/types';

export default function OrgChartModule() {
  const { db, setSelectedEmployeeIdForModal, setActiveTab } = usePortal();
  const [filterDept, setFilterDept] = useState('ALL');

  if (!db) return null;

  // Level 1: Executive Director
  const executiveDirector = db.employees.find(e => e.role === 'SUPER_ADMIN') || db.employees[0];

  // Level 2: Directors (heads of departments)
  const directors = db.employees.filter(e =>
    e.id !== executiveDirector.id && (e.designation.includes('Director') || e.designation.includes('Head'))
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">CISD Organizational Hierarchy & Chain of Command</h2>
          <p className="text-xs text-slate-500">
            Interactive institutional chart illustrating reporting lines, directorate heads, and fellow allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 shadow-sm"
          >
            <option value="ALL">Show Complete Hierarchy</option>
            {db.departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Hierarchy Diagram Container */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm overflow-x-auto min-w-[700px]">
        {/* LEVEL 1: Executive Director */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => setSelectedEmployeeIdForModal(executiveDirector.id)}
            className="cursor-pointer group relative flex flex-col items-center rounded-2xl border-2 border-cisd-gold-500 bg-gradient-to-b from-cisd-navy-950 to-cisd-navy-900 p-5 text-white shadow-xl hover:shadow-2xl transition max-w-sm w-full text-center"
          >
            <span className="rounded bg-cisd-gold-500 text-cisd-navy-950 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wide mb-2 shadow">
              Executive Directorate
            </span>
            <img
              src={executiveDirector.avatar}
              alt={executiveDirector.firstName}
              className="h-16 w-16 rounded-full object-cover border-2 border-cisd-gold-400 shadow-md mb-2"
            />
            <h3 className="font-black text-white text-base group-hover:text-cisd-gold-300 transition">
              {executiveDirector.firstName} {executiveDirector.lastName}
            </h3>
            <p className="text-xs text-slate-300 font-medium">{executiveDirector.designation}</p>
            <p className="text-[11px] text-cisd-gold-400 font-semibold mt-1">
              Centre for International Strategic Dialogue
            </p>

            <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-400 border-t border-slate-800 pt-2 w-full">
              <span>{executiveDirector.email}</span>
              <span>&bull;</span>
              <span>{executiveDirector.phone}</span>
            </div>
          </div>

          {/* Central Connecting Vertical Line */}
          <div className="w-0.5 h-10 bg-cisd-navy-300 my-1" />

          {/* Horizontal Connecting Crossbar for Level 2 */}
          <div className="w-[85%] h-0.5 bg-cisd-navy-300 mb-6 hidden md:block" />
        </div>

        {/* LEVEL 2: Department Heads / Directors */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {directors.map(dir => {
            const dept = db.departments.find(d => d.id === dir.departmentId);
            const teamMembers = db.employees.filter(e => e.reportingManagerId === dir.id);

            if (filterDept !== 'ALL' && dir.departmentId !== filterDept) {
              return null;
            }

            return (
              <div key={dir.id} className="flex flex-col items-center space-y-3">
                {/* Director Node Card */}
                <div
                  onClick={() => setSelectedEmployeeIdForModal(dir.id)}
                  className="cursor-pointer group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cisd-navy-400 hover:shadow-md transition w-full text-center"
                >
                  <span className="rounded bg-cisd-navy-100 text-cisd-navy-900 text-[9px] font-bold px-2 py-0.5 uppercase mb-1.5">
                    {dept?.code}
                  </span>
                  <img
                    src={dir.avatar}
                    alt={dir.firstName}
                    className="h-12 w-12 rounded-full object-cover border mb-1.5"
                  />
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-cisd-navy-800">
                    {dir.firstName} {dir.lastName}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{dir.designation}</p>

                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 w-full flex justify-between">
                    <span>Direct Team</span>
                    <strong className="text-slate-700">{teamMembers.length} Staff</strong>
                  </div>
                </div>

                {/* Subordinate Line */}
                {teamMembers.length > 0 && <div className="w-0.5 h-6 bg-slate-300" />}

                {/* LEVEL 3: Team Members under this Director */}
                <div className="w-full space-y-2">
                  {teamMembers.map(member => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedEmployeeIdForModal(member.id)}
                      className="cursor-pointer group flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-2 text-left hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
                    >
                      <img
                        src={member.avatar}
                        alt={member.firstName}
                        className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-[11px] truncate group-hover:text-cisd-navy-800">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{member.designation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
