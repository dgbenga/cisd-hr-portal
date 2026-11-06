'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import EmployeeProfileModal from '@/components/EmployeeProfileModal';

// Modules
import DashboardModule from '@/components/modules/DashboardModule';
import EmployeeManagementModule from '@/components/modules/EmployeeManagementModule';
import AttendanceModule from '@/components/modules/AttendanceModule';
import LeaveModule from '@/components/modules/LeaveModule';
import HybridWorkModule from '@/components/modules/HybridWorkModule';
import DepartmentsModule from '@/components/modules/DepartmentsModule';
import TasksModule from '@/components/modules/TasksModule';
import MeetingsModule from '@/components/modules/MeetingsModule';
import AssetManagementModule from '@/components/modules/AssetManagementModule';
import RecruitmentModule from '@/components/modules/RecruitmentModule';
import OnboardingModule from '@/components/modules/OnboardingModule';
import DocumentsModule from '@/components/modules/DocumentsModule';
import PerformanceModule from '@/components/modules/PerformanceModule';
import TrainingModule from '@/components/modules/TrainingModule';
import AnnouncementsModule from '@/components/modules/AnnouncementsModule';
import ReportsModule from '@/components/modules/ReportsModule';
import OrgChartModule from '@/components/modules/OrgChartModule';
import TimesheetsModule from '@/components/modules/TimesheetsModule';
import SettingsModule from '@/components/modules/SettingsModule';
import PersonalProfileModule from '@/components/modules/PersonalProfileModule';
import LoginView from '@/components/LoginView';

export default function Home() {
  const { activeTab, setActiveTab, loading, error, refreshData, isAuthenticated, currentUser } = usePortal();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardModule />;
      case 'employees':
      case 'directory':
        return <EmployeeManagementModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'leave':
        return <LeaveModule />;
      case 'hybrid':
        return <HybridWorkModule />;
      case 'departments':
        return <DepartmentsModule />;
      case 'tasks':
        return <TasksModule />;
      case 'meetings':
        return <MeetingsModule />;
      case 'assets':
        return <AssetManagementModule />;
      case 'recruitment':
        return <RecruitmentModule />;
      case 'onboarding':
        return <OnboardingModule />;
      case 'documents':
        return <DocumentsModule />;
      case 'performance':
        return <PerformanceModule />;
      case 'training':
        return <TrainingModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'reports':
        return <ReportsModule />;
      case 'org-chart':
        return <OrgChartModule />;
      case 'timesheets':
        return <TimesheetsModule />;
      case 'settings':
        return <SettingsModule />;
      case 'profile':
      case 'personal-profile':
        return <PersonalProfileModule />;
      default:
        return <DashboardModule />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-cisd-navy-950 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cisd-navy-900 border-2 border-cisd-gold-500 shadow-2xl animate-bounce">
          <span className="font-black text-xl text-cisd-gold-400">CISD</span>
        </div>
        <h2 className="mt-4 text-base font-bold text-white tracking-wide">CISD HR Portal</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to Centre for International Strategic Dialogue Secure Vault...</p>
        <div className="mt-4 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cisd-gold-400 animate-ping" />
          <span className="text-[11px] text-cisd-gold-300 font-medium">Loading Persistent Records...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-xl max-w-md w-full">
          <h2 className="text-lg font-bold text-rose-700">Database Connection Issue</h2>
          <p className="text-xs text-slate-600 mt-2">{error}</p>
          <button
            onClick={() => refreshData()}
            className="mt-4 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // If user is not authenticated, display the CISD Login Dashboard
  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 ${
            isSidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Universal Employee 360 Modal */}
      <EmployeeProfileModal />
    </div>
  );
}
