# Architectural Decision Record (ADR): 0002 - Multi-Entity Scoping & Approvals (Phase 2)

## Context & Problem Statement
Following Phase 1's establishment of the tripartite multi-entity staff roster (Switch Advisory, CISD, GX Media House, and Central Services), the front-end user experience needs explicit entity scoping:
1. Team leads (George for GX, Chinonso for Switch, Marcus for CISD) must have focused, secure approval queues so they are not burdened with timesheets and leaves from unrelated sister entities.
2. HR and C-suite leadership (Folahan Johnson, Yaradua Phibi, Oluwatosin Onemola, Victory Kinosi) require group-wide governance with one-click filtering by entity.
3. Employees across the sister arms need clear visual badging to foster identity while preserving smooth cross-entity collaboration.

## Cross-Model Review Ratification (Gemini Pro Critique)
An independent cross-model architectural review was conducted on 2026-11-11 by a Principal Staff Engineer & Security Architect agent, identifying 8 critical blind spots that were ratified into the final specification:
1. **Server-Side BOLA & Anti-Self-Approval Enforcement**: Relying solely on client UI filtering creates an insecure "security through CSS" posture. `app/api/data/route.ts` is brought into the blast radius to enforce server-side entity containment and ban self-adjudication at the network boundary.
2. **Unblocking Executive Director Authorization**: `app/api/data/route.ts` previously omitted `role: 'EXECUTIVE'`, causing HTTP 403 authorization deadlocks when Folahan Johnson (L7 ED) attempted to adjudicate timesheets/leaves for his direct reports (the 3 Line Managers). `EXECUTIVE` is now formally authorized.
3. **Null-Safe Entity Configuration**: Added `getOrganizationArmConfig()` to guarantee safe fallback to `CENTRAL_HOLDING` in the event of missing or legacy employee/department arm assignments, preventing React unmount crashes.
4. **Universal 360° Dossier Inclusion**: Added `components/EmployeeProfileModal.tsx` to the blast radius alongside `PersonalProfileModule.tsx`.
5. **Historical Entity Preservation**: Snapshotted `organizationArm` onto `Timesheet` and `LeaveRequest` records upon creation, preventing historical timesheet audit distortion during intra-group employee transfers.
6. **Recruitment Auto-Provisioning Synchronization**: In `UPDATE_CANDIDATE_STAGE` (`stage: 'HIRED'`), automatically derive `organizationArm` from the target department and set `accessLevel: 'L1'`.
7. **WCAG 2.1 AA Contrast Compliance**: Updated solid accent color tokens (Emerald 700, Sky 700, Purple 700) to meet the 4.5:1 minimum contrast ratio requirement against white text.
8. **Mobile Viewport Containment**: Configured horizontal scroll containers with short entity labels for 375px mobile viewports to prevent wrapping and layout breakage.

## Consequences & Positive Invariants
- Line Manager queues in Timesheets and Leave are hardened both on the client and in `/api/data`.
- Folahan Johnson and Yaradua Phibi have a seamless governance path to approve Line Managers and Central Services personnel.
- All 25 staff members and future hires benefit from consistent, crash-proof, accessible multi-entity badging.
