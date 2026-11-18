# Feature Spec: 0004 - Executive Intelligence, Tripartite Hierarchy & Multi-Entity Reports (Phase 4)

- **Status**: Accepted & Ratified (Cross-Model Critique Incorporated)
- **Owner**: Adebayo (Principal Architect) / Folahan Johnson (Executive Director) / Yaradua Phibi (Lead HR)
- **Reviewer**: Principal Staff Systems Engineer & Enterprise Security Architect (Gemini Pro)
- **Target Date**: 2026-11-19
- **Entities Covered**: Switch Advisory, CISD (Centre for Inclusive Social Development), GX Media House, Central Holding & Governance
- **Total Headcount Covered**: 30 Verified Personnel across 4 Arms (`emp-1` to `emp-30`)

---

## 1. 100% Requirement Ingestion Matrix (Anti-Lossy Traceability)

| Detail # | User / Security Ratification Constraint | Implementation Target | Acceptance Criterion |
|---|---|---|---|
| **D-1** | **Multi-Entity Executive Command Center & Role Unification (P0 Ratification)**: Unify `role === 'SUPER_ADMIN' \|\| role === 'EXECUTIVE'` so Folahan Johnson (`emp-1`, L7 Executive Director) has full access to View 1 alongside Yaradua Phibi (`emp-2`, Super Admin). Provide an interactive Entity Filter pill bar: *All Arms (Group-Wide)*, *Switch Advisory*, *CISD*, *GX Media House*, and *Central Holding*. KPIs dynamically recalculate based on the active entity. | `components/modules/DashboardModule.tsx` | **AC-1**, **AC-2** |
| **D-2** | **Tripartite Entity Health & Operations Matrix**: Executive dashboard displays a dedicated high-craft 4-arm overview matrix showing active headcount, presence rate, pending approvals, and verified arm leadership (`Chinonso Aluma` for Switch, `Marcus Ogunfolaju` for CISD, `George Kaduna` for GX Media, `Folahan Johnson` for Central). | `components/modules/DashboardModule.tsx` | **AC-3** |
| **D-3** | **Line Manager Dashboard Auto-Scoping**: When Line Managers log in (George Kaduna `emp-5` for GX, Chinonso Aluma `emp-6` for Switch, Marcus Ogunfolaju `emp-7` for CISD), the dashboard automatically locks to their `currentUser.organizationArm`, displays their entity badge, and scopes all team metrics strictly to their unit. | `components/modules/DashboardModule.tsx` | **AC-4** |
| **D-4** | **Tripartite Interactive Org Chart & Governance Tree (P0 Ratification)**: Redesign `OrgChartModule.tsx` from single-entity CISD hierarchy to full Tripartite Architecture: Apex Node (Folahan Johnson, ED L7), Central Shared Services Branch (HR: Phibi `emp-2` & Tosin `emp-3`, Finance: Victory `emp-4`), and Sister Entity Operational Nodes (Switch Lead: Chinonso `emp-6`, CISD Lead: Marcus `emp-7`, GX Lead: George `emp-5`) with verified reporting lines for all 30 staff members. | `components/modules/OrgChartModule.tsx` | **AC-5**, **AC-6** |
| **D-5** | **Matrix Cross-Arm Reporting Line Support (P1 Ratification)**: Correctly model cross-arm reporting for Martha Micheal (`emp-28`, `organizationArm: 'CISD'`, reporting to `emp-2` Yaradua Phibi in Central HR) with an explicit "Administrative Line: Central HR" indicator without breaking single-parent tree layouts. | `components/modules/OrgChartModule.tsx` | **AC-7** |
| **D-6** | **Defensive BOLA Enforcement on Reports (P1 Ratification)**: In `ReportsModule.tsx`, enforce `effectiveArm = (currentUser.role === 'LINE_MANAGER') ? currentUser.organizationArm : filterArm` at both presentation and export layers. Line managers are blocked from harvesting cross-arm data. Regular employees are blocked from accessing group reports. | `components/modules/ReportsModule.tsx` | **AC-8** |
| **D-7** | **Parameterized Payroll & Compensation Rollup (P1 Ratification)**: Add a dedicated "Payroll & Compensation Rollup" report type in `ReportsModule.tsx` (restricted to `FINANCE`, `HR_ADMIN`, `SUPER_ADMIN`, and `EXECUTIVE`), parameterized by `filterMonth` (defaulting to latest active cycle, e.g. `'2026-11'`) to prevent multi-month historical summation traps. Non-authorized roles cannot access this report. | `components/modules/ReportsModule.tsx` | **AC-9** |
| **D-8** | **CWE-1236 Formula Injection Defense & RFC 4180 Escaping (P1 Ratification)**: In `ReportsModule.tsx`, sanitize all CSV cells by prepending a single-quote (`'`) if cell values start with `=`, `+`, `-`, or `@`. Inner quotes must be doubled (`""`). Export uses `URL.createObjectURL(new Blob(...))` to prevent data URI truncation. CSV includes explicit `Organization Arm` column and dynamic filenames. | `components/modules/ReportsModule.tsx` | **AC-10** |
| **D-9** | **Presence Rate Precision & Dynamic Date Resolution (P1 Ratification)**: Calculate Presence Rate as `Math.round(((inOfficeToday + remoteToday) / Math.max(1, armHeadcount)) * 100)`. Dynamically resolve `todayStr` from the latest attendance record date when today has 0 entries, ensuring newly recorded attendance logs immediately reflect in presence metrics. | `components/modules/DashboardModule.tsx` | **AC-11** |
| **D-10** | **Responsive 375px Mobile Canvas & Print Layout Optimization (P2 Ratification)**: Entity pill bars scroll horizontally without wrapping, org chart supports touch pan/scroll with mobile tree view, print view hides navigation/sidebars and formats cleanly on A4 landscape, and all badges comply with WCAG 2.1 AA contrast standards using `ORGANIZATION_ARM_CONFIG`. | `components/modules/DashboardModule.tsx`, `components/modules/OrgChartModule.tsx`, `components/modules/ReportsModule.tsx` | **AC-12** |

---

## 2. Non-Destructive Blast-Radius Contract (Anti-Regression Lock)

- **Target Blast Radius**:
  - `components/modules/DashboardModule.tsx`:
    - Add `EXECUTIVE` to View 1 role check: `if (role === 'SUPER_ADMIN' || role === 'EXECUTIVE')`.
    - Add `filterArm` state (`'ALL' | OrganizationArm`).
    - Add horizontal Entity Filter pill bar for Executive and HR views.
    - Dynamically scope KPI counters (headcount, attendance, pending approvals, overdue deliverables) to `filterArm`.
    - Implement zero-division safe Presence Rate formula and dynamic date fallback.
    - Add "Tripartite Entity Health & Operations Matrix" organism.
    - Scope Line Manager dashboard view to `currentUser.organizationArm`.
  - `components/modules/OrgChartModule.tsx`:
    - Redesign layout to feature Apex Executive Directorate (Folahan Johnson `emp-1`, L7), Central Services Branch (Phibi `emp-2`, Victory `emp-4`, Tosin `emp-3`), and Tripartite Sister Arm Branches (Switch Lead: Chinonso `emp-6`, CISD Lead: Marcus `emp-7`, GX Lead: George `emp-5`).
    - Add matrix handling for Martha Micheal (`emp-28`, CISD &rarr; Central HR).
    - Add entity filter switcher (`ALL`, `SWITCH_ADVISORY`, `CISD`, `GX_MEDIA`, `CENTRAL_HOLDING`).
    - Integrate `getOrganizationArmConfig()` semantic badges and reporting line connectors.
  - `components/modules/ReportsModule.tsx`:
    - Add `filterArm` dropdown selector and filter pill tabs.
    - Enforce defensive BOLA scoping: `effectiveArm = isLineManager ? currentUser.organizationArm : filterArm`.
    - Add `PAYROLL` report type with `filterMonth` selector, Nigerian Naira (₦) formatting, and role-based gating.
    - Implement CWE-1236 CSV formula sanitization and `Blob` export generator with `Organization Arm` column.
    - Add `@media print` style overrides for clean landscape reports.
  - `lib/types.ts`:
    - Add `ExecutiveReportType = 'HEADCOUNT' | 'ATTENDANCE' | 'LEAVE' | 'ASSETS' | 'PROJECTS' | 'PAYROLL'`.
    - Add `TripartiteOrgChartNode` interface.

- **Protected Working Surface ("DO NOT TOUCH" Inventory)**:
  - Auth password logic (`ADMIN_MASTER_PASSWORD`, `DEFAULT_STAFF_PASSWORD`, `sanitizeSecret`).
  - Phase 3 Group Payroll Desk and 4-Eyes Governance engine in `components/modules/PayrollModule.tsx` and `app/api/data/route.ts`.
  - Digital Payslip self-service tab and modal in `components/modules/PersonalProfileModule.tsx`.
  - Phase 2 scoped line manager approvals in `TimesheetsModule.tsx` and `LeaveModule.tsx`.
  - Daily Attendance clock-in terminal and lateness calculation engine in `AttendanceModule.tsx`.
  - SQLite persistence layer and Vercel cold-start hydration in `lib/sqlite.ts` and `lib/db.ts`.

- **Surgical Edit Guarantee**: Strictly localized block additions and edits. Zero wholesale file overwrites.

---

## 3. Schemas & TypeScript Contracts

```typescript
// Extended Report Type in lib/types.ts
export type ExecutiveReportType = 
  | 'HEADCOUNT' 
  | 'ATTENDANCE' 
  | 'LEAVE' 
  | 'ASSETS' 
  | 'PROJECTS' 
  | 'PAYROLL';

// Entity Health Overview Card Data Contract
export interface EntityHealthSummary {
  arm: OrganizationArm;
  label: string;
  leadName: string;
  leadDesignation: string;
  leadId: string;
  headcount: number;
  inOfficeToday: number;
  remoteToday: number;
  presenceRate: number; // Formula: Math.round(((inOfficeToday + remoteToday) / Math.max(1, headcount)) * 100)
  pendingApprovalsCount: number;
  totalPayrollGross: number;
  totalPayrollNet: number;
}

// Tripartite Hierarchy Node
export interface TripartiteOrgNode {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  avatar: string;
  arm: OrganizationArm;
  role: UserRole;
  accessLevel: AccessLevel;
  reportingManagerId?: string;
  isCrossArmReporting?: boolean;
  administrativeManagerName?: string;
  directReportsCount: number;
}

// CSV Sanitization Helper (CWE-1236 Formula Injection Defense)
export function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // Prepend single-quote if cell begins with dangerous spreadsheet execution tokens
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Double-quote RFC 4180 escaping
  return `"${str.replace(/"/g, '""')}"`;
}
```

---

## 4. Numbered Acceptance Criteria

- **AC-1**: In `DashboardModule.tsx`, when Folahan Johnson (`emp-1`, `role: 'EXECUTIVE'`) or Yaradua Phibi (`emp-2`, `role: 'SUPER_ADMIN'`) logs in, View 1 (Executive Command Center) mounts. The interactive Entity Filter pill bar displays: *All Arms (Group-Wide)*, *Switch Advisory*, *CISD*, *GX Media House*, and *Central Holding*.
- **AC-2**: Selecting an entity filter updates all Executive Dashboard KPI stat cards (Total Workforce, On-Site Today, Remote/Field, Pending Leaves, Pending Timesheets, Overdue Deliverables) to calculate exclusively for employees belonging to the selected arm.
- **AC-3**: The Executive Dashboard renders a responsive **Tripartite Entity Health & Operations Matrix** with 4 distinct cards for Switch Advisory, CISD, GX Media House, and Central Holding, summarizing headcount, presence, pending sign-offs, and verified arm leads (`Chinonso Aluma`, `Marcus Ogunfolaju`, `George Kaduna`, `Folahan Johnson`).
- **AC-4**: When a Line Manager (`role: 'LINE_MANAGER'`) logs into the dashboard (George Kaduna `emp-5` for GX, Chinonso Aluma `emp-6` for Switch, Marcus Ogunfolaju `emp-7` for CISD), the dashboard automatically locks to their `currentUser.organizationArm`, displays their entity badge, and scopes all team metrics strictly to their unit.
- **AC-5**: In `OrgChartModule.tsx`, the chart title and structure represent the full Tripartite Institutional Governance: Folahan Johnson (Executive Director, L7) at the apex, connected to Central Shared Services (Phibi, Victory, Tosin) and the 3 Sister Entity Leads (Switch Advisory, CISD, GX Media House).
- **AC-6**: Under each Sister Entity Lead, direct team members across all 30 staff members are grouped with their designations and reporting relationships clearly visualized with semantic entity badges.
- **AC-7**: The Org Chart accurately displays Martha Micheal (`emp-28`, `organizationArm: 'CISD'`) under CISD with an explicit "Administrative Line: Central HR (Yaradua Phibi)" badge. Clicking any node opens that employee's 360° dossier.
- **AC-8**: In `ReportsModule.tsx`, an Entity Filter selector is available. For Line Managers, this filter is defensively locked to their own sister arm (`currentUser.organizationArm`) at both presentation and data-filtering levels, preventing cross-arm data harvesting.
- **AC-9**: A new report type, **"Payroll & Compensation Rollup"**, is available in `ReportsModule.tsx` for authorized roles (`FINANCE`, `HR_ADMIN`, `SUPER_ADMIN`, `EXECUTIVE`), parameterized by `filterMonth` (defaulting to latest active cycle), displaying gross salary, statutory PAYE, pension, and net pay in Nigerian Naira (₦). Non-authorized roles cannot access this report.
- **AC-10**: Clicking "Export Selected CSV" in `ReportsModule.tsx` sanitizes all values against spreadsheet formula injection (CWE-1236), includes an explicit `Organization Arm` column in RFC 4180 format, and downloads via a `Blob` URL with an entity-tagged filename (e.g. `SwitchAdvisory_Headcount_Report_2026-11-18.csv`).
- **AC-11**: Presence Rate is calculated as `Math.round(((inOfficeToday + remoteToday) / Math.max(1, armHeadcount)) * 100)` with division-by-zero protection. When today's date has 0 records, the date dynamically resolves to the latest attendance record date.
- **AC-12**: The UI renders cleanly on 375px mobile viewports with horizontal scrollable filter tabs, touch-friendly tap targets (&ge;44px), print-optimized landscape CSS, and 100% WCAG 2.1 AA contrast compliance using `ORGANIZATION_ARM_CONFIG`.
