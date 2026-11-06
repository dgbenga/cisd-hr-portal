# CISD HR Portal — Centre for International Strategic Dialogue

An enterprise-grade, fully functional Human Resource Management System built specifically for the **Centre for International Strategic Dialogue (CISD)** — an international policy think-tank and multilateral dialogue facilitator based in Abuja, Nigeria.

Inspired by the modular simplicity of Zoho People, the CISD HR Portal features an original institutional identity designed with **Executive Navy Blue (`#0F2744`, `#09182B`)**, **Clean White**, **Soft Slate Grey (`#F8FAFC`)**, and **Refined Diplomatic Gold Accents (`#C69F37`)**.

---

## 🌟 Key Highlights & Architectural Features

1. **Persistent Database Storage (`data/cisd_db.json`):**
   * Real, persistent file-backed database engine.
   * Changes survive page reloads and server restarts.
   * Includes one-click factory reset to restore official CISD institutional seed data anytime.

2. **Full Ecosystem Interconnection (No Data Silos):**
   * **Adding a new staff member** immediately updates total headcount, adds them to their department roster, provisions their leave entitlements, allocates their weekly hybrid schedule, initiates their onboarding checklist, and renders them into the Organizational Hierarchy Chart.
   * **Clocking in/out** dynamically calculates lateness thresholds past 08:30 AM, logs locations (Abuja HQ vs. Remote Workstation), and updates daily executive attendance stats.
   * **Approving a leave request** instantly deducts days from the employee's balance meter and marks their status as `ON_LEAVE` on the daily attendance register.
   * **Assigning an asset** (MacBook Pro, ThinkPad, vehicle, biometric token) immediately displays in the central Asset Register and links into the employee's 360° Dossier.
   * **Hybrid schedule shift requests** update the weekly roster and feed the live **"Expected in Office Today"** seat monitor.
   * **Timesheets** allow weekly project hour tracking against CISD initiatives (e.g. Sahel Peace & Security, AfCFTA Critical Minerals).

3. **Multi-Role RBAC Simulation (Persona Switcher):**
   * Instant persona switcher in the top navigation bar allowing testing of all roles:
     * **Super Administrator:** Dr. Amina Bello (Executive Director & Chief Executive)
     * **HR Administrator:** Olumide Adeyemi (Director of HR & Administration)
     * **Line Manager:** Amb. Ibrahim Mukhtar (Director of Research & Policy Dialogue)
     * **Senior Staff / Fellow:** Dr. Chidi Okonkwo (Senior Strategic Policy Fellow)
     * **New Hire on Probation:** Aisha Mohammed (Research Analyst - Energy Transition)

---

## 🏛️ All 20 Functional Modules

| # | Module | Core Capabilities |
|---|---|---|
| **1** | **Executive Dashboard** | Headcount, on-duty active staff, in-office vs remote ratio, pending approval queue, departmental breakdown, birthdays, anniversaries, and quick shortcuts. |
| **2** | **Staff Directory & Personnel** | Grid and Table views, filters by department, status, and contract type, full search, and Add/Edit staff modal. |
| **3** | **Employee 360° Dossier** | Comprehensive modal with 7 tabs: Personal Info, Job Placement, Education & Prior Experience, Emergency Contacts & Dependants, Assigned Assets, Leave & Attendance Logs, Appraisals, and Documents. |
| **4** | **Daily Attendance Terminal** | Real-time clock-in/out, lateness calculation (+mins past 08:30 AM), remote vs. on-site tags, attendance correction request form, and managerial review. |
| **5** | **Leave Management** | Entitlement meters (Annual 21d, Sick 12d, Casual 5d, Study/Unpaid), leave application with handover colleague selector, and managerial approve/reject queue. |
| **6** | **CISD Hybrid Work Roster** | 3-in-office / 2-remote framework, Monday & Thursday core days, weekly master matrix, and "Who is in the Office Today?" seat capacity monitor. |
| **7** | **Departments & Governance** | The 5 core CISD divisions: *HR & Administration, Research, Finance, Communications, Strategy & Programmes* with assigned department heads, budgets, and member rosters. |
| **8** | **Strategic Deliverables (Tasks)** | Kanban board (5 statuses: *Not Started, In Progress, Under Review, Completed, Overdue*), priority tags, progress percentage sliders, and overdue alerts. |
| **9** | **Meetings & Dialogue Sessions** | Diplomatic roundtables, executive briefings, virtual room URLs, participant invitations, minutes recorder, and actionable follow-up task checkboxes. |
| **10** | **Asset Management** | Tracking of laptops, phones, 4K monitors, official vehicles, AV gear, and badges; asset assignment, return to pool, condition, and serial numbers. |
| **11** | **Recruitment (ATS)** | Requisition postings, candidate tracking pipeline (*Applied &rarr; Screening &rarr; Interview &rarr; Offer &rarr; Hired*), ratings, and offer letter details. |
| **12** | **New Hire Onboarding** | Step-by-step onboarding pipeline (Documentation, IT configuration, Code of Conduct sign-off, orientation, and 90-day probation review). |
| **13** | **Document Vault** | Categorized secure repository for Institutional Policies, Contracts, Appointment Letters, and Administrative Forms with one-click downloads. |
| **14** | **Performance Appraisals & KPIs** | Annual and mid-year review cycles, KPI scorecard breakdowns, supervisor scores, strengths, and professional development plans. |
| **15** | **CISD Academy & Training** | Diplomatic negotiation masterclasses, geopolitical AI foresight, counter-espionage protocols, enrollment, and certification tracking. |
| **16** | **Institutional Noticeboard** | Official circulars, summit advisories, birthday greetings, priority alerts, and interactive read-receipt acknowledgments. |
| **17** | **Executive Reports & Analytics** | Statistical summaries with date/division filters, and one-click export to **CSV** and **Printable Executive PDF**. |
| **18** | **Interactive Org Chart** | Visual hierarchy tree showing reporting chains from the Executive Director to Department Directors and Senior Fellows. |
| **19** | **Timesheets & Project Hours** | Daily Monday–Friday time logging against strategic initiatives, weekly total calculations, and manager sign-off workflows. |
| **20** | **Settings & System Audit Trail** | Institutional metadata configuration, working hours, leave quotas, and immutable real-time audit logs of every system transaction. |

---

## 🚀 How to Run the Application

### 1. Ensure Dependencies are Installed
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience the portal.

### 3. Production Build & Start
```bash
npm run build
npm run start
```

---

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router, Server Actions / Route Handlers)
- **Language:** TypeScript 5.6
- **Styling:** Tailwind CSS with CISD Navy (`#0F2744`) & Gold (`#C69F37`) Palette
- **Icons:** Lucide React
- **Data Layer:** Persistent JSON Database Engine (`data/cisd_db.json`)
- **Exporting:** Dynamic RFC 4180 CSV Generator & Browser Print Engine

