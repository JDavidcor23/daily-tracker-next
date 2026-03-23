'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Todo, Priority, Tag } from '@/lib/types';
import { PRIORITY_WEIGHTS, TODO_FALLBACK_SORT_DATE } from '@/lib/constants';

export type TodoTab = 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'overdue' | 'none' | 'custom';

function getTodayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
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
  const [isRepetitive, setIsRepetitive] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchTags = useCallback(async () => {
    try {
      const data = await api.tags.fetch();
      setTags(data);
    } catch (error: any) {
      console.error('Error loading tags:', error);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
    fetchTags();
  }, [fetchTodos, fetchTags]);

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
      is_repetitive: isRepetitive,
      frequency: isRepetitive ? frequency : undefined,
      tagIds: selectedTagIds
    } as any;

    try {
      await api.createTodo(payload);
      setNewText('');
      setNewDescription('');
      setNewDueDate('');
      setPriority('medium');
      setIsRepetitive(false);
      setFrequency('daily');
      setSelectedTagIds([]);
      fetchTodos();
      toast.success('Task added successfully');
    } catch (error: any) {
      toast.error(`Failed to add: ${error.message}`);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const todo = todos.find(t => t.id === id);

    if (todo?.is_repetitive) {
      if (!completed) {
        // Completing a repetitive task for today
        try {
          await api.createTodo({
            text: todo.text,
            description: todo.description,
            priority: todo.priority,
            completed: true,
            date: today,
            is_repetitive: true,
            frequency: todo.frequency,
          });
          fetchTodos();
          toast.success('Repetitive task completed');
        } catch (error: any) {
          toast.error(`Failed to complete: ${error.message}`);
        }
      } else {
        // Uncompleting - we should delete this specific completion record
        // But only if it's the completion record (completed: true)
        if (todo.completed) {
          try {
            await api.deleteTodo(id);
            fetchTodos();
            toast.success('Completion removed');
          } catch (error: any) {
            toast.error(`Failed to undo: ${error.message}`);
          }
        }
      }
      return;
    }

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
      const updates: Partial<Todo> = {
        text: editText.trim(),
        description: editDescription.trim() || undefined,
        due_date: editDueDate || undefined,
        priority: editPriority,
        is_repetitive: selectedTodo.is_repetitive,
        frequency: selectedTodo.frequency,
        tagIds: editTagIds
      } as any;
      
      await api.updateTodo(selectedTodo.id, updates);
      fetchTodos();
      setSelectedTodo({
        ...selectedTodo,
        ...updates
      } as Todo);
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    }
  };

  const startEditing = (todo: Todo) => {
    setSelectedTodo(todo);
    setEditText(todo.text);
    setEditDescription(todo.description || '');
    setEditDueDate(todo.due_date || '');
    setEditPriority(todo.priority);
    setEditTagIds(todo.tags?.map(t => t.id) || []);
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
    .filter(t => {
      // Special logic for today's repetitive tasks
      if (activeTab === 'today' && t.is_repetitive) {
        // If it's a completion for today, show it
        if (t.completed && t.date === today) return true;
        // If it's a master (uncompleted), show it ONLY if no completion exists for today
        if (!t.completed) {
          const hasCompletionToday = todos.some(other => 
            other.is_repetitive && 
            other.completed && 
            other.date === today && 
            other.text === t.text
          );
          return !hasCompletionToday;
        }
        return false; // Other repetitive records (old completions) don't show in Today
      }
      
      // Standard filtering
      const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab(t, activeTab) && matchesSearch;
    })
    .sort((a, b) => {
      // 1. Completion status (uncompleted first)
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      
      // 2. Repetitive status (repetitive first)
      if (a.is_repetitive !== b.is_repetitive) return a.is_repetitive ? -1 : 1;
      
      // 3. Priority
      if (PRIORITY_WEIGHTS[a.priority] !== PRIORITY_WEIGHTS[b.priority]) {
        return PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
      }
      
      // 4. Date
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
    isRepetitive, setIsRepetitive,
    frequency, setFrequency,
    handleAdd,
    toggleTodo,
    handleUpdate,
    startEditing,
    deleteTodo,
    getFilteredCount,
    filteredTodos,
    tags,
    fetchTags,
    selectedTagIds,
    setSelectedTagIds,
    editTagIds,
    setEditTagIds,
    searchQuery,
    setSearchQuery,
  };
}
