'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { DailyLog, Todo } from '@/lib/types';

export type HistoryFilter = 'all' | 'nutrition' | 'training' | 'study' | 'mind' | 'task';

export function useHistory() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all');

  useEffect(() => {
    async function load() {
      try {
        const [logsData, todosData] = await Promise.all([
          api.fetchLogs(),
          api.fetchTodos(),
        ]);
        setLogs(logsData);
        setTodos(todosData);
      } catch (error: any) {
        toast.error('Failed to load history: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const allEntries = [
    ...logs.map(l => ({ ...l, type: 'log' as const })),
    ...todos.map(t => ({ ...t, type: 'task' as const, date: t.date, log_module: 'task' as any })),
  ];

  const filteredEntries = allEntries.filter(entry => {
    const searchLower = search.toLowerCase();

    if (activeFilter !== 'all') {
      if (activeFilter === 'task' && entry.type !== 'task') return false;
      if (activeFilter !== 'task' && (entry.type !== 'log' || entry.log_module !== activeFilter)) return false;
    }

    if (!search) return true;

    if (entry.type === 'task') {
      return (
        (entry as any).text.toLowerCase().includes(searchLower) ||
        ((entry as any).description || '').toLowerCase().includes(searchLower)
      );
    }

    const log = entry as any;
    return (
      log.log_module.toLowerCase().includes(searchLower) ||
      (log.food_meals || '').toLowerCase().includes(searchLower) ||
      (log.food_notes || '').toLowerCase().includes(searchLower) ||
      (log.train_type || '').toLowerCase().includes(searchLower) ||
      (log.train_notes || '').toLowerCase().includes(searchLower) ||
      (log.study_topic || '').toLowerCase().includes(searchLower) ||
      (log.study_notes || '').toLowerCase().includes(searchLower) ||
      (log.mind_notes || '').toLowerCase().includes(searchLower)
    );
  });

  const groups = filteredEntries.reduce((acc: Record<string, any[]>, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  // Sort entries within each date group: Repetitive tasks first, then the rest.
  for (const date of sortedDates) {
    groups[date].sort((a, b) => {
      const aIsRepetitive = a.type === 'task' && a.is_repetitive ? 1 : 0;
      const bIsRepetitive = b.type === 'task' && b.is_repetitive ? 1 : 0;
      
      if (aIsRepetitive !== bIsRepetitive) {
        return bIsRepetitive - aIsRepetitive; // 1 (repetitive) comes before 0
      }
      
      // Secondary sort: task vs log
      if (a.type !== b.type) {
        return a.type === 'task' ? -1 : 1; // tasks before logs
      }
      
      return 0;
    });
  }

  const deleteEntry = async (entry: any) => {
    try {
      if (entry.type === 'task') {
        await api.deleteTodo(entry.id);
        setTodos(prev => prev.filter(t => t.id !== entry.id));
      } else {
        await api.deleteLog(entry.id);
        setLogs(prev => prev.filter(l => l.id !== entry.id));
      }
      toast.success('Entry deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const updateEntry = async (entry: any, updates: any) => {
    try {
      if (entry.type === 'task') {
        const result = await api.updateTodo(entry.id, updates);
        setTodos(prev => prev.map(t => t.id === entry.id ? { ...t, ...result[0] } : t));
      } else {
        const result = await api.updateLog(entry.id, updates);
        setLogs(prev => prev.map(l => l.id === entry.id ? { ...l, ...result[0] } : l));
      }
      toast.success('Entry updated successfully');
    } catch (error: any) {
      toast.error('Failed to update: ' + error.message);
    }
  };

  return { loading, search, setSearch, activeFilter, setActiveFilter, groups, sortedDates, deleteEntry, updateEntry };
}
