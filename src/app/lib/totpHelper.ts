// src/app/lib/totpHelper.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Encryption key for storing secrets (use env variable in production)
const ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY || 'your-32-char-secret-key-here!!';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt TOTP secret before storing in database
 */
export function encryptSecret(secret: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt TOTP secret from database
 */
export function decryptSecret(encryptedSecret: string): string {
  const [ivHex, encrypted] = encryptedSecret.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(userEmail: string, appName: string = 'Science Lab System') {
  const secret = speakeasy.generateSecret({
    name: `${appName} (${userEmail})`,
    issuer: appName,
    length: 32,
  });
  
  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url!,
  };
}

/**
 * Generate QR code data URL from TOTP secret
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify a TOTP token
 */
export function verifyTOTPToken(token: string, secret: string): boolean {
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1, // Allow 1 time step before/after (30 seconds tolerance)
    });
    
    return verified;
  } catch (error) {
    console.error('Error verifying TOTP token:', error);
    return false;
  }
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX for readability
    const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
    codes.push(formatted);
  }
  
  return codes;
}

/**
 * Hash backup code for secure storage
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Verify backup code
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.includes(hashedInput);
}

/**
 * Remove used backup code from list
 */
export function removeBackupCode(code: string, hashedCodes: string[]): string[] {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.filter(hash => hash !== hashedInput);
}

/**
 * Format backup codes for display (with separators)
 */
export function formatBackupCodesForDisplay(codes: string[]): string {
  return codes.map((code, index) => `${index + 1}. ${code}`).join('\n');
}

/**
 * Get current TOTP token (for testing/display)
 */
export function getCurrentToken(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  });
}