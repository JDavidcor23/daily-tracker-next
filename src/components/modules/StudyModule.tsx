'use client';

import { useState } from 'react';
import { DailyLog } from '@/lib/types';

interface Props {
  onLog: (data: Partial<DailyLog>) => void;
}

export default function StudyModule({ onLog }: Props) {
  const [topic, setTopic] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleLog = () => {
    if (!topic.trim()) return;
    onLog({
      study_topic: topic,
      study_time: time,
      study_notes: notes,
    });
    setTopic('');
    setTime('');
    setNotes('');
  };

  return (
    <div className="card module-section font-sans">
      <div className="module-header">
        <div className="module-icon bg-blue-50 dark:bg-blue-900/20">📚</div>
        <div>
          <p className="module-title">Study</p>
          <p className="module-subtitle uppercase tracking-tight">Log a study session</p>
        </div>
      </div>

      <div>
        <label className="label">Topic</label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g. React Hooks"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            className="input-field h-11"
            placeholder="Time (e.g. 1h)"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <button
          onClick={handleLog}
          disabled={!topic.trim()}
          className="btn-primary px-4"
        >
          Log
        </button>
      </div>

      <div>
        <textarea
          className="input-field resize-none"
          rows={2}
          placeholder="Notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
