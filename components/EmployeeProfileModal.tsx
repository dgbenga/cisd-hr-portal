'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  GraduationCap,
  Shield,
  Laptop,
  Clock,
  CalendarDays,
  Award,
  FileText,
  AlertCircle,
  X,
  Heart,
  Users2,
  Lock
} from 'lucide-react';

export default function EmployeeProfileModal() {
  const { db, selectedEmployeeIdForModal, setSelectedEmployeeIdForModal, currentUser } = usePortal();
  const [activeProfileTab, setActiveProfileTab] = useState<'OVERVIEW' | 'JOB' | 'EDUCATION' | 'ASSETS' | 'LEAVE' | 'PERFORMANCE' | 'DOCUMENTS'>('OVERVIEW');

  if (!selectedEmployeeIdForModal) return null;

  const emp = db?.employees.find(e => e.id === selectedEmployeeIdForModal);
  if (!emp) return null;

  const dept = db?.departments.find(d => d.id === emp.departmentId);
  const manager = db?.employees.find(e => e.id === emp.reportingManagerId);
  const assignedAssets = db?.assets.filter(a => a.assignedToId === emp.id) || [];
  const leaveBalance = db?.leaveBalances.find(b => b.employeeId === emp.id);
  const attendanceRecords = db?.attendanceRecords.filter(a => a.employeeId === emp.id) || [];
  const reviews = db?.performanceReviews.filter(r => r.employeeId === emp.id) || [];
  const documents = db?.documents.filter(d => d.employeeId === emp.id) || [];

  // Security & Confidentiality Clearance checks
  const isSuperAdminOrHR = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'HR_ADMIN';
  const isSelf = currentUser?.id === emp.id;
  const isDirectManager = currentUser?.id === emp.reportingManagerId;

  const canViewConfidentialDocs = isSuperAdminOrHR || isSelf;
  const canViewPerformance = isSuperAdminOrHR || isDirectManager || isSelf;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-cisd-navy-950 via-cisd-navy-900 to-cisd-navy-800 p-6 text-white">
          <button
            onClick={() => setSelectedEmployeeIdForModal(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img
              src={emp.avatar}
              alt={`${emp.firstName} ${emp.lastName}`}
              className="h-24 w-24 rounded-2xl object-cover border-2 border-cisd-gold-400 shadow-lg"
            />
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{emp.firstName} {emp.lastName}</h2>
                <span className="rounded-md bg-cisd-gold-500/20 border border-cisd-gold-400/30 px-2 py-0.5 text-xs font-semibold text-cisd-gold-300">
                  {emp.employeeId}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  emp.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  emp.status === 'ON_PROBATION' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                }`}>
                  {emp.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-300 font-medium">{emp.designation}</p>
              <p className="text-xs text-cisd-gold-300 mt-0.5">{dept?.name} &bull; {emp.gradeLevel}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-cisd-gold-400" />
                  {emp.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-cisd-gold-400" />
                  {emp.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-cisd-gold-400" />
                  {emp.workLocation}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold">
          {[
            { id: 'OVERVIEW', label: '360 Overview', isRestricted: false },
            { id: 'JOB', label: 'Employment Details', isRestricted: false },
            { id: 'EDUCATION', label: 'Education & Career', isRestricted: false },
            { id: 'ASSETS', label: `Assigned Assets (${assignedAssets.length})`, isRestricted: false },
            { id: 'LEAVE', label: 'Leave & Attendance', isRestricted: false },
            { id: 'PERFORMANCE', label: `Performance (${reviews.length})`, isRestricted: !canViewPerformance },
            { id: 'DOCUMENTS', label: `Documents (${documents.length})`, isRestricted: !canViewConfidentialDocs }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveProfileTab(tab.id as any)}
              className={`whitespace-nowrap px-4 py-3 border-b-2 transition flex items-center gap-1.5 ${
                activeProfileTab === tab.id
                  ? 'border-cisd-navy-900 text-cisd-navy-950 font-bold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {tab.isRestricted && (
                <Lock className="h-3 w-3 text-amber-500 inline-block" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 space-y-6">
          {/* 1. OVERVIEW */}
          {activeProfileTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-cisd-navy-900" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                    <span className="font-medium text-slate-800">{emp.personalInfo.dob}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gender</span>
                    <span className="font-medium text-slate-800">{emp.personalInfo.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nationality</span>
                    <span className="font-medium text-slate-800">{emp.personalInfo.nationality}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Marital Status</span>
                    <span className="font-medium text-slate-800">{emp.personalInfo.maritalStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Blood Group</span>
                    <span className="font-medium text-slate-800">{emp.personalInfo.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">NIN / Diplomatic Passport</span>
                    <span className="font-medium text-slate-800">{emp.personalInfo.ninOrPassport}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Residential Address</span>
                    <span className="font-medium text-slate-800">{emp.personalInfo.address}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts & Dependants */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-600" />
                    Emergency Contact
                  </h4>
                  {emp.emergencyContacts.length > 0 ? (
                    emp.emergencyContacts.map((contact, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 p-2.5 text-xs space-y-1">
                        <div className="flex justify-between font-medium text-slate-900">
                          <span>{contact.name}</span>
                          <span className="text-slate-500 text-[11px]">({contact.relationship})</span>
                        </div>
                        <p className="text-slate-600">{contact.phone} &bull; {contact.email}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No emergency contact registered.</p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-cisd-gold-600" />
                    Registered Dependants
                  </h4>
                  {emp.dependants.length > 0 ? (
                    <div className="space-y-1.5">
                      {emp.dependants.map((dep, i) => (
                        <div key={i} className="flex justify-between items-center rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs">
                          <span className="font-medium text-slate-800">{dep.name}</span>
                          <span className="text-slate-500 text-[11px]">{dep.relationship} (Born {dep.dob})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No dependants listed.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. JOB DETAILS */}
          {activeProfileTab === 'JOB' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-cisd-navy-900" />
                Employment & Institutional Placement
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-slate-400 block text-[11px]">Department / Division</span>
                  <span className="font-bold text-slate-900 text-sm">{dept?.name}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{dept?.location}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-slate-400 block text-[11px]">Employment Type</span>
                  <span className="font-bold text-slate-900 text-sm">{emp.employmentType.replace('_', ' ')}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Joined: {emp.joinDate}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-slate-400 block text-[11px]">Reporting Manager</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {manager ? `${manager.firstName} ${manager.lastName}` : 'Executive Directorate'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{manager?.designation || 'Board of Trustees'}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-slate-400 block text-[11px]">Salary Grade Code</span>
                  <span className="font-bold text-slate-900 text-sm">{emp.salaryGrade || 'N/A'}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-slate-400 block text-[11px]">Workstation Allocation</span>
                  <span className="font-bold text-slate-900 text-sm">{emp.workLocation}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-slate-400 block text-[11px]">System Role & RBAC</span>
                  <span className="font-bold text-cisd-navy-900 text-sm">{emp.role.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. EDUCATION & CAREER */}
          {activeProfileTab === 'EDUCATION' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-cisd-navy-900" />
                  Educational Credentials
                </h4>
                <div className="space-y-3">
                  {emp.education.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-cisd-gold-500 pl-3">
                      <p className="font-bold text-slate-900">{edu.degree}</p>
                      <p className="text-slate-600">{edu.institution} &bull; {edu.year}</p>
                      <p className="text-[11px] text-slate-400">{edu.field}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-cisd-navy-900" />
                  Professional Background
                </h4>
                <div className="space-y-3">
                  {emp.workExperience.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-cisd-navy-700 pl-3">
                      <p className="font-bold text-slate-900">{exp.role}</p>
                      <p className="text-slate-600">{exp.company} ({exp.fromYear} - {exp.toYear})</p>
                      <p className="text-[11px] text-slate-500 mt-1">{exp.highlights}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. ASSIGNED ASSETS */}
          {activeProfileTab === 'ASSETS' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Laptop className="h-4 w-4 text-cisd-navy-900" />
                Assigned Institutional Hardware & Property
              </h4>
              {assignedAssets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignedAssets.map((asset) => (
                    <div key={asset.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 text-xs">{asset.name}</span>
                        <span className="rounded bg-cisd-navy-900 text-white font-mono text-[10px] px-1.5 py-0.5">
                          {asset.assetCode}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px]">Serial: <span className="font-mono text-slate-700">{asset.serialNumber}</span></p>
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Condition: <span className="font-semibold text-slate-800">{asset.condition}</span></span>
                        <span className="text-slate-400">Assigned: {asset.assignedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic p-4 text-center">No institutional assets currently assigned to this profile.</p>
              )}
            </div>
          )}

          {/* 5. LEAVE & ATTENDANCE */}
          {activeProfileTab === 'LEAVE' && (
            <div className="space-y-6">
              {/* Balances */}
              {leaveBalance && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Leave Entitlements & Balances</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-center">
                      <span className="text-[11px] text-emerald-800 font-semibold block">Annual Leave</span>
                      <span className="text-xl font-bold text-emerald-900">{leaveBalance.annualTotal - leaveBalance.annualUsed}</span>
                      <span className="text-[10px] text-emerald-600 block">days left of {leaveBalance.annualTotal}</span>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
                      <span className="text-[11px] text-blue-800 font-semibold block">Sick Leave</span>
                      <span className="text-xl font-bold text-blue-900">{leaveBalance.sickTotal - leaveBalance.sickUsed}</span>
                      <span className="text-[10px] text-blue-600 block">days left of {leaveBalance.sickTotal}</span>
                    </div>
                    <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-center">
                      <span className="text-[11px] text-amber-800 font-semibold block">Casual Leave</span>
                      <span className="text-xl font-bold text-amber-900">{leaveBalance.casualTotal - leaveBalance.casualUsed}</span>
                      <span className="text-[10px] text-amber-600 block">days left of {leaveBalance.casualTotal}</span>
                    </div>
                    <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 text-center">
                      <span className="text-[11px] text-purple-800 font-semibold block">Unpaid / Other</span>
                      <span className="text-xl font-bold text-purple-900">{leaveBalance.unpaidUsed}</span>
                      <span className="text-[10px] text-purple-600 block">days taken</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Attendance */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Recent Attendance Logs</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-[10px] font-bold text-slate-400 uppercase">
                        <th className="py-2">Date</th>
                        <th className="py-2">Clock In</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Work Mode</th>
                        <th className="py-2">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceRecords.map(a => (
                        <tr key={a.id} className="text-xs">
                          <td className="py-2 font-medium">{a.date}</td>
                          <td className="py-2">{a.clockIn}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              a.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                              a.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                              a.status === 'REMOTE' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="py-2">{a.workType}</td>
                          <td className="py-2 text-slate-500">{a.locationName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. PERFORMANCE */}
          {activeProfileTab === 'PERFORMANCE' && (
            <div className="space-y-4">
              {!canViewPerformance ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-amber-900 text-sm">Confidential Performance Dossier</h4>
                  <p className="text-xs text-amber-700 max-w-md mx-auto">
                    Appraisal scores, ratings, and strategic development goals are restricted under CISD diplomatic protocols to Executive Leadership, HR Directorate, and the designated Reporting Manager.
                  </p>
                </div>
              ) : reviews.length > 0 ? (
                reviews.map(rev => (
                  <div key={rev.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{rev.cycle}</h4>
                        <span className="text-[11px] text-slate-400">Completed on {rev.createdAt}</span>
                      </div>
                      <div className="rounded-xl bg-cisd-gold-50 border border-cisd-gold-200 px-3 py-1.5 text-center">
                        <span className="text-[10px] uppercase font-bold text-cisd-gold-700 block">Overall Score</span>
                        <span className="text-lg font-black text-cisd-gold-900">{rev.finalScore} / 5.0</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-800">Key Strengths:</p>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg">{rev.strengths}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-800">Professional Development Plan:</p>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg">{rev.developmentPlan}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic p-6 text-center">No finalized appraisal cycles on file for this staff member.</p>
              )}
            </div>
          )}

          {/* 7. DOCUMENTS */}
          {activeProfileTab === 'DOCUMENTS' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-cisd-navy-900" />
                Staff Dossier & Confidential Documents
              </h4>
              {!canViewConfidentialDocs ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-amber-900 text-sm">Access Restricted</h4>
                  <p className="text-xs text-amber-700 max-w-md mx-auto">
                    Individual personnel contracts, appointment credentials, and diplomatic identification forms are classified under the CISD Personnel Privacy Framework.
                  </p>
                </div>
              ) : documents.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {documents.map(doc => (
                    <div key={doc.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">{doc.title}</p>
                        <p className="text-[11px] text-slate-400">Uploaded {doc.uploadedDate} &bull; {doc.fileSize} &bull; {doc.category}</p>
                      </div>
                      <a
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-cisd-navy-900 hover:bg-slate-100 transition"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic p-4 text-center">No confidential individual documents attached.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
