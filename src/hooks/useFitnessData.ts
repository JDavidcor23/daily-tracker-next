'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { GoogleFitData } from '@/lib/types';

export function useFitnessData() {
  const [data, setData] = useState<GoogleFitData | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const status = await api.googleFit.getStatus();
      setConnected(status.connected);
      return status.connected;
    } catch {
      setConnected(false);
      return false;
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const fitData = await api.googleFit.getData();
      setData(fitData);
    } catch (err: any) {
      console.error('Failed to fetch fitness data:', err.message);
      if (err.message?.includes('not connected') || err.message?.includes('authorize')) {
        setConnected(false);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const isConnected = await checkStatus();
      if (isConnected) {
        await fetchData();
      }
      setLoading(false);
    };
    init();
  }, [checkStatus, fetchData]);

  return { data, connected, loading, refreshing, fetchData };
}
