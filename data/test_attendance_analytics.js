const BASE_URL = 'http://localhost:3000';

async function testAttendanceAndRoles() {
  console.log('--- TESTING ATTENDANCE TERMINAL, MONTHLY ANALYTICS & HR_ADMIN DELETION ---');

  // 1. Fetch DB
  const getRes = await fetch(`${BASE_URL}/api/data`);
  const dbData = await getRes.json();
  if (!dbData.success) {
    console.error('Failed to fetch DB:', dbData.error);
    process.exit(1);
  }
  const db = dbData.data;
  console.log(`✓ Fetched Database: ${db.employees.length} employees, ${db.attendanceRecords.length} attendance records.`);

  // 2. Test Clock In for a staff member who has not clocked in today or a new test employee
  const testStaffEmail = `clockin.tester.${Date.now()}@gmail.com`;
  const addStaffRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'ADD_EMPLOYEE',
      user: { id: 'emp-2', name: 'Dr. Fatima Al-Mansoor', role: 'HR_ADMIN' },
      payload: {
        firstName: 'Zainab',
        lastName: 'Umar',
        email: testStaffEmail,
        password: 'Password@2026',
        departmentId: 'dept-2',
        designation: 'Research Fellow',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        employmentType: 'FULL_TIME',
        joinDate: '2026-11-05',
        workLocation: 'Abuja Head Office'
      }
    })
  });
  const newStaff = (await addStaffRes.json()).data;
  console.log(`✓ Registered fresh employee for clock in: ${newStaff.firstName} ${newStaff.lastName} (${newStaff.employeeId})`);

  console.log(`\n1. Testing Clock In for ${newStaff.firstName}...`);
  const clockInRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'CLOCK_IN',
      user: { id: newStaff.id, name: `${newStaff.firstName} ${newStaff.lastName}`, role: newStaff.role },
      payload: {
        employeeId: newStaff.id,
        workType: 'OFFICE',
        locationName: 'Abuja Head Office (Floor 4)'
      }
    })
  });
  const clockInData = await clockInRes.json();
  if (!clockInData.success) {
    console.error('Failed to clock in:', clockInData.error);
    process.exit(1);
  }
  console.log(`✓ Clock In Successful: Record ID=${clockInData.data.id}, Time=${clockInData.data.clockIn}, Status=${clockInData.data.status}`);

  // 3. Test Clock Out for newStaff
  console.log(`\n2. Testing Clock Out for ${newStaff.firstName}...`);
  const clockOutRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'CLOCK_OUT',
      user: { id: newStaff.id, name: `${newStaff.firstName} ${newStaff.lastName}`, role: newStaff.role },
      payload: { employeeId: newStaff.id }
    })
  });
  const clockOutData = await clockOutRes.json();
  if (!clockOutData.success) {
    console.error('Failed to clock out:', clockOutData.error);
    process.exit(1);
  }
  console.log(`✓ Clock Out Successful: Out Time=${clockOutData.data.clockOut}, Total Hours=${clockOutData.data.workingHours}`);

  // 4. Verify Monthly Records for November 2026
  console.log(`\n3. Verifying Monthly Analytics Data for November 2026...`);
  const refreshRes = await fetch(`${BASE_URL}/api/data`);
  const refreshedDb = (await refreshRes.json()).data;
  const novRecords = refreshedDb.attendanceRecords.filter(r => r.date.startsWith('2026-11'));
  console.log(`✓ November 2026 Records: ${novRecords.length} entries.`);
  const officeCount = novRecords.filter(r => r.workType === 'OFFICE' && r.status !== 'ON_LEAVE').length;
  const remoteCount = novRecords.filter(r => r.workType === 'REMOTE').length;
  const lateCount = novRecords.filter(r => r.status === 'LATE').length;
  console.log(`  - Office Presence: ${officeCount}`);
  console.log(`  - Remote Presence: ${remoteCount}`);
  console.log(`  - Late Arrivals  : ${lateCount}`);
  console.log(`  - Punctuality    : ${Math.round(((officeCount + remoteCount - lateCount) / (officeCount + remoteCount)) * 100)}%`);

  // 5. Test HR ADMIN account deletion capability
  console.log(`\n4. Testing HR ADMIN account deletion on a temporary account...`);
  // First create a temporary staff member
  const tempEmail = `temp.delete.${Date.now()}@yahoo.com`;
  const createRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'ADD_EMPLOYEE',
      user: { id: 'emp-2', name: 'Dr. Fatima Al-Mansoor', role: 'HR_ADMIN' },
      payload: {
        firstName: 'Temp',
        lastName: 'Employee',
        email: tempEmail,
        password: 'Password#123',
        departmentId: 'dept-1',
        designation: 'Intern',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        employmentType: 'CONTRACT',
        joinDate: '2026-11-05',
        workLocation: 'Abuja Head Office'
      }
    })
  });
  const createdEmp = (await createRes.json()).data;
  console.log(`✓ Created temp account ID=${createdEmp.employeeId}`);

  // Now HR_ADMIN deletes the temp account
  const deleteRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'DELETE_EMPLOYEE',
      user: { id: 'emp-2', name: 'Dr. Fatima Al-Mansoor', role: 'HR_ADMIN' },
      payload: { id: createdEmp.id }
    })
  });
  const deleteData = await deleteRes.json();
  if (!deleteData.success) {
    console.error('HR_ADMIN could not delete account:', deleteData.error);
    process.exit(1);
  }
  console.log(`✓ HR_ADMIN successfully deleted account ID=${createdEmp.employeeId}`);

  // Verify HR_ADMIN CANNOT delete SUPER_ADMIN
  console.log(`\n5. Verifying HR_ADMIN is prevented from deleting SUPER_ADMIN (emp-1)...`);
  const deleteSuperRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'DELETE_EMPLOYEE',
      user: { id: 'emp-2', name: 'Dr. Fatima Al-Mansoor', role: 'HR_ADMIN' },
      payload: { id: 'emp-1' }
    })
  });
  const deleteSuperData = await deleteSuperRes.json();
  if (deleteSuperData.success) {
    console.error('FAILED: HR_ADMIN was able to delete SUPER_ADMIN!');
    process.exit(1);
  }
  console.log(`✓ Correctly REJECTED: ${deleteSuperData.error}`);

  console.log('\n--- ALL ATTENDANCE TERMINAL, MONTHLY ANALYTICS & HR_ADMIN DELETION TESTS PASSED! ---');
}

testAttendanceAndRoles().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
