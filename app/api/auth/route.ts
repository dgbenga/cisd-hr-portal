/**
 * ==============================================================================
 * CISD HR PORTAL - AUTHENTICATION & ACCESS CONTROL API (`/api/auth`)
 * ==============================================================================
 * 
 * SECURITY ARCHITECTURE:
 * - Master Admin Password:
 *   Stored securely on the server via `process.env.ADMIN_MASTER_PASSWORD`.
 *   It is NEVER sent to the client browser or bundled into client JavaScript.
 * - Everyday Employee Access:
 *   Validates staff credentials by matching official email / Employee ID
 *   against active database records with default staff password (`CISD@2026`).
 * - Role Simulation Protection:
 *   The preseeded accounts switcher is locked server-side and requires entering
 *   the master password (`AdminTosin123`) before elevated personas are unlocked.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { readDb, recordAuditLog, writeDb } from '@/lib/db';
import { Employee } from '@/lib/types';

const ADMIN_MASTER_PASSWORD = process.env.ADMIN_MASTER_PASSWORD || 'AdminTosin123';
const DEFAULT_STAFF_PASSWORD = process.env.DEFAULT_STAFF_PASSWORD || 'CISD@2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const db = readDb();

    switch (action) {
      // 1. REGULAR & EXECUTIVE LOGIN
      case 'LOGIN': {
        const { identifier, email, password } = payload || {};

        if (!password) {
          return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
        }

        const rawIdentifier = identifier || email || '';
        const trimmedIdentifier = rawIdentifier.trim().toLowerCase();
        const trimmedPassword = (password || '').trim();

        // Check if master admin password was entered
        const isMasterAdminPassword = trimmedPassword === ADMIN_MASTER_PASSWORD;

        // If master admin password was provided with executive identifier
        if (isMasterAdminPassword) {
          let targetEmp: Employee | undefined;

          if (trimmedIdentifier) {
            targetEmp = db.employees.find(
              e => e.email.toLowerCase() === trimmedIdentifier ||
                   e.employeeId.toLowerCase() === trimmedIdentifier
            );
          }

          // If no specific staff identifier provided or identifier is 'admin' / 'superadmin', default to Super Admin
          if (!targetEmp) {
            targetEmp = db.employees.find(e => e.role === 'SUPER_ADMIN') || db.employees[0];
          }

          recordAuditLog(
            db,
            'AUTH_LOGIN_SUCCESS',
            'Security',
            `Executive login successful for ${targetEmp.firstName} ${targetEmp.lastName} (${targetEmp.role}) via Master Key`,
            targetEmp.id,
            `${targetEmp.firstName} ${targetEmp.lastName}`
          );
          writeDb(db);

          return NextResponse.json({
            success: true,
            user: targetEmp,
            isAdminUnlocked: true,
            message: 'Executive session authenticated with full clearance.'
          });
        }

        // Standard staff login: require valid email or Employee ID
        if (!trimmedIdentifier) {
          return NextResponse.json({
            success: false,
            error: 'Please enter your Login Email or Employee ID'
          }, { status: 400 });
        }

        const employee = db.employees.find(
          e => e.email.toLowerCase() === trimmedIdentifier ||
               e.employeeId.toLowerCase() === trimmedIdentifier
        );

        if (!employee) {
          return NextResponse.json({
            success: false,
            error: 'No active staff member found matching that Email or Employee ID.'
          }, { status: 401 });
        }

        // Validate staff password (accepts custom account password, standard institutional default, or individual employeeId)
        const isStaffPasswordMatch =
          (employee.password && trimmedPassword === employee.password) ||
          trimmedPassword === DEFAULT_STAFF_PASSWORD ||
          trimmedPassword.toLowerCase() === employee.employeeId.toLowerCase();

        if (!isStaffPasswordMatch) {
          recordAuditLog(
            db,
            'AUTH_LOGIN_FAILED',
            'Security',
            `Failed authentication attempt for ${trimmedIdentifier}`,
            employee.id,
            `${employee.firstName} ${employee.lastName}`
          );
          writeDb(db);

          return NextResponse.json({
            success: false,
            error: 'Invalid password. Please enter your institutional staff password.'
          }, { status: 401 });
        }

        // Successful regular staff login
        recordAuditLog(
          db,
          'AUTH_LOGIN_SUCCESS',
          'Security',
          `Staff member ${employee.firstName} ${employee.lastName} (${employee.employeeId}) logged into portal`,
          employee.id,
          `${employee.firstName} ${employee.lastName}`
        );
        writeDb(db);

        return NextResponse.json({
          success: true,
          user: employee,
          isAdminUnlocked: employee.role === 'SUPER_ADMIN',
          message: `Welcome back, ${employee.firstName}.`
        });
      }

      // 2. UNLOCK PRESEEDED ACCOUNTS & EXECUTIVE ROLE SWITCHER
      case 'VERIFY_ADMIN_PASSWORD': {
        const { password } = payload || {};
        const trimmed = (password || '').trim();

        if (trimmed === ADMIN_MASTER_PASSWORD) {
          recordAuditLog(
            db,
            'ADMIN_SWITCHER_UNLOCKED',
            'Security',
            'Executive Master Persona Switcher unlocked successfully',
            'admin',
            'Executive Administrator'
          );
          writeDb(db);

          return NextResponse.json({
            success: true,
            isAdminUnlocked: true,
            message: 'Administrative Persona Switcher authorized.'
          });
        }

        return NextResponse.json({
          success: false,
          error: 'Incorrect Administrative Master Password. Access to preseeded elevated personas denied.'
        }, { status: 403 });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown authentication action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[CISD Auth Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

