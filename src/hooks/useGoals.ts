'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Goal, GoalSummary, Milestone, Todo, GoalWithDetails } from '@/lib/types';
import { GOAL_PROGRESS_MAX } from '@/lib/constants';

export function useGoals() {
  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail modal state
  const [selectedGoal, setSelectedGoal] = useState<GoalWithDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      const [goalsData, todosData] = await Promise.all([
        api.goals.fetch(),
        api.fetchTodos()
      ]);
      setGoals(goalsData);
      setAllTodos(todosData);
    } catch (error: any) {
      toast.error('Failed to load goals: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const loadGoalDetails = async (id: string) => {
    setDetailLoading(true);
    try {
      const details = await api.goals.getDetails(id);
      setSelectedGoal(details);
    } catch (error: any) {
      toast.error('Failed to load goal details: ' + error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const calculateProgress = (milestones: Milestone[]) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * GOAL_PROGRESS_MAX);
  };

  const syncGoalProgress = async (goalId: string, milestones: Milestone[]) => {
    const progress = calculateProgress(milestones);
    try {
      await api.goals.update(goalId, { progress });
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress } : g));
      if (selectedGoal && selectedGoal.id === goalId) {
        setSelectedGoal(prev => prev ? { ...prev, progress } : null);
      }
      return progress;
    } catch (error) {
      console.error('Failed to sync progress:', error);
      return progress;
    }
  };

  const handleCreateGoal = async (data: Omit<Goal, 'id' | 'created_at'>) => {
    try {
      const newGoal = await api.goals.create(data);
      setGoals(prev => [newGoal as any, ...prev]);
      setIsFormOpen(false);
      toast.success('Goal created successfully');
    } catch (error: any) {
      toast.error('Failed to create goal: ' + error.message);
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const updated = await api.goals.update(id, updates);
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
      if (selectedGoal && selectedGoal.id === id) {
        setSelectedGoal(prev => prev ? { ...prev, ...updated } : null);
      }
      setEditingGoal(null);
      setIsFormOpen(false);
      toast.success('Goal updated successfully');
    } catch (error: any) {
      toast.error('Failed to update goal: ' + error.message);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.goals.delete(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      if (selectedGoal && selectedGoal.id === id) setSelectedGoal(null);
      toast.success('Goal deleted');
    } catch (error: any) {
      toast.error('Failed to delete goal: ' + error.message);
    }
  };

  const handleAddMilestone = async (goalId: string, title: string, dueDate: string) => {
    try {
      const milestone = await api.milestones.create({
        goal_id: goalId,
        title,
        due_date: dueDate,
        completed: false,
        order_index: selectedGoal?.milestones.length || 0
      });

      if (selectedGoal && selectedGoal.id === goalId) {
        const newMilestones = [...selectedGoal.milestones, milestone];
        setSelectedGoal({ ...selectedGoal, milestones: newMilestones });
        await syncGoalProgress(goalId, newMilestones);
      }
      toast.success('Milestone added');
    } catch (error: any) {
      toast.error('Failed to add milestone: ' + error.message);
    }
  };

  const handleToggleMilestone = async (milestone: Milestone) => {
    if (!selectedGoal) return;
    
    const newCompleted = !milestone.completed;
    const updatedMilestones = selectedGoal.milestones.map(m => 
      m.id === milestone.id ? { ...m, completed: newCompleted } : m
    );

    // Optimistic update
    setSelectedGoal({ ...selectedGoal, milestones: updatedMilestones });

    try {
      await api.milestones.update(milestone.id, { completed: newCompleted });
      const newProgress = await syncGoalProgress(selectedGoal.id, updatedMilestones);

      if (newProgress === 100 && selectedGoal.status !== 'completed') {
        toast.success('All milestones completed! Would you like to complete this goal?', {
          duration: 5000,
          icon: '🎉'
        });
      }
    } catch (error: any) {
      toast.error('Failed to update milestone: ' + error.message);
      // Revert
      setSelectedGoal(selectedGoal);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!selectedGoal) return;
    try {
      await api.milestones.delete(milestoneId);
      const newMilestones = selectedGoal.milestones.filter(m => m.id !== milestoneId);
      setSelectedGoal({ ...selectedGoal, milestones: newMilestones });
      await syncGoalProgress(selectedGoal.id, newMilestones);
      toast.success('Milestone deleted');
    } catch (error: any) {
      toast.error('Failed to delete milestone: ' + error.message);
    }
  };

  const handleLinkTask = async (goalId: string, todoId: string) => {
    try {
      await api.goalTaskLinks.link(goalId, todoId);
      const todo = allTodos.find(t => t.id === todoId);
      if (todo && selectedGoal) {
        setSelectedGoal({
          ...selectedGoal,
          linkedTodos: [...selectedGoal.linkedTodos, todo]
        });
      }
      toast.success('Task linked');
    } catch (error: any) {
      toast.error('Failed to link task: ' + error.message);
    }
  };

  const handleUnlinkTask = async (goalId: string, todoId: string) => {
    try {
      await api.goalTaskLinks.unlink(goalId, todoId);
      if (selectedGoal) {
        setSelectedGoal({
          ...selectedGoal,
          linkedTodos: selectedGoal.linkedTodos.filter(t => t.id !== todoId)
        });
      }
      toast.success('Task unlinked');
    } catch (error: any) {
      toast.error('Failed to unlink task: ' + error.message);
    }
  };

  return {
    goals,
    allTodos,
    loading,
    selectedGoal,
    detailLoading,
    isFormOpen,
    editingGoal,
    setSelectedGoal,
    setIsFormOpen,
    setEditingGoal,
    loadGoalDetails,
    handleCreateGoal,
    handleUpdateGoal,
    handleDeleteGoal,
    handleAddMilestone,
    handleToggleMilestone,
    handleDeleteMilestone,
    handleLinkTask,
    handleUnlinkTask
  };
}
