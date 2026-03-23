'use client';

import { useTodos } from '@/hooks/useTodos';
import type { TodoTab } from '@/hooks/useTodos';
import { Priority, Tag } from '@/lib/types';
import { TODO_DESCRIPTION_PREVIEW_LENGTH } from '@/lib/constants';
import TagsManager from '@/components/TagsManager';
import { useState } from 'react';

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400',
  high: 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400',
};

const TABS: { id: TodoTab; label: string; icon: string; color?: string }[] = [
  { id: 'all', label: 'All', icon: '🌈' },
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'tomorrow', label: 'Tomorrow', icon: '🌅' },
  { id: 'overdue', label: 'Overdue', icon: '⚠️', color: 'text-rose-500' },
  { id: 'week', label: 'Week', icon: '📅' },
  { id: 'month', label: 'Month', icon: '📊' },
  { id: 'custom', label: 'Range', icon: '↔️' },
  { id: 'none', label: 'No Date', icon: '📝' },
];

function TodoItem({ todo, onSelect, onToggle, onEdit, onDelete }: { 
  todo: any, 
  onSelect: () => void, 
  onToggle: (id: string, completed: boolean) => void,
  onEdit: (todo: any) => void,
  onDelete: (id: string) => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`card p-4 flex items-center gap-4 group cursor-pointer transition-all duration-300 ${
        todo.completed ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800/50 hover:-translate-y-0.5'
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(todo.id, todo.completed);
        }}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          todo.completed
            ? 'bg-brand-500 border-brand-500 text-white shadow-inner'
            : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
        }`}
      >
        {todo.completed && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold text-slate-700 dark:text-slate-200 transition-all truncate ${
          todo.completed ? 'line-through text-slate-400' : ''
        }`}>
          {todo.text}
        </p>
        <div className="flex items-center gap-3 mt-1 overflow-hidden">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap ${PRIORITY_COLORS[todo.priority as Priority]}`}>
            {todo.priority}
          </span>
          {todo.due_date && (
            <span className="text-[9px] text-rose-500 dark:text-rose-400 font-black uppercase flex items-center gap-1 whitespace-nowrap bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {todo.due_date}
            </span>
          )}
          {todo.is_repetitive && (
            <span className="text-[9px] text-brand-500 dark:text-brand-400 font-black uppercase flex items-center gap-1 whitespace-nowrap bg-brand-50 dark:bg-brand-950/20 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              🔁 {todo.frequency || 'Daily'}
            </span>
          )}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {todo.tags.map((tag: Tag) => (
                <span 
                  key={tag.id}
                  className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md text-white whitespace-nowrap"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          {todo.description && (
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold truncate italic">
              {todo.description.substring(0, TODO_DESCRIPTION_PREVIEW_LENGTH)}{todo.description.length > TODO_DESCRIPTION_PREVIEW_LENGTH ? '...' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(todo);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 hover:scale-110 transition-transform flex-shrink-0"
          title="Edit task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(todo.id);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 hover:scale-110 transition-transform flex-shrink-0"
          title="Delete task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function TodoPage() {
  const {
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
  } = useTodos();

  const [showTagsManager, setShowTagsManager] = useState(false);

  const toggleTagSelection = (tagId: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    } else {
      setSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    }
  };

  return (
    <div className="px-4 py-8 space-y-10 max-w-4xl mx-auto font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Tasks & Reminders</h1>
          <p className="text-sm text-slate-500 font-medium font-sans uppercase tracking-tight">Keep track of what you need to do</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTagsManager(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 transition-colors"
          >
            <span>🏷️</span> Tags
          </button>
          {loading && <div className="animate-spin text-2xl h-8 w-8 flex items-center justify-center">⏳</div>}
        </div>
      </div>

      <form onSubmit={handleAdd} className="card p-6 space-y-4 shadow-xl border-brand-100 dark:border-brand-900/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">New Task Title</label>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g. Review documents, call someone..."
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Expiration Date (Due Date)</label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                    priority === p
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md transform scale-105'
                      : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsRepetitive(!isRepetitive)}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isRepetitive ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-200 dark:border-slate-700'}`}>
                {isRepetitive && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Repetitive Task</span>
            </div>
            
            {isRepetitive && (
              <select 
                value={frequency} 
                onChange={(e) => setFrequency(e.target.value as any)}
                className="bg-transparent border-0 text-xs font-black text-brand-500 uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="label">Description (Optional)</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Add more details about this task..."
              className="input-field min-h-[100px] resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Assign Tags</label>
            {tags.length === 0 ? (
               <p className="text-[10px] text-slate-400 italic">No tags created. Create some using the "Tags" button above.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTagSelection(tag.id)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                      selectedTagIds.includes(tag.id)
                        ? 'text-white border-transparent'
                        : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
                    }`}
                    style={selectedTagIds.includes(tag.id) ? { backgroundColor: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary px-10 py-3 text-sm">
            Create Task
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-4 scrollbar-none sticky top-16 md:top-20 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl z-20 -mx-4 px-4 py-4 mb-2">
        <div className="w-full sm:w-64 relative group mb-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            className="input-field py-2 pl-10 text-xs w-full bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 focus:border-brand-300 dark:focus:border-brand-700 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex-shrink-0
              ${activeTab === tab.id
                ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20 transform scale-105 z-10'
                : `bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 ${tab.color || 'text-slate-400'} hover:border-brand-200 dark:hover:border-brand-800 shadow-sm`}`}
          >
            <span className="text-sm">{tab.icon}</span>
            {tab.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors flex items-center justify-center min-w-[20px] ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {getFilteredCount(tab.id)}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'custom' && (
        <div className="card p-4 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 animate-fade-in">
          <div className="flex-1 w-full">
            <label className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1 block ml-1">From</label>
            <input
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="input-field py-2 text-sm"
            />
          </div>
          <div className="text-slate-300 hidden sm:block pt-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="flex-1 w-full">
            <label className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1 block ml-1">To</label>
            <input
              type="date"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="input-field py-2 text-sm"
            />
          </div>
        </div>
      )}

      <div className="space-y-10">
        {!loading && filteredTodos.length === 0 && (
          <div className="card border-dashed border-2 py-20 text-center text-slate-400 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
            <p className="text-4xl mb-4 opacity-20">🏝️</p>
            <p className="font-medium">{activeTab === 'all' ? 'No tasks found. Enjoy your free time!' : `No tasks found for ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()}.`}</p>
          </div>
        )}

        {/* Repetitive/Daily Tasks Section */}
        {!loading && filteredTodos.some(t => t.is_repetitive) && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-[11px] font-black text-brand-500 dark:text-brand-400 uppercase tracking-[0.2em] whitespace-nowrap">Daily Tasks</h3>
              <div className="h-px bg-brand-100 dark:bg-brand-900/30 w-full" />
            </div>
            {filteredTodos.filter(t => t.is_repetitive).map((todo) => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onSelect={() => { setSelectedTodo(todo); setIsEditing(false); }}
                onToggle={toggleTodo}
                onEdit={startEditing}
                onDelete={deleteTodo}
              />
            ))}
          </div>
        )}

        {/* Normal Tasks Section */}
        {!loading && filteredTodos.some(t => !t.is_repetitive) && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Tasks</h3>
              <div className="h-px bg-slate-100 dark:bg-slate-800/50 w-full" />
            </div>
            {filteredTodos.filter(t => !t.is_repetitive).map((todo) => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onSelect={() => { setSelectedTodo(todo); setIsEditing(false); }}
                onToggle={toggleTodo}
                onEdit={startEditing}
                onDelete={deleteTodo}
              />
            ))}
          </div>
        )}
      </div>

      {selectedTodo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => { setSelectedTodo(null); setIsEditing(false); }}
        >
          <div className="card w-full max-w-lg overflow-hidden shadow-2xl relative border-0 dark:border dark:border-slate-800 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setSelectedTodo(null); setIsEditing(false); }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className={`h-2 absolute top-0 left-0 right-0 ${
              (isEditing ? editPriority : selectedTodo.priority) === 'high' ? 'bg-rose-500' :
              (isEditing ? editPriority : selectedTodo.priority) === 'medium' ? 'bg-blue-500' : 'bg-slate-400'
            }`} />

            <div className="pt-8 px-6 pb-8">
              {isEditing ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="label">Task Title</label>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="input-field"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Due Date</label>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="label">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as Priority)}
                        className="input-field text-xs py-[9px]"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                     <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setSelectedTodo(prev => prev ? {...prev, is_repetitive: !prev.is_repetitive} : null)}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedTodo.is_repetitive ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-200 dark:border-slate-700'}`}>
                           {selectedTodo.is_repetitive && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Repetitive</span>
                     </div>
                     
                     {selectedTodo.is_repetitive && (
                        <select 
                           value={selectedTodo.frequency || 'daily'} 
                           onChange={(e) => setSelectedTodo({...selectedTodo, frequency: e.target.value as any})}
                           className="bg-transparent border-0 text-xs font-black text-brand-500 uppercase tracking-widest outline-none cursor-pointer"
                        >
                           <option value="daily">Daily</option>
                           <option value="weekly">Weekly</option>
                           <option value="monthly">Monthly</option>
                        </select>
                      )}
                   </div>
 
                   <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                      <label className="label">Update Tags</label>
                      {tags.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No tags created.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {tags.map(tag => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => toggleTagSelection(tag.id, true)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                                editTagIds.includes(tag.id)
                                  ? 'text-white border-transparent shadow-lg'
                                  : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
                              }`}
                              style={editTagIds.includes(tag.id) ? { backgroundColor: tag.color } : {}}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      )}
                   </div>

                   <div>
                      <label className="label">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="input-field min-h-[140px] resize-none pb-12"
                      placeholder="Add more details..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button onClick={handleUpdate} className="btn-primary px-10 py-3 text-sm">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${PRIORITY_COLORS[selectedTodo.priority]}`}>
                      {selectedTodo.priority} Priority
                    </span>
                    {selectedTodo.completed && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Completed
                      </span>
                    )}
                  </div>

                  <h2 className={`text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight ${selectedTodo.completed ? 'line-through opacity-40' : ''}`}>
                    {selectedTodo.text}
                  </h2>

                  <div className="space-y-6">
                    {selectedTodo.due_date && (
                      <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                        <h3 className="label text-[9px] uppercase tracking-widest text-rose-400 mb-1">Expiration Date</h3>
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-base">
                          <span className="text-xl">📅</span> {selectedTodo.due_date}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="label text-[9px] uppercase tracking-widest text-slate-400 mb-2">Task Context</h3>
                      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[120px] border border-slate-100 dark:border-slate-800 font-medium whitespace-pre-wrap shadow-inner">
                        {selectedTodo.description || (
                          <span className="italic opacity-30 text-xs">No description provided for this task.</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="label italic text-[10px] uppercase tracking-widest text-slate-400">Created On</h3>
                        <p className="text-xs text-slate-500 font-bold">{selectedTodo.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(selectedTodo)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                          title="Edit Task"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteTodo(selectedTodo.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete Task"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            toggleTodo(selectedTodo.id, selectedTodo.completed);
                            setSelectedTodo({ ...selectedTodo, completed: !selectedTodo.completed });
                          }}
                          className={`btn-primary px-8 py-2.5 text-xs font-black uppercase tracking-widest ${selectedTodo.completed ? 'bg-slate-400 dark:bg-slate-700 hover:bg-slate-500' : ''}`}
                        >
                          {selectedTodo.completed ? 'Undo' : 'Complete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTagsManager && (
        <TagsManager 
          onClose={() => setShowTagsManager(false)} 
          onTagsUpdated={fetchTags}
        />
      )}
    </div>
  );
}
