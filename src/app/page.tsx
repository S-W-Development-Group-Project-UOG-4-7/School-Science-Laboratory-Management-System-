'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import type { User } from './lib/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    
    // Restore the view from localStorage if it exists
    const savedView = localStorage.getItem('dashboard-view');
    if (savedView) {
      router.push(`/?view=${savedView}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      
      // Clear stored dashboard state
      localStorage.removeItem('dashboard-view');
      
      // Clear URL params
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
          initialView={searchParams.get('view') || undefined}
        />
      )}
      <Toaster position="top-right" />
    </>
  );
}