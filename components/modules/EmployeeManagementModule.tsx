'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Users,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Building,
  MapPin,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  ArrowUpDown,
  Download,
  Award,
  KeyRound,
  Copy,
  Check,
  Lock,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Employee, EmploymentStatus, EmploymentType, UserRole } from '@/lib/types';

export default function EmployeeManagementModule() {
  const { db, currentUser, setSelectedEmployeeIdForModal, dispatch, showToast } = usePortal();

  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'NAME' | 'JOIN_DATE' | 'DEPARTMENT'>('NAME');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Promote Personnel Modal State
  const [promotingEmployee, setPromotingEmployee] = useState<Employee | null>(null);
  const [promoteRole, setPromoteRole] = useState<UserRole>('LINE_MANAGER');
  const [promoteDesignation, setPromoteDesignation] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);

  // Reset Password Modal State
  const [resettingEmployee, setResettingEmployee] = useState<Employee | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Created / Updated Credentials Receipt Modal State
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    employeeId: string;
    email: string;
    password: string;
    role: UserRole;
    designation: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pwd = 'Cisd#';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'CISD@2026',
    phone: '',
    departmentId: 'dept-2',
    designation: '',
    role: 'EMPLOYEE' as UserRole,
    status: 'ACTIVE' as EmploymentStatus,
    employmentType: 'FULL_TIME' as EmploymentType,
    joinDate: new Date().toISOString().split('T')[0],
    workLocation: 'Abuja Head Office',
    gradeLevel: 'Officer Level 4',
    salaryGrade: 'OFF-O2',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    dob: '1992-05-10',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    maritalStatus: 'Single' as 'Single' | 'Married' | 'Divorced',
    nationality: 'Nigerian',
    address: 'Abuja, Nigeria',
    bloodGroup: 'O+',
    ninOrPassport: 'NIN-10029482',
    degree: 'B.Sc. Political Science',
    institution: 'University of Abuja',
    eduYear: '2015',
    eduField: 'Social Sciences',
    emergencyName: 'Family Member',
    emergencyRel: 'Sibling',
    emergencyPhone: '+234 800 000 0000',
    emergencyEmail: 'family@example.com'
  });

  if (!db) return null;

  // Filter & Search logic
  const filteredEmployees = db.employees.filter(emp => {
    const matchesDept = filterDept === 'ALL' || emp.departmentId === filterDept;
    const matchesStatus = filterStatus === 'ALL' || emp.status === filterStatus;
    const matchesType = filterType === 'ALL' || emp.employmentType === filterType;
    const q = search.toLowerCase();
    const matchesSearch =
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.employeeId.toLowerCase().includes(q) ||
      emp.designation.toLowerCase().includes(q);
    return matchesDept && matchesStatus && matchesType && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'NAME') return a.firstName.localeCompare(b.firstName);
    if (sortBy === 'JOIN_DATE') return b.joinDate.localeCompare(a.joinDate);
    return a.departmentId.localeCompare(b.departmentId);
  });

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    const initialPwd = generateSecurePassword();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: initialPwd,
      phone: '',
      departmentId: db.departments[0]?.id || 'dept-1',
      designation: '',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      joinDate: new Date().toISOString().split('T')[0],
      workLocation: 'Abuja Head Office',
      gradeLevel: 'Officer Level 4',
      salaryGrade: 'OFF-O2',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      dob: '1992-05-10',
      gender: 'Male',
      maritalStatus: 'Single',
      nationality: 'Nigerian',
      address: 'Abuja, Nigeria',
      bloodGroup: 'O+',
      ninOrPassport: 'NIN-10029482',
      degree: 'B.Sc. Political Science',
      institution: 'University of Abuja',
      eduYear: '2015',
      eduField: 'Social Sciences',
      emergencyName: 'Next of Kin',
      emergencyRel: 'Sibling',
      emergencyPhone: '+234 800 000 0000',
      emergencyEmail: 'kin@example.com'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      password: emp.password || 'CISD@2026',
      phone: emp.phone,
      departmentId: emp.departmentId,
      designation: emp.designation,
      role: emp.role,
      status: emp.status,
      employmentType: emp.employmentType,
      joinDate: emp.joinDate,
      workLocation: emp.workLocation,
      gradeLevel: emp.gradeLevel,
      salaryGrade: emp.salaryGrade || 'OFF-O2',
      avatar: emp.avatar,
      dob: emp.personalInfo.dob,
      gender: emp.personalInfo.gender,
      maritalStatus: emp.personalInfo.maritalStatus,
      nationality: emp.personalInfo.nationality,
      address: emp.personalInfo.address,
      bloodGroup: emp.personalInfo.bloodGroup,
      ninOrPassport: emp.personalInfo.ninOrPassport,
      degree: emp.education[0]?.degree || '',
      institution: emp.education[0]?.institution || '',
      eduYear: emp.education[0]?.year || '',
      eduField: emp.education[0]?.field || '',
      emergencyName: emp.emergencyContacts[0]?.name || '',
      emergencyRel: emp.emergencyContacts[0]?.relationship || '',
      emergencyPhone: emp.emergencyContacts[0]?.phone || '',
      emergencyEmail: emp.emergencyContacts[0]?.email || ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      departmentId: formData.departmentId,
      designation: formData.designation,
      role: formData.role,
      status: formData.status,
      employmentType: formData.employmentType,
      joinDate: formData.joinDate,
      workLocation: formData.workLocation,
      gradeLevel: formData.gradeLevel,
      salaryGrade: formData.salaryGrade,
      avatar: formData.avatar,
      personalInfo: {
        dob: formData.dob,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        ninOrPassport: formData.ninOrPassport
      },
      education: [
        {
          degree: formData.degree,
          institution: formData.institution,
          year: formData.eduYear,
          field: formData.eduField
        }
      ],
      workExperience: [
        {
          company: 'Pre-CISD Institution',
          role: 'Professional Specialist',
          fromYear: '2020',
          toYear: '2024',
          highlights: 'Contributed to strategic research and regional projects.'
        }
      ],
      emergencyContacts: [
        {
          name: formData.emergencyName,
          relationship: formData.emergencyRel,
          phone: formData.emergencyPhone,
          email: formData.emergencyEmail
        }
      ],
      dependants: []
    };

    if (editingEmployee) {
      const res = await dispatch('UPDATE_EMPLOYEE', { id: editingEmployee.id, ...payload });
      if (res.success) {
        showToast('Staff profile updated successfully', 'success');
        setShowAddModal(false);
      }
    } else {
      const res = await dispatch('ADD_EMPLOYEE', payload);
      if (res.success && res.data) {
        showToast('Staff account created and registered in SQLite database', 'success');
        setShowAddModal(false);
        setCreatedCredentials({
          name: `${res.data.firstName} ${res.data.lastName}`,
          employeeId: res.data.employeeId,
          email: res.data.email,
          password: formData.password || 'CISD@2026',
          role: res.data.role,
          designation: res.data.designation
        });
      }
    }
  };

  const handleOpenPromote = (emp: Employee) => {
    setPromotingEmployee(emp);
    setPromoteRole(emp.role);
    setPromoteDesignation(emp.designation);
  };

  const handleConfirmPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingEmployee) return;

    if (currentUser.role === 'HR_ADMIN' && (promoteRole === 'SUPER_ADMIN' || promoteRole === 'HR_ADMIN')) {
      showToast('Permission Denied: Only Super Administrator can elevate staff to Administrator roles', 'error');
      return;
    }

    setIsPromoting(true);
    const res = await dispatch('PROMOTE_EMPLOYEE', {
      id: promotingEmployee.id,
      newRole: promoteRole,
      newDesignation: promoteDesignation
    });
    setIsPromoting(false);

    if (res.success) {
      showToast(`Personnel promoted: ${promotingEmployee.firstName} ${promotingEmployee.lastName} is now ${promoteRole.replace('_', ' ')}`, 'success');
      setPromotingEmployee(null);
    }
  };

  const handleOpenResetPassword = (emp: Employee) => {
    setResettingEmployee(emp);
    setResetPasswordVal(generateSecurePassword());
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingEmployee) return;

    setIsResetting(true);
    const res = await dispatch('RESET_EMPLOYEE_PASSWORD', {
      id: resettingEmployee.id,
      newPassword: resetPasswordVal
    });
    setIsResetting(false);

    if (res.success) {
      setCreatedCredentials({
        name: `${resettingEmployee.firstName} ${resettingEmployee.lastName}`,
        employeeId: resettingEmployee.employeeId,
        email: resettingEmployee.email,
        password: resetPasswordVal,
        role: resettingEmployee.role,
        designation: resettingEmployee.designation
      });
      setResettingEmployee(null);
      showToast(`Password updated for ${resettingEmployee.firstName}`, 'success');
    }
  };

  const copyCredentialsToClipboard = () => {
    if (!createdCredentials) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const text = `=========================================
CISD HR PORTAL - OFFICIAL LOGIN CREDENTIALS
Centre for International Strategic Dialogue
=========================================
Staff Member  : ${createdCredentials.name}
Employee ID   : ${createdCredentials.employeeId}
Designation   : ${createdCredentials.designation}
Assigned Role : ${createdCredentials.role.replace('_', ' ')}
Login Email   : ${createdCredentials.email}
Temp Password : ${createdCredentials.password}
Portal URL    : ${origin}
=========================================
Instructions:
1. Navigate to the Portal URL.
2. Sign in using your Login Email and Temp Password.
3. Keep your credentials safe and confidential.
=========================================`;

    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    showToast('Login credentials copied to clipboard!', 'success');
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  const handleDelete = async (emp: Employee) => {
    if (confirm(`Are you sure you want to remove ${emp.firstName} ${emp.lastName} from the system?`)) {
      const res = await dispatch('DELETE_EMPLOYEE', { id: emp.id });
      if (res.success) {
        showToast('Staff member record deleted', 'info');
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Employee ID,First Name,Last Name,Email,Phone,Department,Designation,Status,Type,Location,Joined'];
    const rows = filteredEmployees.map(e => {
      const d = db.departments.find(dept => dept.id === e.departmentId)?.name || '';
      return `"${e.employeeId}","${e.firstName}","${e.lastName}","${e.email}","${e.phone}","${d}","${e.designation}","${e.status}","${e.employmentType}","${e.workLocation}","${e.joinDate}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CISD_Staff_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported staff directory to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Staff Directory & Personnel Records</h2>
          <p className="text-xs text-slate-500">
            Total of {db.employees.length} diplomats, fellows, researchers, and operational officers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition"
            >
              <Plus className="h-4 w-4 text-cisd-gold-400" />
              Add Staff Member
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID (CISD-001), designation, or email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cisd-navy-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Department */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {db.departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_PROBATION">On Probation</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>

          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Contract Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="FELLOW">Fellow</option>
            <option value="INTERN">Intern</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg ${viewMode === 'GRID' ? 'bg-white shadow text-cisd-navy-900' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg ${viewMode === 'TABLE' ? 'bg-white shadow text-cisd-navy-900' : 'text-slate-400'}`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content: Grid vs Table */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => {
            const dept = db.departments.find(d => d.id === emp.departmentId);
            return (
              <div
                key={emp.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition hover:border-cisd-navy-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <img
                      src={emp.avatar}
                      alt={emp.firstName}
                      className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                    <div className="text-right">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                        {emp.employeeId}
                      </span>
                      <span className={`block mt-1 text-[10px] font-bold uppercase tracking-wider ${
                        emp.status === 'ACTIVE' ? 'text-emerald-600' :
                        emp.status === 'ON_PROBATION' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {emp.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <h3
                    onClick={() => setSelectedEmployeeIdForModal(emp.id)}
                    className="font-bold text-slate-900 text-sm hover:text-cisd-navy-800 cursor-pointer"
                  >
                    {emp.firstName} {emp.lastName}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium line-clamp-1">{emp.designation}</p>
                  <p className="text-[11px] text-cisd-gold-700 mt-0.5">{dept?.name}</p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{emp.workLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    onClick={() => setSelectedEmployeeIdForModal(emp.id)}
                    className="flex items-center gap-1 text-xs font-bold text-cisd-navy-900 hover:text-cisd-gold-600 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    360° Profile
                  </button>

                  <div className="flex items-center gap-1">
                    {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN') && (
                      <>
                        <button
                          onClick={() => handleOpenPromote(emp)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700 transition"
                          title="Promote or Change Role"
                        >
                          <Award className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenResetPassword(emp)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition"
                          title="Reset Password & Credentials"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          title="Edit Profile"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    {(currentUser.role === 'SUPER_ADMIN' || (currentUser.role === 'HR_ADMIN' && emp.role !== 'SUPER_ADMIN')) && (
                      <button
                        onClick={() => handleDelete(emp)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete Staff Account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map(emp => {
                const dept = db.departments.find(d => d.id === emp.departmentId);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div
                        onClick={() => setSelectedEmployeeIdForModal(emp.id)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <img
                          src={emp.avatar}
                          alt={emp.firstName}
                          className="h-8 w-8 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[11px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{emp.employeeId}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{dept?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{emp.designation}</td>
                    <td className="py-3 px-4 text-slate-500">{emp.workLocation}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        emp.status === 'ON_PROBATION' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {emp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedEmployeeIdForModal(emp.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-cisd-navy-900"
                          title="View 360 Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN') && (
                          <>
                            <button
                              onClick={() => handleOpenPromote(emp)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50"
                              title="Promote or Change Role"
                            >
                              <Award className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenResetPassword(emp)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50"
                              title="Reset Password & Issue Credentials"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-cisd-navy-900 hover:bg-slate-100"
                              title="Edit Profile"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {(currentUser.role === 'SUPER_ADMIN' || (currentUser.role === 'HR_ADMIN' && emp.role !== 'SUPER_ADMIN')) && (
                          <button
                            onClick={() => handleDelete(emp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingEmployee ? `Edit Profile: ${editingEmployee.firstName} ${editingEmployee.lastName}` : 'Add New Staff Member'}
                </h3>
                <p className="text-xs text-slate-500">CISD Human Resource Registry Information</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1 text-xs uppercase text-slate-400">Personal Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Login Email Address</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Any email accepted</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. staff.member@gmail.com, name@yahoo.com or @cisd.org.ng"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Personal (Gmail, Yahoo, Outlook) or company email for portal sign in.
                    </p>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NIN / Diplomatic Passport</label>
                    <input
                      type="text"
                      value={formData.ninOrPassport}
                      onChange={(e) => setFormData({ ...formData, ninOrPassport: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 border-b pb-1 text-xs uppercase text-slate-400">Institutional Role & Placement</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">Official Designation</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Strategic Policy Fellow"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Employment Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ON_PROBATION">On Probation</option>
                      <option value="ON_LEAVE">On Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contract Type</label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="FELLOW">Fellow</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>System Access Role</span>
                      {currentUser.role === 'HR_ADMIN' && (
                        <span className="text-[10px] text-amber-600 font-bold">HR Admin Clearance</span>
                      )}
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    >
                      <option value="EMPLOYEE">Standard Employee</option>
                      <option value="LINE_MANAGER">Line Manager / Supervisor</option>
                      {currentUser.role === 'SUPER_ADMIN' ? (
                        <>
                          <option value="HR_ADMIN">HR Administrator</option>
                          <option value="SUPER_ADMIN">Super Administrator (Executive Director)</option>
                        </>
                      ) : (
                        <>
                          <option value="HR_ADMIN" disabled>HR Administrator (Super Admin Authorization Required)</option>
                          <option value="SUPER_ADMIN" disabled>Super Administrator (Super Admin Authorization Required)</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Work Location</label>
                    <input
                      type="text"
                      value={formData.workLocation}
                      onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  {!editingEmployee && (
                    <div className="sm:col-span-2 rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-cisd-gold-600" />
                          Initial Account Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, password: generateSecurePassword() })}
                          className="flex items-center gap-1 text-[11px] text-cisd-navy-800 font-bold hover:underline"
                        >
                          <Sparkles className="h-3 w-3 text-cisd-gold-500" />
                          Generate Secure Password
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full font-mono rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:ring-1 focus:ring-cisd-navy-600"
                        placeholder="Temporary password for initial login"
                      />
                      <p className="text-[10px] text-slate-500">
                        An exportable credential receipt will be shown right after registration to hand over to the staff member.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Education & Emergency */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 border-b pb-1 text-xs uppercase text-slate-400">Education & Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Highest Degree</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">University / Institution</label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-5 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  {editingEmployee ? 'Update Staff Member' : 'Save & Register Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promote Personnel / Role Reassignment Modal */}
      {promotingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <Award className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">Promote & Reassign Personnel</h3>
                <p className="text-[11px] text-slate-500">Update institutional role and official designation</p>
              </div>
              <button
                onClick={() => setPromotingEmployee(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmPromote} className="space-y-4 text-xs">
              {/* Personnel summary */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200">
                <img
                  src={promotingEmployee.avatar}
                  alt={promotingEmployee.firstName}
                  className="h-10 w-10 rounded-full object-cover border"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 truncate">
                    {promotingEmployee.firstName} {promotingEmployee.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{promotingEmployee.employeeId} &bull; {promotingEmployee.designation}</p>
                  <span className="inline-block mt-0.5 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                    Current: {promotingEmployee.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Official Designation
                </label>
                <input
                  type="text"
                  required
                  value={promoteDesignation}
                  onChange={(e) => setPromoteDesignation(e.target.value)}
                  placeholder="e.g. Senior Strategic Director / Lead Fellow"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Assigned Access Role</span>
                  {currentUser.role === 'HR_ADMIN' && (
                    <span className="text-[10px] text-amber-600 font-bold">Admin Clearance Required</span>
                  )}
                </label>
                <select
                  value={promoteRole}
                  onChange={(e) => setPromoteRole(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  <option value="EMPLOYEE">Standard Employee</option>
                  <option value="LINE_MANAGER">Line Manager / Supervisor</option>
                  {currentUser.role === 'SUPER_ADMIN' ? (
                    <>
                      <option value="HR_ADMIN">HR Administrator</option>
                      <option value="SUPER_ADMIN">Super Administrator (Executive Director)</option>
                    </>
                  ) : (
                    <>
                      <option value="HR_ADMIN" disabled>HR Administrator (Super Admin Clearance Required)</option>
                      <option value="SUPER_ADMIN" disabled>Super Administrator (Super Admin Clearance Required)</option>
                    </>
                  )}
                </select>
                {currentUser.role === 'HR_ADMIN' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    * Institutional Rule: Only the Super Administrator has authorization to promote staff to Administrator or Super Administrator.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setPromotingEmployee(null)}
                  className="rounded-lg border px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPromoting}
                  className="rounded-lg bg-cisd-navy-900 px-4 py-1.5 font-bold text-white hover:bg-cisd-navy-800 shadow flex items-center gap-1.5"
                >
                  <Award className="h-3.5 w-3.5 text-cisd-gold-400" />
                  {isPromoting ? 'Promoting...' : 'Confirm Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">Reset Account Password</h3>
                <p className="text-[11px] text-slate-500">Issue new login credentials for staff member</p>
              </div>
              <button
                onClick={() => setResettingEmployee(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <p className="font-bold text-slate-900">
                  {resettingEmployee.firstName} {resettingEmployee.lastName}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  ID: {resettingEmployee.employeeId} &bull; Login Email: {resettingEmployee.email}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">New Password</label>
                  <button
                    type="button"
                    onClick={() => setResetPasswordVal(generateSecurePassword())}
                    className="flex items-center gap-1 text-[11px] text-cisd-navy-800 font-bold hover:underline"
                  >
                    <Sparkles className="h-3 w-3 text-cisd-gold-500" />
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  className="w-full font-mono rounded-lg border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-cisd-navy-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setResettingEmployee(null)}
                  className="rounded-lg border px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="rounded-lg bg-cisd-navy-900 px-4 py-1.5 font-bold text-white hover:bg-cisd-navy-800 shadow flex items-center gap-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5 text-cisd-gold-400" />
                  {isResetting ? 'Updating...' : 'Set & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Credentials Handover Receipt Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2 mb-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Credentials Issued</h3>
              <p className="text-xs text-slate-500">
                Provide these login details to the staff member. They can use any valid email address to log in.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 font-sans">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Staff Member</span>
                <span className="font-bold text-slate-900 text-xs">{createdCredentials.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Employee ID</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{createdCredentials.employeeId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Assigned Role</span>
                <span className="font-bold text-cisd-navy-900 text-xs">{createdCredentials.role.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Official Designation</span>
                <span className="text-slate-700 text-xs">{createdCredentials.designation}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Login Email</span>
                <span className="font-mono font-bold text-slate-900 text-xs bg-white px-2 py-0.5 rounded border">
                  {createdCredentials.email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Initial Password</span>
                <span className="font-mono font-black text-emerald-700 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {createdCredentials.password}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={copyCredentialsToClipboard}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cisd-navy-900 py-2.5 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition"
              >
                {copiedCredentials ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
                    <span>Credentials Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-cisd-gold-400" />
                    <span>Copy Login Credentials for Handover</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Dismiss / Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
