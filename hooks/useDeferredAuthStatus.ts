import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';

interface DeferredAuthStatus {
  loading: boolean;
  session: Session | null;
  user: User | null;
}

export function useDeferredAuthStatus(): DeferredAuthStatus {
  const [status, setStatus] = useState<DeferredAuthStatus>({
    loading: true,
    session: null,
    user: null,
  });

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        const { supabase, isSupabaseConfigured } = await import('../services/supabase');

        if (!isSupabaseConfigured) {
          if (active) {
            setStatus({
              loading: false,
              session: null,
              user: null,
            });
          }
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (active) {
          setStatus({
            loading: false,
            session,
            user: session?.user ?? null,
          });
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          if (!active) {
            return;
          }

          setStatus({
            loading: false,
            session: nextSession,
            user: nextSession?.user ?? null,
          });
        });

        unsubscribe = () => subscription.unsubscribe();
      } catch (error) {
        console.error('Deferred auth initialization failed:', error);
        if (active) {
          setStatus({
            loading: false,
            session: null,
            user: null,
          });
        }
      }
    };

    initializeAuth();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return status;
}
