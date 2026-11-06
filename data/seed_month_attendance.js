const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'cisd.sqlite');
const db = new Database(dbPath);

console.log('Seeding rich monthly attendance data into SQLite...');

const employees = db.prepare('SELECT id, employee_id, first_name, last_name, department_id FROM employees').all();

// Working dates for November 2026 prior to Nov 5
const dates = [
  { date: '2026-11-02', day: 'Monday' },
  { date: '2026-11-03', day: 'Tuesday' },
  { date: '2026-11-04', day: 'Wednesday' },
  { date: '2026-10-30', day: 'Friday' },
  { date: '2026-10-29', day: 'Thursday' },
  { date: '2026-10-28', day: 'Wednesday' }
];

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO attendance_records 
  (id, employee_id, date, clock_in, clock_out, status, work_type, location_name, working_hours, lateness_minutes, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let insertedCount = 0;

db.transaction(() => {
  for (const { date } of dates) {
    for (const emp of employees) {
      const existing = db.prepare('SELECT id FROM attendance_records WHERE employee_id = ? AND date = ?').get(emp.id, date);
      if (existing) continue;

      const recordId = `att-${date}-${emp.id}`;
      
      // Determine varied realistic patterns
      const rand = (emp.id.charCodeAt(emp.id.length - 1) + date.charCodeAt(date.length - 1)) % 10;
      
      let status = 'PRESENT';
      let workType = 'OFFICE';
      let location = 'Abuja Head Office';
      let clockIn = '08:15';
      let clockOut = '17:15';
      let hours = 8.5;
      let lateMinutes = 0;
      let notes = null;

      if (rand === 0 || rand === 7) {
        status = 'REMOTE';
        workType = 'REMOTE';
        location = 'Approved Home Station';
        clockIn = '08:30';
        clockOut = '17:00';
        hours = 8.0;
      } else if (rand === 4) {
        status = 'LATE';
        workType = 'OFFICE';
        location = 'Abuja Head Office';
        clockIn = '08:52';
        clockOut = '17:30';
        hours = 8.1;
        lateMinutes = 22;
        notes = 'Heavy traffic delay on Airport Road';
      } else if (rand === 9 && emp.id === 'emp-7') {
        status = 'ON_LEAVE';
        workType = 'OFFICE';
        location = 'Leave';
        clockIn = '-';
        clockOut = '-';
        hours = 0;
        notes = 'Approved study leave';
      } else if (rand === 1) {
        clockIn = '08:05';
        clockOut = '17:20';
        hours = 8.7;
      } else if (rand === 2) {
        clockIn = '08:24';
        clockOut = '17:05';
        hours = 8.2;
      }

      insertStmt.run(
        recordId,
        emp.id,
        date,
        clockIn,
        clockOut,
        status,
        workType,
        location,
        hours,
        lateMinutes,
        notes
      );
      insertedCount++;
    }
  }
})();

console.log(`✓ Inserted ${insertedCount} historical working attendance records.`);

// Update mirror json if exists
try {
  const fs = require('fs');
  const jsonPath = path.join(__dirname, 'cisd_db.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const allRecords = db.prepare('SELECT * FROM attendance_records').all().map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      date: r.date,
      clockIn: r.clock_in,
      clockOut: r.clock_out,
      status: r.status,
      workType: r.work_type,
      locationName: r.location_name,
      workingHours: r.working_hours,
      latenessMinutes: r.lateness_minutes,
      notes: r.notes
    }));
    data.attendanceRecords = allRecords;
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✓ Updated json mirror with ${allRecords.length} records.`);
  }
} catch (e) {
  console.warn('JSON mirror update error:', e.message);
}

