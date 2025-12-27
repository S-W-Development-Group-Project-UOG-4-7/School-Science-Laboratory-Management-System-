import { NextResponse } from 'next/server';

// Attendance API removed — endpoint retained to return 410 Gone for any requests.
export function POST() {
  return NextResponse.json(
    { success: false, message: 'Attendance API has been removed' },
    { status: 410 }
  );
}

export function GET() {
  return NextResponse.json(
    { success: false, message: 'Attendance API has been removed' },
    { status: 410 }
  );
}

