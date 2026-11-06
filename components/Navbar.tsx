'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Bell,
  Search,
  Clock,
  ChevronDown,
  UserCheck,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Menu,
  Shield,
  Briefcase,
  LogOut,
  MapPin,
  HelpCircle,
  PhoneCall,
  Laptop,
  FolderLock,
  User,
  X,
  ExternalLink,
  LifeBuoy,
  Lock,
  Unlock,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export default function Navbar({ onToggleSidebar, isSidebarCollapsed }: NavbarProps) {
  const {
    db,
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    dispatch,
    showToast,
    setSelectedEmployeeIdForModal,
    isAdminUnlocked,
    unlockAdminSwitcher,
    lockAdminSwitcher,
    logout
  } = usePortal();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showClockModal, setShowClockModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminUnlockModal, setShowAdminUnlockModal] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminKeyError, setAdminKeyError] = useState<string | null>(null);
  const [adminKeyLoading, setAdminKeyLoading] = useState(false);
  const [clockWorkType, setClockWorkType] = useState<'OFFICE' | 'REMOTE'>('OFFICE');
  const [clockLocation, setClockLocation] = useState('Abuja Head Office');

  // Check today's clock in status for current user
  const todayStr = '2026-11-05';
  const todayRecord = db?.attendanceRecords.find(
    a => a.employeeId === currentUser?.id && a.date === todayStr
  );

  const isClockedIn = Boolean(todayRecord);
  const isClockedOut = Boolean(todayRecord?.clockOut);

  // Pending approval counts
  const pendingLeaves = db?.leaveRequests.filter(l => l.status === 'PENDING').length || 0;
  const pendingTimesheets = db?.timesheets.filter(t => t.status === 'SUBMITTED').length || 0;
  const overdueTasks = db?.tasks.filter(t => t.status === 'OVERDUE').length || 0;
  const totalNotifications = pendingLeaves + pendingTimesheets + (db?.announcements.length || 0);

  const handleClockIn = async () => {
    const res = await dispatch('CLOCK_IN', {
      employeeId: currentUser.id,
      workType: clockWorkType,
      locationName: clockWorkType === 'OFFICE' ? 'Abuja Head Office' : clockLocation
    });
    if (res.success) {
      showToast(`Clocked in successfully at ${clockWorkType === 'OFFICE' ? 'Abuja Head Office' : clockLocation}`, 'success');
      setShowClockModal(false);
    }
  };

  const handleClockOut = async () => {
    const res = await dispatch('CLOCK_OUT', { employeeId: currentUser.id });
    if (res.success) {
      showToast('Clocked out successfully. Working hours saved.', 'success');
    }
  };

  const availablePersonas = [
    { empId: 'emp-1', role: 'SUPER_ADMIN' as UserRole, title: 'Dr. Amina Bello', subtitle: 'Executive Director (Super Admin)' },
    { empId: 'emp-3', role: 'HR_ADMIN' as UserRole, title: 'Olumide Adeyemi', subtitle: 'Director of HR & Admin (HR Admin)' },
    { empId: 'emp-2', role: 'LINE_MANAGER' as UserRole, title: 'Amb. Ibrahim Mukhtar', subtitle: 'Director of Research (Line Manager)' },
    { empId: 'emp-7', role: 'EMPLOYEE' as UserRole, title: 'Dr. Chidi Okonkwo', subtitle: 'Senior Fellow (Employee)' },
    { empId: 'emp-14', role: 'EMPLOYEE' as UserRole, title: 'Aisha Mohammed', subtitle: 'Research Analyst (On Probation)' }
  ];

  // Global search matching results
  const q = searchQuery.trim().toLowerCase();
  const searchResults = q.length > 1 && db ? {
    employees: db.employees.filter(e =>
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q)
    ).slice(0, 3),
    tasks: db.tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.projectTag && t.projectTag.toLowerCase().includes(q))
    ).slice(0, 3),
    assets: db.assets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.assetCode.toLowerCase().includes(q)
    ).slice(0, 2),
    documents: db.documents.filter(d =>
      d.title.toLowerCase().includes(q)
    ).slice(0, 2),
    meetings: db.meetings.filter(m =>
      m.title.toLowerCase().includes(q)
    ).slice(0, 2)
  } : null;

  const hasAnySearchResults = searchResults && (
    searchResults.employees.length > 0 ||
    searchResults.tasks.length > 0 ||
    searchResults.assets.length > 0 ||
    searchResults.documents.length > 0 ||
    searchResults.meetings.length > 0
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-cisd-navy-500 transition"
          title="Toggle Sidebar"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cisd-navy-900 text-cisd-gold-400 font-bold text-sm tracking-wider shadow">
            CISD
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm tracking-tight">CISD HR Portal</span>
              <span className="rounded bg-cisd-gold-100 px-1.5 py-0.5 text-[10px] font-semibold text-cisd-gold-800">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none">Centre for International Strategic Dialogue</p>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar with Live Spotlight Palette */}
      <div className="relative hidden md:block max-w-md w-full mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff, departments, policies, assets, or tasks..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-cisd-navy-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cisd-navy-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Palette Dropdown */}
        {searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 text-xs">
            {hasAnySearchResults ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {/* Staff results */}
                {searchResults.employees.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block px-2">Personnel ({searchResults.employees.length})</span>
                    {searchResults.employees.map(emp => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployeeIdForModal(emp.id);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-slate-50 cursor-pointer transition"
                      >
                        <img src={emp.avatar} alt={emp.firstName} className="h-7 w-7 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{emp.designation} &bull; {emp.employeeId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tasks results */}
                {searchResults.tasks.length > 0 && (
                  <div className="space-y-1 border-t border-slate-100 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block px-2">Tasks ({searchResults.tasks.length})</span>
                    {searchResults.tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setActiveTab('tasks');
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 cursor-pointer transition"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 truncate">{task.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">Due: {task.dueDate}</p>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assets results */}
                {searchResults.assets.length > 0 && (
                  <div className="space-y-1 border-t border-slate-100 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block px-2">Assets ({searchResults.assets.length})</span>
                    {searchResults.assets.map(asset => (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setActiveTab('assets');
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 cursor-pointer transition"
                      >
                        <span className="font-bold text-slate-900 truncate">{asset.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">{asset.assetCode}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Documents results */}
                {searchResults.documents.length > 0 && (
                  <div className="space-y-1 border-t border-slate-100 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block px-2">Documents ({searchResults.documents.length})</span>
                    {searchResults.documents.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setActiveTab('documents');
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 cursor-pointer transition"
                      >
                        <span className="font-bold text-slate-900 truncate">{doc.title}</span>
                        <span className="text-[10px] text-slate-400">{doc.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-3 italic">No matching records found across CISD vault.</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions, Notifications, Help, Role Switcher, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Clock-in Status Button */}
        {!isClockedIn ? (
          <button
            onClick={() => setShowClockModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clock In</span>
          </button>
        ) : !isClockedOut ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-800 font-medium hidden sm:inline">Clocked in at {todayRecord?.clockIn}</span>
            <button
              onClick={handleClockOut}
              className="ml-1 rounded bg-emerald-700 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-emerald-800"
            >
              Clock Out
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 font-medium">
            Shift Ended ({todayRecord?.clockIn} - {todayRecord?.clockOut})
          </div>
        )}

        {/* Notifications Tray */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none transition"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="font-semibold text-slate-900 text-xs">Executive Notifications</span>
                <span className="text-[11px] text-slate-500">{totalNotifications} items</span>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                {pendingLeaves > 0 && (
                  <div
                    onClick={() => { setActiveTab('leave'); setShowNotifications(false); }}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50 transition border border-amber-100 bg-amber-50/50"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">{pendingLeaves} Pending Leave Request{pendingLeaves > 1 ? 's' : ''}</p>
                      <p className="text-[11px] text-slate-500">Requires managerial or HR Director sign-off.</p>
                    </div>
                  </div>
                )}
                {overdueTasks > 0 && (
                  <div
                    onClick={() => { setActiveTab('tasks'); setShowNotifications(false); }}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50 transition border border-rose-100 bg-rose-50/50"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">{overdueTasks} Overdue Task{overdueTasks > 1 ? 's' : ''}</p>
                      <p className="text-[11px] text-slate-500">Immediate attention required on strategic deliverables.</p>
                    </div>
                  </div>
                )}
                {db?.announcements.slice(0, 2).map(ann => (
                  <div
                    key={ann.id}
                    onClick={() => { setActiveTab('announcements'); setShowNotifications(false); }}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50 transition border border-slate-100"
                  >
                    <CheckCircle2 className="h-4 w-4 text-cisd-navy-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800 line-clamp-1">{ann.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{ann.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-2 mt-2 text-center">
                <button
                  onClick={() => { setActiveTab('announcements'); setShowNotifications(false); }}
                  className="text-[11px] font-semibold text-cisd-navy-700 hover:underline"
                >
                  View All Institutional Circulars
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help & Protocol Support Button */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          title="CISD HR Support & Protocol Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Switch Persona / Role Simulation Menu (HIDDEN unless unlocked with AdminTosin123) */}
        {isAdminUnlocked ? (
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 rounded-lg border border-cisd-gold-400/50 bg-cisd-gold-50/70 px-2.5 py-1 text-xs text-cisd-navy-950 hover:bg-cisd-gold-100/80 transition"
              title="Executive Persona Switcher (Unlocked)"
            >
              <Unlock className="h-3.5 w-3.5 text-cisd-gold-700" />
              <span className="hidden lg:inline font-medium">Role:</span>
              <span className="font-bold text-cisd-navy-950">
                {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                 currentUser?.role === 'HR_ADMIN' ? 'HR Director' :
                 currentUser?.role === 'LINE_MANAGER' ? 'Line Manager' : 'Employee'}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in zoom-in-95">
                <div className="border-b border-slate-100 px-2 py-1.5 mb-1 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-cisd-gold-700 flex items-center gap-1">
                      <Unlock className="h-3 w-3" />
                      Executive Persona Switcher
                    </p>
                    <p className="text-[10px] text-slate-400">Testing elevated permission levels</p>
                  </div>
                  <button
                    onClick={() => {
                      lockAdminSwitcher();
                      setShowRoleMenu(false);
                    }}
                    className="text-[10px] text-rose-600 hover:underline font-semibold"
                    title="Hide preseeded accounts"
                  >
                    Lock
                  </button>
                </div>
                <div className="space-y-1">
                  {availablePersonas.map((persona) => {
                    const emp = db?.employees.find(e => e.id === persona.empId);
                    const isCurrent = currentUser?.id === persona.empId;
                    return (
                      <button
                        key={persona.empId}
                        onClick={() => {
                          if (emp) {
                            setCurrentUser(emp);
                            showToast(`Switched active view to ${emp.firstName} ${emp.lastName}`, 'info');
                          }
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                          isCurrent ? 'bg-cisd-navy-50 text-cisd-navy-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img
                          src={emp?.avatar}
                          alt={persona.title}
                          className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{persona.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{persona.subtitle}</p>
                        </div>
                        {isCurrent && <CheckCircle2 className="h-3.5 w-3.5 text-cisd-gold-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
              <Shield className="h-3.5 w-3.5 text-cisd-gold-600" />
              <span className="font-semibold text-cisd-navy-900">
                {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                 currentUser?.role === 'HR_ADMIN' ? 'HR Director' :
                 currentUser?.role === 'LINE_MANAGER' ? 'Line Manager' : 'Employee'}
              </span>
            </div>
            <button
              onClick={() => setShowAdminUnlockModal(true)}
              className="rounded-lg p-1 text-slate-400 hover:text-cisd-gold-600 hover:bg-slate-100 transition"
              title="Unlock Executive / Preseed Accounts"
            >
              <Lock className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Current User Profile Pill with Dropdown */}
        <div className="relative">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 pr-2.5 hover:bg-slate-100 transition"
            title="Account Menu"
          >
            <img
              src={currentUser?.avatar}
              alt={`${currentUser?.firstName} ${currentUser?.lastName}`}
              className="h-7 w-7 rounded-full object-cover border border-cisd-gold-500"
            />
            <div className="hidden xl:block text-left leading-none">
              <p className="text-xs font-bold text-slate-900">{currentUser?.firstName} {currentUser?.lastName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{currentUser?.designation?.substring(0, 24)}...</p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs animate-in zoom-in-95">
              <div className="border-b border-slate-100 p-2 mb-1">
                <p className="font-bold text-slate-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <span className="rounded bg-cisd-navy-100 text-cisd-navy-900 text-[10px] font-bold px-1.5 py-0.5 mt-1 inline-block">
                  {currentUser?.role?.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-cisd-navy-950 font-bold bg-cisd-gold-50/80 hover:bg-cisd-gold-100 transition"
              >
                <Sparkles className="h-4 w-4 text-cisd-gold-600" />
                Personal Profile & Tenure
              </button>
              <button
                onClick={() => {
                  if (currentUser) setSelectedEmployeeIdForModal(currentUser.id);
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 transition"
              >
                <User className="h-4 w-4 text-cisd-navy-900" />
                View 360° Profile
              </button>
              <button
                onClick={() => {
                  setActiveTab('leave');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 transition"
              >
                <Calendar className="h-4 w-4 text-cisd-gold-600" />
                My Leave Entitlements
              </button>
              <button
                onClick={() => {
                  setActiveTab('timesheets');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 transition"
              >
                <Clock className="h-4 w-4 text-blue-600" />
                Log Timesheets
              </button>
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 transition font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out of Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Unlock Modal Dialog */}
      {showAdminUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cisd-gold-100 text-cisd-gold-800">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Executive Master Clearance</h4>
                  <p className="text-[10px] text-slate-500">Unlock preseeded test accounts</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAdminUnlockModal(false);
                  setAdminKeyError(null);
                  setAdminKeyInput('');
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {adminKeyError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{adminKeyError}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAdminKeyError(null);
                setAdminKeyLoading(true);
                const res = await unlockAdminSwitcher(adminKeyInput);
                setAdminKeyLoading(false);
                if (res.success) {
                  setShowAdminUnlockModal(false);
                  setAdminKeyInput('');
                } else {
                  setAdminKeyError(res.error || 'Incorrect master password');
                }
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Administrative Master Password</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  placeholder="Enter administrator secret key"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cisd-navy-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminUnlockModal(false);
                    setAdminKeyError(null);
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminKeyLoading}
                  className="rounded-lg bg-cisd-navy-950 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-cisd-navy-900 transition flex items-center gap-1.5"
                >
                  {adminKeyLoading ? 'Verifying...' : 'Unlock Switcher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clock In Modal Dialog */}
      {showClockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">CISD Daily Attendance Clock-In</h3>
              </div>
              <button
                onClick={() => setShowClockModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Member</label>
                <div className="rounded-lg bg-slate-50 p-2 text-slate-800 font-medium">
                  {currentUser.firstName} {currentUser.lastName} ({currentUser.employeeId})
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Working Modality Today</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClockWorkType('OFFICE')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 font-medium transition ${
                      clockWorkType === 'OFFICE'
                        ? 'border-cisd-navy-900 bg-cisd-navy-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    Office On-Site
                  </button>
                  <button
                    type="button"
                    onClick={() => setClockWorkType('REMOTE')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 font-medium transition ${
                      clockWorkType === 'REMOTE'
                        ? 'border-cisd-navy-900 bg-cisd-navy-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    Remote / Field
                  </button>
                </div>
              </div>

              {clockWorkType === 'REMOTE' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Remote Station / Field Location</label>
                  <input
                    type="text"
                    value={clockLocation}
                    onChange={(e) => setClockLocation(e.target.value)}
                    placeholder="e.g. Approved Home Office, Geneva Mission, Vienna Centre"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-cisd-navy-600 focus:outline-none"
                  />
                </div>
              )}

              <div className="rounded-lg bg-slate-50 p-3 text-slate-600 text-[11px] space-y-1">
                <p>Standard CISD Working Hours: 08:30 AM - 05:00 PM</p>
                <p className="text-slate-500">Clock-ins after 08:30 AM will automatically record lateness for audit compliance.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClockModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClockIn}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 shadow"
                >
                  Confirm Clock-In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help & Protocol Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-cisd-navy-900" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">CISD HR & Diplomatic Protocol Support</h3>
                  <p className="text-[11px] text-slate-500">Institutional Helpdesk & Emergency Operations Directory</p>
                </div>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              {/* Emergency Contacts */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4 text-rose-600" />
                  Key Institutional Helplines
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded-lg border">
                    <span className="text-slate-400 block">HR Directorate</span>
                    <strong className="text-slate-800">+234 9 461 9001</strong>
                    <span className="text-slate-500 block">hr@cisdialogue.org</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border">
                    <span className="text-slate-400 block">IT & Cyber Defense</span>
                    <strong className="text-slate-800">+234 9 461 9009</strong>
                    <span className="text-slate-500 block">it-support@cisdialogue.org</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border">
                    <span className="text-slate-400 block">Diplomatic Transit / Protocol</span>
                    <strong className="text-slate-800">+234 9 461 9015</strong>
                    <span className="text-slate-500 block">protocol@cisdialogue.org</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border">
                    <span className="text-slate-400 block">Executive Secretariat</span>
                    <strong className="text-slate-800">+234 9 461 9000</strong>
                    <span className="text-slate-500 block">secretariat@cisdialogue.org</span>
                  </div>
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Frequently Asked Questions</h4>
                <div className="space-y-2">
                  <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-1">
                    <p className="font-bold text-slate-800">What is the CISD Hybrid Work Policy?</p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      All CISD staff are required to spend at least 3 days on-site at Abuja HQ per week. Mondays and Thursdays are mandatory on-site days for executive council and dialogue briefings. Schedule shifts must be submitted 48 hours in advance through the Hybrid Roster module.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-1">
                    <p className="font-bold text-slate-800">How do I request an attendance time adjustment?</p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      If biometric fingerprint or card readers fail during morning power transition, open the Daily Attendance tab and click &quot;Request Adjustment&quot;. Your Line Manager will review and update your official audit log.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-1">
                    <p className="font-bold text-slate-800">What are the rules for official travel per diem claims?</p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Download the official &quot;Staff Travel & Expense Claim Form&quot; from the Document Vault. Receipts for flights, visa processing, and lodging must be attached and submitted to the Finance Directorate within 5 working days of return.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t mt-4">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-xl bg-cisd-navy-900 px-5 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow"
              >
                Close Support Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
