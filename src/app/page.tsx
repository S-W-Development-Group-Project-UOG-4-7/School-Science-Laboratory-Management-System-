'use client';

import { useState } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/components/Dashboard';
import { Toaster } from '@/components/ui/sonner';
import type { User } from '@/lib/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleLogin = (userData: User, sessionIdData?: string) => {
    setUser(userData);
    if (sessionIdData) {
      setSessionId(sessionIdData);
    }
  };

  const handleLogout = async () => {
    if (user && user.id) {
      try {
        // Call logout API to update status and session
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            sessionId: sessionId,
          }),
        });
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with logout even if API call fails
      }
    }
    setUser(null);
    setSessionId(null);
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