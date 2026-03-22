'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { DailyLog, DEFAULT_LOG, LogModule } from '@/lib/types';

function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function useTodayPage() {
  const today = todayDate();
  const [timeline, setTimeline] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.fetchLogs(today);
      setTimeline(data);
    } catch (error: any) {
      toast.error(`Failed to load timeline: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const handleLog = async (log_module: LogModule, moduleData: Partial<DailyLog>) => {
    const payload: Partial<DailyLog> = {
      ...DEFAULT_LOG,
      ...moduleData,
      log_module,
      date: today,
    };
    delete payload.id;
    delete payload.created_at;

    try {
      await api.createLog(payload);
      toast.success('Activity logged!');
      fetchTimeline();
    } catch (error: any) {
      toast.error(`Log failed: ${error.message}`);
    }
  };

  const updateLog = async (id: string, updates: Partial<DailyLog>) => {
    try {
      const result = await api.updateLog(id, updates);
      setTimeline(prev => prev.map(l => l.id === id ? { ...l, ...result[0] } : l));
      toast.success('Log updated!');
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    }
  };

  const deleteLog = async (id: string) => {
    try {
      await api.deleteLog(id);
      setTimeline(prev => prev.filter(l => l.id !== id));
      toast.success('Log deleted!');
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  return { today, timeline, loading, handleLog, updateLog, deleteLog };
}
