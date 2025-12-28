import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Predefined credentials for different roles
const CREDENTIALS: Record<string, { password: string; role: 'STUDENT' | 'TEACHER' | 'LAB_ASSISTANT' | 'PRINCIPAL' | 'ADMIN'; name: string }> = {
  // Admin
  'admin@school.lk': { password: 'admin123', role: 'ADMIN', name: 'System Administrator' },
  
  // Principal
  'principal@school.lk': { password: 'principal123', role: 'PRINCIPAL', name: 'Principal Silva' },
  
  // Teachers
  'teacher1@school.lk': { password: 'teacher123', role: 'TEACHER', name: 'Mr. Perera' },
  'teacher2@school.lk': { password: 'teacher123', role: 'TEACHER', name: 'Mrs. Fernando' },
  
  // Lab Assistants
  'labassist1@school.lk': { password: 'labassist123', role: 'LAB_ASSISTANT', name: 'Lab Assistant Kumar' },
  'labassist2@school.lk': { password: 'labassist123', role: 'LAB_ASSISTANT', name: 'Lab Assistant Nimal' },
  
  // Students
  'student1@school.lk': { password: 'student123', role: 'STUDENT', name: 'Student Amal' },
  'student2@school.lk': { password: 'student123', role: 'STUDENT', name: 'Student Sahan' },
  
  // Seeded Database Users
  'john.doe@school.edu': { password: 'password123', role: 'STUDENT', name: 'John Doe' },
  'jane.smith@school.edu': { password: 'password123', role: 'STUDENT', name: 'Jane Smith' },
  'bob.johnson@school.edu': { password: 'password123', role: 'STUDENT', name: 'Bob Johnson' },
  'mike.assistant@school.edu': { password: 'password123', role: 'LAB_ASSISTANT', name: 'Lab Assistant Mike' },
};

// Helper function to map database role to frontend role
function mapRoleToFrontend(role: string): 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'admin' {
  const roleMap: Record<string, 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'admin'> = {
    'STUDENT': 'student',
    'TEACHER': 'teacher',
    'LAB_ASSISTANT': 'lab-assistant',
    'PRINCIPAL': 'principal',
    'ADMIN': 'admin',
  };
  return roleMap[role] || 'student';
}

// Helper function to determine default role from email
function getDefaultRoleFromEmail(email: string): 'STUDENT' | 'TEACHER' | 'LAB_ASSISTANT' | 'PRINCIPAL' | 'ADMIN' {
  if (email.includes('admin')) return 'ADMIN';
  if (email.includes('principal')) return 'PRINCIPAL';
  if (email.includes('teacher')) return 'TEACHER';
  if (email.includes('lab') || email.includes('assistant')) return 'LAB_ASSISTANT';
  return 'STUDENT';
}

// POST /api/auth/login - Handle user login and auto-insert into database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Check if email is in predefined credentials (admin, teachers, etc.)
    const predefinedCredentials = CREDENTIALS[email];
    
    if (predefinedCredentials) {
      // Validate password for predefined users
      if (predefinedCredentials.password !== password) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid email or password',
          },
          { status: 401 }
        );
      }

      // Check if user exists in database
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // User doesn't exist, create new user with predefined role
        user = await prisma.user.create({
          data: {
            email,
            name: predefinedCredentials.name,
            role: predefinedCredentials.role,
          } as any, // Using 'as any' to allow optional status field
        });
      } else {
        // User exists, update name and role
        user = await prisma.user.update({
          where: { email },
          data: {
            name: predefinedCredentials.name,
            role: predefinedCredentials.role,
          } as any, // Using 'as any' to allow optional status field
        });
      }

      // Try to update status and create session (if available)
      let sessionId: string | undefined;
      try {
        // Try to set status to ONLINE if field exists
        await prisma.user.update({
          where: { email },
          data: { status: 'ONLINE' } as any,
        });
      } catch (e) {
        // Status field not available - continue without it
      }

      try {
        // Try to create session if Session model exists
        const session = await (prisma as any).session.create({
          data: {
            userId: user.id,
            loginTime: new Date(),
          },
        });
        sessionId = session.id.toString();
      } catch (error: any) {
        // Session model not available - continue without session tracking
        console.log('Session tracking not available');
      }

      // Return user data with session ID (if available)
      return NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          user: {
            id: user.id.toString(),
            email: user.email,
            name: user.name || '',
            role: mapRoleToFrontend(user.role),
          },
          ...(sessionId && { sessionId }),
        },
        { status: 200 }
      );
    }

    // For emails not in predefined list, check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Default student passwords for validation
    // In production, passwords should be hashed and stored in the database
    const defaultStudentPasswords = ['student123', 'password123', 'student'];
    
    // Determine if this should be treated as a student based on email pattern
    const isLikelyStudent = !email.includes('admin') && 
                           !email.includes('principal') && 
                           !email.includes('teacher') && 
                           !email.includes('lab') && 
                           !email.includes('assistant');

    if (user) {
      // User exists in database
      // For students, validate password against default student passwords
      if (user.role === 'STUDENT' && isLikelyStudent) {
        // Validate password for existing student users
        if (defaultStudentPasswords.includes(password)) {
          // Try to update user status to ONLINE (if field exists)
          try {
            await prisma.user.update({
              where: { email },
              data: { status: 'ONLINE' } as any,
            });
          } catch (e) {
            // Status field not available - continue without it
          }

          // Try to create session record for login (if Session model exists)
          let sessionId: string | undefined;
          try {
            const session = await (prisma as any).session.create({
              data: {
                userId: user.id,
                loginTime: new Date(),
              },
            });
            sessionId = session.id.toString();
          } catch (error: any) {
            // Session model not available - continue without session tracking
            console.log('Session tracking not available');
          }

          return NextResponse.json(
            {
              success: true,
              message: 'Login successful',
              user: {
                id: user.id.toString(),
                email: user.email,
                name: user.name || '',
                role: mapRoleToFrontend(user.role),
              },
              ...(sessionId && { sessionId }),
            },
            { status: 200 }
          );
        } else {
          return NextResponse.json(
            {
              success: false,
              message: 'Invalid email or password',
            },
            { status: 401 }
          );
        }
      } else {
        // Non-student existing user but not in predefined credentials - require valid credentials
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid email or password',
          },
          { status: 401 }
        );
      }
    }

    // User doesn't exist in database and not in predefined credentials
    // For student emails, automatically create a STUDENT account if password is valid
    if (isLikelyStudent && defaultStudentPasswords.includes(password)) {
      // Extract name from email (e.g., "john.doe@school.edu" -> "John Doe")
      const emailParts = email.split('@')[0].split(/[._-]/);
      const name = emailParts
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');

      // Create new student user automatically
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Student',
          role: 'STUDENT', // Default to STUDENT for new accounts
        } as any, // Using 'as any' to allow optional status field
      });

      // Try to update status to ONLINE (if field exists)
      try {
        await prisma.user.update({
          where: { email },
          data: { status: 'ONLINE' } as any,
        });
      } catch (e) {
        // Status field not available - continue without it
      }

      // Try to create session record for login (if Session model exists)
      let sessionId: string | undefined;
      try {
        const session = await (prisma as any).session.create({
          data: {
            userId: user.id,
            loginTime: new Date(),
          },
        });
        sessionId = session.id.toString();
      } catch (error: any) {
        // Session model not available - continue without session tracking
        console.log('Session tracking not available');
      }

      // Return user data with session ID (if available)
      return NextResponse.json(
        {
          success: true,
          message: 'Login successful. Student account created automatically.',
          user: {
            id: user.id.toString(),
            email: user.email,
            name: user.name || '',
            role: mapRoleToFrontend(user.role),
          },
          ...(sessionId && { sessionId }),
        },
        { status: 200 }
      );
    }

    // Invalid credentials
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid email or password',
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Error during login:', error);
    
    // Handle unique constraint violation (email already exists)
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process login',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

