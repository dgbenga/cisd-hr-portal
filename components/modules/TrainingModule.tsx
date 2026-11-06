'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  GraduationCap,
  Award,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Users,
  BookOpen,
  Sparkles,
  Plus,
  X
} from 'lucide-react';
import { TrainingCourse } from '@/lib/types';

export default function TrainingModule() {
  const { db, currentUser, dispatch, showToast } = usePortal();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCode, setCourseCode] = useState('CISD-ACAD-005');
  const [courseCategory, setCourseCategory] = useState<'DIPLOMACY' | 'SECURITY' | 'GOVERNANCE' | 'METHODOLOGY'>('DIPLOMACY');
  const [instructor, setInstructor] = useState('Ambassador Olumide Adeyemi');
  const [durationHours, setDurationHours] = useState(16);
  const [scheduleDate, setScheduleDate] = useState('2026-11-25');
  const [maxSeats, setMaxSeats] = useState(15);
  const [description, setDescription] = useState('');

  if (!db) return null;

  const handleEnroll = async (courseId: string) => {
    const res = await dispatch('ENROLL_TRAINING', {
      courseId,
      employeeId: currentUser.id
    });
    if (res.success) {
      showToast('Enrolled in training masterclass', 'success');
    }
  };

  const handleComplete = async (courseId: string) => {
    const res = await dispatch('COMPLETE_TRAINING', {
      courseId,
      employeeId: currentUser.id
    });
    if (res.success) {
      showToast('Certified completion of course and added to personnel credentials', 'success');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('CREATE_TRAINING_COURSE', {
      code: courseCode,
      title: courseTitle,
      category: courseCategory,
      description,
      instructor,
      durationHours: Number(durationHours),
      scheduleDate,
      maxParticipants: Number(maxSeats)
    });
    if (res.success) {
      showToast('New training masterclass published to academy', 'success');
      setShowCreateModal(false);
      setCourseTitle('');
      setDescription('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">CISD Academy & Strategic Skills Development</h2>
          <p className="text-xs text-slate-500">
            Executive masterclasses in diplomatic negotiation, geopolitical intelligence, counter-espionage, and institutional leadership
          </p>
        </div>

        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 text-cisd-gold-400" />
            Create Masterclass
          </button>
        )}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {db.trainingCourses.map(course => {
          const isEnrolled = course.enrolledEmployeeIds.includes(currentUser.id);
          const isCompleted = course.completedEmployeeIds.includes(currentUser.id);

          return (
            <div
              key={course.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-cisd-navy-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-cisd-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                    {course.code}
                  </span>
                  <span className="rounded bg-cisd-gold-100 text-cisd-gold-800 text-[10px] font-bold px-2 py-0.5 uppercase">
                    {course.category.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{course.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{course.description}</p>

                <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Instructor:</span>
                    <strong className="text-slate-800">{course.instructor}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span>{course.durationHours} Hours Intensive</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled:</span>
                    <span>{course.scheduleDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Enrollment:</span>
                    <span className="font-semibold text-cisd-navy-900">
                      {course.enrolledEmployeeIds.length} / {course.maxParticipants} Seats
                    </span>
                  </div>
                </div>

                {/* Enrolled Staff Avatars */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {course.enrolledEmployeeIds.slice(0, 4).map(pid => {
                      const p = db.employees.find(e => e.id === pid);
                      return (
                        <img
                          key={pid}
                          src={p?.avatar}
                          alt={p?.firstName}
                          className="h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        />
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {course.enrolledEmployeeIds.length} staff enrolled
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100">
                {isCompleted ? (
                  <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-800 py-2 text-xs font-bold border border-emerald-200">
                    <Award className="h-4 w-4 text-emerald-600" />
                    Certified & Credentialed
                  </div>
                ) : isEnrolled ? (
                  <div className="space-y-2">
                    <div className="text-center text-[11px] font-semibold text-blue-700 bg-blue-50 py-1 rounded-lg">
                      Enrolled & Scheduled
                    </div>
                    <button
                      onClick={() => handleComplete(course.id)}
                      className="w-full rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      Mark as Completed
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="w-full rounded-xl bg-cisd-navy-900 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="h-4 w-4 text-cisd-gold-400" />
                    Enroll in Masterclass
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Masterclass Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Publish New Academy Masterclass</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Multilateral Sanctions & Diplomatic De-escalation"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="DIPLOMACY">Diplomacy</option>
                    <option value="SECURITY">Security</option>
                    <option value="GOVERNANCE">Governance</option>
                    <option value="METHODOLOGY">Methodology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instructor / Fellow</label>
                  <input
                    type="text"
                    required
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Syllabus & Course Scope</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline syllabus, key case studies, and required background readings..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
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
                  Publish Masterclass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
