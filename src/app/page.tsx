'use client';

import React from 'react';
import { useTodayPage } from '@/hooks/useTodayPage';
import { NutritionModule, TrainingModule, StudyModule, MindModule, FitnessModule, TodosModule } from '@/components/modules';
import { Timeline, EntryDetailModal } from '@/components/timeline';
import { formatDisplayDate } from '@/lib/utils';

export default function TodayPage() {
  const { today, timeline, loading, handleLog, updateEntry, deleteEntry } = useTodayPage();
  const [selectedEntry, setSelectedEntry] = React.useState<any | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState<any>(null);

  const startEditing = (entry: any) => {
    setEditData({ ...entry });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (selectedEntry?.id) {
      await updateEntry(selectedEntry, editData);
      setSelectedEntry({ ...editData });
      setIsEditing(false);
    }
  };

  const handleDelete = async (entry: any) => {
    if (confirm('Are you sure you want to delete this log?')) {
      await deleteEntry(entry);
      setSelectedEntry(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin text-4xl">🌅</div>
        <p className="text-slate-400 font-medium animate-pulse">Loading daily summary…</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 space-y-10 animate-fade-in font-sans">
      <div className="card bg-gradient-to-r from-brand-600 to-violet-600 text-white border-0 shadow-lg p-6 sm:p-8 relative overflow-hidden group rounded-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2 drop-shadow-sm">
          Timeline Mode
        </p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">{formatDisplayDate(today)}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <TodosModule />
        <NutritionModule onLog={(data) => handleLog('nutrition', data)} />
        <TrainingModule onLog={(data) => handleLog('training', data)} />
        <StudyModule onLog={(data) => handleLog('study', data)} />
        <MindModule onLog={(data) => handleLog('mind', data)} />
        <FitnessModule />
      </div>

      <Timeline 
        timeline={timeline}
        onEntryClick={(entry) => {
          setSelectedEntry(entry);
          setIsEditing(false);
        }}
        onEntryEdit={(entry) => {
          startEditing(entry);
          setSelectedEntry(entry);
        }}
        onEntryDelete={handleDelete}
      />

      {selectedEntry && (
        <EntryDetailModal
          selectedEntry={selectedEntry}
          isEditing={isEditing}
          editData={editData}
          onEdit={startEditing}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => {
            setSelectedEntry(null);
            setIsEditing(false);
          }}
          onEditDataChange={setEditData}
          onCancelEdit={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
