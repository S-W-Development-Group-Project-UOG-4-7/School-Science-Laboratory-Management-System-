'use client';

import { useState } from 'react';
import {LoginPage} from '@/components/LoginPage';
import {Dashboard} from '@/components/Dashboard';
import { Toaster } from '@/components/ui/sonner';
import type { User } from '@/lib/types';
export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const handleLogin = (userData: User) => {
    setUser(userData);
  };
  const handleLogout = () => {
    setUser(null);
  };
  return (
    <>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
      <Toaster position="top-right" />
    </>
  );
}

