'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Briefcase,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Star,
  FileText,
  Mail,
  Phone,
  ChevronRight,
  ArrowRight,
  Send,
  Building,
  DollarSign,
  Calendar,
  X,
  UserCheck,
  Award,
  Trash2,
  Edit3
} from 'lucide-react';
import { RecruitmentJob, Candidate, CandidateStage } from '@/lib/types';

export default function RecruitmentModule() {
  const { db, currentUser, setActiveTab, dispatch, showToast } = usePortal();

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isLineManager = currentUser.role === 'LINE_MANAGER';
  const isHRAdmin = currentUser.role === 'HR_ADMIN';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTabLocal] = useState<'VACANCIES' | 'CANDIDATES'>(
    isEmployee ? 'VACANCIES' : 'CANDIDATES'
  );
  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');

  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);

  // Referral / Internal Apply modal for Employee
  const [showReferModal, setShowReferModal] = useState(false);
  const [referJobTitle, setReferJobTitle] = useState('');
  const [referCandidateName, setReferCandidateName] = useState('');
  const [referCandidateEmail, setReferCandidateEmail] = useState('');
  const [referNote, setReferNote] = useState('');

  // Candidate evaluation / detail modal
  const [evaluatingCandidate, setEvaluatingCandidate] = useState<Candidate | null>(null);
  const [evalNotes, setEvalNotes] = useState('');
  const [evalRating, setEvalRating] = useState(4);
  const [offerSalary, setOfferSalary] = useState('$75,000');
  const [offerStartDate, setOfferStartDate] = useState('2026-12-01');

  // Job form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobDeptId, setJobDeptId] = useState('dept-2');
  const [jobExp, setJobExp] = useState('5+ years');
  const [jobOpenings, setJobOpenings] = useState(1);
  const [jobDeadline, setJobDeadline] = useState('2026-12-15');
  const [jobSalary, setJobSalary] = useState('$65,000 - $85,000 per annum');
  const [jobDesc, setJobDesc] = useState('');

  // Candidate form state
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candJobId, setCandJobId] = useState('job-1');

  if (!db) return null;

  const stages: { id: CandidateStage; label: string; color: string }[] = [
    { id: 'APPLIED', label: 'Applied', color: 'bg-slate-100 text-slate-800' },
    { id: 'SCREENING', label: 'Screening', color: 'bg-blue-100 text-blue-800' },
    { id: 'INTERVIEW', label: 'Interview Scheduled', color: 'bg-amber-100 text-amber-800' },
    { id: 'OFFER', label: 'Offer Extended', color: 'bg-purple-100 text-purple-800' },
    { id: 'HIRED', label: 'Hired & Onboarding', color: 'bg-emerald-100 text-emerald-800' }
  ];

  const filteredCandidates = db.candidates.filter(c => {
    const matchJob = selectedJobId === 'ALL' || c.jobId === selectedJobId;
    const matchStage = selectedStage === 'ALL' || c.stage === selectedStage;
    return matchJob && matchStage;
  });

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('CREATE_JOB', {
      title: jobTitle,
      departmentId: jobDeptId,
      type: 'FULL_TIME',
      location: 'Abuja Head Office',
      experience: jobExp,
      openings: Number(jobOpenings),
      deadline: jobDeadline,
      salaryRange: jobSalary,
      description: jobDesc,
      requirements: ['Proven background in strategic policy research', 'Fluency in English']
    });
    if (res.success) {
      showToast('New recruitment vacancy published', 'success');
      setShowCreateJobModal(false);
      setJobTitle('');
      setJobDesc('');
    }
  };

  const handleToggleJobStatus = async (job: RecruitmentJob) => {
    const nextStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    const res = await dispatch('UPDATE_JOB_STATUS', {
      id: job.id,
      status: nextStatus
    });
    if (res.success) {
      showToast(`Vacancy marked as ${nextStatus}`, 'info');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Archive this vacancy requisition?')) {
      const res = await dispatch('DELETE_JOB', { id: jobId });
      if (res.success) {
        showToast('Vacancy requisition archived', 'info');
      }
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('CREATE_CANDIDATE', {
      jobId: candJobId,
      fullName: candName,
      email: candEmail,
      phone: candPhone
    });
    if (res.success) {
      showToast('Candidate registered into applicant tracking pipeline', 'success');
      setShowAddCandidateModal(false);
      setCandName('');
      setCandEmail('');
      setCandPhone('');
    }
  };

  const handleOpenEvaluationModal = (cand: Candidate) => {
    setEvaluatingCandidate(cand);
    setEvalNotes(cand.interviewNotes || '');
    setEvalRating(cand.rating || 4);
    setOfferSalary(cand.offerDetails?.salary || '$75,000');
    setOfferStartDate(cand.offerDetails?.startDate || '2026-12-01');
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingCandidate) return;

    const res = await dispatch('UPDATE_CANDIDATE_STAGE', {
      id: evaluatingCandidate.id,
      stage: evaluatingCandidate.stage,
      interviewNotes: evalNotes,
      rating: evalRating
    });

    if (res.success) {
      showToast('Candidate evaluation notes and rating updated', 'success');
      setEvaluatingCandidate({
        ...evaluatingCandidate,
        interviewNotes: evalNotes,
        rating: evalRating
      });
    }
  };

  const handleSetStage = async (stage: CandidateStage) => {
    if (!evaluatingCandidate) return;
    const res = await dispatch('UPDATE_CANDIDATE_STAGE', {
      id: evaluatingCandidate.id,
      stage,
      interviewNotes: evalNotes,
      rating: evalRating
    });
    if (res.success) {
      showToast(`Candidate moved to ${stage}`, 'info');
      setEvaluatingCandidate({ ...evaluatingCandidate, stage });
    }
  };

  const handleExtendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingCandidate) return;

    const offerDetails: { salary: string; startDate: string; status: 'PENDING' | 'ACCEPTED' | 'DECLINED' } = {
      salary: offerSalary,
      startDate: offerStartDate,
      status: 'PENDING'
    };

    const res = await dispatch('UPDATE_CANDIDATE_STAGE', {
      id: evaluatingCandidate.id,
      stage: 'OFFER',
      offerDetails,
      interviewNotes: evalNotes,
      rating: evalRating
    });

    if (res.success) {
      showToast(`Official appointment offer extended (${offerSalary})`, 'success');
      setEvaluatingCandidate({
        ...evaluatingCandidate,
        stage: 'OFFER',
        offerDetails
      });
    }
  };

  const handleAdvanceStage = async (candidateId: string, currentStage: CandidateStage) => {
    const stageOrder: CandidateStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'];
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      const res = await dispatch('UPDATE_CANDIDATE_STAGE', {
        id: candidateId,
        stage: nextStage
      });
      if (res.success) {
        showToast(`Candidate moved to ${nextStage}`, 'info');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isEmployee
              ? 'CISD Career & Internal Staff Mobility Portal'
              : isLineManager
              ? 'Departmental Talent Review & Requisitions'
              : 'Talent Acquisition & Recruitment (ATS)'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEmployee
              ? 'Explore open requisitions across CISD Directorates, refer diplomatic candidates, or submit internal mobility applications'
              : isLineManager
              ? 'Review candidate pipelines for your directorate, record interview scores, and track active requisitions'
              : 'Diplomatic talent pipeline, candidate screenings, interview evaluations, and offer workflows'}
          </p>
        </div>

        {isEmployee ? (
          <button
            onClick={() => {
              setReferJobTitle(db.recruitmentJobs[0]?.title || 'Policy Fellow');
              setShowReferModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
          >
            <Send className="h-4 w-4 text-cisd-gold-400" />
            Refer a Candidate / Apply
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCandidateModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <Users className="h-4 w-4" />
              Add Applicant
            </button>
            {(isSuperAdmin || isHRAdmin) && (
              <button
                onClick={() => setShowCreateJobModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition"
              >
                <Plus className="h-4 w-4 text-cisd-gold-400" />
                Post Vacancy
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs: Vacancies vs Candidate Pipeline */}
      {!isEmployee ? (
        <div className="flex border-b border-slate-200 text-xs font-bold space-x-6">
          <button
            onClick={() => setActiveTabLocal('CANDIDATES')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'CANDIDATES'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Candidate Pipeline ({db.candidates.length})
          </button>
          <button
            onClick={() => setActiveTabLocal('VACANCIES')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'VACANCIES'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Vacancies ({db.recruitmentJobs.length})
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold text-cisd-navy-900">
          <Briefcase className="h-4 w-4 text-cisd-gold-600" />
          <span>Active Institutional Requisitions ({db.recruitmentJobs.length} Open Positions)</span>
        </div>
      )}

      {/* CANDIDATES PIPELINE VIEW */}
      {activeTab === 'CANDIDATES' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-semibold text-slate-500">Filter Position:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
              >
                <option value="ALL">All Requisitions</option>
                {db.recruitmentJobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-semibold text-slate-500">Pipeline Stage:</span>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
              >
                <option value="ALL">All Stages</option>
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="HIRED">Hired</option>
              </select>
            </div>
          </div>

          {/* Kanban / Cards by Stage */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {stages.map(st => {
              const stageCandidates = filteredCandidates.filter(c => c.stage === st.id);
              return (
                <div key={st.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-3 min-h-[380px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-xs">{st.label}</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stageCandidates.map(cand => {
                      const job = db.recruitmentJobs.find(j => j.id === cand.jobId);
                      return (
                        <div
                          key={cand.id}
                          onClick={() => handleOpenEvaluationModal(cand)}
                          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2 hover:border-cisd-navy-400 hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 text-xs hover:text-cisd-navy-900">{cand.fullName}</h4>
                            <div className="flex items-center text-amber-500">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-[10px] font-bold ml-0.5 text-slate-700">{cand.rating}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-cisd-navy-800 font-semibold truncate">{job?.title}</p>

                          <div className="space-y-0.5 text-[10px] text-slate-500">
                            <p className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span className="truncate">{cand.email}</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{cand.phone}</span>
                            </p>
                          </div>

                          {cand.interviewNotes && (
                            <p className="rounded bg-slate-50 p-1.5 text-[10px] text-slate-600 italic line-clamp-2">
                              &ldquo;{cand.interviewNotes}&rdquo;
                            </p>
                          )}

                          {cand.offerDetails && (
                            <div className="rounded bg-purple-50 p-2 text-[10px] text-purple-900 font-medium">
                              Offer: {cand.offerDetails.salary} (Start {cand.offerDetails.startDate})
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 font-medium">Click to evaluate</span>
                            {st.id !== 'HIRED' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceStage(cand.id, cand.stage);
                                }}
                                className="flex items-center gap-1 rounded bg-cisd-navy-900 px-2 py-0.5 font-bold text-white hover:bg-cisd-navy-800 shadow-sm"
                              >
                                Advance <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VACANCIES VIEW */}
      {activeTab === 'VACANCIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.recruitmentJobs.map(job => {
            const dept = db.departments.find(d => d.id === job.departmentId);
            const candidatesForJob = db.candidates.filter(c => c.jobId === job.id);

            return (
              <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="rounded bg-cisd-navy-100 text-cisd-navy-900 text-[10px] font-bold px-2 py-0.5">
                      {dept?.name}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{job.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isEmployee ? (
                      <>
                        <button
                          onClick={() => handleToggleJobStatus(job)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shadow-sm ${
                            job.status === 'OPEN'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {job.status === 'OPEN' ? 'Open' : 'Closed'}
                        </button>
                        {(isSuperAdmin || isHRAdmin) && (
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Archive Vacancy"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Accepting Applications
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>

                <div className="rounded-xl bg-slate-50 p-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Openings</span>
                    <span className="font-bold text-slate-800">{job.openings} Seat</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Experience Level</span>
                    <span className="font-bold text-slate-800">{job.experience}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Salary Band</span>
                    <span className="font-bold text-cisd-navy-900">{job.salaryRange}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Closing Date</span>
                    <span className="font-bold text-slate-800">{job.deadline}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">
                    {candidatesForJob.length} Total Applicants
                  </span>
                  {!isEmployee ? (
                    <button
                      onClick={() => { setSelectedJobId(job.id); setActiveTabLocal('CANDIDATES'); }}
                      className="flex items-center gap-1 font-bold text-cisd-navy-900 hover:underline text-xs"
                    >
                      View Pipeline <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setReferJobTitle(job.title);
                        setShowReferModal(true);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cisd-navy-800 transition shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5 text-cisd-gold-400" />
                      Refer / Apply
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Evaluation & Offer Modal */}
      {evaluatingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="rounded bg-cisd-navy-100 text-cisd-navy-900 text-[10px] font-bold px-2 py-0.5">
                  Candidate Dossier & Assessment
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{evaluatingCandidate.fullName}</h3>
                <p className="text-xs text-slate-500">
                  {db.recruitmentJobs.find(j => j.id === evaluatingCandidate.jobId)?.title} &bull; Applied {evaluatingCandidate.appliedDate}
                </p>
              </div>
              <button
                onClick={() => setEvaluatingCandidate(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 text-xs pr-1">
              {/* Pipeline Stage Quick Selector */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Pipeline Stage Progression:</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'] as CandidateStage[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleSetStage(st)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition text-center ${
                        evaluatingCandidate.stage === st
                          ? 'bg-cisd-navy-900 text-white shadow-sm ring-2 ring-cisd-navy-900/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Card */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Email Address</span>
                  <span className="font-semibold text-slate-800">{evaluatingCandidate.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phone Number</span>
                  <span className="font-semibold text-slate-800">{evaluatingCandidate.phone}</span>
                </div>
              </div>

              {/* Star Rating Selector */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Interview Rating (1-5 Stars):</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEvalRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= evalRating ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{evalRating} / 5 Stars</span>
                </div>
              </div>

              {/* Interview Notes Form */}
              <form onSubmit={handleSaveEvaluation} className="space-y-2">
                <label className="block font-semibold text-slate-700">Executive Interview Notes & Analysis:</label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Record dialogue performance, analytical rigor, geopolitical acumen, and cultural alignment..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-900 transition shadow-sm"
                >
                  Save Evaluation Notes
                </button>
              </form>

              {/* Formal Offer Extension Section */}
              {isSuperAdmin || isHRAdmin ? (
                <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-700" />
                    <h4 className="font-bold text-purple-950 text-xs">Formal Offer Formulation & Terms</h4>
                  </div>

                  <form onSubmit={handleExtendOffer} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-900 mb-1">Offered Base Salary</label>
                        <input
                          type="text"
                          value={offerSalary}
                          onChange={(e) => setOfferSalary(e.target.value)}
                          className="w-full rounded-lg border border-purple-200 bg-white p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-purple-900 mb-1">Proposed Start Date</label>
                        <input
                          type="date"
                          value={offerStartDate}
                          onChange={(e) => setOfferStartDate(e.target.value)}
                          className="w-full rounded-lg border border-purple-200 bg-white p-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-purple-200/60">
                      <span className="text-[10px] text-purple-800 font-medium">
                        Status: {evaluatingCandidate.offerDetails ? 'Offer Formulated' : 'No Active Offer'}
                      </span>
                      <button
                        type="submit"
                        className="rounded-lg bg-purple-700 px-4 py-2 font-bold text-white hover:bg-purple-800 transition shadow"
                      >
                        Extend Official Offer
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Award className="h-4 w-4 text-cisd-gold-600" />
                    Directorate Line Manager Assessment Scope
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Department Directorate heads record technical interview notes and candidate ratings. Formal remuneration terms, offer letters, and appointment contracts are formulated exclusively by the HR Directorate and Executive Director.
                  </p>
                </div>
              )}

              {/* Hired & Onboarding Action */}
              {evaluatingCandidate.stage === 'HIRED' && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-900 text-xs block">Candidate Confirmed Hired</span>
                    <span className="text-[11px] text-emerald-700">Ready to monitor orientation and milestone tracking</span>
                  </div>
                  <button
                    onClick={() => {
                      setEvaluatingCandidate(null);
                      setActiveTab('onboarding');
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow"
                  >
                    <UserCheck className="h-4 w-4" />
                    Open Onboarding Checklist
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setEvaluatingCandidate(null)}
                className="rounded-lg border px-4 py-1.5 text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showCreateJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Post New Recruitment Requisition</h3>
              <button onClick={() => setShowCreateJobModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Position Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Fellow on Multilateral Sanctions"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Directorate</label>
                  <select
                    value={jobDeptId}
                    onChange={(e) => setJobDeptId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    {db.departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Openings</label>
                  <input
                    type="number"
                    min="1"
                    value={jobOpenings}
                    onChange={(e) => setJobOpenings(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Salary Range</label>
                <input
                  type="text"
                  value={jobSalary}
                  onChange={(e) => setJobSalary(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Overview</label>
                <textarea
                  rows={3}
                  required
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Summary of strategic responsibilities..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateJobModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Publish Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Register Applicant into Pipeline</h3>
              <button onClick={() => setShowAddCandidateModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Requisition</label>
                <select
                  value={candJobId}
                  onChange={(e) => setCandJobId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  {db.recruitmentJobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Roland Marchand"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="candidate@example.org"
                  value={candEmail}
                  onChange={(e) => setCandEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+234 800 000 0000"
                  value={candPhone}
                  onChange={(e) => setCandPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddCandidateModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal Mobility & Candidate Referral Modal for Employees */}
      {showReferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <span className="rounded bg-cisd-gold-100 text-cisd-navy-900 text-[10px] font-bold px-2 py-0.5">
                  Internal Mobility & Referral
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  Express Interest or Refer Candidate
                </h3>
              </div>
              <button
                onClick={() => setShowReferModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(
                  `Application / referral for "${referJobTitle}" submitted directly to the HR Directorate`,
                  'success'
                );
                setShowReferModal(false);
                setReferCandidateName('');
                setReferCandidateEmail('');
                setReferNote('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Position</label>
                <input
                  type="text"
                  readOnly
                  value={referJobTitle}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Candidate / Staff Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={currentUser ? `${currentUser.firstName} ${currentUser.lastName} (or external referral name)` : 'Full Name'}
                  value={referCandidateName}
                  onChange={(e) => setReferCandidateName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="contact@example.org"
                  value={referCandidateEmail}
                  onChange={(e) => setReferCandidateEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Statement of Interest or Recommendation
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize relevant diplomatic experience, research credentials, and institutional motivation..."
                  value={referNote}
                  onChange={(e) => setReferNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowReferModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Submit to HR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
