import { NextRequest, NextResponse } from 'next/server';
import prisma  from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      orderBy: { createdDate: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdDate: true,
        lastLogin: true,
        customPrivileges: true,
        revokedPrivileges: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, customPrivileges, revokedPrivileges } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase().replace('-', '_'),
        status: 'ACTIVE',
        customPrivileges: customPrivileges || [],
        revokedPrivileges: revokedPrivileges || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdDate: true,
        lastLogin: true,
        customPrivileges: true,
        revokedPrivileges: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user (for status changes and privilege updates)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, role, status, customPrivileges, revokedPrivileges } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role.toUpperCase().replace('-', '_');
    if (status) updateData.status = status.toUpperCase();
    if (customPrivileges !== undefined) updateData.customPrivileges = customPrivileges;
    if (revokedPrivileges !== undefined) updateData.revokedPrivileges = revokedPrivileges;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdDate: true,
        lastLogin: true,
        customPrivileges: true,
        revokedPrivileges: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (user?.role === 'ADMIN' || user?.role === 'PRINCIPAL') {
      return NextResponse.json(
        { error: 'Cannot delete admin or principal accounts' },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// PUT - Update user (full update)
export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, role } = await request.json();

    if (!id || !name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const emailTaken = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        NOT: { id },
      },
    });

    if (emailTaken) {
      return NextResponse.json(
        { error: 'Email is already in use by another user' },
        { status: 400 }
      );
    }

    const roleMap: { [key: string]: Role } = {
      'student': Role.STUDENT,
      'teacher': Role.TEACHER,
      'lab-assistant': Role.LAB_ASSISTANT,
      'principal': Role.PRINCIPAL,
      'admin': Role.ADMIN,
    };

    const roleEnum = roleMap[role.toLowerCase()];
    if (!roleEnum) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: roleEnum,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdDate: true,
        lastLogin: true,
        customPrivileges: true,
        revokedPrivileges: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}