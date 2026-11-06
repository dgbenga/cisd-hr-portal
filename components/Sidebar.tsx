'use client';

import React from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  LayoutDashboard,
  Users,
  Network,
  Building,
  UserPlus,
  Clock,
  CalendarDays,
  CalendarCheck2,
  CalendarRange,
  Timer,
  Award,
  GraduationCap,
  Briefcase,
  Laptop,
  CheckSquare,
  MessagesSquare,
  FolderLock,
  BarChart3,
  Settings,
  BellRing,
  RotateCcw,
  Sparkles,
  Shield,
  UserCheck
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface SidebarProps {
  isCollapsed: boolean;
  onSelectTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number | string;
  badgeColor?: string;
  count?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function Sidebar({ isCollapsed, onSelectTab }: SidebarProps) {
  const { activeTab, setActiveTab, currentUser, db, dispatch, showToast } = usePortal();

  const role: UserRole = currentUser?.role || 'SUPER_ADMIN';

  // Dynamic counts for badges based on role
  const allPendingLeaves = db?.leaveRequests.filter(l => l.status === 'PENDING') || [];
  const allPendingTimesheets = db?.timesheets.filter(t => t.status === 'SUBMITTED') || [];

  // Team-specific counts for line manager
  const teamMemberIds = db?.employees.filter(e => e.departmentId === currentUser?.departmentId).map(e => e.id) || [];
  const teamPendingLeaves = allPendingLeaves.filter(l => teamMemberIds.includes(l.employeeId)).length;
  const teamPendingTimesheets = allPendingTimesheets.filter(t => teamMemberIds.includes(t.employeeId)).length;

  const overdueTasks = db?.tasks.filter(t => t.status === 'OVERDUE').length || 0;
  const myOverdueTasks = db?.tasks.filter(t => t.assignedToId === currentUser?.id && t.status === 'OVERDUE').length || 0;
  const activeVacancies = db?.recruitmentJobs.filter(j => j.status === 'OPEN').length || 0;

  // Build role-tailored navigation groups
  const getNavGroups = (): NavGroup[] => {
    if (role === 'SUPER_ADMIN') {
      return [
        {
          group: 'Executive Command',
          items: [
            { id: 'dashboard', label: 'Executive Command Center', icon: LayoutDashboard },
            { id: 'profile', label: 'My Profile & Tenure', icon: UserCheck },
            { id: 'announcements', label: 'Institutional Notices', icon: BellRing, badge: db?.announcements.length }
          ]
        },
        {
          group: 'Workforce & Governance',
          items: [
            { id: 'employees', label: 'Employee Directory', icon: Users, count: db?.employees.length },
            { id: 'org-chart', label: 'Organizational Hierarchy', icon: Network },
            { id: 'departments', label: 'Strategic Directorates', icon: Building, count: db?.departments.length },
            { id: 'onboarding', label: 'New Hire Onboarding', icon: UserPlus }
          ]
        },
        {
          group: 'Time & Attendance',
          items: [
            { id: 'attendance', label: 'Attendance & Sign-In Station', icon: Clock },
            {
              id: 'leave',
              label: 'Leave Management',
              icon: CalendarDays,
              badge: allPendingLeaves.length > 0 ? allPendingLeaves.length : undefined,
              badgeColor: 'bg-amber-500'
            },
            { id: 'hybrid', label: 'CISD Hybrid Master Roster', icon: CalendarRange },
            {
              id: 'timesheets',
              label: 'Timesheets Oversight',
              icon: Timer,
              badge: allPendingTimesheets.length > 0 ? allPendingTimesheets.length : undefined,
              badgeColor: 'bg-indigo-500'
            }
          ]
        },
        {
          group: 'Talent & ATS',
          items: [
            { id: 'performance', label: 'Appraisals & Strategic KPIs', icon: Award },
            { id: 'training', label: 'Academy Masterclasses', icon: GraduationCap },
            { id: 'recruitment', label: 'Recruitment & ATS', icon: Briefcase, count: activeVacancies }
          ]
        },
        {
          group: 'Operations',
          items: [
            { id: 'assets', label: 'Property & Assets Registry', icon: Laptop, count: db?.assets.length },
            {
              id: 'tasks',
              label: 'Strategic Tasks',
              icon: CheckSquare,
              badge: overdueTasks > 0 ? `${overdueTasks} due` : undefined,
              badgeColor: 'bg-rose-500'
            },
            { id: 'meetings', label: 'Dialogues & Meetings', icon: MessagesSquare, count: db?.meetings.length },
            { id: 'documents', label: 'Document Vault', icon: FolderLock }
          ]
        },
        {
          group: 'Institutional Governance',
          items: [
            { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
            { id: 'settings', label: 'Portal Settings & Audit', icon: Settings }
          ]
        }
      ];
    }

    if (role === 'HR_ADMIN') {
      return [
        {
          group: 'HR Command',
          items: [
            { id: 'dashboard', label: 'HR Operations Center', icon: LayoutDashboard },
            { id: 'profile', label: 'My Profile & Tenure', icon: UserCheck },
            { id: 'announcements', label: 'Noticeboard & Circulars', icon: BellRing, badge: db?.announcements.length }
          ]
        },
        {
          group: 'Workforce Administration',
          items: [
            { id: 'employees', label: 'Staff Personnel Directory', icon: Users, count: db?.employees.length },
            { id: 'org-chart', label: 'Organizational Hierarchy', icon: Network },
            { id: 'departments', label: 'Directorate Allocations', icon: Building, count: db?.departments.length },
            { id: 'onboarding', label: 'New Hire Indoctrination', icon: UserPlus }
          ]
        },
        {
          group: 'Time, Leave & Attendance',
          items: [
            { id: 'attendance', label: 'Attendance & Sign-In Station', icon: Clock },
            {
              id: 'leave',
              label: 'Leave Administration',
              icon: CalendarDays,
              badge: allPendingLeaves.length > 0 ? allPendingLeaves.length : undefined,
              badgeColor: 'bg-amber-500'
            },
            { id: 'hybrid', label: 'Hybrid Roster Administration', icon: CalendarRange },
            {
              id: 'timesheets',
              label: 'Timesheets Verification',
              icon: Timer,
              badge: allPendingTimesheets.length > 0 ? allPendingTimesheets.length : undefined,
              badgeColor: 'bg-indigo-500'
            }
          ]
        },
        {
          group: 'Talent Acquisition & Growth',
          items: [
            { id: 'recruitment', label: 'Recruitment & ATS Pipeline', icon: Briefcase, count: activeVacancies },
            { id: 'training', label: 'Academy Masterclasses', icon: GraduationCap },
            { id: 'performance', label: 'Appraisal Cycles & Reviews', icon: Award }
          ]
        },
        {
          group: 'Workplace Operations',
          items: [
            { id: 'assets', label: 'Asset Inventory & Custody', icon: Laptop, count: db?.assets.length },
            {
              id: 'tasks',
              label: 'Operational Tasks',
              icon: CheckSquare,
              badge: overdueTasks > 0 ? `${overdueTasks} due` : undefined,
              badgeColor: 'bg-rose-500'
            },
            { id: 'meetings', label: 'Meetings & Dialogues', icon: MessagesSquare, count: db?.meetings.length },
            { id: 'documents', label: 'Regulatory Document Vault', icon: FolderLock }
          ]
        },
        {
          group: 'Analytics & Reporting',
          items: [
            { id: 'reports', label: 'HR Analytics & Reports', icon: BarChart3 }
          ]
        }
      ];
    }

    if (role === 'LINE_MANAGER') {
      return [
        {
          group: 'Directorate Management',
          items: [
            { id: 'dashboard', label: 'Team Manager Dashboard', icon: LayoutDashboard },
            { id: 'profile', label: 'My Profile & Tenure', icon: UserCheck },
            { id: 'announcements', label: 'Institutional Notices', icon: BellRing, badge: db?.announcements.length }
          ]
        },
        {
          group: 'Team & Directory',
          items: [
            { id: 'employees', label: 'Staff Directory', icon: Users, count: db?.employees.length },
            { id: 'org-chart', label: 'Organizational Hierarchy', icon: Network },
            { id: 'departments', label: 'Directorate Overview', icon: Building }
          ]
        },
        {
          group: 'Team Time & Attendance',
          items: [
            { id: 'attendance', label: 'Attendance & Sign-In Station', icon: Clock },
            {
              id: 'leave',
              label: 'Team Leave Approvals',
              icon: CalendarDays,
              badge: teamPendingLeaves > 0 ? teamPendingLeaves : undefined,
              badgeColor: 'bg-amber-500'
            },
            { id: 'hybrid', label: 'Department Hybrid Roster', icon: CalendarRange },
            {
              id: 'timesheets',
              label: 'Team Timesheets Review',
              icon: Timer,
              badge: teamPendingTimesheets > 0 ? teamPendingTimesheets : undefined,
              badgeColor: 'bg-indigo-500'
            }
          ]
        },
        {
          group: 'Deliverables & Talent',
          items: [
            {
              id: 'tasks',
              label: 'Team Deliverables & Tasks',
              icon: CheckSquare,
              badge: overdueTasks > 0 ? `${overdueTasks} due` : undefined,
              badgeColor: 'bg-rose-500'
            },
            { id: 'performance', label: 'Team Appraisals & KPIs', icon: Award },
            { id: 'training', label: 'Academy Masterclasses', icon: GraduationCap }
          ]
        },
        {
          group: 'Collaboration & Property',
          items: [
            { id: 'meetings', label: 'Dialogues & Meetings', icon: MessagesSquare, count: db?.meetings.length },
            { id: 'documents', label: 'Document Vault & Policies', icon: FolderLock },
            { id: 'assets', label: 'Assigned Department Assets', icon: Laptop }
          ]
        }
      ];
    }

    // Default: EMPLOYEE (Self-Service)
    return [
      {
        group: 'My Workspace',
        items: [
          { id: 'dashboard', label: 'My Self-Service Workspace', icon: LayoutDashboard },
          { id: 'profile', label: 'Personal Profile & Tenure', icon: UserCheck },
          { id: 'announcements', label: 'Noticeboard & Circulars', icon: BellRing, badge: db?.announcements.length }
        ]
      },
      {
        group: 'My Time & Schedule',
        items: [
          { id: 'attendance', label: 'Attendance & Sign-In Station', icon: Clock },
          { id: 'leave', label: 'My Leave Balances & Requests', icon: CalendarDays },
          { id: 'hybrid', label: 'CISD Office & Remote Roster', icon: CalendarRange },
          { id: 'timesheets', label: 'My Project Timesheets', icon: Timer }
        ]
      },
      {
        group: 'My Career & Growth',
        items: [
          { id: 'performance', label: 'My Appraisals & Goals', icon: Award },
          { id: 'training', label: 'CISD Academy Masterclasses', icon: GraduationCap }
        ]
      },
      {
        group: 'Collaboration & Workplace',
        items: [
          { id: 'employees', label: 'Staff Directory', icon: Users, count: db?.employees.length },
          { id: 'org-chart', label: 'Organizational Hierarchy', icon: Network },
          {
            id: 'tasks',
            label: 'My Assigned Deliverables',
            icon: CheckSquare,
            badge: myOverdueTasks > 0 ? `${myOverdueTasks} due` : undefined,
            badgeColor: 'bg-rose-500'
          },
          { id: 'meetings', label: 'My Meetings & Dialogues', icon: MessagesSquare },
          { id: 'documents', label: 'Document Vault & Policies', icon: FolderLock },
          { id: 'assets', label: 'My Assigned Hardware & Badges', icon: Laptop }
        ]
      }
    ];
  };

  const navGroups = getNavGroups();

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-20 flex flex-col border-r border-slate-200 bg-cisd-navy-950 text-slate-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Role Badge Indicator */}
      {!isCollapsed && (
        <div className="px-4 pt-3 pb-1 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Access Level</span>
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase tracking-wide text-[9px] ${
                role === 'SUPER_ADMIN'
                  ? 'bg-cisd-gold-500 text-cisd-navy-950'
                  : role === 'HR_ADMIN'
                  ? 'bg-blue-600 text-white'
                  : role === 'LINE_MANAGER'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              {role.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}

      {/* Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.group}
              </h4>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onSelectTab(item.id);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cisd-gold-500 text-cisd-navy-950 font-bold shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cisd-navy-950' : 'text-slate-400 group-hover:text-cisd-gold-400'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 truncate text-left">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white ${
                        item.badgeColor || 'bg-cisd-navy-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {!isCollapsed && !item.badge && item.count !== undefined && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Clearance Banner */}
      {!isCollapsed && (
        <div className="border-t border-slate-800 p-3 bg-cisd-navy-900/60 text-[10px] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="truncate">{currentUser?.firstName} {currentUser?.lastName}</span>
          </div>
          <p className="text-slate-400 truncate text-[9px]">{currentUser?.designation}</p>
        </div>
      )}
    </aside>
  );
}
