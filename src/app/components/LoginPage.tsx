'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FlaskConical, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { User, Role } from '@/lib/types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Predefined credentials for different roles
const CREDENTIALS = {
  'admin@school.lk': { password: 'admin123', role: Role.ADMIN, name: 'System Administrator', id: 1 },
  'principal@school.lk': { password: 'principal123', role: Role.PRINCIPAL, name: 'Principal Silva', id: 2 },
  'teacher1@school.lk': { password: 'teacher123', role: Role.TEACHER, name: 'Mr. Perera', id: 3 },
  'teacher2@school.lk': { password: 'teacher123', role: Role.TEACHER, name: 'Mrs. Fernando', id: 4 },
  'labassist1@school.lk': { password: 'labassist123', role: Role.LAB_ASSISTANT, name: 'Lab Assistant Kumar', id: 5 },
  'labassist2@school.lk': { password: 'labassist123', role: Role.LAB_ASSISTANT, name: 'Lab Assistant Nimal', id: 6 },
  'student1@school.lk': { password: 'student123', role: Role.STUDENT, name: 'Student Amal', id: 7 },
  'student2@school.lk': { password: 'student123', role: Role.STUDENT, name: 'Student Sahan', id: 8 },
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('2fa');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    const credentials = (CREDENTIALS as any)[email];
    if (credentials && credentials.password === password) {
      const mockUser: User = {
        id: credentials.id,
        name: credentials.name,
        email: email,
        role: credentials.role,
        password: credentials.password,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onLogin(mockUser);
    } else {
      alert('Invalid OTP or credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30 flex items-center justify-center p-4 relative overflow-hidden">
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
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div className="flex justify-center mb-4" whileHover={{ scale: 1.05, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-full shadow-lg">
              <FlaskConical className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.h1 className="text-blue-900 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Science Lab Management System
          </motion.h1>
          <motion.p className="text-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            School Laboratory Portal
          </motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
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
                  <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
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

                  <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
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

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <div className="text-center text-sm text-gray-600">
                    <a href="#" className="text-blue-600 hover:underline transition-colors">Forgot password?</a>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <motion.div className="flex justify-center gap-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    {otp.map((digit, index) => (
                      <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
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

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                      disabled={isLoading || otp.some(d => !d)}
                    >
                      {isLoading ? (
                        <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                      ) : (
                        'Verify & Sign In'
                      )}
                    </Button>
                  </motion.div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">Didn't receive the code?</p>
                    <Button type="button" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => {}}>
                      Resend Code
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="mt-6 text-center text-sm text-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <p>Secure access for authorized school personnel only</p>
        </motion.div>

        <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-700 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><span className="font-semibold text-blue-700">Admin:</span> admin@school.lk / admin123</p>
                <p><span className="font-semibold text-blue-700">Principal:</span> principal@school.lk / principal123</p>
                <p><span className="font-semibold text-green-700">Teacher:</span> teacher1@school.lk / teacher123</p>
                <p><span className="font-semibold text-yellow-700">Lab Assistant:</span> labassist1@school.lk / labassist123</p>
                <p><span className="font-semibold text-gray-700">Student:</span> student1@school.lk / student123</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}