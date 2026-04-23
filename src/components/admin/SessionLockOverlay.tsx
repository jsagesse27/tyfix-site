'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Loader2, AlertCircle, Delete } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SessionLockOverlayProps {
  onUnlock: (sessionData?: any) => void;
  vaultStatus: 'idle' | 'vaulting' | 'vaulted' | 'error';
}

export default function SessionLockOverlay({ onUnlock, vaultStatus }: SessionLockOverlayProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Prevent scrolling behind the overlay
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleKeyPress = (num: string) => {
    if (loading) return;
    setPin((prev) => {
      const next = prev + num;
      if (next.length === 4) {
        verifyPin(next);
      }
      return next.slice(0, 4);
    });
    setError('');
  };

  const handleDelete = () => {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleHardLock = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login?reason=locked');
    router.refresh();
  };

  const verifyPin = async (currentPin: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/unvault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: currentPin }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onUnlock(data.sessionData);
      } else {
        setPin('');
        setError(data.error || 'Incorrect PIN');
        if (data.hard_lock) {
          await handleHardLock();
        }
      }
    } catch {
      setPin('');
      setError('Network error. Try again.');
    } finally {
      if (pin.length === 4) setPin(''); 
      setLoading(false);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0','1','2','3','4','5','6','7','8','9'].includes(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, loading]); // Need latest state

  if (vaultStatus === 'error') {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Session Error</h2>
        <p className="text-gray-500 mb-6 text-center">There was an issue securing your session. Please sign in again.</p>
        <button onClick={handleHardLock} className="btn-primary px-8 py-3">Sign In</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/40 backdrop-blur-2xl">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full mx-4 flex flex-col items-center">
        
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mb-6 shadow-inner">
          <Lock size={28} />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-1">Session Locked</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
           {vaultStatus === 'vaulting' 
              ? 'Securing session vault...' 
              : 'Enter admin PIN to resume session'}
        </p>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                pin.length > i ? 'bg-primary scale-110' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-xs font-bold mb-4 animate-shake text-center h-4">{error}</p>
        )}
        {!error && <div className="h-4 mb-4" />}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              disabled={loading || vaultStatus === 'vaulting'}
              className="h-16 rounded-2xl bg-white border border-gray-100 text-xl font-bold text-gray-800 hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm active:bg-gray-100 transition-all disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <div /> {/* Empy space */}
          <button
            onClick={() => handleKeyPress('0')}
            disabled={loading || vaultStatus === 'vaulting'}
            className="h-16 rounded-2xl bg-white border border-gray-100 text-xl font-bold text-gray-800 hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm active:bg-gray-100 transition-all disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || vaultStatus === 'vaulting' || pin.length === 0}
            className="h-16 rounded-2xl bg-transparent text-gray-400 flex flex-col items-center justify-center hover:text-gray-600 active:text-gray-800 transition-colors disabled:opacity-50"
          >
            <Delete size={24} />
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-[2rem] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-2" size={32} />
            <span className="text-sm font-bold text-gray-600">Unlocking Vault...</span>
          </div>
        )}
      </div>
      
      {/* Fallback to full sign in */}
      <button 
        onClick={handleHardLock} 
        className="mt-8 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
      >
        Sign out entirely
      </button>
    </div>
  );
}
