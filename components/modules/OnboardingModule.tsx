'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  UserCheck,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Plus,
  ShieldCheck,
  Laptop,
  FileText,
  GraduationCap,
  Users,
  CheckCheck,
  ChevronRight,
  X
} from 'lucide-react';

export default function OnboardingModule() {
  const { db, currentUser, setSelectedEmployeeIdForModal, dispatch, showToast } = usePortal();

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isLineManager = currentUser.role === 'LINE_MANAGER';
  const isHRAdmin = currentUser.role === 'HR_ADMIN';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Determine initial selected employee
  const myProcess = db ? db.onboardingProcesses.find(p => p.employeeId === currentUser.id) : null;
  const initialEmpId = isEmployee
    ? (myProcess ? currentUser.id : 'emp-14')
    : isLineManager
    ? (db?.onboardingProcesses.find(p => {
        const emp = db.employees.find(e => e.id === p.employeeId);
        return emp?.departmentId === currentUser.departmentId;
      })?.employeeId || 'emp-14')
    : 'emp-14';

  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmpId);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'DOCUMENT' | 'IT_ASSET' | 'ORIENTATION' | 'TRAINING'>('ORIENTATION');
  const [newTaskDue, setNewTaskDue] = useState('2026-11-20');

  if (!db) return null;

  // Filter processes visible to current user
  const visibleProcesses = isEmployee
    ? (myProcess ? [myProcess] : [])
    : isLineManager
    ? db.onboardingProcesses.filter(p => {
        const emp = db.employees.find(e => e.id === p.employeeId);
        return emp?.departmentId === currentUser.departmentId;
      })
    : db.onboardingProcesses;

  // Selected onboarding process
  const process = db.onboardingProcesses.find(p => p.employeeId === selectedEmpId) || visibleProcesses[0];
  const employee = db.employees.find(e => e.id === process?.employeeId);
  const dept = db.departments.find(d => d.id === employee?.departmentId);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!process) return;
    const res = await dispatch('UPDATE_ONBOARDING_TASK', {
      employeeId: process.employeeId,
      taskId,
      isCompleted: !currentStatus
    });
    if (res.success) {
      showToast('Onboarding milestone status updated', 'success');
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process) return;

    const res = await dispatch('ADD_ONBOARDING_TASK', {
      employeeId: process.employeeId,
      title: newTaskTitle,
      category: newTaskCategory,
      dueDate: newTaskDue
    });

    if (res.success) {
      showToast(`Added milestone: "${newTaskTitle}"`, 'success');
      setShowAddTaskModal(false);
      setNewTaskTitle('');
    }
  };

  const handleCompleteAll = async () => {
    if (!process) return;
    if (confirm(`Sign off on all indoctrination milestones for ${employee?.firstName} ${employee?.lastName} and clear probation?`)) {
      const res = await dispatch('COMPLETE_ALL_ONBOARDING', {
        employeeId: process.employeeId
      });
      if (res.success) {
        showToast('All onboarding milestones completed! Probation cleared.', 'success');
      }
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'DOCUMENT': return <FileText className="h-4 w-4 text-cisd-navy-800" />;
      case 'IT_ASSET': return <Laptop className="h-4 w-4 text-blue-600" />;
      case 'ORIENTATION': return <Users className="h-4 w-4 text-cisd-gold-600" />;
      case 'TRAINING': return <GraduationCap className="h-4 w-4 text-purple-600" />;
      default: return <ShieldCheck className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isEmployee
              ? 'My Institutional Orientation & Induction Roadmap'
              : isLineManager
              ? 'Directorate New Hire Onboarding Roster'
              : 'New Hire Onboarding & Indoctrination'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEmployee
              ? 'Complete orientation milestones, submit credentials, review covenants, and track your 90-day probationary clearance'
              : isLineManager
              ? 'Supervise departmental induction milestones, mentor new fellows, and review readiness for permanent confirmation'
              : 'Orientation roadmaps, credential issuance, security clearance, and 90-day probation monitoring'}
          </p>
        </div>

        {(isSuperAdmin || isHRAdmin) && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition"
            >
              <Plus className="h-4 w-4 text-cisd-gold-400" />
              Add Milestone
            </button>
          </div>
        )}
      </div>

      {/* Confirmed Employee Banner (when employee has no active probation/onboarding) */}
      {isEmployee && !myProcess && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <span className="rounded bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wide">
                  Permanent Staff Clearance Verified
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  CISD Institutional Induction & Probation Cleared
                </h3>
                <p className="text-xs text-slate-600">
                  {currentUser.firstName} {currentUser.lastName} &bull; {currentUser.designation} ({currentUser.employeeId})
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEmployeeIdForModal(currentUser.id)}
              className="rounded-xl border border-emerald-300 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 shadow-sm"
            >
              View Institutional Dossier
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-200/60 text-xs">
            <div className="rounded-xl bg-white/80 p-3 border border-emerald-100">
              <span className="text-[10px] text-slate-400 font-semibold block">Induction Status</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Fully Certified
              </span>
            </div>
            <div className="rounded-xl bg-white/80 p-3 border border-emerald-100">
              <span className="text-[10px] text-slate-400 font-semibold block">Employment Tenancy</span>
              <span className="font-bold text-slate-800 mt-0.5 block">Permanent / Confirmed Fellow</span>
            </div>
            <div className="rounded-xl bg-white/80 p-3 border border-emerald-100">
              <span className="text-[10px] text-slate-400 font-semibold block">Security & Covenants</span>
              <span className="font-bold text-slate-800 mt-0.5 block">Charter & NDA Signed & Archived</span>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Candidates Selection Bar (For Admins and Managers) */}
      {!isEmployee && visibleProcesses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {visibleProcesses.map(proc => {
            const emp = db.employees.find(e => e.id === proc.employeeId);
            const isSelected = proc.employeeId === selectedEmpId;

            return (
              <div
                key={proc.id}
                onClick={() => setSelectedEmpId(proc.employeeId)}
                className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition space-y-3 ${
                  isSelected
                    ? 'border-cisd-navy-900 bg-white ring-2 ring-cisd-navy-900/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={emp?.avatar}
                    alt={emp?.firstName}
                    className="h-12 w-12 rounded-xl object-cover border"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-900 text-xs truncate">{emp?.firstName} {emp?.lastName}</h3>
                      <span className="font-mono text-[10px] text-slate-400">{emp?.employeeId}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{emp?.designation}</p>
                    <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 mt-1 inline-block">
                      {emp?.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                    <span>Onboarding Completion</span>
                    <span>{proc.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        proc.progress === 100 ? 'bg-emerald-500' : 'bg-cisd-navy-900'
                      }`}
                      style={{ width: `${proc.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Onboarding Checklist Container */}
      {process && employee && (!isEmployee || myProcess) ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          {/* Staff Info Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3.5">
              <img
                src={employee.avatar}
                alt={employee.firstName}
                className="h-14 w-14 rounded-2xl object-cover border"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">{employee.firstName} {employee.lastName}</h3>
                <p className="text-xs text-slate-500">{employee.designation} &bull; {dept?.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Joined {employee.joinDate} &bull; Probation Target {employee.probationEndDate || '2026-11-01'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(isSuperAdmin || isHRAdmin) && (
                <button
                  onClick={handleCompleteAll}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
                >
                  <CheckCheck className="h-4 w-4 text-emerald-600" />
                  Sign-off All Tasks
                </button>
              )}
              <button
                onClick={() => setSelectedEmployeeIdForModal(employee.id)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                View Dossier
              </button>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                Indoctrination Milestones & Sign-offs ({process.tasks.filter(t => t.isCompleted).length} / {process.tasks.length} Completed)
              </h4>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="text-xs font-bold text-cisd-navy-900 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-2.5">
              {process.tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id, task.isCompleted)}
                  className={`cursor-pointer flex items-start gap-3 rounded-xl border p-3.5 transition ${
                    task.isCompleted
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <button className="mt-0.5 flex-shrink-0 text-slate-400">
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs ${task.isCompleted ? 'line-through text-slate-500 font-medium' : 'font-bold text-slate-900'}`}>
                        {task.title}
                      </span>
                      <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                        {getCategoryIcon(task.category)}
                        {task.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span>Target: {task.dueDate}</span>
                      {task.completedAt && (
                        <span className="text-emerald-700 font-medium">Completed on {task.completedAt}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs italic">
          No active onboarding processes selected.
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Add Onboarding Milestone</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Milestone Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Diplomatic Protocol & Media Training"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="ORIENTATION">Orientation</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="IT_ASSET">IT Asset</option>
                    <option value="TRAINING">Training</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
