'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  MessagesSquare,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Users,
  Video,
  FileText,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  Edit3,
  Save,
  Trash2,
  X
} from 'lucide-react';
import { Meeting, MeetingType, MeetingActionItem } from '@/lib/types';

export default function MeetingsModule() {
  const { db, currentUser, setSelectedEmployeeIdForModal, dispatch, showToast } = usePortal();

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isLineManager = currentUser.role === 'LINE_MANAGER';
  const isHRAdmin = currentUser.role === 'HR_ADMIN';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const [meetingScope, setMeetingScope] = useState<'ALL' | 'MY_MEETINGS'>(isEmployee ? 'MY_MEETINGS' : 'ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MeetingType>('STRATEGIC_DIALOGUE');
  const [date, setDate] = useState('2026-11-06');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:30');
  const [location, setLocation] = useState('Executive Boardroom, Floor 5, Abuja HQ');
  const [isVirtual, setIsVirtual] = useState(true);
  const [virtualLink, setVirtualLink] = useState('https://dialogue.cisd.org/room-1');
  const [participantIds, setParticipantIds] = useState<string[]>(['emp-1', 'emp-2']);
  const [actionItemText, setActionItemText] = useState('');
  const [actionItemAssignee, setActionItemAssignee] = useState('emp-2');
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);

  // Minutes editing state
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [minutesContent, setMinutesContent] = useState('');

  // Inline action item add for selected meeting
  const [newActionItemTask, setNewActionItemTask] = useState('');
  const [newActionItemAssignee, setNewActionItemAssignee] = useState('emp-7');

  if (!db) return null;

  const currentSelected = selectedMeeting ? db.meetings.find(m => m.id === selectedMeeting.id) || selectedMeeting : db.meetings[0];

  const myInvitedCount = db.meetings.filter(m => m.participantIds.includes(currentUser.id)).length;

  const filteredMeetings = db.meetings.filter(m => {
    if (isEmployee && meetingScope === 'MY_MEETINGS') {
      if (!m.participantIds.includes(currentUser.id)) return false;
    }
    return filterType === 'ALL' || m.type === filterType;
  });

  const handleOpenSchedule = () => {
    setTitle('');
    setDescription('');
    setType('STRATEGIC_DIALOGUE');
    setDate('2026-11-06');
    setStartTime('14:00');
    setEndTime('15:30');
    setLocation('Diplomatic Conference Hall B, Abuja HQ');
    setIsVirtual(true);
    setVirtualLink('https://dialogue.cisd.org/strategic-roundtable');
    setParticipantIds(['emp-1', 'emp-2', 'emp-7']);
    setActionItems([]);
    setShowScheduleModal(true);
  };

  const handleAddActionItem = () => {
    if (!actionItemText.trim()) return;
    setActionItems([
      ...actionItems,
      {
        id: `act-${Date.now()}`,
        task: actionItemText,
        assignedToId: actionItemAssignee,
        status: 'OPEN'
      }
    ]);
    setActionItemText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('CREATE_MEETING', {
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      location,
      isVirtual,
      virtualLink: isVirtual ? virtualLink : undefined,
      participantIds,
      actionItems
    });
    if (res.success) {
      showToast('Strategic meeting scheduled and added to institutional calendar', 'success');
      setShowScheduleModal(false);
    }
  };

  const handleToggleActionItem = async (meeting: Meeting, actionItemId: string) => {
    const updatedActionItems = meeting.actionItems.map(item => {
      if (item.id === actionItemId) {
        return { ...item, status: item.status === 'OPEN' ? 'DONE' as const : 'OPEN' as const };
      }
      return item;
    });

    const res = await dispatch('UPDATE_MEETING', {
      id: meeting.id,
      actionItems: updatedActionItems
    });

    if (res.success) {
      showToast('Action item status updated', 'info');
      setSelectedMeeting({ ...meeting, actionItems: updatedActionItems });
    }
  };

  const handleAddInlineActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelected || !newActionItemTask.trim()) return;

    const newItem: MeetingActionItem = {
      id: `act-${Date.now()}`,
      task: newActionItemTask.trim(),
      assignedToId: newActionItemAssignee,
      status: 'OPEN'
    };

    const updated = [...(currentSelected.actionItems || []), newItem];

    const res = await dispatch('UPDATE_MEETING', {
      id: currentSelected.id,
      actionItems: updated
    });

    if (res.success) {
      showToast('New action item assigned and added to meeting record', 'success');
      setNewActionItemTask('');
      setSelectedMeeting({ ...currentSelected, actionItems: updated });
    }
  };

  const handleSaveMinutes = async () => {
    if (!currentSelected) return;

    const res = await dispatch('UPDATE_MEETING', {
      id: currentSelected.id,
      minutes: minutesContent
    });

    if (res.success) {
      showToast('Meeting minutes and briefing notes updated', 'success');
      setIsEditingMinutes(false);
      setSelectedMeeting({ ...currentSelected, minutes: minutesContent });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Diplomatic Dialogues & Meetings</h2>
          <p className="text-xs text-slate-500">
            Strategic sessions, ministerial prep roundtables, executive briefings, and action item accountability
          </p>
        </div>

        <button
          onClick={handleOpenSchedule}
          className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-cisd-gold-400" />
          Schedule Session
        </button>
      </div>

      {/* Employee Scope Switcher */}
      {isEmployee && (
        <div className="flex border-b border-slate-200 text-xs font-bold space-x-6">
          <button
            onClick={() => setMeetingScope('MY_MEETINGS')}
            className={`pb-3 border-b-2 transition ${
              meetingScope === 'MY_MEETINGS'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Invited Sessions ({myInvitedCount})
          </button>
          <button
            onClick={() => setMeetingScope('ALL')}
            className={`pb-3 border-b-2 transition ${
              meetingScope === 'ALL'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Institutional Dialogues & Briefings ({db.meetings.length})
          </button>
        </div>
      )}

      {/* Main Grid: Upcoming Sessions & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Meeting List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-xs">
            <span className="font-bold text-slate-700">Filter Classification:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 py-1 px-3 text-slate-700"
            >
              <option value="ALL">All Meeting Formats</option>
              <option value="STRATEGIC_DIALOGUE">Strategic Dialogue</option>
              <option value="EXECUTIVE_BRIEFING">Executive Briefing</option>
              <option value="DEPARTMENTAL">Departmental Sync</option>
              <option value="BOARD">Board Review</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredMeetings.map(meeting => {
              const isSelected = currentSelected?.id === meeting.id;
              const organizer = db.employees.find(e => e.id === meeting.organizerId);

              return (
                <div
                  key={meeting.id}
                  onClick={() => {
                    setSelectedMeeting(meeting);
                    setMinutesContent(meeting.minutes || '');
                    setIsEditingMinutes(false);
                  }}
                  className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition space-y-3 ${
                    isSelected
                      ? 'border-cisd-navy-900 bg-white ring-2 ring-cisd-navy-800/10'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          meeting.type === 'STRATEGIC_DIALOGUE' ? 'bg-cisd-navy-900 text-white' :
                          meeting.type === 'EXECUTIVE_BRIEFING' ? 'bg-cisd-gold-100 text-cisd-gold-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {meeting.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {meeting.date}
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {meeting.startTime} – {meeting.endTime}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{meeting.title}</h3>
                    </div>

                    {meeting.isVirtual && meeting.virtualLink && (
                      <a
                        href={meeting.virtualLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 self-start sm:self-auto"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join Virtual Room
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{meeting.description}</p>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      {meeting.location}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {meeting.participantIds.slice(0, 4).map(pid => {
                          const p = db.employees.find(e => e.id === pid);
                          return (
                            <img
                              key={pid}
                              src={p?.avatar}
                              alt={p?.firstName}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            />
                          );
                        })}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {meeting.participantIds.length} Invited &bull; {meeting.actionItems?.length || 0} Action Items
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Meeting Details, Minutes & Action Items */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="h-4 w-4 text-cisd-navy-900" />
              Session Minutes & Action Items
            </h3>

            {currentSelected ? (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{currentSelected.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">{currentSelected.date} &bull; {currentSelected.location}</p>
                </div>

                {/* Minutes Section with Interactive Editor */}
                <div className="rounded-xl bg-slate-50 p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wide">
                      Executive Minutes & Briefing Notes
                    </span>
                    {!isEditingMinutes ? (
                      <button
                        onClick={() => {
                          setMinutesContent(currentSelected.minutes || '');
                          setIsEditingMinutes(true);
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-cisd-navy-900 hover:underline"
                      >
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveMinutes}
                        className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
                      >
                        <Save className="h-3 w-3" /> Save
                      </button>
                    )}
                  </div>

                  {isEditingMinutes ? (
                    <div className="space-y-2">
                      <textarea
                        rows={4}
                        value={minutesContent}
                        onChange={(e) => setMinutesContent(e.target.value)}
                        placeholder="Type session briefing minutes, outcomes, and agreed communiqués..."
                        className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white text-slate-800"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setIsEditingMinutes(false)}
                          className="px-2 py-1 border rounded text-[10px] text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveMinutes}
                          className="px-2.5 py-1 bg-cisd-navy-900 text-white rounded font-bold text-[10px]"
                        >
                          Save Minutes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {currentSelected.minutes || 'No formal briefing minutes logged yet. Click Edit to record key agreements.'}
                    </p>
                  )}
                </div>

                {/* Action Items List */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">
                    Assigned Action Items ({currentSelected.actionItems?.length || 0})
                  </span>

                  {currentSelected.actionItems && currentSelected.actionItems.length > 0 ? (
                    <div className="space-y-2">
                      {currentSelected.actionItems.map(item => {
                        const isDone = item.status === 'DONE';
                        const assignedEmp = db.employees.find(e => e.id === item.assignedToId);
                        return (
                          <div
                            key={item.id}
                            className={`flex items-start gap-2.5 rounded-xl border p-2.5 transition ${
                              isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <button
                              onClick={() => handleToggleActionItem(currentSelected, item.id)}
                              className="mt-0.5 text-slate-400 hover:text-emerald-600"
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs ${isDone ? 'line-through text-slate-400' : 'font-medium text-slate-800'}`}>
                                {item.task}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Assigned to: <span className="font-semibold text-slate-600">{assignedEmp?.firstName} {assignedEmp?.lastName}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-xs">No action items logged for this session yet.</p>
                  )}

                  {/* Inline Form to Add Action Item */}
                  <form onSubmit={handleAddInlineActionItem} className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Assign New Action Item</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Draft Sahel peace communiqué briefing..."
                      value={newActionItemTask}
                      onChange={(e) => setNewActionItemTask(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={newActionItemAssignee}
                        onChange={(e) => setNewActionItemAssignee(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 p-1.5 text-xs text-slate-700 bg-white"
                      >
                        {db.employees.map(e => (
                          <option key={e.id} value={e.id}>
                            {e.firstName} {e.lastName} ({e.designation})
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg bg-cisd-navy-900 px-3 py-1.5 font-bold text-white text-xs hover:bg-cisd-navy-800 shadow"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </div>

                {/* Attendees list */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block text-xs">Confirmed Attendees</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {currentSelected.participantIds.map(pid => {
                      const p = db.employees.find(e => e.id === pid);
                      return (
                        <div key={pid} className="flex items-center gap-2">
                          <img src={p?.avatar} alt={p?.firstName} className="h-6 w-6 rounded-full object-cover" />
                          <span className="text-slate-700 font-medium">{p?.firstName} {p?.lastName}</span>
                          <span className="text-[10px] text-slate-400">({p?.designation})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic text-xs text-center py-6">
                Select a meeting from the list to view minutes and manage action items.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Schedule Strategic Dialogue / Meeting</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahel Peace & Security Working Group Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agenda & Strategic Objectives</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Outline key dialogue items, expected outputs, and background readings..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meeting Classification</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="STRATEGIC_DIALOGUE">Strategic Dialogue</option>
                    <option value="EXECUTIVE_BRIEFING">Executive Briefing</option>
                    <option value="DEPARTMENTAL">Departmental Sync</option>
                    <option value="BOARD">Board Review</option>
                    <option value="ONE_ON_ONE">One-on-One</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVirtual"
                  checked={isVirtual}
                  onChange={(e) => setIsVirtual(e.target.checked)}
                  className="rounded text-cisd-navy-900"
                />
                <label htmlFor="isVirtual" className="font-semibold text-slate-700">Include Secure Virtual Room Link</label>
              </div>

              {isVirtual && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Virtual Room URL</label>
                  <input
                    type="url"
                    value={virtualLink}
                    onChange={(e) => setVirtualLink(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Schedule Dialogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
