# Feature Spec: 0002 - Multi-Entity Scoping & Approvals (Phase 2)

- **Status**: Accepted
- **Owner**: Adebayo (Principal Architect) / Oluwatosin Onemola (HR Lead)
- **Reviewer**: Principal Staff Software Engineer & Enterprise Security Architect (Gemini Pro)
- **Target Date**: 2026-11-11
- **Entities Covered**: Switch Advisory, CISD, GX Media House, Central Holding

---

## 1. 100% Requirement Ingestion Matrix (Anti-Lossy Traceability)

| Detail # | User / Reviewer Detail & Constraint | Implementation Target | Acceptance Criterion |
|---|---|---|---|
| **D-1** | **Full Multi-Entity Scoping**: Implement entity-aware filtering, visual identity badging, and line-manager approval scoping across Staff Directory, 360° Dossier, Departments, Timesheets, and Leave modules. | `components/modules/EmployeeManagementModule.tsx`, `components/EmployeeProfileModal.tsx`, `components/modules/TimesheetsModule.tsx`, `components/modules/LeaveModule.tsx`, `components/modules/DepartmentsModule.tsx` | **AC-1** |
| **D-2** | **WCAG 2.1 AA Compliant Semantic Arm Accents**: High-contrast, accessible badges: Switch Advisory (Teal/Emerald `bg-emerald-700` / `bg-emerald-50 text-emerald-800`), CISD (Navy/Sky `bg-sky-700` / `bg-sky-50 text-sky-800`), GX Media House (Violet/Purple `bg-purple-700` / `bg-purple-50 text-purple-800`), and Central Holding (Slate/Steel `bg-slate-700` / `bg-slate-100 text-slate-800`). | `lib/types.ts` (`ORGANIZATION_ARM_CONFIG`, `getOrganizationArmConfig`) | **AC-2** |
| **D-3** | **Staff Directory Multi-Entity Filtering**: Filter bar in Staff Directory allows instant filtering by Entity (`ALL`, `SWITCH_ADVISORY`, `CISD`, `GX_MEDIA`, `CENTRAL_HOLDING`) alongside Department, Status, and Type. Displays entity badge and Access Level (`L0`–`L7`) on every card and table row. Mobile-optimized with horizontal scrolling and short labels. | `components/modules/EmployeeManagementModule.tsx` | **AC-3** |
| **D-4** | **Add/Edit Personnel Controls**: Add/Edit modal exposes `organizationArm` dropdown and `accessLevel` selector with sensible defaults, allowing HR to provision staff directly into the correct arm and grade level. | `components/modules/EmployeeManagementModule.tsx` | **AC-4** |
| **D-5** | **Line Manager Timesheet Approval Scoping & BOLA Defense**: Line managers (George for GX, Chinonso for Switch, Marcus for CISD) only see and approve timesheets submitted by their entity's staff. Server-side BOLA validation in `app/api/data/route.ts` rejects any cross-entity or self-approval attempts. | `components/modules/TimesheetsModule.tsx`, `app/api/data/route.ts` | **AC-5** |
| **D-6** | **Line Manager Leave Approval Scoping & Anti-Self-Approval**: Line managers only see and approve leave requests from their entity's staff. Server-side validation blocks self-approvals and cross-arm adjudication. | `components/modules/LeaveModule.tsx`, `app/api/data/route.ts` | **AC-6** |
| **D-7** | **Executive & Central Approval Governance**: `app/api/data/route.ts` unblocks `role: 'EXECUTIVE'` (Folahan Johnson) for `REVIEW_TIMESHEET` and `REVIEW_LEAVE`. Line Managers (George, Chinonso, Marcus) are approved by ED (FJ) or HR Lead (Phibi). Tosin approved by Phibi; Victory and Phibi approved by FJ. FJ (L7 ED) is exempt from timesheet submission. | `app/api/data/route.ts`, `components/modules/TimesheetsModule.tsx`, `components/modules/LeaveModule.tsx` | **AC-7** |
| **D-8** | **Departments & Strategic Entities Governance**: Departments module surfaces the entity association of each strategic division, provides an entity filter, and displays headcount rollups per sister company. | `components/modules/DepartmentsModule.tsx` | **AC-8** |
| **D-9** | **Historical Entity Snapshots & Safe Accessors**: Add `organizationArm?: OrganizationArm` to `Timesheet` and `LeaveRequest` so transferred employees' past work remains permanently bound to the originating entity. Provide `getOrganizationArmConfig(arm?: OrganizationArm)` with fallback to prevent null crashes. | `lib/types.ts`, `app/api/data/route.ts` | **AC-9** |
| **D-10** | **Recruitment Auto-Provisioning Synchronization**: In `UPDATE_CANDIDATE_STAGE` (`stage: 'HIRED'`), derive `organizationArm` from target department, assign `accessLevel: 'L1'`, and map `gradeLevel: 'L1 - Junior Staff'`. | `app/api/data/route.ts` | **AC-10** |
| **D-11** | **Universal 360° Dossier Update**: Display entity badge and access level in both `components/EmployeeProfileModal.tsx` and `components/modules/PersonalProfileModule.tsx`. | `components/EmployeeProfileModal.tsx`, `components/modules/PersonalProfileModule.tsx` | **AC-11** |

---

## 2. Non-Destructive Blast-Radius Contract (Anti-Regression Lock)

- **Target Blast Radius**:
  - `lib/types.ts`: Add `ORGANIZATION_ARM_CONFIG`, `getOrganizationArmConfig()`, and optional `organizationArm` on `Timesheet` and `LeaveRequest`.
  - `app/api/data/route.ts`:
    - Add `'EXECUTIVE'` to `requireRoles` for `REVIEW_TIMESHEET` and `REVIEW_LEAVE`.
    - Add server-side anti-self-approval guard (`ts.employeeId !== currentUserId`).
    - Add server-side BOLA containment check for `LINE_MANAGER` (target staff must match reviewer's `organizationArm` or report to reviewer).
    - Stamp `organizationArm` on new timesheets (`SUBMIT_TIMESHEET`) and leaves (`APPLY_LEAVE`).
    - Provision `organizationArm` and `accessLevel` on candidate hiring (`UPDATE_CANDIDATE_STAGE`).
  - `components/modules/EmployeeManagementModule.tsx`: Entity filter tabs with mobile scroll, semantic badges on cards/rows, arm & level dropdowns in Add/Edit modal.
  - `components/EmployeeProfileModal.tsx`: Render entity badge and access level in 360° dossier header banner.
  - `components/modules/PersonalProfileModule.tsx`: Render entity badge and access level in user's profile view.
  - `components/modules/DepartmentsModule.tsx`: Entity filter pills, parent entity badges on department cards.
  - `components/modules/TimesheetsModule.tsx`:
    - Refine `pendingTimesheets` scoping by `organizationArm` for line managers.
    - Block self-approval from appearing in manager's approval queue.
    - Render entity badges on review cards.
    - Entity filter for HR and Executive Director.
    - Specific filtered empty state (*"No pending timesheets for [Entity]"*).
  - `components/modules/LeaveModule.tsx`:
    - Refine `pendingLeaves` scoping by `organizationArm` for line managers.
    - Block self-approval from appearing in manager's approval queue.
    - Render entity badges on review cards.
    - Specific filtered empty state.

- **Protected Working Surface ("DO NOT TOUCH")**:
  - Auth password logic (`ADMIN_MASTER_PASSWORD`, `DEFAULT_STAFF_PASSWORD`, `isMatchingMasterPassword`, `sanitizeSecret`).
  - Vercel `/tmp` copy and cold-start recovery logic in `lib/sqlite.ts` and `lib/db.ts`.
  - Database seed values in `data/cisd.sqlite` and `data/cisd_db.json`.
  - Timesheet hourly calculation engine, draft auto-save, and persistence dispatchers.
  - Attendance check-in/out terminal and lateness calculation routines.

- **Surgical Edit Guarantee**: Strictly localized block replacements. Zero wholesale file rewrites.

---

## 3. Schemas & TypeScript Contracts

```typescript
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
    accentBg: 'bg-emerald-700' // Passes WCAG AA (5.2:1)
  },
  CISD: {
    arm: 'CISD',
    label: 'CISD (Inclusive Dialogue)',
    shortLabel: 'CISD',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    borderClass: 'border-sky-300',
    textClass: 'text-sky-700',
    accentBg: 'bg-sky-700' // Passes WCAG AA (5.4:1)
  },
  GX_MEDIA: {
    arm: 'GX_MEDIA',
    label: 'GX Media House',
    shortLabel: 'GX Media',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    borderClass: 'border-purple-300',
    textClass: 'text-purple-700',
    accentBg: 'bg-purple-700' // Passes WCAG AA (5.6:1)
  },
  CENTRAL_HOLDING: {
    arm: 'CENTRAL_HOLDING',
    label: 'Central Holding & Governance',
    shortLabel: 'Central',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    borderClass: 'border-slate-300',
    textClass: 'text-slate-700',
    accentBg: 'bg-slate-700' // Passes WCAG AA (6.1:1)
  }
};

export function getOrganizationArmConfig(arm?: OrganizationArm): OrganizationArmMetadata {
  if (!arm || !ORGANIZATION_ARM_CONFIG[arm]) {
    return ORGANIZATION_ARM_CONFIG.CENTRAL_HOLDING;
  }
  return ORGANIZATION_ARM_CONFIG[arm];
}
```

---

## 4. Numbered Acceptance Criteria

- **AC-1**: Staff Directory displays an accessible, mobile-scrollable "Filter by Entity" selector with options: *All Entities (25)*, *Switch Advisory (7)*, *CISD (8)*, *GX Media (7)*, and *Central Holding (3)*.
- **AC-2**: Every employee card in Grid View and row in Table View renders their semantic entity badge alongside their Grade/Access Level (`[Switch Advisory] L5`, `[GX Media] L3`) using WCAG AA compliant color tokens.
- **AC-3**: Adding or editing an employee allows selecting their `OrganizationArm` (`SWITCH_ADVISORY`, `CISD`, `GX_MEDIA`, `CENTRAL_HOLDING`) and `AccessLevel` (`L0` to `L7`), persisting accurately to SQLite and JSON databases.
- **AC-4**: Both the universal `EmployeeProfileModal` (opened from directory or department lists) and `PersonalProfileModule` render the employee's entity badge and access level in the header metadata.
- **AC-5**: In `TimesheetsModule.tsx`, George Kaduna (`emp-5`, GX Lead) only sees submissions from GX Media personnel. Chinonso Aluma (`emp-6`, Switch Lead) only sees Switch Advisory personnel. Marcus Ogunfolaju (`emp-7`, CISD Lead) only sees CISD personnel.
- **AC-6**: In `TimesheetsModule.tsx` and `LeaveModule.tsx`, self-approvals are strictly barred: a Line Manager or HR Admin's own submission never appears in their own approval queue.
- **AC-7**: Server-side BOLA validation in `app/api/data/route.ts` for `REVIEW_TIMESHEET` and `REVIEW_LEAVE`:
  - Rejects self-adjudication attempts with HTTP 400.
  - Rejects Line Manager attempts to adjudicate records outside their `organizationArm` with HTTP 403.
  - Authorizes `role: 'EXECUTIVE'` (Folahan Johnson) alongside `SUPER_ADMIN` and `HR_ADMIN`.
- **AC-8**: Executive Director (`emp-1`, Folahan Johnson) and HR Lead (`emp-2`, Yaradua Phibi) can review and approve timesheets and leaves for Line Managers (George, Chinonso, Marcus) and Central Holding staff.
- **AC-9**: When creating timesheets or applying for leaves, `organizationArm` is snapshotted onto the record so future staff transfers do not distort historical entity audits.
- **AC-10**: In `DepartmentsModule.tsx`, departments display their parent entity badge, and an entity filter allows viewing divisions belonging to Switch Advisory, CISD, GX Media, or Central Services.
- **AC-11**: Null-safety is guaranteed across all modules via `getOrganizationArmConfig()`, eliminating any possibility of `undefined` runtime property access crashes.
