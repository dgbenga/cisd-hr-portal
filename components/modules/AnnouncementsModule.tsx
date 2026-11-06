'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  BellRing,
  Plus,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Cake,
  Building,
  User,
  Send
} from 'lucide-react';
import { Announcement, AnnouncementCategory } from '@/lib/types';

export default function AnnouncementsModule() {
  const { db, currentUser, dispatch, showToast } = usePortal();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('OFFICIAL_MEMO');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');

  if (!db) return null;

  const filteredAnnouncements = db.announcements.filter(a => {
    return filterCategory === 'ALL' || a.category === filterCategory;
  });

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('CREATE_ANNOUNCEMENT', {
      title,
      category,
      content,
      priority
    });
    if (res.success) {
      showToast('Institutional circular broadcasted to all CISD personnel', 'success');
      setShowBroadcastModal(false);
      setTitle('');
      setContent('');
    }
  };

  const handleAcknowledge = async (id: string) => {
    const res = await dispatch('ACKNOWLEDGE_ANNOUNCEMENT', { id });
    if (res.success) {
      showToast('Circular acknowledged and marked as read', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Institutional Circulars & Noticeboard</h2>
          <p className="text-xs text-slate-500">
            Diplomatic summit notifications, executive circulars, policy alerts, and collegial staff celebrations
          </p>
        </div>

        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN') && (
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 text-cisd-gold-400" />
            Broadcast Notice
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        {['ALL', 'OFFICIAL_MEMO', 'DIPLOMATIC_EVENT', 'POLICY', 'CELEBRATION'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              filterCategory === cat
                ? 'bg-cisd-navy-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Notices' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.map(ann => {
          const author = db.employees.find(e => e.id === ann.authorId);
          const isHigh = ann.priority === 'HIGH' || ann.priority === 'CRITICAL';

          return (
            <div
              key={ann.id}
              className={`rounded-2xl border p-5 shadow-sm transition space-y-3 ${
                isHigh
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    ann.priority === 'HIGH' || ann.priority === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {ann.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">&bull; Published on {ann.publishDate}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <img
                    src={author?.avatar}
                    alt={author?.firstName}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span>Issued by <strong className="text-slate-800">{author?.firstName} {author?.lastName}</strong></span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Acknowledged by {ann.acknowledgeCount} staff members
                </span>

                <button
                  onClick={() => handleAcknowledge(ann.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-cisd-navy-900 hover:text-cisd-gold-600 transition"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Acknowledge & Mark Read
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Broadcast Notice Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Broadcast Institutional Circular</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Heading</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Protocol Guidelines for Visiting Delegations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="OFFICIAL_MEMO">Official Memo</option>
                    <option value="DIPLOMATIC_EVENT">Diplomatic Event</option>
                    <option value="POLICY">Policy Circular</option>
                    <option value="CELEBRATION">Celebration / Birthday</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">Critical Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Circular Text</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Draft full message for institutional distribution..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Publish & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
