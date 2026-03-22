'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Todo, Priority } from '@/lib/types';
import { PRIORITY_WEIGHTS, TODO_FALLBACK_SORT_DATE } from '@/lib/constants';

export type TodoTab = 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'overdue' | 'none' | 'custom';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getWeekRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { startOfWeek: start, endOfWeek: end };
}

function getMonthRange() {
  const now = new Date();
  return {
    startOfMonth: new Date(now.getFullYear(), now.getMonth(), 1),
    startOfNextMonth: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [activeTab, setActiveTab] = useState<TodoTab>('all');
  const [rangeStart, setRangeStart] = useState(getTodayStr);
  const [rangeEnd, setRangeEnd] = useState(getTodayStr);

  const today = getTodayStr();
  const tomorrow = getTomorrowStr();
  const { startOfWeek, endOfWeek } = getWeekRange();
  const { startOfMonth, startOfNextMonth } = getMonthRange();

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.fetchTodos();
      setTodos(data);
    } catch (error: any) {
      toast.error(`Failed to load tasks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const payload: Partial<Todo> = {
      text: newText.trim(),
      description: newDescription.trim() || undefined,
      due_date: newDueDate || undefined,
      priority,
      completed: false,
      date: getTodayStr(),
    };

    try {
      await api.createTodo(payload);
      setNewText('');
      setNewDescription('');
      setNewDueDate('');
      setPriority('medium');
      fetchTodos();
      toast.success('Task added successfully');
    } catch (error: any) {
      toast.error(`Failed to add: ${error.message}`);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await api.updateTodo(id, { completed: !completed });
      fetchTodos();
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTodo || !editText.trim()) return;

    try {
      await api.updateTodo(selectedTodo.id, {
        text: editText.trim(),
        description: editDescription.trim() || undefined,
        due_date: editDueDate || undefined,
        priority: editPriority,
      });
      fetchTodos();
      setSelectedTodo({
        ...selectedTodo,
        text: editText.trim(),
        description: editDescription.trim(),
        due_date: editDueDate,
        priority: editPriority,
      });
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditText(todo.text);
    setEditDescription(todo.description || '');
    setEditDueDate(todo.due_date || '');
    setEditPriority(todo.priority);
    setIsEditing(true);
  };

  const deleteTodo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTodo(id);
      toast.success('Task removed');
      if (selectedTodo?.id === id) setSelectedTodo(null);
      fetchTodos();
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const matchesTab = (t: Todo, tab: TodoTab): boolean => {
    switch (tab) {
      case 'today': return t.due_date === today || (!!t.due_date && t.due_date < today && !t.completed);
      case 'tomorrow': return t.due_date === tomorrow;
      case 'week': {
        if (!t.due_date) return false;
        const d = new Date(t.due_date + 'T12:00:00');
        return d >= startOfWeek && d < endOfWeek;
      }
      case 'month': {
        if (!t.due_date) return false;
        const d = new Date(t.due_date + 'T12:00:00');
        return d >= startOfMonth && d < startOfNextMonth;
      }
      case 'overdue': return !!t.due_date && t.due_date < today && !t.completed;
      case 'custom': {
        if (!t.due_date) return false;
        const d = new Date(t.due_date + 'T12:00:00');
        const s = new Date(rangeStart + 'T00:00:00');
        const e = new Date(rangeEnd + 'T23:59:59');
        return d >= s && d <= e;
      }
      case 'none': return !t.due_date;
      default: return true;
    }
  };

  const getFilteredCount = (tab: TodoTab) => todos.filter(t => matchesTab(t, tab)).length;

  const filteredTodos = todos
    .filter(t => matchesTab(t, activeTab))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (PRIORITY_WEIGHTS[a.priority] !== PRIORITY_WEIGHTS[b.priority]) {
        return PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
      }
      return (a.due_date || TODO_FALLBACK_SORT_DATE).localeCompare(b.due_date || TODO_FALLBACK_SORT_DATE);
    });

  return {
    todos,
    loading,
    newText, setNewText,
    newDescription, setNewDescription,
    newDueDate, setNewDueDate,
    priority, setPriority,
    selectedTodo, setSelectedTodo,
    isEditing, setIsEditing,
    editText, setEditText,
    editDescription, setEditDescription,
    editDueDate, setEditDueDate,
    editPriority, setEditPriority,
    activeTab, setActiveTab,
    rangeStart, setRangeStart,
    rangeEnd, setRangeEnd,
    handleAdd,
    toggleTodo,
    handleUpdate,
    startEditing,
    deleteTodo,
    getFilteredCount,
    filteredTodos,
  };
}
