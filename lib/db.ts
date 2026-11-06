/**
 * ==============================================================================
 * CISD HR PORTAL - UNIFIED DATABASE ACCESS LAYER (SQLITE & BACKUP)
 * ==============================================================================
 * 
 * ARCHITECTURE FOR DEVELOPERS:
 * - Primary Storage: SQLite (`data/cisd.sqlite`) powered by better-sqlite3 with
 *   WAL (Write-Ahead Logging) mode and full relational schema enforcement.
 * - Secondary Mirror: `data/cisd_db.json` automatically mirrored for human-readable
 *   inspections, backups, and diff tooling.
 * - Concurrency: Thread-safe non-blocking reads while writes are active.
 * - Transactions: All multi-record mutations commit atomically.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import {
  Department,
  Employee,
  AttendanceRecord,
  AttendanceCorrection,
  LeaveRequest,
  LeaveBalance,
  HybridSchedule,
  Task,
  Meeting,
  Asset,
  RecruitmentJob,
  Candidate,
  OnboardingProcess,
  DocumentRecord,
  PerformanceReview,
  TrainingCourse,
  Announcement,
  Timesheet,
  OrganizationSettings,
  SystemAuditLog
} from './types';
import {
  initialDepartments,
  initialEmployees,
  initialAttendanceRecords,
  initialAttendanceCorrections,
  initialLeaveBalances,
  initialLeaveRequests,
  initialHybridSchedules,
  initialTasks,
  initialMeetings,
  initialAssets,
  initialRecruitmentJobs,
  initialCandidates,
  initialOnboardingProcesses,
  initialDocuments,
  initialPerformanceReviews,
  initialTrainingCourses,
  initialAnnouncements,
  initialTimesheets,
  initialSettings,
  initialAuditLogs
} from './initial-data';
import {
  getSqliteDb,
  getSqliteDatabaseSnapshot,
  saveDatabaseSnapshotToSqlite,
  seedSqliteDatabase,
  insertSqliteAuditLog
} from './sqlite';

/**
 * Normalized database schema containing all institutional entities
 */
export interface DatabaseSchema {
  departments: Department[];
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  attendanceCorrections: AttendanceCorrection[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  hybridSchedules: HybridSchedule[];
  tasks: Task[];
  meetings: Meeting[];
  assets: Asset[];
  recruitmentJobs: RecruitmentJob[];
  candidates: Candidate[];
  onboardingProcesses: OnboardingProcess[];
  documents: DocumentRecord[];
  performanceReviews: PerformanceReview[];
  trainingCourses: TrainingCourse[];
  announcements: Announcement[];
  timesheets: Timesheet[];
  settings: OrganizationSettings;
  auditLogs: SystemAuditLog[];
}

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? '/tmp/cisd-data' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cisd_db.json');

/**
 * Ensures the target data directory exists on the filesystem
 */
function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (isVercel && !fs.existsSync(DB_FILE)) {
    const seedJson = path.join(process.cwd(), 'data', 'cisd_db.json');
    if (fs.existsSync(seedJson)) {
      try {
        fs.copyFileSync(seedJson, DB_FILE);
      } catch (e) {
        console.warn('[Vercel Setup] Could not copy seed json to /tmp:', e);
      }
    }
  }
}

/**
 * Generates a clean, populated factory seed database instance
 */
export function getInitialDatabase(): DatabaseSchema {
  return {
    departments: initialDepartments,
    employees: initialEmployees,
    attendanceRecords: initialAttendanceRecords,
    attendanceCorrections: initialAttendanceCorrections,
    leaveBalances: initialLeaveBalances,
    leaveRequests: initialLeaveRequests,
    hybridSchedules: initialHybridSchedules,
    tasks: initialTasks,
    meetings: initialMeetings,
    assets: initialAssets,
    recruitmentJobs: initialRecruitmentJobs,
    candidates: initialCandidates,
    onboardingProcesses: initialOnboardingProcesses,
    documents: initialDocuments,
    performanceReviews: initialPerformanceReviews,
    trainingCourses: initialTrainingCourses,
    announcements: initialAnnouncements,
    timesheets: initialTimesheets,
    settings: initialSettings,
    auditLogs: initialAuditLogs
  };
}

/**
 * Overwrites the SQLite persistent storage with the default factory seed
 */
export function resetDbToSeed(): DatabaseSchema {
  ensureDataDirectory();
  const db = getSqliteDb();
  seedSqliteDatabase(db);
  const fresh = getSqliteDatabaseSnapshot();

  // Also mirror to JSON file
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[CISD Mirror Warning] Could not mirror to JSON:', err);
  }

  return fresh;
}

/**
 * Reads the database snapshot from SQLite.
 * Automatically falls back to seed data if SQLite is uninitialized.
 */
export function readDb(): DatabaseSchema {
  ensureDataDirectory();
  try {
    return getSqliteDatabaseSnapshot();
  } catch (err) {
    console.error('[CISD Database] SQLite read failed, attempting recovery from initial seed:', err);
    return resetDbToSeed();
  }
}

/**
 * Persists the entire database schema into SQLite using an atomic transaction,
 * and mirrors the state to `data/cisd_db.json` for human inspection.
 */
export function writeDb(data: DatabaseSchema): void {
  ensureDataDirectory();

  // 1. Primary Relational Storage (SQLite with WAL mode)
  try {
    saveDatabaseSnapshotToSqlite(data);
  } catch (err) {
    console.error('[CISD SQLite Save Error]:', err);
  }

  // 2. Secondary Human-Readable JSON Mirror
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[CISD Mirror Warning] Could not mirror to cisd_db.json:', err);
  }
}

/**
 * Atomically records an audit entry directly onto the database instance.
 * Call this prior to calling writeDb(db) to prevent race conditions and log overwrites.
 */
export function recordAuditLog(
  db: DatabaseSchema,
  action: string,
  module: string,
  details: string,
  userId = 'emp-1',
  userName = 'System Administrator'
): SystemAuditLog {
  const newLog: SystemAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId,
    userName,
    action,
    module,
    details
  };

  if (!db.auditLogs) {
    db.auditLogs = [];
  }

  // Prepend so the newest events appear first
  db.auditLogs.unshift(newLog);

  // Keep a rolling buffer of 250 audit entries for performance
  if (db.auditLogs.length > 250) {
    db.auditLogs = db.auditLogs.slice(0, 250);
  }

  return newLog;
}

/**
 * Standalone legacy helper for audit logging with auto-persistence
 */
export function logAudit(
  action: string,
  module: string,
  details: string,
  userId = 'emp-1',
  userName = 'Dr. Amina Bello'
): void {
  const db = readDb();
  recordAuditLog(db, action, module, details, userId, userName);
  writeDb(db);
}

// Re-export SQLite direct access helpers for custom queries
export { getSqliteDb, insertSqliteAuditLog } from './sqlite';
