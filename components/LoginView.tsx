'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Users2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function LoginView() {
  const { login, unlockAdminSwitcher, isAdminUnlocked, db, showToast } = usePortal();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Executive Master Unlock State
  const [showAdminUnlockModal, setShowAdminUnlockModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminUnlockLoading, setAdminUnlockLoading] = useState(false);
  const [adminUnlockError, setAdminUnlockError] = useState<string | null>(null);

  const handleSubmitStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminMasterUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminUnlockError(null);
    setAdminUnlockLoading(true);

    try {
      const res = await unlockAdminSwitcher(adminPasswordInput);
      if (res.success) {
        setShowAdminUnlockModal(false);
        setAdminPasswordInput('');
        showToast('Executive Master Key Verified. Preseeded accounts are now visible.', 'success');
      } else {
        setAdminUnlockError(res.error || 'Invalid executive master password.');
      }
    } finally {
      setAdminUnlockLoading(false);
    }
  };

  const preseedAccounts = [
    {
      id: 'emp-1',
      name: 'Folahan Johnson (FJ)',
      role: 'Executive Director (L7)',
      designation: 'Executive Director (All Three Arms)',
      email: 'folahan.johnson@cisdialogue.org',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'emp-2',
      name: 'Yaradua Phibi',
      role: 'Lead HR Administrator',
      designation: 'HR Administrator & Operations Lead',
      email: 'yaradua.phibi@cisdialogue.org',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'emp-3',
      name: 'Oluwatosin Onemola (Tosin)',
      role: 'HR Admin Assistant',
      designation: 'HR Admin Assistant',
      email: 'tosin.onemola@cisdialogue.org',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'emp-4',
      name: 'Victory Kinosi',
      role: 'Finance & Admin Officer',
      designation: 'Finance & Admin Officer (All Three Arms)',
      email: 'victory.kinosi@switchadvisory.com',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'emp-5',
      name: 'George Kaduna',
      role: 'Team Lead: GX Media',
      designation: 'Communications Manager (GX Media Lead)',
      email: 'george.kaduna@gxmedia.ng',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'emp-6',
      name: 'Chinonso Aluma',
      role: 'Team Lead: Switch Advisory',
      designation: 'Programs & Operations Manager (Switch Lead)',
      email: 'chinonso.aluma@switchadvisory.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'emp-7',
      name: 'Marcus Ogunfolaju',
      role: 'Team Lead: CISD',
      designation: 'Senior Manager (CISD Lead)',
      email: 'marcus.ogunfolaju@cisdialogue.org',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'emp-9',
      name: 'Adebayo Toyosi',
      role: 'Staff: GX Media House',
      designation: 'Front End / Graphics Designer',
      email: 'adebayo.toyosi@gxmedia.ng',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'emp-21',
      name: 'Peace Okeke',
      role: 'Staff: Switch Advisory',
      designation: 'Programs Officer',
      email: 'peace.okeke@switchadvisory.com',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden text-slate-100">
      {/* Background Diplomatic Architectural Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-cisd-navy-950 via-slate-950 to-cisd-navy-900 opacity-95 z-0" />
      <div className="absolute top-0 right-0 -mr-48 -mt-48 w-96 h-96 rounded-full bg-cisd-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-48 -mb-48 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cisd-navy-900 to-cisd-navy-950 border border-cisd-gold-400 shadow-md">
            <span className="font-serif font-black text-xs tracking-wider text-cisd-gold-400">CISD</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Centre for International Strategic Dialogue</h1>
            <p className="text-[10px] text-slate-400">Institutional Human Resource & Operations Portal</p>
          </div>
        </div>

        {/* Master Admin Unlock Button */}
        <div>
          {!isAdminUnlocked ? (
            <button
              onClick={() => setShowAdminUnlockModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-cisd-gold-400/50 hover:bg-slate-800 transition"
              title="Unlock Executive / Preseed Accounts"
            >
              <Lock className="h-3.5 w-3.5 text-cisd-gold-400" />
              <span className="font-medium text-[11px]">Executive Clearance</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Preseed Accounts Unlocked
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Login Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Diplomatic Mission & Identity */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-cisd-gold-400/30 bg-cisd-gold-500/10 px-3 py-1 text-xs font-semibold text-cisd-gold-300">
              <Shield className="h-3.5 w-3.5 text-cisd-gold-400" />
              Official Diplomatic Network
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Strategic Dialogue. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cisd-gold-300 via-cisd-gold-400 to-amber-200">
                Institutional Excellence.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">
              Welcome to the CISD personnel operations ecosystem. Access your employee dossier, attendance tracking, hybrid schedule roster, and strategic task assignments.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-left">
              <div className="rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm">
                <p className="text-lg font-bold text-white">20 Modules</p>
                <p className="text-[11px] text-slate-400">Unified Operations</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm">
                <p className="text-lg font-bold text-cisd-gold-400">SQLite + WAL</p>
                <p className="text-[11px] text-slate-400">Encrypted Relational Store</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Dashboard */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Form Title */}
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-cisd-gold-400" />
                  Staff Portal Sign In
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate using your login email (personal or institutional) or unique Employee ID.
                </p>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Staff Login Form */}
              <form onSubmit={handleSubmitStaffLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-cisd-gold-400" />
                    Login Email or Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. name@gmail.com, staff@cisd.org.ng, or CISD-007"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cisd-gold-400 focus:outline-none focus:ring-1 focus:ring-cisd-gold-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-cisd-gold-400" />
                      Staff Password
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Default: <code className="bg-slate-800 px-1 py-0.5 rounded text-cisd-gold-300">CISD@2026</code>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your confidential password"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:border-cisd-gold-400 focus:outline-none focus:ring-1 focus:ring-cisd-gold-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-cisd-gold-500 to-cisd-gold-600 hover:from-cisd-gold-400 hover:to-cisd-gold-500 text-cisd-navy-950 font-bold py-2.5 px-4 text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border-2 border-cisd-navy-950 border-t-transparent animate-spin" />
                      Authenticating Credentials...
                    </span>
                  ) : (
                    <>
                      <span>Sign In to Staff Portal</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* UNLOCKED PRESEEDED ACCOUNTS (Hidden until unlocked with AdminTosin123) */}
              {isAdminUnlocked ? (
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cisd-gold-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Executive Testing Personas (Unlocked)
                    </span>
                    <span className="text-[10px] text-slate-400">Click to direct login</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {preseedAccounts.map(account => (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => {
                          setIdentifier(account.email);
                          setPassword('AdminTosin123');
                          login(account.email, 'AdminTosin123');
                        }}
                        className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-800/60 p-2 text-left hover:border-cisd-gold-400/60 hover:bg-slate-800 transition group"
                      >
                        <img
                          src={account.avatar}
                          alt={account.name}
                          className="h-8 w-8 rounded-full object-cover border border-slate-600 group-hover:border-cisd-gold-400"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{account.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{account.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-2 text-[11px]">
                    <Shield className="h-3.5 w-3.5 text-slate-500" />
                    Preseeded accounts & role switcher are hidden for security.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAdminUnlockModal(true)}
                    className="text-cisd-gold-400 hover:text-cisd-gold-300 font-semibold underline text-[11px]"
                  >
                    Unlock
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-slate-500 border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} Centre for International Strategic Dialogue (CISD). All rights reserved.</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Maitama Diplomatic Enclave, Abuja, FCT, Nigeria &bull; Strictly Confidential</p>
      </footer>

      {/* EXECUTIVE MASTER KEY MODAL (Checks AdminTosin123 on the server) */}
      {showAdminUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cisd-gold-500/20 text-cisd-gold-400">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Executive Administrator Clearance</h4>
                  <p className="text-[10px] text-slate-400">Unlock preseeded test accounts & role simulation</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAdminUnlockModal(false);
                  setAdminUnlockError(null);
                }}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {adminUnlockError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{adminUnlockError}</span>
              </div>
            )}

            <form onSubmit={handleAdminMasterUnlock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Enter Executive Master Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Enter administrator secret key"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cisd-gold-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  Master password is authenticated strictly server-side against secure environment variables.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminUnlockModal(false)}
                  className="rounded-xl border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminUnlockLoading}
                  className="rounded-xl bg-cisd-gold-500 hover:bg-cisd-gold-400 text-cisd-navy-950 px-4 py-2 text-xs font-bold transition flex items-center gap-1.5"
                >
                  {adminUnlockLoading ? 'Verifying...' : 'Unlock Preseeded Accounts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

