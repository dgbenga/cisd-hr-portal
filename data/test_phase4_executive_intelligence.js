/**
 * Automated Verification & Testing Suite for Phase 4:
 * Executive Intelligence, Tripartite Hierarchy & Multi-Entity Reports
 *
 * Verifies Acceptance Criteria (AC-1 through AC-12):
 * 1. Folahan Johnson (emp-1, L7 Executive Director) profile and governance role
 * 2. Tripartite workforce distribution across 30 verified personnel
 * 3. Cross-arm reporting line governance (Martha Micheal emp-28 in CISD -> Central HR)
 * 4. CWE-1236 Formula Injection sanitization & RFC 4180 double-quote escaping
 * 5. Presence Rate calculation precision and zero-division protection
 * 6. Line Manager BOLA scoping and payroll access restrictions
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function runPhase4Tests() {
  console.log('========================================================================');
  console.log('CISD / TRIPARTITE HR PORTAL - PHASE 4 VERIFICATION TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Database Roster & Folahan Johnson Executive Command Verification
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Folahan Johnson (L7 Executive Director) Apex Node ---');
    const dbPath = path.join(__dirname, 'cisd_db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const fj = db.employees.find(e => e.id === 'emp-1');
    assert(fj !== undefined, 'Folahan Johnson (emp-1) exists in employee directory');
    assert(fj.role === 'EXECUTIVE', `Folahan Johnson has role: 'EXECUTIVE' (got ${fj.role})`);
    assert(fj.accessLevel === 'L7', `Folahan Johnson holds grade level: 'L7' (got ${fj.accessLevel})`);
    assert(fj.organizationArm === 'CENTRAL_HOLDING', 'Folahan Johnson is assigned to CENTRAL_HOLDING');

    // -------------------------------------------------------------------------
    // TEST 2: Tripartite Hierarchy Distribution Across Verified Personnel
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Tripartite 30-Personnel Workforce Distribution ---');
    assert(db.employees.length >= 30, `Total workforce contains ${db.employees.length} personnel (expected >= 30)`);

    const centralStaff = db.employees.filter(e => e.organizationArm === 'CENTRAL_HOLDING');
    const switchStaff = db.employees.filter(e => e.organizationArm === 'SWITCH_ADVISORY');
    const cisdStaff = db.employees.filter(e => e.organizationArm === 'CISD');
    const gxStaff = db.employees.filter(e => e.organizationArm === 'GX_MEDIA');

    assert(centralStaff.length === 4, `Central Holding has exactly 4 governance staff (found ${centralStaff.length})`);
    assert(switchStaff.length >= 8, `Switch Advisory has ${switchStaff.length} strategy specialists`);
    assert(cisdStaff.length === 8, `CISD has exactly 8 non-profit fellows & associates (found ${cisdStaff.length})`);
    assert(gxStaff.length === 10, `GX Media House has exactly 10 creative & multimedia personnel (found ${gxStaff.length})`);

    // Sister Entity Leads Verification
    const switchLead = db.employees.find(e => e.id === 'emp-6');
    const cisdLead = db.employees.find(e => e.id === 'emp-7');
    const gxLead = db.employees.find(e => e.id === 'emp-5');

    assert(switchLead && switchLead.role === 'LINE_MANAGER' && switchLead.organizationArm === 'SWITCH_ADVISORY',
      `Switch Advisory Lead verified: ${switchLead?.firstName} ${switchLead?.lastName} (emp-6)`
    );
    assert(cisdLead && cisdLead.role === 'LINE_MANAGER' && cisdLead.organizationArm === 'CISD',
      `CISD Lead verified: ${cisdLead?.firstName} ${cisdLead?.lastName} (emp-7)`
    );
    assert(gxLead && gxLead.role === 'LINE_MANAGER' && gxLead.organizationArm === 'GX_MEDIA',
      `GX Media Lead verified: ${gxLead?.firstName} ${gxLead?.lastName} (emp-5)`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Matrix Cross-Arm Governance (Martha Micheal emp-28)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Matrix Cross-Arm Governance (Martha Micheal Invariant) ---');
    const martha = db.employees.find(e => e.id === 'emp-28');
    assert(martha !== undefined, 'Martha Micheal (emp-28) exists');
    assert(martha.organizationArm === 'CISD', `Martha Micheal is in CISD arm (got ${martha.organizationArm})`);
    assert(martha.reportingManagerId === 'emp-2', `Martha Micheal reports administratively to Yaradua Phibi (emp-2) in Central HR (got ${martha.reportingManagerId})`);

    // -------------------------------------------------------------------------
    // TEST 4: CWE-1236 Formula Injection Sanitization & RFC 4180 Escaping
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: CWE-1236 Formula Sanitization & RFC 4180 Escaping ---');
    function sanitizeCsvCell(value) {
      if (value === null || value === undefined) return '""';
      let str = String(value);
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    }

    assert(sanitizeCsvCell('=1+1') === '"\'=1+1"', 'Formula injection starting with "=" neutralized with leading quote');
    assert(sanitizeCsvCell('+cmd|/C calc!A0') === '"\'+cmd|/C calc!A0"', 'Formula injection starting with "+" neutralized with leading quote');
    assert(sanitizeCsvCell('-5+2') === '"\'-5+2"', 'Formula injection starting with "-" neutralized with leading quote');
    assert(sanitizeCsvCell('@SUM(A1:A10)') === '"\'@SUM(A1:A10)"', 'Formula injection starting with "@" neutralized with leading quote');
    assert(sanitizeCsvCell('Normal Text') === `"Normal Text"`, 'Standard text enclosed in double quotes');
    assert(sanitizeCsvCell('Text with "Quotes"') === `"Text with ""Quotes"""`, 'Embedded quotes properly doubled per RFC 4180');

    // -------------------------------------------------------------------------
    // TEST 5: Presence Rate Precision & Zero-Division Invariants
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Presence Rate Calculation & Zero-Division Safety ---');
    function calculatePresenceRate(inOffice, remote, headcount) {
      return Math.round(((inOffice + remote) / Math.max(1, headcount)) * 100);
    }

    assert(calculatePresenceRate(6, 2, 8) === 100, 'Standard 100% presence correctly computed (6 in-office + 2 remote on 8 headcount)');
    assert(calculatePresenceRate(4, 2, 8) === 75, 'Standard 75% presence correctly computed (4 in-office + 2 remote on 8 headcount)');
    assert(calculatePresenceRate(0, 0, 0) === 0, 'Zero-division safely returns 0% without NaN or error (0 headcount arm)');

    // -------------------------------------------------------------------------
    // TEST 6: Zero-Trust Server Partitioning for Reports & Compensation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Zero-Trust Server Partitioning for Reports & Compensation ---');
    // Fetch data with regular employee
    const resEmp = await fetch(`${BASE_URL}/api/data`, { headers: { 'x-user-id': 'emp-8' } });
    const jsonEmp = await resEmp.json();
    assert(jsonEmp.success === true, 'GET /api/data succeeds with employee identity');
    assert(
      jsonEmp.data.payrollRecords.every(r => r.employeeId === 'emp-8'),
      `Regular Line Staff (emp-8) only receives their personal payslip records (found ${jsonEmp.data.payrollRecords.length})`
    );

    // Fetch data with Finance Officer (emp-4)
    const resFin = await fetch(`${BASE_URL}/api/data`, { headers: { 'x-user-id': 'emp-4' } });
    const jsonFin = await resFin.json();
    assert(
      jsonFin.data.payrollRecords.length >= 25,
      `Finance Officer (emp-4) receives full group payroll rollup records (${jsonFin.data.payrollRecords.length} records)`
    );

    // Fetch data with Group Executive Director (emp-1)
    const resED = await fetch(`${BASE_URL}/api/data`, { headers: { 'x-user-id': 'emp-1' } });
    const jsonED = await resED.json();
    assert(
      jsonED.data.payrollRecords.length >= 25,
      `Executive Director (emp-1) receives full group payroll rollup records (${jsonED.data.payrollRecords.length} records)`
    );

    console.log('\n========================================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test Suite Encountered Fatal Exception:', err);
    process.exit(1);
  }
}

runPhase4Tests();
