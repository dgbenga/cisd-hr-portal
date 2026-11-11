'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Building2,
  Users,
  Briefcase,
  Laptop,
  CheckCircle2,
  ChevronRight,
  MapPin,
  DollarSign,
  Mail,
  Phone,
  Shield,
  Layers,
  Plus,
  X
} from 'lucide-react';

export default function DepartmentsModule() {
  const { db, currentUser, setSelectedEmployeeIdForModal, setActiveTab, dispatch, showToast } = usePortal();
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    currentUser?.departmentId ? currentUser.departmentId : (db?.departments?.[0]?.id || 'dept-cisd')
  );

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isHRAdmin = currentUser.role === 'HR_ADMIN';

  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHeadId, setDeptHeadId] = useState('emp-phibi');
  const [deptLocation, setDeptLocation] = useState('Floor 3, Diplomatic Wing, Abuja HQ');
  const [deptDescription, setDeptDescription] = useState('');

  if (!db) return null;

  const currentDept = db.departments.find(d => d.id === selectedDeptId) || db.departments[0];
  const deptHead = db.employees.find(e => e.id === currentDept.headId);
  const deptMembers = db.employees.filter(e => e.departmentId === currentDept.id);
  const deptTasks = db.tasks.filter(t => t.departmentId === currentDept.id);
  const deptAssets = db.assets.filter(a => {
    const owner = db.employees.find(e => e.id === a.assignedToId);
    return owner?.departmentId === currentDept.id;
  });

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('CREATE_DEPARTMENT', {
      name: deptName,
      code: deptCode.toUpperCase(),
      headId: deptHeadId,
      location: deptLocation,
      description: deptDescription
    });
    if (res.success) {
      showToast(`Strategic Directorate "${deptName}" created`, 'success');
      setShowAddDeptModal(false);
      setDeptName('');
      setDeptCode('');
      setDeptDescription('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">CISD Departments & Governance Structure</h2>
          <p className="text-xs text-slate-500">
            {db.departments.length} Core Strategic Policy & Operational Directorates of the Centre for International Strategic Dialogue
          </p>
        </div>

        {(isSuperAdmin || isHRAdmin) && (
          <button
            onClick={() => setShowAddDeptModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 text-cisd-gold-400" />
            Add Strategic Division
          </button>
        )}
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {db.departments.map(dept => {
          const isSelected = dept.id === currentDept.id;
          const members = db.employees.filter(e => e.departmentId === dept.id);
          const head = db.employees.find(e => e.id === dept.headId);

          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`cursor-pointer rounded-2xl border p-4 transition flex flex-col justify-between ${
                isSelected
                  ? 'border-cisd-navy-900 bg-cisd-navy-950 text-white shadow-lg'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`rounded font-mono text-[10px] px-1.5 py-0.5 font-bold ${
                    isSelected ? 'bg-cisd-gold-500 text-cisd-navy-950' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {dept.code}
                  </span>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {members.length} Staff
                  </span>
                </div>
                <h3 className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {dept.name}
                </h3>
              </div>

              <div className={`mt-3 pt-2.5 border-t text-[11px] ${isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                Head: <span className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-800'}`}>{head?.firstName} {head?.lastName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Department Comprehensive Detail View */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-cisd-navy-900 via-cisd-navy-800 to-cisd-navy-700 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-cisd-gold-500 text-cisd-navy-950 text-[10px] font-bold px-2 py-0.5">
                {currentDept.code}
              </span>
              <span className="text-xs text-slate-300">{currentDept.location}</span>
            </div>
            <h2 className="text-2xl font-black text-white">{currentDept.name}</h2>
            <p className="text-xs text-slate-300 max-w-2xl">{currentDept.description}</p>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/10 text-center min-w-[160px]">
            <span className="text-[10px] font-bold text-cisd-gold-300 uppercase tracking-wider block">Allocated Personnel</span>
            <span className="text-3xl font-black text-white">{deptMembers.length}</span>
            <span className="text-[10px] text-slate-300 block">Permanent & Fellows</span>
          </div>
        </div>

        {/* Directorate Leadership & Metrics */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <img
                src={deptHead?.avatar}
                alt={deptHead?.firstName}
                className="h-14 w-14 rounded-2xl object-cover border-2 border-slate-200 shadow"
              />
              <div>
                <span className="rounded bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 uppercase">
                  Directorate Lead
                </span>
                <h3 className="font-bold text-slate-900 text-base">{deptHead?.firstName} {deptHead?.lastName}</h3>
                <p className="text-xs text-slate-500">{deptHead?.designation}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => deptHead && setSelectedEmployeeIdForModal(deptHead.id)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Director Dossier
              </button>
            </div>
          </div>

          {/* Members Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                Allocated Personnel & Fellows ({deptMembers.length})
              </h4>
              <button
                onClick={() => setActiveTab('employees')}
                className="text-xs font-semibold text-cisd-navy-900 hover:underline flex items-center gap-1"
              >
                Full Staff Directory <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {deptMembers.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployeeIdForModal(emp.id)}
                  className="cursor-pointer flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-100/70 hover:border-slate-200 transition"
                >
                  <img
                    src={emp.avatar}
                    alt={emp.firstName}
                    className="h-10 w-10 rounded-full object-cover border"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{emp.designation}</p>
                    <span className="rounded bg-slate-200/60 text-slate-600 text-[9px] font-mono px-1">
                      {emp.employeeId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Directorate Deliverables & Associated Assets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            {/* Active Deliverables */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-xs">Active Strategic Deliverables</span>
                <span className="text-[10px] font-bold text-cisd-navy-900 bg-cisd-navy-50 px-2 py-0.5 rounded">
                  {deptTasks.length} Deliverables
                </span>
              </div>
              <div className="space-y-2">
                {deptTasks.map(t => (
                  <div key={t.id} className="rounded-lg bg-slate-50 p-2 text-xs flex justify-between items-center">
                    <span className="font-medium text-slate-800 truncate max-w-[200px]">{t.title}</span>
                    <span className="text-[10px] text-slate-500">{t.progressPercentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deployed Hardware & Assets */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-xs">Assigned Directorate Assets</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {deptAssets.length} Tracked
                </span>
              </div>
              <div className="space-y-2">
                {deptAssets.map(a => (
                  <div key={a.id} className="rounded-lg bg-slate-50 p-2 text-xs flex justify-between items-center">
                    <span className="font-medium text-slate-800 truncate max-w-[200px]">{a.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{a.assetCode}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Strategic Directorate Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Add New Strategic Directorate</h3>
              <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Directorate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Multilateral Sanctions & Diplomatic Protocols"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Division Code</label>
                  <input
                    type="text"
                    required
                    placeholder="MSDP"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Directorate Head</label>
                  <select
                    value={deptHeadId}
                    onChange={(e) => setDeptHeadId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    {db.employees.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Location</label>
                <input
                  type="text"
                  required
                  value={deptLocation}
                  onChange={(e) => setDeptLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandate & Core Objectives</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Define strategic institutional scope and outputs..."
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Create Directorate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
