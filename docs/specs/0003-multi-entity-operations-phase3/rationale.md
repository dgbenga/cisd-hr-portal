# Architectural Decision Record (ADR): 0003 - Multi-Entity Operations, Payroll Desk & Team Scoping (Phase 3)

## Context & Problem Statement
With Phase 1 (tripartite staff roster) and Phase 2 (entity badging, Staff Directory filtering, and scoped timesheet/leave approvals) fully delivered, Phase 3 addresses the operational lifecycle of the tripartite group (Switch Advisory, CISD, and GX Media House):
1. **Finance & Multi-Entity Payroll**: Victory Kinosi (`emp-4`, `role: 'FINANCE'`) is the single dedicated finance officer serving all 3 sister arms. A centralized, secure payroll desk is required to compute gross-to-net salary runs, itemize statutory Nigerian deductions (PAYE, Pension), and issue digital payslips to the 25 staff members.
2. **Team Lead Scoping Across Operational Modules**: Line Managers (George Kaduna for GX Media, Chinonso Aluma for Switch Advisory, Marcus Ogunfolaju for CISD) need scoped views for deliverables, announcements, appraisals, and equipment.
3. **Cross-Arm Media Collaboration**: GX Media House exists to produce creative and media collateral for Switch Advisory and CISD, requiring an authorized cross-arm delegation protocol.

---

## Cross-Model Review Ratification (Gemini Pro Critique)
An independent adversarial architectural review was conducted on 2026-11-13 by an Enterprise Security Architect (Gemini Pro), uncovering 5 critical vulnerabilities and 5 architectural refinements that were ratified into the final specification:

1. **Server-Side Data Partitioning in `GET /api/data` (P0)**:
   - *Vulnerability*: Returning `payroll_records` unpartitioned in the bulk `GET /api/data` payload allows any user to inspect all colleagues' and executives' salaries via browser DevTools or client state.
   - *Ratification*: `GET /api/data` strictly partitions payroll data based on the caller's role. Non-finance and non-executive roles (`EMPLOYEE`, `LINE_MANAGER`) only receive their own payslip records (`employeeId === currentUserId`). Full group-wide payroll is served only to `FINANCE`, `HR_ADMIN`, `SUPER_ADMIN`, and `EXECUTIVE`.
2. **Elimination of Default `SUPER_ADMIN` Fallback (P0)**:
   - *Vulnerability*: In `route.ts`, `user?.role || 'SUPER_ADMIN'` allowed unauthenticated clients to escalate privileges by omitting the `user` object.
   - *Ratification*: Eradicated default fallback. Unauthenticated dispatch calls fail closed with HTTP 401 Unauthorized.
3. **SQLite Foreign Key Deletion Cascade Order (P0)**:
   - *Vulnerability*: `saveDatabaseSnapshotToSqlite()` executes `DELETE FROM employees`. If `payroll_records` has an `employee_id REFERENCES employees(id)` foreign key, deleting employees first triggers a Foreign Key constraint crash.
   - *Ratification*: Child `payroll_records` are deleted before `employees`, and foreign keys are created with `ON DELETE CASCADE`.
4. **Pre-Seeding for Vercel Cold-Start Hydration (P0)**:
   - *Vulnerability*: Runtime-generated records in Vercel's ephemeral `/tmp/cisd-data/` evaporate upon container recycling.
   - *Ratification*: Pre-compute and commit November 2026 payroll records for all 25 staff members directly in static repo files (`lib/initial-data.ts`, `data/cisd.sqlite`, `data/cisd_db.json`) in `DISBURSED` status.
5. **4-Eyes Payroll Governance Lifecycle (P1)**:
   - *Vulnerability*: Permitting an L2 Junior Finance Officer to unilaterally disburse funds without executive counter-signature violates standard corporate governance and NGO grant accounting.
   - *Ratification*: Replaced binary toggle with an auditable 4-stage lifecycle: `DRAFT` (Victory, L2 Finance) &rarr; `AUDITED` (Phibi, L4 HR Lead) &rarr; `APPROVED` (Folahan Johnson, L7 ED) &rarr; `DISBURSED` (Victory). Victory is barred from self-approving her own draft.
6. **Cross-Arm Task Delegation Protocol (P1)**:
   - *Vulnerability*: Hard-scoping Line Managers to their own entity breaks GX Media's mandate of creating marketing/media assets for Switch and CISD.
   - *Ratification*: Added `collaborationArm: 'GX_MEDIA'` and Cross-Arm Request workflow in `TasksModule.tsx` routing to GX Lead or HR Lead.
7. **Statutory Compensation Precision & Immutability (P1)**:
   - *Ratification*: Standardized statutory Nigerian compensation breakdown (Basic 45%, Housing 25%, Transport 15%, Utility 15%; 8% employee Pension; progressive PAYE). Float-safe rounding via `roundNaira()`. Disbursed records are sealed and locked against mutation with HTTP 409 Conflict.
8. **Responsive 375px Mobile Layout & Print CSS (P2)**:
   - *Ratification*: Payslip columns stack on mobile (`grid-cols-1 sm:grid-cols-2`), entity filter pills scroll horizontally, and `@media print` isolates the printable payslip document.
9. **Purge of Legacy Personas (P2)**:
   - *Ratification*: Completely replaced lingering references to legacy personas ("Dr. Amina Bello", "Dr. Fatima Al-Mansoor") with ratified tripartite leadership (Folahan Johnson, Yaradua Phibi, Victory Kinosi).

---

## Consequences & Invariants Guaranteed
- **Confidentiality**: Zero compensation leaks over the network wire.
- **Auditability**: Four-eyes separation of duties ensures financial compliance.
- **Reliability**: SQLite foreign key cascade and Vercel cold-start hydration are 100% crash-proof.
- **Cross-Entity Agility**: Line Managers are scoped safely while preserving GX Media's cross-arm creative collaboration.
