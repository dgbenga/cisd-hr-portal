// Test script to verify account creation, personal email login, role assignment, promotion hierarchy, and deletion rules

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- STARTING ACCOUNT CREATION & ROLE HIERARCHY TESTS ---');

  // 1. Super Admin creates a new staff account with personal email
  const personalEmail = `tosin.researcher.${Date.now()}@gmail.com`;
  const initialPassword = 'SecurePass#2026';

  console.log(`\n1. Creating new account with personal email: ${personalEmail}`);
  const addRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'ADD_EMPLOYEE',
      user: { id: 'emp-1', name: 'Ambassador Aminu Bello', role: 'SUPER_ADMIN' },
      payload: {
        firstName: 'Tosin',
        lastName: 'Adewale',
        email: personalEmail,
        password: initialPassword,
        phone: '+234 803 111 2222',
        departmentId: 'dept-2',
        designation: 'Senior International Fellow',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        employmentType: 'FULL_TIME',
        joinDate: '2026-11-05',
        workLocation: 'Abuja Head Office',
        gradeLevel: 'Senior Fellow SF-1',
        salaryGrade: 'EXEC-01',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        personalInfo: {
          dob: '1990-08-14',
          gender: 'Male',
          maritalStatus: 'Married',
          nationality: 'Nigerian',
          address: 'Maitama, Abuja',
          bloodGroup: 'O+',
          ninOrPassport: 'NIN-99283741'
        },
        education: [{ degree: 'Ph.D. Strategic Studies', institution: 'University of Ibadan', year: '2019', field: 'Security' }],
        workExperience: [{ company: 'Foreign Affairs Thinktank', role: 'Lead Analyst', fromYear: '2019', toYear: '2026', highlights: 'Authored 14 policy briefs' }],
        emergencyContacts: [{ name: 'Grace Adewale', relationship: 'Spouse', phone: '+234 803 222 3333', email: 'grace@example.com' }],
        dependants: []
      }
    })
  });

  const addData = await addRes.json();
  if (!addData.success) {
    console.error('FAILED to add employee:', addData.error);
    process.exit(1);
  }
  const createdEmp = addData.data;
  console.log(`✓ Account created: ID=${createdEmp.employeeId}, ID_UUID=${createdEmp.id}, Email=${createdEmp.email}, Role=${createdEmp.role}`);

  // 2. Log in with the newly created personal email account
  console.log(`\n2. Testing Login with personal email (${personalEmail}) and password (${initialPassword})...`);
  const loginRes = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'LOGIN',
      payload: {
        email: personalEmail,
        password: initialPassword
      }
    })
  });

  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('FAILED login with personal email:', loginData.error);
    process.exit(1);
  }
  console.log(`✓ Login SUCCESSFUL: Logged in as ${loginData.user.firstName} ${loginData.user.lastName} (${loginData.user.role})`);

  // 3. Test that HR_ADMIN CANNOT promote this employee to HR_ADMIN or SUPER_ADMIN
  console.log(`\n3. Testing Hierarchy Protection: HR_ADMIN attempts to promote employee to HR_ADMIN...`);
  const hrPromoteRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'PROMOTE_EMPLOYEE',
      user: { id: 'emp-2', name: 'Dr. Fatima Al-Mansoor', role: 'HR_ADMIN' },
      payload: {
        id: createdEmp.id,
        newRole: 'HR_ADMIN',
        newDesignation: 'Associate HR Director'
      }
    })
  });

  const hrPromoteData = await hrPromoteRes.json();
  if (hrPromoteData.success) {
    console.error('SECURITY VULNERABILITY: HR_ADMIN was able to promote someone to HR_ADMIN!');
    process.exit(1);
  } else {
    console.log(`✓ Correctly REJECTED: ${hrPromoteData.error}`);
  }

  // 4. Test that HR_ADMIN CAN promote an employee to LINE_MANAGER
  console.log(`\n4. Testing Allowed HR_ADMIN promotion: HR_ADMIN promotes employee to LINE_MANAGER...`);
  const hrLinePromoteRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'PROMOTE_EMPLOYEE',
      user: { id: 'emp-2', name: 'Dr. Fatima Al-Mansoor', role: 'HR_ADMIN' },
      payload: {
        id: createdEmp.id,
        newRole: 'LINE_MANAGER',
        newDesignation: 'Head of Special Projects Unit'
      }
    })
  });

  const hrLinePromoteData = await hrLinePromoteRes.json();
  if (!hrLinePromoteData.success) {
    console.error('FAILED: HR_ADMIN should be able to promote to LINE_MANAGER:', hrLinePromoteData.error);
    process.exit(1);
  }
  console.log(`✓ HR_ADMIN successfully promoted employee to LINE_MANAGER (${hrLinePromoteData.data.designation})`);

  // 5. Test that SUPER_ADMIN CAN promote to HR_ADMIN
  console.log(`\n5. Testing SUPER_ADMIN Promotion: SUPER_ADMIN promotes employee to HR_ADMIN...`);
  const superPromoteRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'PROMOTE_EMPLOYEE',
      user: { id: 'emp-1', name: 'Ambassador Aminu Bello', role: 'SUPER_ADMIN' },
      payload: {
        id: createdEmp.id,
        newRole: 'HR_ADMIN',
        newDesignation: 'Deputy Director of Human Resources'
      }
    })
  });

  const superPromoteData = await superPromoteRes.json();
  if (!superPromoteData.success) {
    console.error('FAILED: SUPER_ADMIN could not promote to HR_ADMIN:', superPromoteData.error);
    process.exit(1);
  }
  console.log(`✓ SUPER_ADMIN successfully promoted employee to ${superPromoteData.data.role}`);

  // 6. Test that HR_ADMIN CAN delete a regular staff account
  console.log(`\n6. Testing Deletion: HR_ADMIN deletes a staff account...`);
  const hrDeleteRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'DELETE_EMPLOYEE',
      user: { id: 'emp-2', name: 'Dr. Fatima Al-Mansoor', role: 'HR_ADMIN' },
      payload: { id: createdEmp.id }
    })
  });

  const hrDeleteData = await hrDeleteRes.json();
  if (!hrDeleteData.success) {
    console.error('FAILED: HR_ADMIN should now be allowed to delete accounts:', hrDeleteData.error);
    process.exit(1);
  }
  console.log(`✓ HR_ADMIN successfully deleted staff account.`);

  // 7. Test that HR_ADMIN CANNOT delete a SUPER_ADMIN account
  console.log(`\n7. Testing Protection: HR_ADMIN attempts to delete SUPER_ADMIN account...`);
  const hrDeleteSuperRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'DELETE_EMPLOYEE',
      user: { id: 'emp-2', name: 'Dr. Fatima Al-Mansoor', role: 'HR_ADMIN' },
      payload: { id: 'emp-1' } // Super Admin
    })
  });

  const hrDeleteSuperData = await hrDeleteSuperRes.json();
  if (hrDeleteSuperData.success) {
    console.error('SECURITY VULNERABILITY: HR_ADMIN was able to delete the Super Admin account!');
    process.exit(1);
  } else {
    console.log(`✓ Correctly REJECTED: ${hrDeleteSuperData.error}`);
  }

  console.log('\n--- ALL ACCOUNT CREATION, PROMOTION HIERARCHY, AND DELETION TESTS PASSED! ---');
}

runTests().catch(err => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});

