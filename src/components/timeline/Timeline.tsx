'use client';

import React from 'react';
import { TimelineEntry } from './TimelineEntry';

interface TimelineProps {
  timeline: any[];
  onEntryClick: (entry: any) => void;
  onEntryEdit: (entry: any) => void;
  onEntryDelete: (entry: any) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  timeline,
  onEntryClick,
  onEntryEdit,
  onEntryDelete,
}) => {
  return (
    <section className="mt-8 mb-12 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-2xl shadow-sm border border-slate-50 dark:border-slate-800">
          🕒
        </div>
        <div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Today's Timeline</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Your chronological activity log</p>
        </div>
      </div>

      {timeline.length === 0 ? (
        <div className="card border-dashed border-2 py-16 text-center text-slate-400 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 p-8 rounded-2xl shadow-sm">
          <p className="text-4xl mb-3 opacity-20">📝</p>
          <p className="font-medium">No activities logged yet for today.</p>
          <p className="text-[10px] mt-1 uppercase tracking-widest opacity-60">Log something above to get started</p>
        </div>
      ) : (
        <div className="relative space-y-6 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
          {timeline.map((entry) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              onClick={onEntryClick}
              onEdit={onEntryEdit}
              onDelete={onEntryDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
};
