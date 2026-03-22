import { DailyLog, Todo, GoogleFitData, GoogleFitStatus, Goal, GoalSummary, Milestone, GoalTaskLink, GoalWithDetails } from './types';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // In Next.js, we can call our own API routes using relative paths or full URLs.
  // Using relative paths works well on the client.
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }
  return result.data;
}

export const api = {
  // Todos
  fetchTodos: () => request<Todo[]>('/api/todos'),
  createTodo: (todo: Partial<Todo>) => request<Todo[]>('/api/todos', {
    method: 'POST',
    body: JSON.stringify(todo),
  }),
  updateTodo: (id: string, updates: Partial<Todo>) => request<Todo[]>(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteTodo: (id: string) => request<void>(`/api/todos/${id}`, {
    method: 'DELETE',
  }),

  // Logs
  fetchLogs: (date?: string) => request<DailyLog[]>(`/api/logs${date ? `?date=${date}` : ''}`),
  createLog: (log: Partial<DailyLog>) => {
    const endpoint = `/api/${log.log_module}`;
    return request<DailyLog[]>(endpoint, {
      method: 'POST',
      body: JSON.stringify(log),
    });
  },
  updateLog: (id: string, updates: Partial<DailyLog>) => request<DailyLog[]>(`/api/logs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteLog: (id: string) => request<void>(`/api/logs/${id}`, {
    method: 'DELETE',
  }),

  // Google Fit
  googleFit: {
    getAuthUrl: () => request<{ url: string }>('/api/google-fit/auth-url'),
    getStatus: () => request<GoogleFitStatus>('/api/google-fit/status'),
    getData: () => request<GoogleFitData>('/api/google-fit/data'),
    disconnect: () => request<{ disconnected: boolean }>('/api/google-fit/disconnect', {
      method: 'POST',
    }),
  },

  // Goals
  goals: {
    fetch: () => request<GoalSummary[]>('/api/goals'),
    create: (goal: Omit<Goal, 'id' | 'created_at'>) => request<Goal>('/api/goals', { 
      method: 'POST', 
      body: JSON.stringify(goal) 
    }),
    update: (id: string, updates: Partial<Goal>) => request<Goal>(`/api/goals/${id}`, { 
      method: 'PATCH', 
      body: JSON.stringify(updates) 
    }),
    delete: (id: string) => request<void>(`/api/goals/${id}`, { 
      method: 'DELETE' 
    }),
    getDetails: (id: string) => request<GoalWithDetails>(`/api/goals/${id}/details`),
  },
  milestones: {
    create: (m: Omit<Milestone, 'id' | 'created_at'>) => request<Milestone>('/api/milestones', { 
      method: 'POST', 
      body: JSON.stringify(m) 
    }),
    update: (id: string, u: Partial<Milestone>) => request<Milestone>(`/api/milestones/${id}`, { 
      method: 'PATCH', 
      body: JSON.stringify(u) 
    }),
    delete: (id: string) => request<void>(`/api/milestones/${id}`, { 
      method: 'DELETE' 
    }),
  },
  goalTaskLinks: {
    link: (goalId: string, todoId: string) => request<GoalTaskLink>('/api/goal-task-links', { 
      method: 'POST', 
      body: JSON.stringify({ goal_id: goalId, todo_id: todoId }) 
    }),
    unlink: (goalId: string, todoId: string) => request<void>('/api/goal-task-links', { 
      method: 'DELETE', 
      body: JSON.stringify({ goal_id: goalId, todo_id: todoId }) 
    }),
  },
};
