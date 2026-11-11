'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  User,
  Calendar,
  Camera,
  Award,
  Sparkles,
  Clock,
  Building,
  Mail,
  Phone,
  MapPin,
  Shield,
  CheckCircle2,
  Heart,
  Save,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  KeyRound,
  FileText,
  Printer,
  ChevronRight,
  Gift,
  PartyPopper
} from 'lucide-react';
import { Employee, UserRole, getOrganizationArmConfig } from '@/lib/types';

// Pre-curated diplomatic portraits for quick selection
const CURATED_AVATARS = [
  { label: 'Diplomat Alpha', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { label: 'Diplomat Beta', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Diplomat Gamma', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { label: 'Diplomat Delta', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Diplomat Epsilon', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
  { label: 'Diplomat Zeta', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
  { label: 'Diplomat Eta', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { label: 'Diplomat Theta', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
];

export default function PersonalProfileModule() {
  const { currentUser, db, dispatch, showToast, refreshData } = usePortal();

  if (!currentUser || !db) return null;

  const currentEmp = db.employees.find(e => e.id === currentUser.id) || currentUser;
  const currentDept = db.departments.find(d => d.id === currentEmp.departmentId);

  // Form State
  const [firstName, setFirstName] = useState(currentEmp.firstName || '');
  const [lastName, setLastName] = useState(currentEmp.lastName || '');
  const [email, setEmail] = useState(currentEmp.email || '');
  const [phone, setPhone] = useState(currentEmp.phone || '');
  const [avatar, setAvatar] = useState(currentEmp.avatar || CURATED_AVATARS[0].url);
  const [joinDate, setJoinDate] = useState(currentEmp.joinDate || '2023-08-15');
  const [workLocation, setWorkLocation] = useState(currentEmp.workLocation || 'Abuja Head Office');
  const [designation, setDesignation] = useState(currentEmp.designation || '');
  
  // Personal Info
  const [dob, setDob] = useState(currentEmp.personalInfo?.dob || '1990-05-15');
  const [gender, setGender] = useState(currentEmp.personalInfo?.gender || 'Male');
  const [maritalStatus, setMaritalStatus] = useState(currentEmp.personalInfo?.maritalStatus || 'Single');
  const [nationality, setNationality] = useState(currentEmp.personalInfo?.nationality || 'Nigerian');
  const [address, setAddress] = useState(currentEmp.personalInfo?.address || 'Abuja, Nigeria');
  const [bloodGroup, setBloodGroup] = useState(currentEmp.personalInfo?.bloodGroup || 'O+');
  const [ninOrPassport, setNinOrPassport] = useState(currentEmp.personalInfo?.ninOrPassport || 'NIN-10029482');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState(currentEmp.emergencyContacts?.[0]?.name || 'Next of Kin');
  const [emergencyRel, setEmergencyRel] = useState(currentEmp.emergencyContacts?.[0]?.relationship || 'Sibling');
  const [emergencyPhone, setEmergencyPhone] = useState(currentEmp.emergencyContacts?.[0]?.phone || '+234 800 000 0000');
  const [emergencyEmail, setEmergencyEmail] = useState(currentEmp.emergencyContacts?.[0]?.email || 'kin@example.com');

  // Password Update
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PHOTOS' | 'START_DATE' | 'DETAILS' | 'SECURITY'>('OVERVIEW');

  // =========================================================================
  // DYNAMIC TENURE & ANNIVERSARY CALCULATIONS
  // =========================================================================
  const portalToday = new Date('2026-11-05'); // Simulation benchmark date
  const startObj = new Date(joinDate || '2023-08-15');

  let years = portalToday.getFullYear() - startObj.getFullYear();
  let months = portalToday.getMonth() - startObj.getMonth();
  let days = portalToday.getDate() - startObj.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(portalToday.getFullYear(), portalToday.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Absolute total days
  const totalMilliseconds = Math.max(0, portalToday.getTime() - startObj.getTime());
  const totalElapsedDays = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
  const totalElapsedMonths = years * 12 + months;

  // Next work anniversary
  let nextAnniversary = new Date(portalToday.getFullYear(), startObj.getMonth(), startObj.getDate());
  if (nextAnniversary < portalToday) {
    nextAnniversary = new Date(portalToday.getFullYear() + 1, startObj.getMonth(), startObj.getDate());
  }
  const daysUntilAnniversary = Math.ceil((nextAnniversary.getTime() - portalToday.getTime()) / (1000 * 60 * 60 * 24));
  const milestoneCelebrating = years + (daysUntilAnniversary === 0 ? 0 : 1);
  const isAnniversaryThisMonth = portalToday.getMonth() === startObj.getMonth();
  const isAnniversaryToday = daysUntilAnniversary === 0;

  // Service honors determination
  let milestoneTitle = 'Diplomatic Foundation Fellow';
  let medalColor = 'bg-amber-100 text-amber-800 border-amber-300';
  if (years >= 10) {
    milestoneTitle = 'Grand Commander Vanguard Laureate';
    medalColor = 'bg-purple-100 text-purple-900 border-purple-300';
  } else if (years >= 5) {
    milestoneTitle = 'Executive Diplomatic Medal of Honor';
    medalColor = 'bg-blue-100 text-blue-900 border-blue-300';
  } else if (years >= 3) {
    milestoneTitle = 'Distinguished Strategic Dialogue Fellowship';
    medalColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  } else if (years >= 1) {
    milestoneTitle = 'Diplomatic Service Commendation';
    medalColor = 'bg-cisd-gold-100 text-cisd-gold-900 border-cisd-gold-400';
  }

  // Handle Local Photo Upload (FileReader -> Base64)
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit. Please upload a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setAvatar(base64Url);
      showToast('Photo uploaded and preview ready. Click Save Profile to persist.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Changes
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      showToast('New passwords do not match. Please verify.', 'error');
      return;
    }

    setIsSaving(true);
    const payload: any = {
      id: currentEmp.id,
      firstName,
      lastName,
      email,
      phone,
      avatar,
      joinDate,
      workLocation,
      personalInfo: {
        ...currentEmp.personalInfo,
        dob,
        gender: gender as any,
        maritalStatus: maritalStatus as any,
        nationality,
        address,
        bloodGroup,
        ninOrPassport
      },
      emergencyContacts: [
        {
          name: emergencyName,
          relationship: emergencyRel,
          phone: emergencyPhone,
          email: emergencyEmail
        }
      ]
    };

    // If password provided, update it
    if (newPassword) {
      payload.password = newPassword;
    }

    // If current user is privileged (Super Admin or HR Admin), allow designation modification
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN') {
      payload.designation = designation;
    }

    const res = await dispatch('UPDATE_EMPLOYEE', payload);
    setIsSaving(false);

    if (res.success) {
      showToast('Personal Profile, Photo & Official Start Date saved successfully!', 'success');
      setNewPassword('');
      setConfirmPassword('');
      await refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP CELEBRATION & SERVICE MILESTONE HERO BANNER                        */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cisd-navy-950 via-slate-900 to-cisd-navy-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative gold glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cisd-gold-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar and Welcome */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={avatar}
                alt={`${firstName} ${lastName}`}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl object-cover border-4 border-cisd-gold-400 shadow-2xl"
              />
              <button
                onClick={() => setActiveTab('PHOTOS')}
                className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-xl bg-cisd-navy-900 border border-cisd-gold-400 text-cisd-gold-400 hover:scale-110 shadow transition"
                title="Change Photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-cisd-gold-500/20 text-cisd-gold-400 border border-cisd-gold-500/30 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider">
                  {currentEmp.employeeId}
                </span>
                <span className="rounded-md bg-white/10 border border-white/20 px-2.5 py-0.5 text-[11px] font-bold text-slate-200">
                  {currentDept?.name}
                </span>
                {(() => {
                  const armCfg = getOrganizationArmConfig(currentEmp.organizationArm);
                  return (
                    <span className="rounded-md bg-white/10 border border-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {armCfg.label}
                    </span>
                  );
                })()}
                {currentEmp.accessLevel && (
                  <span className="rounded-md bg-cisd-gold-500/30 border border-cisd-gold-400/40 px-2.5 py-0.5 text-[11px] font-mono font-bold text-cisd-gold-200">
                    {currentEmp.accessLevel}
                  </span>
                )}
                <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold">
                  Active Diplomatic Personnel
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {firstName} {lastName}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {designation || currentEmp.designation} &bull; {workLocation}
              </p>

              {/* Service Milestone Badge */}
              <div className="flex items-center gap-2 pt-1">
                <Award className="h-4 w-4 text-cisd-gold-400" />
                <span className="text-xs font-bold text-cisd-gold-300">
                  {milestoneTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-end">
            <button
              onClick={() => setShowCertificateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cisd-gold-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-lg transition active:scale-95"
            >
              <Award className="h-4 w-4" />
              <span>Service Certificate</span>
            </button>

            <button
              onClick={() => handleSaveProfile()}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur shadow transition active:scale-95"
            >
              <Save className="h-4 w-4 text-emerald-400" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>

        {/* Celebration Notification Bar if Anniversary is Near */}
        {(isAnniversaryThisMonth || daysUntilAnniversary <= 60) && (
          <div className="relative z-10 mt-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-cisd-gold-500/15 to-emerald-500/20 border border-cisd-gold-400/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cisd-gold-400 text-slate-950 font-black shadow">
                <PartyPopper className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-sm text-cisd-gold-300">
                  {isAnniversaryToday
                    ? `🎉 Happy Work Anniversary! Celebrating ${years} Years at CISD Today!`
                    : `Upcoming Service Milestone: Celebrating ${milestoneCelebrating} Years at CISD!`}
                </p>
                <p className="text-xs text-slate-300">
                  {isAnniversaryToday
                    ? `The Executive Directorate salutes your ${years} years of dedicated strategic foresight and diplomacy.`
                    : `Your next official work anniversary occurs in ${daysUntilAnniversary} days on ${nextAnniversary.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="text-xs font-bold text-cisd-gold-400 hover:text-white underline flex items-center gap-1"
            >
              <span>View Service Recognition</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. LIVE SERVICE TENURE BREAKDOWN TILES (CALCULATED FROM START DATE)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Start Date</span>
          <p className="text-lg font-black text-slate-900 mt-1">
            {new Date(joinDate || '2023-08-15').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-cisd-navy-700 font-semibold pt-1">
            <Calendar className="h-3 w-3" />
            <span>Indoctrination Day</span>
          </div>
        </div>

        <div className="rounded-2xl border border-cisd-gold-200 bg-cisd-gold-50/50 p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-cisd-gold-800 uppercase tracking-wider block">Total Service Tenure</span>
          <p className="text-xl font-black text-cisd-navy-950 mt-1">
            {years} <span className="text-xs font-medium text-slate-500">Yrs</span> {months} <span className="text-xs font-medium text-slate-500">Mos</span> {days} <span className="text-xs font-medium text-slate-500">Days</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] text-cisd-gold-800 font-bold pt-1">
            <Sparkles className="h-3 w-3 text-cisd-gold-600" />
            <span>{totalElapsedDays.toLocaleString()} calendar days logged</span>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Service Milestone</span>
          <p className="text-2xl font-black text-blue-900 mt-1">
            Year {years >= 1 ? years : '1 (Probation)'}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-blue-700 font-semibold pt-1">
            <Award className="h-3 w-3" />
            <span>{totalElapsedMonths} months of service</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Next Anniversary</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {daysUntilAnniversary === 0 ? 'Today! 🎊' : `In ${daysUntilAnniversary} Days`}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold pt-1">
            <Gift className="h-3 w-3" />
            <span>Milestone Year {milestoneCelebrating}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PROFILE SETUP & CONFIGURATION SUB-TABS                                */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {/* Sub-tabs header */}
        <div className="flex flex-wrap border-b border-slate-200 text-xs font-bold gap-6">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'OVERVIEW'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Personal Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab('PHOTOS')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'PHOTOS'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Photo & Avatar Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('START_DATE')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'START_DATE'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Start Date & Service Tenure</span>
          </button>

          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'DETAILS'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Emergency Contacts & Identity</span>
          </button>

          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'SECURITY'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Account Security & Password</span>
          </button>
        </div>

        {/* --- SUBTAB 1: OVERVIEW / PERSONAL DOSSIER --- */}
        {activeTab === 'OVERVIEW' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Login & Official Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  You can use this email to sign into the CISD portal.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Direct Telephone / Mobile</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Diplomatic Work Location</label>
                <input
                  type="text"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Institutional Designation</label>
                <input
                  type="text"
                  disabled={currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'HR_ADMIN'}
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className={`w-full rounded-xl border border-slate-200 p-2.5 text-xs ${
                    currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'HR_ADMIN'
                      ? 'bg-slate-50 text-slate-500 cursor-not-allowed'
                      : 'focus:ring-1 focus:ring-cisd-navy-600'
                  }`}
                />
                {currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'HR_ADMIN' && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Official title adjustments require HR Directorate clearance.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-cisd-navy-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow"
              >
                <Save className="h-4 w-4 text-cisd-gold-400" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Personal Dossier'}</span>
              </button>
            </div>
          </form>
        )}

        {/* --- SUBTAB 2: PHOTO & AVATAR STUDIO --- */}
        {activeTab === 'PHOTOS' && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Current Preview Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Active Portrait</span>
                <img
                  src={avatar}
                  alt="Portrait Preview"
                  className="h-36 w-36 rounded-3xl object-cover mx-auto border-4 border-cisd-gold-400 shadow-xl"
                />
                <p className="font-bold text-slate-900 text-xs">{firstName} {lastName}</p>
                <p className="text-[11px] text-slate-500">{designation}</p>
              </div>

              {/* Upload Options */}
              <div className="md:col-span-2 space-y-5">
                <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center space-y-3 bg-white hover:bg-slate-50/50 transition">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cisd-navy-50 text-cisd-navy-900 border mx-auto">
                    <Upload className="h-6 w-6 text-cisd-navy-800" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Upload Photo From Your Device</h4>
                    <p className="text-[11px] text-slate-500">Supports PNG, JPG, or WebP up to 5MB. Photo is saved directly to your profile.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition">
                    <Camera className="h-4 w-4 text-cisd-gold-400" />
                    <span>Browse Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Pre-Curated Portraits Gallery */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-cisd-gold-500" />
                    <span>Or Select a Pre-Curated Diplomatic Headshot</span>
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {CURATED_AVATARS.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setAvatar(item.url);
                          showToast(`Selected ${item.label}. Click Save Profile to apply.`, 'info');
                        }}
                        className={`cursor-pointer rounded-2xl overflow-hidden border-2 p-0.5 transition hover:scale-105 ${
                          avatar === item.url ? 'border-cisd-gold-500 ring-2 ring-cisd-gold-400/40' : 'border-transparent'
                        }`}
                        title={item.label}
                      >
                        <img
                          src={item.url}
                          alt={item.label}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom URL Input */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Custom Image Web Link (URL)</label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.example.com/photo.jpg"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleSaveProfile()}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl bg-cisd-navy-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow"
                  >
                    <Save className="h-4 w-4 text-cisd-gold-400" />
                    <span>{isSaving ? 'Saving...' : 'Apply & Save Portrait'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- SUBTAB 3: START DATE & TENURE MILESTONES --- */}
        {activeTab === 'START_DATE' && (
          <div className="space-y-6 text-xs">
            <div className="rounded-2xl border border-cisd-gold-200 bg-cisd-gold-50/40 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cisd-gold-400 text-slate-950 font-black flex-shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-950 text-sm">Official Work Start Date & Milestone Engine</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Setting your official commencement date allows the CISD system to track your exact tenure, calculate seniority rankings, celebrate your annual work anniversaries, and issue diplomatic service awards.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <label className="block font-bold text-slate-800 mb-1">
                    Commencement Date (The Day You Officially Started Work at CISD)
                  </label>
                  <input
                    type="date"
                    required
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-cisd-navy-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={isSaving}
                  className="sm:self-end flex items-center justify-center gap-2 rounded-xl bg-cisd-navy-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  <Save className="h-4 w-4 text-cisd-gold-400" />
                  <span>Update & Recalculate Tenure</span>
                </button>
              </div>
            </div>

            {/* Detailed Career Milestones Timeline */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-cisd-gold-600" />
                <span>CISD Diplomatic Service Milestones Roadmap</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className={`rounded-xl border p-4 space-y-2 ${years >= 1 ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-900">1 Year Milestone</span>
                    {years >= 1 ? (
                      <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">Achieved ✅</span>
                    ) : (
                      <span className="rounded bg-slate-200 text-slate-600 px-2 py-0.5 text-[10px] font-bold">In Progress ⏳</span>
                    )}
                  </div>
                  <p className="font-bold text-slate-800 text-xs">Diplomatic Foundation Award</p>
                  <p className="text-[11px] text-slate-500">Completion of the initial year of diplomatic foresight and institutional service.</p>
                </div>

                <div className={`rounded-xl border p-4 space-y-2 ${years >= 3 ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-900">3 Years Milestone</span>
                    {years >= 3 ? (
                      <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">Achieved ✅</span>
                    ) : (
                      <span className="rounded bg-slate-200 text-slate-600 px-2 py-0.5 text-[10px] font-bold">In Progress ⏳</span>
                    )}
                  </div>
                  <p className="font-bold text-slate-800 text-xs">Strategic Foresight Fellowship</p>
                  <p className="text-[11px] text-slate-500">Conferred upon senior research fellows and operations specialists of sustained excellence.</p>
                </div>

                <div className={`rounded-xl border p-4 space-y-2 ${years >= 5 ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-900">5 Years Milestone</span>
                    {years >= 5 ? (
                      <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">Achieved ✅</span>
                    ) : (
                      <span className="rounded bg-slate-200 text-slate-600 px-2 py-0.5 text-[10px] font-bold">In Progress ⏳</span>
                    )}
                  </div>
                  <p className="font-bold text-slate-800 text-xs">Distinguished Service Medal</p>
                  <p className="text-[11px] text-slate-500">Executive recognition of substantial leadership in multilateral Track II negotiations.</p>
                </div>

                <div className={`rounded-xl border p-4 space-y-2 ${years >= 10 ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-900">10 Years Milestone</span>
                    {years >= 10 ? (
                      <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">Achieved ✅</span>
                    ) : (
                      <span className="rounded bg-slate-200 text-slate-600 px-2 py-0.5 text-[10px] font-bold">In Progress ⏳</span>
                    )}
                  </div>
                  <p className="font-bold text-slate-800 text-xs">Founding Vanguard Laureate</p>
                  <p className="text-[11px] text-slate-500">The highest honor of permanent institutional heritage and founding leadership.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- SUBTAB 4: IDENTITY, EMERGENCY & BIOMETRICS --- */}
        {activeTab === 'DETAILS' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 border-b pb-2 mb-3 text-xs uppercase text-slate-400">
                Personal Identification & Demographics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIN / Diplomatic Passport</label>
                  <input
                    type="text"
                    value={ninOrPassport}
                    onChange={(e) => setNinOrPassport(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 border-b pb-2 mb-3 text-xs uppercase text-slate-400">
                Emergency Contact & Next of Kin
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Full Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={emergencyRel}
                    onChange={(e) => setEmergencyRel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Email</label>
                  <input
                    type="email"
                    value={emergencyEmail}
                    onChange={(e) => setEmergencyEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-cisd-navy-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow"
              >
                <Save className="h-4 w-4 text-cisd-gold-400" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Emergency & Identity Info'}</span>
              </button>
            </div>
          </form>
        )}

        {/* --- SUBTAB 5: ACCOUNT SECURITY & PASSWORD --- */}
        {activeTab === 'SECURITY' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs max-w-xl">
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                <p className="font-bold text-slate-900">Portal Authentication Password</p>
                <p className="text-slate-500 text-[11px]">
                  You can change your portal sign-in password at any time. It will take effect immediately across all sessions.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Confidential Password</label>
                <input
                  type="password"
                  placeholder="Enter new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                />
              </div>
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="submit"
                disabled={isSaving || !newPassword}
                className="flex items-center gap-2 rounded-xl bg-cisd-navy-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow disabled:opacity-50"
              >
                <KeyRound className="h-4 w-4 text-cisd-gold-400" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. DIPLOMATIC CERTIFICATE OF SERVICE RECOGNITION (PRINTABLE MODAL)        */}
      {/* ========================================================================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl border-4 border-cisd-gold-400 relative text-center space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold"
            >
              &times;
            </button>

            {/* Emblem */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cisd-navy-900 border-2 border-cisd-gold-400 shadow-lg">
              <span className="font-serif font-black text-lg text-cisd-gold-400 tracking-wider">CISD</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cisd-gold-700 font-bold">
                Centre for International Strategic Dialogue
              </span>
              <h3 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
                Certificate of Diplomatic Service
              </h3>
              <p className="text-xs text-slate-500 italic">Conferred in Honor of Dedicated Institutional Contribution</p>
            </div>

            <div className="py-2 space-y-2">
              <p className="text-xs text-slate-500">This official scroll hereby recognizes and commends</p>
              <h4 className="text-2xl font-black text-cisd-navy-950 underline decoration-cisd-gold-400 underline-offset-4">
                {firstName} {lastName}
              </h4>
              <p className="text-xs font-bold text-cisd-gold-800">{designation}</p>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed pt-2">
                For distinguished and devoted service rendered to the Centre for International Strategic Dialogue since commencement on{' '}
                <strong className="text-slate-900">{new Date(joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>,
                marking an accomplished tenure of:
              </p>
              
              <div className="inline-block rounded-2xl bg-cisd-navy-50 border border-cisd-navy-200 px-6 py-2.5 mt-2">
                <span className="text-lg font-black text-cisd-navy-900">
                  {years} Years, {months} Months, and {days} Days of Excellence
                </span>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 px-8">
              <div className="text-center">
                <p className="font-serif italic font-bold text-slate-800">Dr. Amina Bello</p>
                <div className="w-32 border-b border-slate-400 mx-auto my-1" />
                <p className="text-[10px] text-slate-400">Super Administrator & Director</p>
              </div>

              <div className="text-center">
                <p className="font-serif italic font-bold text-slate-800">Dr. Fatima Al-Mansoor</p>
                <div className="w-32 border-b border-slate-400 mx-auto my-1" />
                <p className="text-[10px] text-slate-400">Head of Human Resources</p>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl bg-cisd-navy-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow"
              >
                <Printer className="h-4 w-4 text-cisd-gold-400" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

