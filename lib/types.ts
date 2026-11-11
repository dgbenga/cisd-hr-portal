export type UserRole = 'SUPER_ADMIN' | 'EXECUTIVE' | 'HR_ADMIN' | 'FINANCE' | 'LINE_MANAGER' | 'EMPLOYEE';
export type OrganizationArm = 'CISD' | 'SWITCH_ADVISORY' | 'GX_MEDIA' | 'CENTRAL_HOLDING';
export type AccessLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7';

export interface OrganizationArmMetadata {
  arm: OrganizationArm;
  label: string;
  shortLabel: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
  accentBg: string; // WCAG 2.1 AA compliant (>= 4.5:1 against white)
}

export const ORGANIZATION_ARM_CONFIG: Record<OrganizationArm, OrganizationArmMetadata> = {
  SWITCH_ADVISORY: {
    arm: 'SWITCH_ADVISORY',
    label: 'Switch Advisory',
    shortLabel: 'Switch',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderClass: 'border-emerald-300',
    textClass: 'text-emerald-700',
    accentBg: 'bg-emerald-700'
  },
  CISD: {
    arm: 'CISD',
    label: 'CISD (Inclusive Dialogue)',
    shortLabel: 'CISD',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    borderClass: 'border-sky-300',
    textClass: 'text-sky-700',
    accentBg: 'bg-sky-700'
  },
  GX_MEDIA: {
    arm: 'GX_MEDIA',
    label: 'GX Media House',
    shortLabel: 'GX Media',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    borderClass: 'border-purple-300',
    textClass: 'text-purple-700',
    accentBg: 'bg-purple-700'
  },
  CENTRAL_HOLDING: {
    arm: 'CENTRAL_HOLDING',
    label: 'Central Holding & Governance',
    shortLabel: 'Central',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    borderClass: 'border-slate-300',
    textClass: 'text-slate-700',
    accentBg: 'bg-slate-700'
  }
};

export function getOrganizationArmConfig(arm?: OrganizationArm): OrganizationArmMetadata {
  if (!arm || !ORGANIZATION_ARM_CONFIG[arm]) {
    return ORGANIZATION_ARM_CONFIG.CENTRAL_HOLDING;
  }
  return ORGANIZATION_ARM_CONFIG[arm];
}

export type EmploymentStatus = 'ACTIVE' | 'ON_PROBATION' | 'ON_LEAVE' | 'TERMINATED';
export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'FELLOW' | 'INTERN';

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  field: string;
}

export interface WorkExperienceItem {
  company: string;
  role: string;
  fromYear: string;
  toYear: string;
  highlights: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface Dependant {
  name: string;
  relationship: string;
  dob: string;
}

export interface PersonalInfo {
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced';
  nationality: string;
  address: string;
  bloodGroup: string;
  ninOrPassport: string;
}

export interface Employee {
  id: string;
  employeeId: string; // e.g. CISD-001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  departmentId: string;
  designation: string;
  role: UserRole;
  status: EmploymentStatus;
  employmentType: EmploymentType;
  joinDate: string;
  probationEndDate?: string;
  workLocation: string;
  reportingManagerId?: string;
  gradeLevel: string;
  personalInfo: PersonalInfo;
  education: EducationItem[];
  workExperience: WorkExperienceItem[];
  emergencyContacts: EmergencyContact[];
  dependants: Dependant[];
  salaryGrade?: string;
  password?: string; // Custom initial staff password
  organizationArm?: OrganizationArm;
  accessLevel?: AccessLevel;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headId: string;
  description: string;
  location: string;
  budget: string;
  organizationArm?: OrganizationArm;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'REMOTE' | 'ON_LEAVE' | 'ABSENT';
export type WorkType = 'OFFICE' | 'REMOTE' | 'FIELD';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm
  clockOut?: string; // HH:mm
  status: AttendanceStatus;
  workType: WorkType;
  locationName: string;
  workingHours: number;
  latenessMinutes: number;
  notes?: string;
}

export interface AttendanceCorrection {
  id: string;
  employeeId: string;
  date: string;
  requestedClockIn: string;
  requestedClockOut: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
}

export type LeaveType = 'ANNUAL' | 'SICK' | 'CASUAL' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  organizationArm?: OrganizationArm;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  handoverEmployeeId?: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
  approvalNotes?: string;
}

export interface LeaveBalance {
  employeeId: string;
  annualTotal: number;
  annualUsed: number;
  sickTotal: number;
  sickUsed: number;
  casualTotal: number;
  casualUsed: number;
  maternityPaternityTotal: number;
  maternityPaternityUsed: number;
  unpaidUsed: number;
}

export type WorkDaySchedule = 'OFFICE' | 'REMOTE';

export interface ScheduleChangeRequest {
  id: string;
  targetDate: string;
  originalStatus: WorkDaySchedule;
  requestedStatus: WorkDaySchedule;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedBy?: string;
}

export interface HybridSchedule {
  id: string;
  employeeId: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  monday: WorkDaySchedule;
  tuesday: WorkDaySchedule;
  wednesday: WorkDaySchedule;
  thursday: WorkDaySchedule;
  friday: WorkDaySchedule;
  status: 'ACTIVE' | 'PENDING_CHANGE';
  changeRequests?: ScheduleChangeRequest[];
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'OVERDUE';

export interface Task {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  assignedToId: string;
  createdById: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  progressPercentage: number;
  projectTag?: string;
}

export type MeetingType = 'STRATEGIC_DIALOGUE' | 'EXECUTIVE_BRIEFING' | 'DEPARTMENTAL' | 'ONE_ON_ONE' | 'BOARD';

export interface MeetingActionItem {
  id: string;
  task: string;
  assignedToId: string;
  status: 'OPEN' | 'DONE';
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  type: MeetingType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  organizerId: string;
  participantIds: string[];
  minutes?: string;
  actionItems: MeetingActionItem[];
}

export type AssetCategory = 'LAPTOP' | 'PHONE' | 'MONITOR' | 'VEHICLE' | 'FURNITURE' | 'ACCESS_CARD' | 'AUDIO_VISUAL';
export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR';
export type AssetStatus = 'ASSIGNED' | 'AVAILABLE' | 'IN_MAINTENANCE' | 'RETIRED';

export interface MaintenanceLog {
  date: string;
  description: string;
  cost?: number;
  performedBy: string;
}

export interface Asset {
  id: string;
  assetCode: string; // CISD-EQ-001
  name: string;
  category: AssetCategory;
  serialNumber: string;
  acquisitionDate: string;
  assignedToId?: string;
  assignedDate?: string;
  condition: AssetCondition;
  status: AssetStatus;
  location: string;
  maintenanceLogs: MaintenanceLog[];
}

export interface RecruitmentJob {
  id: string;
  title: string;
  departmentId: string;
  type: EmploymentType;
  location: string;
  experience: string;
  openings: number;
  deadline: string;
  status: 'OPEN' | 'INTERVIEWING' | 'CLOSED';
  description: string;
  requirements: string[];
  salaryRange: string;
}

export type CandidateStage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';

export interface Candidate {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  appliedDate: string;
  stage: CandidateStage;
  resumeUrl?: string;
  interviewNotes?: string;
  rating: number; // 1-5
  offerDetails?: {
    salary: string;
    startDate: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  };
}

export interface OnboardingTask {
  id: string;
  title: string;
  category: 'DOCUMENT' | 'IT_ASSET' | 'ORIENTATION' | 'TRAINING';
  isCompleted: boolean;
  completedAt?: string;
  dueDate: string;
}

export interface OnboardingProcess {
  id: string;
  employeeId: string;
  startDate: string;
  targetCompletionDate: string;
  progress: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  tasks: OnboardingTask[];
}

export type DocumentCategory = 'CONTRACT' | 'APPOINTMENT_LETTER' | 'CV' | 'CERTIFICATE' | 'ID_CARD' | 'POLICY' | 'FORM';

export interface DocumentRecord {
  id: string;
  title: string;
  category: DocumentCategory;
  fileType: string;
  fileSize: string;
  uploadedDate: string;
  uploadedById: string;
  employeeId?: string;
  isCompanyWide: boolean;
  downloadUrl: string;
  description?: string;
}

export interface KpiRating {
  title: string;
  weight: number;
  score: number; // 1-5
  comments: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  cycle: string;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'FINALIZED';
  selfRating: number;
  managerRating: number;
  kpiRatings: KpiRating[];
  strengths: string;
  areasForGrowth: string;
  developmentPlan: string;
  finalScore: number;
  createdAt: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  code: string;
  category: 'DIPLOMACY' | 'POLICY_RESEARCH' | 'LEADERSHIP' | 'COMPLIANCE' | 'DIGITAL_SKILLS';
  instructor: string;
  durationHours: number;
  scheduleDate: string;
  maxParticipants: number;
  enrolledEmployeeIds: string[];
  completedEmployeeIds: string[];
  description: string;
}

export type AnnouncementCategory = 'OFFICIAL_MEMO' | 'DIPLOMATIC_EVENT' | 'POLICY' | 'CELEBRATION' | 'URGENT';

export interface Announcement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  content: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  publishDate: string;
  authorId: string;
  targetDepartmentId?: string;
  targetArm?: OrganizationArm;
  acknowledgeCount: number;
}

export interface TimesheetEntry {
  projectId: string;
  projectName: string;
  activity: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  totalHours: number;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  organizationArm?: OrganizationArm;
  weekStartDate: string;
  weekEndDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt?: string;
  approvedBy?: string;
  entries: TimesheetEntry[];
  totalHours: number;
}

export interface OrganizationSettings {
  name: string;
  abbreviation: string;
  headquarters: string;
  tagline: string;
  email: string;
  phone: string;
  workingDays: string[];
  officeHours: {
    start: string;
    end: string;
  };
  hybridPolicy: {
    minimumOfficeDays: number;
    mandatoryOfficeDays: string[];
  };
  leaveEntitlements: {
    annual: number;
    sick: number;
    casual: number;
    maternity: number;
    paternity: number;
  };
  fiscalYear: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
}
