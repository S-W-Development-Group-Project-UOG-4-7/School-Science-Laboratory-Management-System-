'use client';

import { useState } from 'react';
import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FlaskConical, ArrowRight, Shield, AlertCircle, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User } from "@/src/app/lib/types";
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// DNA Helix Animation Component
const DNAHelix = () => {
  const [rotation, setRotation] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    const animate = () => {
      setRotation(prev => (prev + 0.5) % 360);
    };
    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;
  
  const numPoints = 50;
  const points = Array.from({ length: numPoints });
  const centerX = 250;
  const centerY = 300;
  const amplitude = 150;
  const verticalSpacing = 18;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg viewBox="0 0 500 600" className="w-full h-full opacity-50">
        <defs>
          <radialGradient id="blueGrad">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </radialGradient>
          <radialGradient id="yellowGrad">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
        </defs>
        
        {points.map((_, i) => {
          const y = i * verticalSpacing;
          const angle = (i * 20 + rotation) * (Math.PI / 180);
          
          const blueX = centerX + Math.sin(angle) * amplitude;
          const blueZ = Math.cos(angle);
          
          const yellowX = centerX - Math.sin(angle) * amplitude;
          const yellowZ = -Math.cos(angle);
          
          const blueOpacity = blueZ > 0 ? 0.9 : 0.3;
          const yellowOpacity = yellowZ > 0 ? 0.9 : 0.3;
          
          const blueSize = blueZ > 0 ? 8 : 5;
          const yellowSize = yellowZ > 0 ? 8 : 5;
          
          const showBar = Math.abs(blueX - yellowX) < amplitude * 0.5;
          
          return (
            <g key={i}>
              {showBar && (
                <line
                  x1={blueX}
                  y1={y}
                  x2={yellowX}
                  y2={y}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  opacity="0.5"
                />
              )}
              
              <circle
                cx={blueX}
                cy={y}
                r={blueSize}
                fill="url(#blueGrad)"
                opacity={blueOpacity}
              />
              
              <circle
                cx={yellowX}
                cy={y}
                r={yellowSize}
                fill="url(#yellowGrad)"
                opacity={yellowOpacity}
              />
            </g>
          );
        })}
        
        <text x="430" y="580" fill="#94a3b8" fontSize="14" fontWeight="bold">
          DNA
        </text>
      </svg>
    </div>
  );
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user data
      setPendingUser(data.user);

      // Check if 2FA is required
      if (data.twoFactorRequired) {
        // 2FA enabled - show TOTP input
        setStep('2fa');
      } else {
        // No 2FA - login directly
        onLogin(data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!pendingUser) {
        throw new Error('Session expired. Please login again.');
      }

      const token = isBackupCode ? backupCode : otp.join('');

      const response = await fetch('/api/auth/totp/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: pendingUser.id,
          token: token.replace(/\s|-/g, ''), // Remove spaces and dashes
          isBackupCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Show warning if using backup codes
      if (data.warning) {
        alert(data.warning);
      }

      // Login successful
      onLogin(pendingUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      setBackupCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('login');
    setOtp(['', '', '', '', '', '']);
    setBackupCode('');
    setIsBackupCode(false);
    setError('');
    setPendingUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      <DNAHelix />
      
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex justify-center mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-full shadow-lg">
              <FlaskConical className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.h1
            className="text-3xl font-bold text-blue-900 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Science Mate
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            School Laboratory Portal
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {step === 'login' ? 'Welcome Back' : 'Two-Factor Authentication'}
                {step === '2fa' && <Shield className="w-5 h-5 text-blue-600" />}
              </CardTitle>
              <CardDescription>
                {step === 'login'
                  ? 'Sign in to access the laboratory management system'
                  : isBackupCode
                  ? 'Enter one of your backup recovery codes'
                  : 'Enter the 6-digit code from your authenticator app'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {step === 'login' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@school.lk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="transition-all hover:border-blue-400 focus:border-blue-500"
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="transition-all hover:border-blue-400 focus:border-blue-500"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <div className="text-center text-sm text-gray-600">
                    <a href="#" className="text-blue-600 hover:underline transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {!isBackupCode ? (
                    // Regular 6-digit OTP input
                    <>
                      <motion.div
                        className="flex justify-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {otp.map((digit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <Input
                              id={`otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className="w-12 h-12 text-center text-lg font-semibold transition-all hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                      <p className="text-xs text-gray-500 text-center">
                        Open your authenticator app to get the code
                      </p>
                    </>
                  ) : (
                    // Backup code input
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label htmlFor="backup" className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Backup Recovery Code
                      </Label>
                      <Input
                        id="backup"
                        type="text"
                        placeholder="XXXX-XXXX"
                        value={backupCode}
                        onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                        className="text-center text-lg font-mono tracking-wider transition-all hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        maxLength={9}
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Enter the backup code in format: XXXX-XXXX
                      </p>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                      disabled={isLoading || (!isBackupCode && otp.some(d => !d)) || (isBackupCode && !backupCode)}
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        'Verify & Sign In'
                      )}
                    </Button>
                  </motion.div>

                  <div className="text-center space-y-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm"
                      onClick={() => {
                        setIsBackupCode(!isBackupCode);
                        setOtp(['', '', '', '', '', '']);
                        setBackupCode('');
                        setError('');
                      }}
                    >
                      {isBackupCode ? 'Use authenticator code' : 'Use backup code'}
                    </Button>
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 text-sm"
                        onClick={handleBackToLogin}
                      >
                        Back to Login
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="mt-6 text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Secure access for authorized school personnel only</p>
        </motion.div>
      </div>
    </div>
  );
}