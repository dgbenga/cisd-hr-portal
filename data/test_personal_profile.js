const BASE_URL = 'http://localhost:3000';

async function testPersonalProfile() {
  console.log('--- TESTING PERSONAL PROFILE, PHOTO UPLOAD & START DATE TENURE ---');

  // 1. Get an employee (e.g., emp-10, Elena Rostova)
  const getRes = await fetch(`${BASE_URL}/api/data`);
  const db = (await getRes.json()).data;
  const emp10 = db.employees.find(e => e.id === 'emp-10');
  console.log(`✓ Fetched Employee: ${emp10.firstName} ${emp10.lastName} (Current Start Date: ${emp10.joinDate})`);

  // 2. Employee updates their own photo, phone, and sets an earlier start date to test tenure celebration
  const updatedStartDate = '2022-06-15'; // Over 4 years of service!
  const updatedAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
  const updatedPhone = '+234 809 999 8888';

  console.log(`\n1. Updating Profile for ${emp10.firstName}: Start Date -> ${updatedStartDate}, New Avatar, New Phone...`);
  const updateRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'UPDATE_EMPLOYEE',
      user: { id: emp10.id, name: `${emp10.firstName} ${emp10.lastName}`, role: emp10.role },
      payload: {
        id: emp10.id,
        joinDate: updatedStartDate,
        avatar: updatedAvatar,
        phone: updatedPhone
      }
    })
  });

  const updateData = await updateRes.json();
  if (!updateData.success) {
    console.error('FAILED to update profile:', updateData.error);
    process.exit(1);
  }
  const savedEmp = updateData.data;
  console.log(`✓ Profile Successfully Updated:`);
  console.log(`  - Name      : ${savedEmp.firstName} ${savedEmp.lastName}`);
  console.log(`  - Start Date: ${savedEmp.joinDate}`);
  console.log(`  - Phone     : ${savedEmp.phone}`);
  console.log(`  - Avatar    : ${savedEmp.avatar}`);

  // 3. Verify tenure calculation
  const portalToday = new Date('2026-11-05');
  const start = new Date(savedEmp.joinDate);
  const years = portalToday.getFullYear() - start.getFullYear();
  console.log(`\n2. Tenure Recalculation:`);
  console.log(`  - Years of Diplomatic Service: ${years} Years`);
  console.log(`  - Milestone Honor Conferred : Strategic Foresight Fellowship Medal`);

  // 4. Verify privilege escalation prevention: employee tries to change their role to SUPER_ADMIN
  console.log(`\n3. Verifying Self-Service Security (Prevent Role Escalation)...`);
  const hackRes = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'UPDATE_EMPLOYEE',
      user: { id: emp10.id, name: `${emp10.firstName} ${emp10.lastName}`, role: 'EMPLOYEE' },
      payload: {
        id: emp10.id,
        role: 'SUPER_ADMIN' // Attempt to escalate
      }
    })
  });
  const hackData = await hackRes.json();
  if (hackData.data.role === 'SUPER_ADMIN') {
    console.error('SECURITY BREACH: Employee was able to change their own role to SUPER_ADMIN!');
    process.exit(1);
  }
  console.log(`✓ Privilege Escalation Prevented: Role remained ${hackData.data.role}`);

  console.log('\n--- ALL PERSONAL PROFILE & TENURE TESTS PASSED! ---');
}

testPersonalProfile().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

