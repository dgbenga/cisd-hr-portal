# Feature Spec: 0001 - Organization Restructure Phase 1 (Real Multi-Entity Staff Roster)

- **Status**: Proposed
- **Owner**: Adebayo (Principal Architect) / Oluwatosin Onemola (HR Lead)
- **Target Date**: 2026-11-11
- **Entities Covered**: Switch Advisory, CISD (Centre for Inclusive Social Development), GX Media House

---

## 1. 100% Requirement Ingestion Matrix (Anti-Lossy Traceability)

| Detail # | User-Explained Detail / Constraint | Implementation Target | Acceptance Criterion |
|---|---|---|---|
| **D-1** | Three distinct sister entities: Switch Advisory (implementation & consulting), CISD (NGO / non-profit), and GX Media House (media & branding for Switch and CISD). | `lib/types.ts` (`OrganizationArm`), `lib/initial-data.ts` (`initialDepartments`), `lib/sqlite.ts` | **AC-1** |
| **D-2** | Executive Director: Folahan Johnson ("FJ", L7) oversees all three arms without routine data-entry burden. | `lib/initial-data.ts`, `components/LoginView.tsx`, `components/Navbar.tsx` | **AC-2** |
| **D-3** | Dedicated HR Team: Yaradua Phibi (Lead HR, L4) and Oluwatosin Onemola (HR Assistant, L2). HR operates the whole engine with full admin rights. | `lib/initial-data.ts`, `components/LoginView.tsx`, `components/Navbar.tsx` | **AC-3** |
| **D-4** | Department/Arm Team Leads: George Kaduna (GX Media Lead, L5), Chinonso Aluma (Switch Advisory Lead, L5), and Marcus Ogunfolaju (CISD Lead, L6). | `lib/initial-data.ts`, `components/LoginView.tsx`, `components/Navbar.tsx` | **AC-4** |
| **D-5** | Shared Finance Desk: Victory Kinosi (Finance & Admin Officer, L2) serving all 3 arms. | `lib/initial-data.ts`, `components/LoginView.tsx`, `components/Navbar.tsx` | **AC-5** |
| **D-6** | Complete real staff roster mapped from L0 (intern) to L7 (C-Suite) with accurate designations, emails, and reporting managers across GX, Switch, and CISD. | `lib/initial-data.ts` (`initialEmployees`) | **AC-6** |
| **D-7** | Database auto-seed & migration preserves existing tables while seamlessly populating the new real entities in SQLite and JSON mirror. | `lib/db.ts`, `lib/sqlite.ts`, `data/cisd.sqlite`, `data/cisd_db.json` | **AC-7** |

---

## 2. Non-Destructive Blast-Radius Contract (Anti-Regression Lock)

- **Target Blast Radius**:
  - `lib/types.ts`: Add `organizationArm?: OrganizationArm` (`'SWITCH_ADVISORY' | 'CISD' | 'GX_MEDIA' | 'EXECUTIVE'`) and `accessLevel?: AccessLevel` (`'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7'`) to `Employee`.
  - `lib/initial-data.ts`: Replace placeholder demo employees with the real 25-person team mapped from the CISD/Switch/GX org chart. Update departments to reflect the 3 arms + Executive + Central Services.
  - `lib/sqlite.ts`: Add schema migration for `organization_arm` and `access_level` on the `employees` table, update seed inserter, and add auto-reseed routine.
  - `components/LoginView.tsx`: Update preseed persona cards to feature FJ (ED), Phibi & Tosin (HR), George (GX Lead), Chinonso (Switch Lead), Marcus (CISD Lead), Victory (Finance), and staff members.
  - `components/Navbar.tsx`: Update executive persona switcher dropdown to match the real staff roster.

- **Protected Working Surface ("DO NOT TOUCH")**:
  - All auth password logic (`ADMIN_MASTER_PASSWORD`, `DEFAULT_STAFF_PASSWORD`, `isMatchingMasterPassword`, `sanitizeSecret`).
  - Vercel `/tmp` copy and cold-start recovery logic (`isVercel` in `sqlite.ts` and `db.ts`).
  - Timesheet save draft, auto-upsert, and approval workflows in `TimesheetsModule.tsx` and `app/api/data/route.ts`.
  - Core layouts, sidebar navigation, attendance punch engine, and audit logging.

- **Surgical Edit Guarantee**:
  - Zero wholesale rewrites. Only localized block modifications.

---

## 3. Schemas & TypeScript Contracts

```typescript
export type OrganizationArm = 'CISD' | 'SWITCH_ADVISORY' | 'GX_MEDIA' | 'CENTRAL_HOLDING';
export type AccessLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7';

export interface Employee {
  // ... existing fields ...
  organizationArm?: OrganizationArm;
  accessLevel?: AccessLevel;
}
```

---

## 4. Numbered Acceptance Criteria

- **AC-1**: Database contains departments representing the 3 arms: CISD (`dept-cisd`), Switch Advisory (`dept-switch`), GX Media House (`dept-gx`), plus Executive Directorate (`dept-exec`), HR & Admin (`dept-hr`), and Finance & Accounts (`dept-finance`).
- **AC-2**: Folahan Johnson (FJ) is seeded as Executive Director with `accessLevel: 'L7'`, `role: 'SUPER_ADMIN'`, email `folahan.johnson@cisdialogue.org`.
- **AC-3**: Yaradua Phibi (`L4`, `HR_ADMIN`) and Oluwatosin Onemola (`L2`, `HR_ADMIN`) are seeded as the HR administration team.
- **AC-4**: George Kaduna (`L5`, `LINE_MANAGER`, GX Media), Chinonso Aluma (`L5`, `LINE_MANAGER`, Switch Advisory), and Marcus Ogunfolaju (`L6`, `LINE_MANAGER`, CISD) are seeded as Team Leads with direct reporting links to their respective team members.
- **AC-5**: Victory Kinosi is seeded as Finance & Admin Officer (`L2`, `FINANCE`, Switch Advisory & Group-wide).
- **AC-6**: All 20+ staff members from the uploaded org chart are correctly seeded with matching grade levels, designations, and arms.
- **AC-7**: Preseed account switcher on the Login page and Navbar allows one-click switching between FJ, Phibi, Tosin, George, Chinonso, Marcus, Victory, and staff members without password friction.

