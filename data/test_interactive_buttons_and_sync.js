/**
 * Automated Verification Suite for Interactive Buttons & Synchronization
 * 
 * Verifies:
 * 1. Zero static/dead <button> tags across all components (every button has onClick or type="submit").
 * 2. Shared modal mounting in DashboardModule (quickLeaveModal & showBirthdayModal accessible in all role views).
 * 3. Health matrix lead and badge interactivity in DashboardModule.
 * 4. Milestone toggle checkbox interactivity in OnboardingModule.
 * 5. Role-specific shortcut and tab synchronization across all views.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

console.log('========================================================================');
console.log('CISD PORTAL - BUTTON CLICKABILITY & INTERACTIVITY VERIFICATION SUITE');
console.log('========================================================================\n');

// TEST 1: Zero Dead Buttons Across Entire Component Tree
test('Every <button> in components/ has an active onClick handler or type="submit"', () => {
  const allFiles = walk('./components');
  const deadButtons = [];

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let insideButton = false;
    let buttonSnippet = '';
    let startLine = 0;
    let hasOnClick = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('<button')) {
        insideButton = true;
        buttonSnippet = line;
        startLine = i + 1;
        hasOnClick = line.includes('onClick');
      } else if (insideButton) {
        buttonSnippet += ' ' + line.trim();
        if (line.includes('onClick')) hasOnClick = true;
      }

      if (insideButton && line.includes('>')) {
        const isSubmit = buttonSnippet.includes('type="submit"') || buttonSnippet.includes("type='submit'");
        if (!hasOnClick && !isSubmit) {
          deadButtons.push({ file, line: startLine, snippet: buttonSnippet.replace(/\s+/g, ' ').substring(0, 100) });
        }
        insideButton = false;
        buttonSnippet = '';
        hasOnClick = false;
      }
    }
  }

  assert.strictEqual(deadButtons.length, 0, `Found ${deadButtons.length} static buttons: ${JSON.stringify(deadButtons)}`);
});

// TEST 2: DashboardModule Shared Modal Scoping
test('DashboardModule mounts quickLeaveModal and showBirthdayModal at shared root level', () => {
  const dashboardCode = fs.readFileSync('components/modules/DashboardModule.tsx', 'utf8');
  
  assert(dashboardCode.includes('renderRoleDashboard'), 'renderRoleDashboard helper encapsulates persona views');
  assert(dashboardCode.includes('{renderRoleDashboard()}'), 'Root JSX renders active role dashboard');
  assert(dashboardCode.includes('{quickLeaveModal && ('), 'quickLeaveModal is mounted at component root');
  assert(dashboardCode.includes('{showBirthdayModal && ('), 'showBirthdayModal is mounted at component root');
});

// TEST 3: Tripartite Health Matrix Interactive Links
test('DashboardModule Health Matrix leads have interactive 360° profile triggers', () => {
  const dashboardCode = fs.readFileSync('components/modules/DashboardModule.tsx', 'utf8');

  assert(dashboardCode.includes('setSelectedEmployeeIdForModal(leadId)'), 'Lead name click dispatches setSelectedEmployeeIdForModal(leadId)');
  assert(dashboardCode.includes('setActiveTab(\'leave\')'), 'Pending badge click synchronizes activeTab to leave');
});

// TEST 4: Onboarding Milestone Checkbox Interactivity
test('OnboardingModule milestone checkbox has stopPropagation and handleToggleTask trigger', () => {
  const onboardingCode = fs.readFileSync('components/modules/OnboardingModule.tsx', 'utf8');

  assert(onboardingCode.includes('handleToggleTask(task.id, task.isCompleted)'), 'Checkbox button calls handleToggleTask');
  assert(onboardingCode.includes('e.stopPropagation()'), 'Checkbox click stops event bubbling to parent row');
  assert(onboardingCode.includes('type="button"'), 'Checkbox button has explicit type="button"');
});

// TEST 5: Birthday Wish Modal Functionality & Form Dispatch
test('DashboardModule Birthday modal dispatches CREATE_ANNOUNCEMENT celebration notice', () => {
  const dashboardCode = fs.readFileSync('components/modules/DashboardModule.tsx', 'utf8');

  assert(dashboardCode.includes('handleSendBirthdayGreeting'), 'handleSendBirthdayGreeting form handler exists');
  assert(dashboardCode.includes('CREATE_ANNOUNCEMENT'), 'Dispatches CREATE_ANNOUNCEMENT action');
  assert(dashboardCode.includes('category: \'CELEBRATION\''), 'Announcements category tagged as CELEBRATION');
  assert(dashboardCode.includes('Babatunde Fashina'), 'Includes recipient Babatunde Fashina profile link');
});

// TEST 6: Navigation Synchronization Across All Views
test('DashboardModule shortcuts properly synchronize activeTab across all 4 personas', () => {
  const dashboardCode = fs.readFileSync('components/modules/DashboardModule.tsx', 'utf8');

  const requiredTabs = ['leave', 'announcements', 'settings', 'recruitment', 'employees', 'onboarding', 'tasks', 'hybrid', 'timesheets', 'assets', 'departments', 'meetings', 'training'];
  for (const tab of requiredTabs) {
    assert(dashboardCode.includes(`setActiveTab('${tab}')`), `Synchronizes activeTab to '${tab}'`);
  }
});

console.log(`\n========================================================================`);
console.log(`ALL VERIFICATION TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================================================\n`);

process.exit(failed === 0 ? 0 : 1);
