'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { DailyLog, DEFAULT_LOG, LogModule } from '@/lib/types';

function todayDate(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function useTodayPage() {
  const today = todayDate();
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true);
      const [logsData, todosData] = await Promise.all([
        api.fetchLogs(today),
        api.fetchTodos()
      ]);
      const activeTodos = todosData
        .filter(t => t.date === today && t.completed)
        .map(t => ({ ...t, log_module: 'task' as any }));
      const merged = [...logsData, ...activeTodos].sort((a: any, b: any) => {
        const tA = new Date(a.created_at || new Date()).getTime();
        const tB = new Date(b.created_at || new Date()).getTime();
        return tA - tB;
      });
      setTimeline(merged);
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

  const updateEntry = async (entry: any, updates: Partial<any>) => {
    try {
      if (entry.log_module === 'task') {
        const result = await api.updateTodo(entry.id, updates);
        setTimeline(prev => prev.map(l => l.id === entry.id ? { ...l, ...result[0] } : l));
      } else {
        const result = await api.updateLog(entry.id, updates);
        setTimeline(prev => prev.map(l => l.id === entry.id ? { ...l, ...result[0] } : l));
      }
      toast.success('Activity updated!');
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    }
  };

  const deleteEntry = async (entry: any) => {
    try {
      if (entry.log_module === 'task') {
        await api.deleteTodo(entry.id);
      } else {
        await api.deleteLog(entry.id);
      }
      setTimeline(prev => prev.filter(l => l.id !== entry.id));
      toast.success('Activity deleted!');
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  return { today, timeline, loading, handleLog, updateEntry, deleteEntry };
}
