'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Tag } from '@/lib/types';

interface TagsManagerProps {
  onClose: () => void;
  onTagsUpdated?: () => void;
}

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
  '#f97316', '#eab308', '#22c55e', '#06b6d4', 
  '#3b82f6', '#64748b'
];

export default function TagsManager({ onClose, onTagsUpdated }: TagsManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [isCreating, setIsCreating] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await api.tags.fetch();
      setTags(data);
    } catch (error: any) {
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await api.tags.create({ name: newName.trim(), color: newColor });
      setNewName('');
      fetchTags();
      onTagsUpdated?.();
      toast.success('Tag created');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag? It will be removed from all tasks.')) return;
    try {
      await api.tags.delete(id);
      fetchTags();
      onTagsUpdated?.();
      toast.success('Tag deleted');
    } catch (error: any) {
      toast.error('Delete failed');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="card w-full max-w-md overflow-hidden shadow-2xl relative border-0 dark:border dark:border-slate-800 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Manage Tags</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Create New Tag</label>
              <input
                type="text"
                placeholder="Tag name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input-field py-2 text-sm"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`w-6 h-6 rounded-full transition-all ${newColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full py-2 text-xs font-black uppercase tracking-widest"
              disabled={!newName.trim()}
            >
              Add Tag
            </button>
          </form>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Your Tags</label>
            {loading ? (
              <div className="py-10 text-center animate-pulse text-slate-400 text-sm">Loading tags...</div>
            ) : tags.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs italic">No tags created yet.</div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {tags.map(tag => (
                  <div 
                    key={tag.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{tag.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
