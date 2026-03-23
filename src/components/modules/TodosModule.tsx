'use client';

import { useEffect } from 'react';
import { useTodos } from '@/hooks/useTodos';

export default function TodosModule() {
  const { filteredTodos, toggleTodo, activeTab, setActiveTab, loading } = useTodos();

  useEffect(() => {
    if (activeTab !== 'today') {
      setActiveTab('today');
    }
  }, [activeTab, setActiveTab]);

  const pendingTodos = filteredTodos.filter(todo => !todo.completed);

  return (
    <div className="card module-section col-span-1 md:col-span-2 font-sans">
      <div className="module-header mb-4">
        <div className="module-icon bg-sky-50 dark:bg-sky-900/20 text-sky-500">✅</div>
        <div>
          <p className="module-title font-bold text-slate-800 dark:text-slate-100">Today's Tasks</p>
          <p className="module-subtitle uppercase tracking-tight">Your pending daily tasks</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
          ))}
        </div>
      ) : pendingTodos.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <p className="text-3xl opacity-50 mb-2">🎉</p>
          <p className="font-medium text-sm">All caught up for today!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          {pendingTodos.map(todo => (
            <div 
              key={todo.id} 
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                todo.completed 
                  ? 'bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-60' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-900'
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id, todo.completed)}
                className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                  todo.completed 
                    ? 'bg-sky-500 border-sky-500 text-white' 
                    : 'border-slate-300 dark:border-slate-600 hover:border-sky-400'
                }`}
              >
                {todo.completed && <span className="text-xs">✓</span>}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {todo.text}
                </p>
                {todo.description && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">{todo.description}</p>
                )}
              </div>
              
              {todo.is_repetitive && (
                <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-sky-500 bg-sky-50 dark:bg-sky-900/30 px-2 py-1 rounded-md">
                  Daily
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
