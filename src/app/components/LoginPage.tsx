'use client';

import { useState } from 'react';
import * as React from 'react';;
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FlaskConical, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User, UserRole } from '@/lib/types';

interface LoginPageProps {
  onLogin: (user: User, sessionId?: string) => void;
}

// Predefined credentials for different roles
// Note: Seeded database users (from seed script) are also supported below
const CREDENTIALS = {
  // Admin
  'admin@school.lk': { password: 'admin123', role: 'admin' as const, name: 'System Administrator', id: 'admin-001' },
  
  // Principal
  'principal@school.lk': { password: 'principal123', role: 'principal' as const, name: 'Principal Silva', id: 'principal-001' },
  
  // Teachers
  'teacher1@school.lk': { password: 'teacher123', role: 'teacher' as const, name: 'Mr. Perera', id: 'teacher-001' },
  'teacher2@school.lk': { password: 'teacher123', role: 'teacher' as const, name: 'Mrs. Fernando', id: 'teacher-002' },
  
  // Lab Assistants
  'labassist1@school.lk': { password: 'labassist123', role: 'lab-assistant' as const, name: 'Lab Assistant Kumar', id: 'lab-001' },
  'labassist2@school.lk': { password: 'labassist123', role: 'lab-assistant' as const, name: 'Lab Assistant Nimal', id: 'lab-002' },
  
  // Students (default role for any other email)
  'student1@school.lk': { password: 'student123', role: 'student' as const, name: 'Student Amal', id: 'student-001' },
  'student2@school.lk': { password: 'student123', role: 'student' as const, name: 'Student Sahan', id: 'student-002' },
  
  // Seeded Database Users (from seed script)
  'john.doe@school.edu': { password: 'password123', role: 'student' as const, name: 'John Doe', id: '1' },
  'jane.smith@school.edu': { password: 'password123', role: 'student' as const, name: 'Jane Smith', id: '2' },
  'bob.johnson@school.edu': { password: 'password123', role: 'student' as const, name: 'Bob Johnson', id: '3' },
  // Seeded teacher and lab assistant credentials removed
  'mike.assistant@school.edu': { password: 'password123', role: 'lab-assistant' as const, name: 'Lab Assistant Mike', id: '5' },
};

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
  // Don't render on server to avoid hydration mismatch
  if (!mounted) return null;
  
  const numPoints = 50;
  const points = Array.from({ length: numPoints });
  const centerX = 250;
  const centerY = 300;
  const amplitude = 150; // Increased width
  const verticalSpacing = 18; //increase height
  
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('2fa');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
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
    
    try {
      // Call login API to validate credentials and insert/update user in database
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Login successful, user data is automatically saved to database
        // Pass sessionId to parent component
        onLogin(data.user, data.sessionId);
      } else {
        alert(data.message || 'Invalid OTP or credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* DNA Helix Animation */}
      <DNAHelix />
      
      {/* Animated Background Elements */}
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
        {/* Header */}
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
            className="text-blue-900 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Science Lab Management System
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

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {step === 'login' ? 'Welcome Back' : '2-Factor Authentication'}
                {step === '2fa' && <Shield className="w-5 h-5 text-blue-600" />}
              </CardTitle>
              <CardDescription>
                {step === 'login'
                  ? 'Sign in to access the laboratory management system'
                  : 'Enter the 6-digit code sent to your registered device'}
              </CardDescription>
            </CardHeader>
            <CardContent>
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

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                      disabled={isLoading || otp.some(d => !d)}
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
                    <p className="text-sm text-gray-600">Didn't receive the code?</p>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        // Resend OTP logic
                      }}
                    >
                      Resend Code
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-6 text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Secure access for authorized school personnel only</p>
        </motion.div>

        {/* Test Credentials Info */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-700 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><span className="font-semibold text-blue-700">Admin:</span> admin@school.lk / admin123</p>
                <p><span className="font-semibold text-blue-700">Principal:</span> principal@school.lk / principal123</p>
                <p><span className="font-semibold text-green-700">Teacher:</span> teacher1@school.lk / teacher123</p>
                <p><span className="font-semibold text-yellow-700">Lab Assistant:</span> labassist1@school.lk / labassist123</p>
                <p><span className="font-semibold text-gray-700">Student:</span> student1@school.lk / student123</p>
                <p className="mt-2 pt-2 border-t border-blue-200"><span className="font-semibold text-purple-700">Seeded DB Users:</span></p>
                <p><span className="font-semibold text-purple-700">Student:</span> john.doe@school.edu / password123</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}