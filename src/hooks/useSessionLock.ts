'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const DEFAULT_TIMEOUT_MINUTES = 3 * 24 * 60; // 3 days default

interface UseSessionLockProps {
  timeoutMinutes?: number;
}

export function useSessionLock({ timeoutMinutes = DEFAULT_TIMEOUT_MINUTES }: UseSessionLockProps) {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);
  const [vaultStatus, setVaultStatus] = useState<'idle' | 'vaulting' | 'vaulted' | 'error'>('idle');
  const supabase = createClient();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const lockSession = useCallback(async (isLocalTrigger = true) => {
    if (isLocked || vaultStatus === 'vaulting' || vaultStatus === 'vaulted') return;
    
    setIsLocked(true);
    setVaultStatus('vaulting');
    
    if (isLocalTrigger && channelRef.current) {
      channelRef.current.postMessage('lock');
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Vault the session on the server
        const res = await fetch('/api/auth/vault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionData: session }),
        });

        if (res.ok) {
          // Severely scrub the browser's knowledge of the session
          // using scope: 'local' to avoid revoking it on the server
          await supabase.auth.signOut({ scope: 'local' });
          
          setVaultStatus('vaulted');
        } else {
          setVaultStatus('error');
        }
      } else {
        setVaultStatus('vaulted'); // Already no session
      }
    } catch {
      setVaultStatus('error');
    }
  }, [isLocked, vaultStatus, supabase.auth]);

  const resetActivity = useCallback(() => {
    if (isLocked) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Broadcast activity to other tabs
    if (channelRef.current) {
      channelRef.current.postMessage('activity');
    }

    timerRef.current = setTimeout(() => {
      lockSession(true);
    }, timeoutMinutes * 60 * 1000);
  }, [isLocked, timeoutMinutes, lockSession]);

  const unlockSession = useCallback(async (sessionData?: any) => {
    if (sessionData) {
      // Re-hydrate Supabase Client which automatically fixes cookies
      await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });
    }

    setIsLocked(false);
    setVaultStatus('idle');
    
    if (channelRef.current) {
      channelRef.current.postMessage('unlock');
    }
    
    resetActivity();
    router.refresh();
  }, [supabase.auth, resetActivity, router]);

  useEffect(() => {
    // Setup cross-tab communication
    channelRef.current = new BroadcastChannel('tyfix_auth_lock');
    
    channelRef.current.onmessage = (event) => {
      if (event.data === 'lock') {
        lockSession(false); // don't broadcast back
      } else if (event.data === 'unlock') {
        setIsLocked(false);
        setVaultStatus('idle');
        router.refresh();
      } else if (event.data === 'activity' && !isLocked) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          lockSession(true);
        }, timeoutMinutes * 60 * 1000);
      }
    };

    // Listen to local user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleUserActivity = () => resetActivity();
    
    events.forEach(e => document.addEventListener(e, handleUserActivity, { passive: true }));
    
    // Initial start
    resetActivity();

    return () => {
      events.forEach(e => document.removeEventListener(e, handleUserActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (channelRef.current) channelRef.current.close();
    };
  }, [resetActivity, lockSession, isLocked, timeoutMinutes, router]);

  return { isLocked, vaultStatus, unlockSession };
}
