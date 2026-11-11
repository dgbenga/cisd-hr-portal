# Architectural Decision Record (ADR): 0001 - Organization Restructure Phase 1

## Context & Problem Statement
The CISD HR Portal was originally built with generic diplomatic personas (e.g., Dr. Amina Bello, Amb. Ibrahim Mukhtar). In reality, the organization operates as a tripartite structure encompassing:
1. **Switch Advisory** (Public sector consulting and policy implementation)
2. **CISD** (Non-profit NGO dedicated to inclusive social dialogue)
3. **GX Media House** (Creative, branding, and media agency serving both arms)

Central corporate functions (Executive Directorate, HR & Administration, and Finance) provide governance across all three arms. The application requires real staff records matching the verified CISD Role-Based Organizational Structure (Levels L0 through L7) to ensure authentic testing, role scoping, targeted notifications, and payroll workflows.

## Decision Drivers
- **Zero-Friction Role Simulation**: Allow stakeholders (FJ, Phibi, Tosin, George, Chinonso, Marcus, Victory) to log in and immediately see their tailored portal experience without configuration.
- **Accurate Subordination & Approvals**: Timesheets, leave requests, and deliverables must flow to the correct Team Lead (George for GX, Chinonso for Switch, Marcus for CISD) and up to HR and ED.
- **Backward Compatibility**: Existing database tables (attendance, tasks, assets, timesheets, documents) must continue to function seamlessly with foreign key relationships updated to real employee IDs.

## Evaluated Alternatives
- *Alternative 1*: Maintain separate databases for each company. **Rejected** because FJ, HR (Phibi & Tosin), and Finance (Victory) operate centrally across all three arms. A single unified database with `organizationArm` tagging provides group-level visibility with clean departmental boundaries.
- *Alternative 2*: Replace all tables from scratch. **Rejected** because preserving operational modules (timesheets, audit logs, policies) ensures uninterrupted continuity.

## Consequences & Positive Invariants
- The system now accurately reflects the real people, hierarchy, and three operational entities.
- Subsequent phases (Targeted Notices, Payslips, Departmental Assets) will directly consume `organizationArm` and `accessLevel`.

