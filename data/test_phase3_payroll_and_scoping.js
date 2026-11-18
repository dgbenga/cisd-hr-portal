/**
 * Integration Test Suite for Phase 3:
 * 1. GET /api/data privacy partitioning (sensitive payroll data scoped to caller).
 * 2. 4-Eyes separation of duties in Payroll lifecycle (DRAFT -> AUDITED -> APPROVED -> DISBURSED -> IMMUTABLE).
 * 3. BOLA enforcement on CREATE_TASK (Line manager cross-arm restriction vs GX Media creative request).
 * 4. Entity-targeted announcements & Line manager restriction.
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('========================================================================');
  console.log('CISD / TRIPARTITE HR PORTAL - PHASE 3 INTEGRATION TEST SUITE');
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
    // TEST 1: Unauthenticated GET /api/data privacy partitioning
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Privacy Partitioning for Unauthenticated Caller ---');
    const resUnauth = await fetch(`${BASE_URL}/api/data`);
    const jsonUnauth = await resUnauth.json();
    assert(jsonUnauth.success === true, 'GET /api/data succeeds');
    assert(
      Array.isArray(jsonUnauth.data.payrollRecords) && jsonUnauth.data.payrollRecords.length === 0,
      'Unauthenticated caller receives 0 payroll records (zero data leak)'
    );

    // -------------------------------------------------------------------------
    // TEST 2: Standard Employee GET /api/data privacy partitioning
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Privacy Partitioning for Standard Employee (Peace Okeke - emp-10) ---');
    const resEmp = await fetch(`${BASE_URL}/api/data`, {
      headers: { 'x-user-id': 'emp-10' }
    });
    const jsonEmp = await resEmp.json();
    assert(jsonEmp.success === true, 'GET /api/data succeeds with x-user-id');
    const empRecords = jsonEmp.data.payrollRecords;
    assert(
      empRecords.length > 0 && empRecords.every(r => r.employeeId === 'emp-10'),
      `Standard employee receives only their own payslips (found ${empRecords.length} records, all for emp-10)`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Privileged Finance Officer GET /api/data
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Privileged Finance Access (Victory Kinosi - emp-4) ---');
    const resFinance = await fetch(`${BASE_URL}/api/data`, {
      headers: { 'x-user-id': 'emp-4' }
    });
    const jsonFinance = await resFinance.json();
    assert(
      jsonFinance.data.payrollRecords.length >= 30,
      `Finance Officer receives full group payroll records (found ${jsonFinance.data.payrollRecords.length} records)`
    );

    // -------------------------------------------------------------------------
    // TEST 4: 4-Eyes Governance on Group Payroll (Test Period: 2026-12)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: 4-Eyes Governance Workflow (December 2026 Cycle) ---');
    const testMonth = '2026-12';

    // 4.1 Victory (Finance L2) generates payroll drafts
    console.log('4.1 Victory Kinosi drafts December 2026 payroll...');
    const draftRes = await fetch(`${BASE_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'GENERATE_PAYROLL',
        user: { id: 'emp-4', name: 'Victory Kinosi', role: 'FINANCE' },
        payload: { month: testMonth }
      })
    });
    const draftJson = await draftRes.json();
    assert(draftJson.success === true, `Draft generation succeeded for ${draftJson.count} staff members`);

    // 4.2 Separation of Duties: Victory tries to audit her own drafts -> MUST FAIL
    console.log('4.2 Victory attempts to audit her own drafts (Self-Audit Violation)...');
    const selfAuditRes = await fetch(`${BASE_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'AUDIT_PAYROLL',
        user: { id: 'emp-4', name: 'Victory Kinosi', role: 'HR_ADMIN' }, // Even if role spoofed as HR
        payload: { month: testMonth }
      })
    });
    const selfAuditJson = await selfAuditRes.json();
    assert(selfAuditJson.success === false, 'Self-audit rejected by server (Separation of Duties enforced)');

    // 4.3 Yaradua Phibi (Lead HR L4) audits the payroll
    console.log('4.3 Yaradua Phibi (Lead HR) audits the December 2026 payroll...');
    const auditRes = await fetch(`${BASE_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'AUDIT_PAYROLL',
        user: { id: 'emp-2', name: 'Yaradua Phibi', role: 'HR_ADMIN' },
        payload: { month: testMonth }
      })
    });
    const auditJson = await auditRes.json();
    assert(auditJson.success === true, `Yaradua Phibi successfully audited ${auditJson.count} payroll records`);

    // 4.4 Folahan Johnson (Executive Director L7) authorizes disbursement
    console.log('4.4 Folahan Johnson (Executive Director) authorizes payroll disbursement...');
    const approveRes = await fetch(`${BASE_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'APPROVE_PAYROLL',
        user: { id: 'emp-1', name: 'Folahan Johnson', role: 'EXECUTIVE' },
        payload: { month: testMonth }
      })
    });
    const approveJson = await approveRes.json();
    assert(approveJson.success === true, `Folahan Johnson successfully approved ${approveJson.count} payroll records`);

    // 4.5 Victory (Finance L2) executes bank salary disbursement
    console.log('4.5 Victory Kinosi executes bank salary disbursement...');
    const disburseRes = await fetch(`${BASE_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'DISBURSE_PAYROLL',
        user: { id: 'emp-4', name: 'Victory Kinosi', role: 'FINANCE' },
        payload: { month: testMonth }
      })
    });
    const disburseJson = await disburseRes.json();
    assert(disburseJson.success === true, `Disbursement executed for ${disburseJson.count} staff members`);

    // 4.6 Immutability Check: Attempting to edit a disbursed payroll record -> MUST FAIL 409
    console.log('4.6 Attempting to edit a disbursed payroll record (Immutability check)...');
    const editRes = await fetch(`${BASE_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_PAYROLL_RECORD',
        user: { id: 'emp-4', name: 'Victory Kinosi', role: 'FINANCE' },
        payload: { id: `pay-emp-10-${testMonth}`, basicSalary: 9999999 }
      })
    });
    assert(editRes.status === 409, `Disbursed record edit rejected with HTTP 409 Conflict (got ${editRes.status})`);

    // -------------------------------------------------------------------------
    // TEST 5: BOLA Scoping on Task Assignments
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Task Delegation & BOLA Scoping ---');
    // Chinonso Aluma (Switch Advisory Lead, emp-8) tries to assign directly to GX Media staff (emp-17) WITHOUT cross-arm request
    console.log('5.1 Chinonso tries unauthorized direct cross-arm assignment to GX staff...');
    const taskFailRes = await fetch(`${BASE_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_TASK',
        user: { id: 'emp-8', name: 'Chinonso Aluma', role: 'LINE_MANAGER' },
        payload: {
          title: 'Direct Cross-Arm Attempt',
          description: 'Build infographic',
          assignedToId: 'emp-17', // Joy Ogbonna, GX Media
          isCrossArm: false
        }
      })
    });
    const taskFailJson = await taskFailRes.json();
    assert(taskFailJson.success === false, 'Unauthorized cross-arm task assignment blocked by BOLA');

    // 5.2 Chinonso uses authorized Cross-Arm Request to GX Media House
    console.log('5.2 Chinonso delegates via authorized Cross-Arm Request to GX Media...');
    const taskPassRes = await fetch(`${BASE_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_TASK',
        user: { id: 'emp-8', name: 'Chinonso Aluma', role: 'LINE_MANAGER' },
        payload: {
          title: 'Switch Q4 Strategy Report Infographic',
          description: 'Design visual infographic for public distribution',
          assignedToId: 'emp-17', // Joy Ogbonna, GX Media
          isCrossArm: true,
          collaborationArm: 'GX_MEDIA'
        }
      })
    });
    const taskPassJson = await taskPassRes.json();
    assert(taskPassJson.success === true, 'Authorized Cross-Arm creative deliverable request succeeded');

    // -------------------------------------------------------------------------
    // TEST 6: Entity-Targeted Noticeboard Announcements
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Entity-Targeted Announcements ---');
    // George Kaduna (GX Media Lead, emp-16) tries to broadcast notice targeted to SWITCH_ADVISORY -> MUST FAIL
    console.log('6.1 George Kaduna tries to broadcast notice to Switch Advisory...');
    const annFailRes = await fetch(`${BASE_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_ANNOUNCEMENT',
        user: { id: 'emp-16', name: 'George Kaduna', role: 'LINE_MANAGER' },
        payload: {
          title: 'Notice for Switch',
          content: 'Hello Switch staff',
          category: 'OFFICIAL_MEMO',
          priority: 'NORMAL',
          targetArm: 'SWITCH_ADVISORY'
        }
      })
    });
    const annFailJson = await annFailRes.json();
    assert(annFailJson.success === false, 'Cross-entity announcement broadcast blocked for Line Manager');

    // 6.2 George broadcasts notice targeted to GX_MEDIA -> SUCCEEDS
    console.log('6.2 George Kaduna broadcasts notice targeted to GX_MEDIA...');
    const annPassRes = await fetch(`${BASE_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_ANNOUNCEMENT',
        user: { id: 'emp-16', name: 'George Kaduna', role: 'LINE_MANAGER' },
        payload: {
          title: 'Studio Lighting Upgrade Scheduled',
          content: 'The production studio will undergo lighting maintenance on Friday.',
          category: 'OFFICIAL_MEMO',
          priority: 'NORMAL',
          targetArm: 'GX_MEDIA'
        }
      })
    });
    const annPassJson = await annPassRes.json();
    assert(annPassJson.success === true, 'Entity-targeted announcement broadcast succeeded');

    console.log('\n========================================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
