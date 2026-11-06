'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
  Plus,
  Search,
  Filter,
  FileText,
  User,
  Users
} from 'lucide-react';
import { PerformanceReview, KpiRating } from '@/lib/types';

export default function PerformanceModule() {
  const { db, currentUser, setSelectedEmployeeIdForModal, dispatch, showToast } = usePortal();

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isLineManager = currentUser.role === 'LINE_MANAGER';
  const isHRAdmin = currentUser.role === 'HR_ADMIN';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const [selectedCycle, setSelectedCycle] = useState('ALL');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSelfModal, setShowSelfModal] = useState(false);

  // Form State
  const [targetEmployeeId, setTargetEmployeeId] = useState('emp-7');
  const [cycle, setCycle] = useState('2026 Annual Strategic Appraisal');
  const [selfRating, setSelfRating] = useState(4.5);
  const [managerRating, setManagerRating] = useState(4.8);
  const [strengths, setStrengths] = useState('Exceptional diplomatic synthesis, reliable publication delivery, and high institutional credibility.');
  const [areasForGrowth, setAreasForGrowth] = useState('Expand mentoring of junior fellows on qualitative multilateral field interview methodologies.');
  const [developmentPlan, setDevelopmentPlan] = useState('Sponsored participation at the Geneva Centre for Security Policy executive course.');

  if (!db) return null;

  const reviews = db.performanceReviews.filter(r => {
    if (isEmployee) {
      if (r.employeeId !== currentUser.id) return false;
    } else if (isLineManager) {
      const emp = db.employees.find(e => e.id === r.employeeId);
      if (emp?.departmentId !== currentUser.departmentId && r.employeeId !== currentUser.id) return false;
    }
    return selectedCycle === 'ALL' || r.cycle === selectedCycle;
  });

  const availableAppraisees = isLineManager
    ? db.employees.filter(e => e.departmentId === currentUser.departmentId && e.id !== currentUser.id)
    : db.employees;

  const handleOpenReviewModal = () => {
    setTargetEmployeeId(availableAppraisees[0]?.id || 'emp-7');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalScore = Number(((Number(selfRating) + Number(managerRating)) / 2).toFixed(1));

    const kpis: KpiRating[] = [
      { title: 'Strategic Policy Formulation & Research Quality', weight: 40, score: Number(managerRating), comments: 'Consistently rigorous analysis delivered ahead of summit deadlines.' },
      { title: 'Diplomatic Dialogue Facilitation & Stakeholder Engagement', weight: 35, score: 5.0, comments: 'Exemplary neutrality and poise in closed bilateral track sessions.' },
      { title: 'Inter-Departmental Collaboration & Team Leadership', weight: 25, score: 4.5, comments: 'Active mentor to research associates.' }
    ];

    const res = await dispatch('SUBMIT_PERFORMANCE_REVIEW', {
      employeeId: targetEmployeeId,
      cycle,
      status: 'FINALIZED',
      selfRating: Number(selfRating),
      managerRating: Number(managerRating),
      finalScore,
      kpiRatings: kpis,
      strengths,
      areasForGrowth,
      developmentPlan
    });

    if (res.success) {
      showToast('Performance appraisal cycle submitted and recorded', 'success');
      setShowReviewModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isEmployee
              ? 'My Performance Scorecard & Development Appraisals'
              : isLineManager
              ? 'Directorate Performance Evaluations & Appraisals'
              : 'Staff Performance Appraisals & Strategic KPIs'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEmployee
              ? 'Quarterly review scores, KPI metrics, supervisor evaluations, and strategic professional growth plans'
              : isLineManager
              ? 'Evaluate staff fellows in your directorate, record KPI ratings, and formulate professional growth roadmaps'
              : '360-degree reviews, policy impact metrics, supervisor assessments, and professional growth roadmaps'}
          </p>
        </div>

        {isEmployee ? (
          <button
            onClick={() => setShowSelfModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
          >
            <Star className="h-4 w-4 text-cisd-gold-400" />
            Submit Self-Reflection & Goals
          </button>
        ) : (
          <button
            onClick={handleOpenReviewModal}
            className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 text-cisd-gold-400" />
            Conduct Staff Appraisal
          </button>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isEmployee ? 'My Overall Score' : 'Average Institutional Score'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900">
              {isEmployee ? (reviews[0]?.finalScore || '4.7') : '4.65'}
            </span>
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {isEmployee ? 'Performance Band: Outstanding (Exceeds Expectations)' : '94% of personnel meet or exceed targets'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Review Cycle</span>
          <p className="text-base font-bold text-cisd-navy-900 mt-1">2026 Annual Strategic Review</p>
          <span className="text-[11px] text-slate-500">Scheduled: October – November 2026</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isEmployee ? 'Appraisal Records' : 'Evaluated Personnel'}
          </span>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {reviews.length} {isEmployee ? 'Record' : 'Dossiers'}
          </p>
          <span className="text-[11px] text-slate-500">Finalized and logged</span>
        </div>
      </div>

      {/* Appraisals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-bold text-slate-900 text-sm">
            {isEmployee ? 'My Performance Dossier' : 'Completed Performance Dossiers'}
          </h3>
          <span className="text-xs text-slate-500">{reviews.length} Appraisal Records</span>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-500 space-y-2">
            <Award className="h-8 w-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Annual Appraisal Records Yet</h4>
            <p className="max-w-md mx-auto">
              Your formal annual appraisal cycle will be conducted following initial probationary orientation. Continue logging your research deliverables, hybrid attendance, and timesheets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(rev => {
            const emp = db.employees.find(e => e.id === rev.employeeId);
            const reviewer = db.employees.find(e => e.id === rev.reviewerId);
            const dept = db.departments.find(d => d.id === emp?.departmentId);

            return (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-cisd-navy-300 transition"
              >
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp?.avatar}
                      alt={emp?.firstName}
                      className="h-12 w-12 rounded-xl object-cover border"
                    />
                    <div>
                      <h4
                        onClick={() => emp && setSelectedEmployeeIdForModal(emp.id)}
                        className="font-bold text-slate-900 text-sm cursor-pointer hover:underline"
                      >
                        {emp?.firstName} {emp?.lastName}
                      </h4>
                      <p className="text-xs text-slate-500">{emp?.designation} &bull; {dept?.name}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-cisd-gold-50 border border-cisd-gold-200 px-3 py-1 text-center">
                    <span className="text-[9px] uppercase font-bold text-cisd-gold-700 block">Rating</span>
                    <span className="text-base font-black text-cisd-gold-900">{rev.finalScore} / 5.0</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">KPI Scorecard Breakdown</span>
                  <div className="space-y-1.5 text-xs">
                    {rev.kpiRatings?.map((kpi, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-50 p-2 space-y-0.5">
                        <div className="flex justify-between font-semibold text-slate-800 text-[11px]">
                          <span>{kpi.title}</span>
                          <span className="text-cisd-navy-900 font-bold">{kpi.score} / 5.0</span>
                        </div>
                        <p className="text-[10px] text-slate-500 italic">{kpi.comments}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">Evaluator Assessment:</span>
                    <p className="text-slate-600 bg-slate-50/60 p-2 rounded-lg mt-0.5 text-[11px] leading-relaxed">
                      {rev.strengths}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Development Roadmap:</span>
                    <p className="text-slate-600 bg-slate-50/60 p-2 rounded-lg mt-0.5 text-[11px] leading-relaxed">
                      {rev.developmentPlan}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Reviewed by {reviewer?.firstName} {reviewer?.lastName}</span>
                  <span>{rev.createdAt} &bull; Cycle: {rev.cycle}</span>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Conduct Appraisal Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Conduct Staff Appraisal</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Member Being Appraised</label>
                <select
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  {availableAppraisees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appraisal Cycle</label>
                <input
                  type="text"
                  required
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Self-Evaluation Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={selfRating}
                    onChange={(e) => setSelfRating(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supervisor Final Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={managerRating}
                    onChange={(e) => setManagerRating(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Strengths & Policy Impact</label>
                <textarea
                  rows={2}
                  required
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Areas for Professional Growth</label>
                <textarea
                  rows={2}
                  required
                  value={areasForGrowth}
                  onChange={(e) => setAreasForGrowth(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recommended Professional Development Plan</label>
                <textarea
                  rows={2}
                  required
                  value={developmentPlan}
                  onChange={(e) => setDevelopmentPlan(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Finalize & Submit Scorecard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Self-Reflection & Goals Modal */}
      {showSelfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <span className="rounded bg-cisd-gold-100 text-cisd-navy-900 text-[10px] font-bold px-2 py-0.5">
                  Self-Evaluation Portal
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  Submit Self-Reflection & Development Goals
                </h3>
              </div>
              <button
                onClick={() => setShowSelfModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Self-appraisal reflection recorded and submitted to your Line Manager', 'success');
                setShowSelfModal(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Self-Rating (1-5 Stars)</label>
                <select
                  value={selfRating}
                  onChange={(e) => setSelfRating(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  <option value={5}>5.0 - Exceptional / Role Model</option>
                  <option value={4.5}>4.5 - Outstanding (Exceeds Requirements)</option>
                  <option value={4}>4.0 - Strong Delivery (Meets All Standards)</option>
                  <option value={3.5}>3.5 - Developing Solidly</option>
                  <option value={3}>3.0 - Meets Minimum Expectations</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Deliverables & Diplomatic Milestones Achieved</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize key policy papers drafted, dialogues convened, and cross-directorate contributions..."
                  defaultValue="Delivered the Sahel Regional Security Policy brief ahead of the November summit; co-facilitated two closed bilateral dialogue sessions with ECOWAS counterparts."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requested Skills & Development Support</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Requested specialized executive courses, research tools, or language certifications..."
                  defaultValue="Participation in the Advanced Multilateral Negotiation Simulation and qualitative survey methodology certification."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowSelfModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Submit Self-Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
