'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getSupabase } from '@/lib/supabase';

type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

interface SupabaseContextValue {
  status: ConnectionStatus;
  checkConnection: () => Promise<void>;
  refreshClient: () => void;
}

const SupabaseCtx = createContext<SupabaseContextValue>({
  status: 'disconnected',
  checkConnection: async () => {},
  refreshClient: () => {},
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [refreshSig, setRefreshSig] = useState(0);

  const refreshClient = useCallback(() => {
    setRefreshSig(s => s + 1);
  }, []);

  const checkConnection = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setStatus('disconnected');
      return;
    }

    setStatus('checking');
    try {
      const { error } = await supabase
        .from('daily_log_entries')
        .select('id')
        .limit(1);
      setStatus(error ? 'disconnected' : 'connected');
    } catch {
      setStatus('disconnected');
    }
  }, [refreshSig]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <SupabaseCtx.Provider value={{ status, checkConnection, refreshClient }}>
      {children}
    </SupabaseCtx.Provider>
  );
}

export function useSupabaseContext() {
  return useContext(SupabaseCtx);
}
