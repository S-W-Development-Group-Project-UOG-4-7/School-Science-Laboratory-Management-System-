'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  Shield, 
  Smartphone, 
  Check, 
  Copy, 
  Download,
  AlertCircle,
  ArrowLeft,
  Key
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { User } from "@src/app/lib/types";

interface TwoFactorSetupPageProps {
  user: User;
  onComplete: () => void;
  onCancel: () => void;
}

export function TwoFactorSetupPage({ user, onComplete, onCancel }: TwoFactorSetupPageProps) {
  const [step, setStep] = useState<'loading' | 'scan' | 'verify' | 'backup' | 'complete'>('loading');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  useEffect(() => {
    initializeSetup();
  }, []);

  const initializeSetup = async () => {
    try {
      const response = await fetch('/api/auth/totp/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize 2FA setup');
      }

      setQrCode(data.data.qrCode);
      setSecret(data.data.secret);
      setBackupCodes(data.data.backupCodes);
      setStep('scan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize setup');
      setStep('scan');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/totp/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          token: verificationCode,
          secret,
          backupCodes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setStep('backup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setVerificationCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([`Science Mate - Backup Recovery Codes\nGenerated: ${new Date().toLocaleString()}\n\n${text}\n\nKeep these codes safe. Each code can only be used once.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sciencemate-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Button>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Set Up Two-Factor Authentication</h2>
        <p className="text-gray-600">Add an extra layer of security to your account</p>
      </motion.div>

      {/* Step 1: Scan QR Code */}
      {step === 'scan' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Step 1: Scan QR Code
              </CardTitle>
              <CardDescription>
                Use Google Authenticator or any TOTP authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {qrCode ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>

                  <div className="w-full">
                    <Label>Or enter this key manually:</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={secret}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(secret, 'secret')}
                      >
                        {copiedSecret ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading QR Code...</p>
                </div>
              )}

              <Alert>
                <Shield className="w-4 h-4" />
                <AlertTitle>Recommended Apps</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Google Authenticator (iOS/Android)</li>
                    <li>Microsoft Authenticator (iOS/Android)</li>
                    <li>Authy (iOS/Android/Desktop)</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => setStep('verify')}
                disabled={!qrCode}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                I've Scanned the Code
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Verify */}
      {step === 'verify' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Step 2: Verify Setup
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code from your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl font-mono tracking-wider"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 text-center">
                    The code changes every 30 seconds
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('scan')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={verificationCode.length !== 6 || isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </div>
                    ) : (
                      'Verify & Continue'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Backup Codes */}
      {step === 'backup' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Step 3: Save Backup Codes
              </CardTitle>
              <CardDescription>
                Store these codes safely. You'll need them if you lose your phone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Important!</AlertTitle>
                <AlertDescription>
                  Each backup code can only be used once. Store them in a secure location.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-white rounded border">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                  className="flex-1"
                >
                  {copiedBackup ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Codes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadBackupCodes}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              <Button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Setup
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}