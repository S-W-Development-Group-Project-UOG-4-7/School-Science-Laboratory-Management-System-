// app/api/users/bulk-import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role, Status } from '@prisma/client';

interface ImportUser {
  name: string;
  email: string;
  role: string;
  password: string;
  rowNumber: number;
}

interface ImportError {
  row: number;
  email: string;
  error: string;
}

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'No users provided' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as ImportError[],
    };

    // Process each user
    for (const user of users as ImportUser[]) {
      try {
        // Validate required fields
        if (!user.name || !user.email || !user.password) {
          results.failed++;
          results.errors.push({
            row: user.rowNumber,
            email: user.email || 'Unknown',
            error: 'Missing required fields (name, email, or password)',
          });
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
          results.failed++;
          results.errors.push({
            row: user.rowNumber,
            email: user.email,
            error: 'Invalid email format',
          });
          continue;
        }

        // Validate role
        const validRoles = ['student', 'teacher', 'lab-assistant', 'principal', 'admin'];
        if (!validRoles.includes(user.role.toLowerCase())) {
          results.failed++;
          results.errors.push({
            row: user.rowNumber,
            email: user.email,
            error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
          });
          continue;
        }

        // Convert role to enum format
        const roleMap: { [key: string]: Role } = {
          'student': Role.STUDENT,
          'teacher': Role.TEACHER,
          'lab-assistant': Role.LAB_ASSISTANT,
          'principal': Role.PRINCIPAL,
          'admin': Role.ADMIN,
        };
        const roleEnum = roleMap[user.role.toLowerCase()];

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });

        if (existingUser) {
          results.failed++;
          results.errors.push({
            row: user.rowNumber,
            email: user.email,
            error: 'Email already exists in the system',
          });
          continue;
        }

        // Validate password strength (minimum 6 characters)
        if (user.password.length < 6) {
          results.failed++;
          results.errors.push({
            row: user.rowNumber,
            email: user.email,
            error: 'Password must be at least 6 characters long',
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Create user
        await prisma.user.create({
          data: {
            name: user.name.trim(),
            email: user.email.toLowerCase().trim(),
            password: hashedPassword,
            role: roleEnum,
            status: Status.ACTIVE,
          },
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: user.rowNumber,
          email: user.email || 'Unknown',
          error: error.message || 'Failed to create user',
        });
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk import', details: error.message },
      { status: 500 }
    );
  }
}