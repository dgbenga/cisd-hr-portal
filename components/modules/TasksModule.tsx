'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit2,
  LayoutGrid,
  List,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '@/lib/types';

export default function TasksModule() {
  const { db, currentUser, setSelectedEmployeeIdForModal, dispatch, showToast } = usePortal();

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isLineManager = currentUser.role === 'LINE_MANAGER';
  const isHRAdmin = currentUser.role === 'HR_ADMIN';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const [taskViewFilter, setTaskViewFilter] = useState<'MY_TASKS' | 'ALL_TASKS'>(
    isEmployee ? 'MY_TASKS' : 'ALL_TASKS'
  );

  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [filterDept, setFilterDept] = useState(isLineManager ? currentUser.departmentId : 'ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [search, setSearch] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: currentUser.departmentId || 'dept-2',
    assignedToId: currentUser.id,
    priority: 'MEDIUM' as TaskPriority,
    status: 'IN_PROGRESS' as TaskStatus,
    dueDate: '2026-11-15',
    progressPercentage: 30,
    projectTag: 'Strategic Dialogue 2026'
  });

  if (!db) return null;

  const myTasks = db.tasks.filter(t => t.assignedToId === currentUser.id);

  // Filter tasks
  const filteredTasks = db.tasks.filter(t => {
    if (isEmployee && taskViewFilter === 'MY_TASKS') {
      if (t.assignedToId !== currentUser.id) return false;
    }
    const matchDept = filterDept === 'ALL' || t.departmentId === filterDept;
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    const q = search.toLowerCase();
    const matchSearch =
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.projectTag && t.projectTag.toLowerCase().includes(q));
    return matchDept && matchPriority && matchSearch;
  });

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'NOT_STARTED', label: 'Not Started', color: 'border-slate-300 bg-slate-50' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-400 bg-blue-50/40' },
    { id: 'UNDER_REVIEW', label: 'Under Review', color: 'border-purple-400 bg-purple-50/40' },
    { id: 'COMPLETED', label: 'Completed', color: 'border-emerald-400 bg-emerald-50/40' },
    { id: 'OVERDUE', label: 'Overdue Alerts', color: 'border-rose-400 bg-rose-50/40' }
  ];

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      departmentId: db.departments[0]?.id || 'dept-1',
      assignedToId: db.employees[0]?.id || 'emp-1',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      dueDate: '2026-11-20',
      progressPercentage: 0,
      projectTag: 'Sahel Dialogue'
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setFormData({
      title: t.title,
      description: t.description,
      departmentId: t.departmentId,
      assignedToId: t.assignedToId,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      progressPercentage: t.progressPercentage,
      projectTag: t.projectTag || ''
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      const res = await dispatch('UPDATE_TASK', { id: editingTask.id, ...formData });
      if (res.success) {
        showToast('Task updated successfully', 'success');
        setShowCreateModal(false);
      }
    } else {
      const res = await dispatch('CREATE_TASK', formData);
      if (res.success) {
        showToast('Strategic task assigned and added to roadmap', 'success');
        setShowCreateModal(false);
      }
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const res = await dispatch('UPDATE_TASK', {
      id: taskId,
      status: newStatus,
      progressPercentage: newStatus === 'COMPLETED' ? 100 : undefined
    });
    if (res.success) {
      showToast(`Moved task to ${newStatus.replace('_', ' ')}`, 'info');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const res = await dispatch('DELETE_TASK', { id: taskId });
      if (res.success) {
        showToast('Task removed', 'info');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Strategic Task Operations & Deliverables</h2>
          <p className="text-xs text-slate-500">
            Monitor institutional deadlines, policy drafts, ministerial preparations, and accountability
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-cisd-gold-400" />
          {isEmployee ? 'Create Deliverable' : 'Assign New Task'}
        </button>
      </div>

      {/* Employee View Mode Switcher */}
      {isEmployee && (
        <div className="flex border-b border-slate-200 text-xs font-bold space-x-6">
          <button
            onClick={() => setTaskViewFilter('MY_TASKS')}
            className={`pb-3 border-b-2 transition ${
              taskViewFilter === 'MY_TASKS'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Assigned Deliverables ({myTasks.length})
          </button>
          <button
            onClick={() => setTaskViewFilter('ALL_TASKS')}
            className={`pb-3 border-b-2 transition ${
              taskViewFilter === 'ALL_TASKS'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Directorate Strategic Tasks ({db.tasks.length})
          </button>
        </div>
      )}

      {/* Filter and View Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, project tags, deliverables..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
          >
            <option value="ALL">All Departments</option>
            {db.departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`p-1.5 rounded-lg ${viewMode === 'KANBAN' ? 'bg-white shadow text-cisd-navy-900' : 'text-slate-400'}`}
              title="Kanban Board"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg ${viewMode === 'LIST' ? 'bg-white shadow text-cisd-navy-900' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-3 min-h-[420px]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-xs">{col.label}</span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.map(task => {
                    const assignee = db.employees.find(e => e.id === task.assignedToId);
                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2 hover:border-cisd-navy-300 transition"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            task.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                            task.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                          {task.projectTag && (
                            <span className="text-[10px] font-medium text-cisd-gold-700 truncate max-w-[120px]">
                              #{task.projectTag}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs leading-snug">{task.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                            <span>Progress</span>
                            <span>{task.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                task.progressPercentage === 100 ? 'bg-emerald-500' :
                                task.status === 'OVERDUE' ? 'bg-rose-500' : 'bg-cisd-navy-800'
                              }`}
                              style={{ width: `${task.progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Assignee & Due Date */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          <div
                            onClick={() => assignee && setSelectedEmployeeIdForModal(assignee.id)}
                            className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900"
                            title={assignee ? `${assignee.firstName} ${assignee.lastName}` : ''}
                          >
                            <img
                              src={assignee?.avatar}
                              alt={assignee?.firstName}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                            <span className="truncate max-w-[75px] font-medium text-slate-700">
                              {assignee?.firstName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{task.dueDate}</span>
                        </div>

                        {/* Quick Status Shift Controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px]">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                            className="rounded border border-slate-200 bg-slate-50 py-0.5 px-1 text-[10px] text-slate-700"
                          >
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="OVERDUE">Overdue</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(task)}
                              className="p-1 text-slate-400 hover:text-slate-700"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Task Deliverable</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(task => {
                const assignee = db.employees.find(e => e.id === task.assignedToId);
                const dept = db.departments.find(d => d.id === task.departmentId);
                return (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{task.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{task.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{dept?.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img src={assignee?.avatar} alt={assignee?.firstName} className="h-6 w-6 rounded-full object-cover" />
                        <span className="font-medium text-slate-800">{assignee?.firstName} {assignee?.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                        task.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{task.dueDate}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{task.progressPercentage}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        task.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenEdit(task)} className="p-1 text-slate-400 hover:text-slate-700">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="p-1 text-slate-400 hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Create / Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingTask ? 'Edit Strategic Task' : 'Assign New Strategic Task'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Deliverable Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Synthesize Sahel Security Track 1.5 Briefing Memo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail scope, requirements, and required bilateral outputs..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Directorate</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    {db.departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignee</label>
                  <select
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    {db.employees.map(e => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.designation})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Identifier Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Sahel Dialogue 2026"
                    value={formData.projectTag}
                    onChange={(e) => setFormData({ ...formData, projectTag: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Completion ({formData.progressPercentage}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progressPercentage}
                    onChange={(e) => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
