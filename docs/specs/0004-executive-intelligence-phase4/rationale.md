# Architectural Decision Record (ADR): 0004 - Executive Intelligence, Tripartite Hierarchy & Multi-Entity Reports (Phase 4)

## Context & Problem Statement
With Phase 1 (tripartite staff roster), Phase 2 (entity badging, Staff Directory filtering, and scoped timesheet/leave approvals), and Phase 3 (multi-entity payroll desk, 4-eyes governance, and operational scoping) fully delivered, the portal's high-level executive and analytical views require alignment:
1. **Executive Dashboard**: Previously treated the organization as a monolithic block. Folahan Johnson (Executive Director, `emp-1`, L7) was inadvertently locked out of the Executive Command Center due to a role check omission (`EXECUTIVE` omitted from View 1). In addition, senior leadership required high-level drill-downs to monitor operational health, presence rates, and approval bottlenecks across each distinct sister arm (Switch Advisory, CISD, GX Media House, Central Holding).
2. **Organizational Hierarchy (Org Chart)**: Previously displayed a single-tier CISD-specific diagram with broken dynamic queries (`.includes('Director')`), rendering Tier 2 completely empty and placing HR above the Executive Director. The actual tripartite structure consists of Folahan Johnson at the executive apex, Central Shared Services (HR & Finance), and 3 sister arms led by their verified Line Managers:
   - Switch Advisory Lead: Chinonso Aluma (`emp-6`)
   - CISD Lead: Marcus Ogunfolaju (`emp-7`)
   - GX Media Lead: George Kaduna (`emp-5`)
3. **Cross-Arm Reporting & Roster Realities**: The real roster contains 30 employees (`emp-1` to `emp-30`). Employee `emp-28` (Martha Micheal) has `organizationArm: 'CISD'` but reports to `emp-2` (Yaradua Phibi, Central Holding HR), requiring matrix tree support.
4. **Institutional Reports & CSV Security**: Reports lacked entity-level filtering, and raw CSV generation lacked defense against spreadsheet formula injection (CWE-1236).

---

## Architectural Decisions & Trade-Offs

### ADR-1: Role Unification for Executive Command Center
- **Decision**: Unify `role === 'SUPER_ADMIN' || role === 'EXECUTIVE'` in `DashboardModule.tsx`.
- **Rationale**: Folahan Johnson (`emp-1`, L7) holds the `EXECUTIVE` role and must have full executive command center visibility alongside HR Super Administrator Yaradua Phibi (`emp-2`).

### ADR-2: Dynamic Client-Side Entity Slicing in Executive Dashboard
- **Decision**: In `DashboardModule.tsx`, maintain an active `filterArm` state that dynamically recalculates workforce numbers, attendance, leave, timesheets, and deliverables in real time.
- **Rationale**: Avoids unnecessary network round-trips by leveraging the local hydrated database state in `PortalContext`. Provides instant, zero-latency switching between Group-Wide and Sister Arm views.

### ADR-3: Tripartite Entity Health Matrix
- **Decision**: Add a dedicated 4-arm overview matrix in the Executive Command Center displaying active headcount, presence rate, pending approvals, and lead officers.
- **Rationale**: Empowers Folahan Johnson to assess group health at a glance without having to drill into individual sub-tabs.

### ADR-4: Hierarchical Tripartite Tree Structure in Org Chart
- **Decision**: Architect the org chart into 3 distinct functional tiers:
  - **Tier 1 (Executive Apex)**: Executive Directorate (Folahan Johnson, `emp-1`, L7).
  - **Tier 2 (Central Shared Services & Sister Entity Leadership)**:
    - Central Holding: Yaradua Phibi (`emp-2`, HR Lead L4), Victory Kinosi (`emp-4`, Finance Officer L2), Oluwatosin Onemola (`emp-3`, HR Assistant L2).
    - Switch Advisory Lead: Chinonso Aluma (`emp-6`, L5).
    - CISD Lead: Marcus Ogunfolaju (`emp-7`, L6).
    - GX Media Lead: George Kaduna (`emp-5`, L5).
  - **Tier 3 (Operational Teams)**: Direct team members grouped under their respective sister entity and reporting leads across all 30 employees.
- **Rationale**: Accurately reflects the legal and operational holding company governance model established in Phase 1 and fixes the empty Tier 2 bug.

### ADR-5: CSV Formula Injection Defense (CWE-1236) & RFC 4180 Escaping
- **Decision**: Sanitize all cell contents by prepending a single-quote (`'`) if values start with `=`, `+`, `-`, or `@`. Double inner quotes (`""`) for RFC 4180 compliance, and export via `URL.createObjectURL(new Blob(...))` instead of URI encoding.
- **Rationale**: Eliminates spreadsheet remote execution vulnerabilities when executives open exported reports in Microsoft Excel or Google Sheets, while preventing URI truncation on large datasets.

### ADR-6: Matrix Cross-Arm Governance (Martha Micheal Invariant)
- **Decision**: Render Martha Micheal (`emp-28`, `organizationArm: 'CISD'`) under the CISD branch with an explicit visual badge: `"Administrative Line: Central HR (Yaradua Phibi)"`.
- **Rationale**: Allows single-parent visual nesting under CISD while accurately declaring cross-arm supervisory governance.

### ADR-7: Strict Workforce Presence Rate vs Punctuality Metric
- **Decision**: Decouple arrival timeliness from physical/remote seat presence. Calculate presence as:
  $$\text{Presence Rate} = \text{round}\left(\frac{\text{In-Office} + \text{Remote}}{\max(1, \text{Arm Headcount})} \times 100\right)$$
  and dynamically resolve `todayStr` from the latest attendance record date when today has 0 entries.
- **Rationale**: Guarantees meaningful presence metrics even with 0 current-day check-ins and prevents `NaN` division-by-zero crashes.

---

## Invariants & Guardrails Guaranteed
- **Confidentiality & Defensive BOLA**: Line managers are prohibited from harvesting analytical reports and compensation data outside their assigned sister arm at both presentation and data-filtering levels.
- **Zero-Drift Consistency**: Reuses existing `ORGANIZATION_ARM_CONFIG` and semantic color tokens (`cisd-navy-*`, `cisd-gold-*`, emerald for Switch, blue for CISD, purple for GX Media).
- **Zero Regressions**: Existing Phase 1, Phase 2, and Phase 3 features remain completely untouched.
