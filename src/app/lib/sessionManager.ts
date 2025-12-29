// src/app/lib/sessionManager.ts

export interface Session {
  userId: string;
  otp: string;
  expiresAt: number;
  email: string;
  attempts?: number;
  lastResent?: number;
}

// In-memory session storage
// In production, use Redis, database, or a proper session store
const sessions = new Map<string, Session>();

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(token);
    }
  }
}, 5 * 60 * 1000);

export class SessionManager {
  // Create a new session
  static create(token: string, session: Session): void {
    sessions.set(token, session);
  }

  // Get a session
  static get(token: string): Session | undefined {
    return sessions.get(token);
  }

  // Update a session
  static update(token: string, updates: Partial<Session>): boolean {
    const session = sessions.get(token);
    if (!session) return false;
    
    sessions.set(token, { ...session, ...updates });
    return true;
  }

  // Delete a session
  static delete(token: string): boolean {
    return sessions.delete(token);
  }

  // Check if session exists and is valid
  static isValid(token: string): boolean {
    const session = sessions.get(token);
    if (!session) return false;
    
    if (session.expiresAt < Date.now()) {
      sessions.delete(token);
      return false;
    }
    
    return true;
  }

  // Get all active sessions (for debugging)
  static getAll(): Map<string, Session> {
    return new Map(sessions);
  }

  // Clear all sessions (for testing)
  static clear(): void {
    sessions.clear();
  }
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email/SMS
export async function sendOTP(email: string, otp: string): Promise<void> {
  // In production, integrate with:
  // - Email: SendGrid, AWS SES, Resend, Mailgun
  // - SMS: Twilio, AWS SNS, Nexmo
  
  // For development, log to console
  console.log('='.repeat(60));
  console.log(`📧 OTP Notification`);
  console.log(`To: ${email}`);
  console.log(`Code: ${otp}`);
  console.log(`Expires: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}`);
  console.log('='.repeat(60));
  
  // TODO: Implement actual email/SMS sending
  // Example with SendGrid:
  // await sendgrid.send({
  //   to: email,
  //   from: 'noreply@school.lk',
  //   subject: 'Your Login Verification Code',
  //   text: `Your verification code is: ${otp}`,
  //   html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
  // });
}