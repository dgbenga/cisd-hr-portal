'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatabaseSchema } from '@/lib/db';
import { Employee, UserRole } from '@/lib/types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface PortalContextType {
  db: DatabaseSchema | null;
  loading: boolean;
  error: string | null;
  currentUser: Employee;
  setCurrentUser: (emp: Employee) => void;
  isAuthenticated: boolean;
  isAdminUnlocked: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  unlockAdminSwitcher: (password: string) => Promise<{ success: boolean; error?: string }>;
  lockAdminSwitcher: () => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  dispatch: (action: string, payload: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  selectedEmployeeIdForModal: string | null;
  setSelectedEmployeeIdForModal: (id: string | null) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DatabaseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedEmployeeIdForModal, setSelectedEmployeeIdForModal] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshData = async () => {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setDb(json.data);

        // Check if there's a stored session in localStorage
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('cisd_session_user_id') : null;
        const storedAdminUnlocked = typeof window !== 'undefined' ? localStorage.getItem('cisd_admin_unlocked') === 'true' : false;

        if (storedAdminUnlocked) {
          setIsAdminUnlocked(true);
        }

        if (storedUserId) {
          const matched = json.data.employees?.find((e: Employee) => e.id === storedUserId);
          if (matched) {
            setCurrentUser(matched);
            setIsAuthenticated(true);
            if (matched.role === 'SUPER_ADMIN') {
              setIsAdminUnlocked(true);
            }
          }
        }
      } else {
        setError(json.error || 'Failed to load data');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LOGIN',
          payload: { identifier, password }
        })
      });
      const result = await res.json();

      if (result.success && result.user) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        const adminState = Boolean(result.isAdminUnlocked || result.user.role === 'SUPER_ADMIN');
        setIsAdminUnlocked(adminState);

        if (typeof window !== 'undefined') {
          localStorage.setItem('cisd_session_user_id', result.user.id);
          localStorage.setItem('cisd_admin_unlocked', adminState ? 'true' : 'false');
        }

        showToast(`Welcome back, ${result.user.firstName} ${result.user.lastName}`, 'success');
        return { success: true };
      } else {
        showToast(result.error || 'Authentication failed', 'error');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      showToast(err.message || 'Login network error', 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAdminUnlocked(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cisd_session_user_id');
      localStorage.removeItem('cisd_admin_unlocked');
    }
    showToast('Signed out of CISD Portal session', 'info');
  };

  const unlockAdminSwitcher = async (password: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY_ADMIN_PASSWORD',
          payload: { password }
        })
      });
      const result = await res.json();

      if (result.success) {
        setIsAdminUnlocked(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cisd_admin_unlocked', 'true');
        }
        showToast('Executive Master Key Verified: Preseeded personas unlocked', 'success');
        return { success: true };
      } else {
        showToast(result.error || 'Access denied', 'error');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      showToast(err.message || 'Verification network error', 'error');
      return { success: false, error: err.message };
    }
  };

  const lockAdminSwitcher = () => {
    setIsAdminUnlocked(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cisd_admin_unlocked');
    }
    showToast('Executive mode locked: Preseeded accounts hidden', 'info');
  };

  const dispatch = async (action: string, payload: any) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          payload,
          user: currentUser ? { id: currentUser.id, name: `${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role } : null
        })
      });
      const result = await res.json();
      if (result.success) {
        await refreshData();
        return { success: true, data: result.data };
      } else {
        showToast(result.error || 'Action failed', 'error');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      showToast(err.message || 'Network error occurred', 'error');
      return { success: false, error: err.message };
    }
  };

  const handleSetActiveRole = (newRole: UserRole) => {
    if (!db) return;
    // Find an employee matching this role
    const matched = db.employees.find(e => e.role === newRole);
    if (matched) {
      setCurrentUser(matched);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cisd_session_user_id', matched.id);
      }
      showToast(`Switched active view to ${matched.firstName} ${matched.lastName} (${newRole.replace('_', ' ')})`, 'info');
    } else if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
      showToast(`Role updated to ${newRole.replace('_', ' ')}`, 'info');
    }
  };

  // Fallback temporary user while loading
  const fallbackUser: Employee = {
    id: 'emp-1',
    employeeId: 'CISD-001',
    firstName: 'Folahan',
    lastName: 'Johnson',
    email: 'folahan.johnson@cisdialogue.org',
    phone: '+234 803 100 0001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-exec',
    designation: 'Executive Director (All Three Arms)',
    role: 'EXECUTIVE' as UserRole,
    organizationArm: 'CENTRAL_HOLDING',
    accessLevel: 'L7',
    status: 'ACTIVE' as const,
    employmentType: 'FULL_TIME' as const,
    joinDate: '2019-01-15',
    workLocation: 'Abuja Head Office (Executive Suite)',
    gradeLevel: 'L7 - C-Suite Executive',
    personalInfo: {
      dob: '1976-04-12',
      gender: 'Male' as const,
      maritalStatus: 'Married' as const,
      nationality: 'Nigerian',
      address: 'Plot 422, Diplomatic Enclave, Maitama, Abuja',
      bloodGroup: 'O+',
      ninOrPassport: 'A08942155'
    },
    education: [],
    workExperience: [],
    emergencyContacts: [],
    dependants: []
  };

  return (
    <PortalContext.Provider
      value={{
        db,
        loading,
        error,
        currentUser: currentUser || fallbackUser,
        setCurrentUser: (emp: Employee) => {
          setCurrentUser(emp);
          if (typeof window !== 'undefined') {
            localStorage.setItem('cisd_session_user_id', emp.id);
          }
        },
        isAuthenticated,
        isAdminUnlocked,
        login,
        logout,
        unlockAdminSwitcher,
        lockAdminSwitcher,
        activeRole: currentUser?.role || 'EMPLOYEE',
        setActiveRole: handleSetActiveRole,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        removeToast,
        refreshData,
        dispatch,
        selectedEmployeeIdForModal,
        setSelectedEmployeeIdForModal
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
