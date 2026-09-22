'use client';

import { useState } from 'react';
import { apiClient } from '../lib/api';

interface ReviewTaskItem {
  id: string;
  match_id: string;
  priority: number;
  score_frames?: {
    raw_text: string;
    image_hash: string | null;
    confidence: number;
  };
}

interface ReviewQueueProps {
  initialTasks: ReviewTaskItem[];
}

export function ReviewQueue({ initialTasks }: ReviewQueueProps) {
  const [tasks, setTasks] = useState<ReviewTaskItem[]>(initialTasks);
  const [correctionValues, setCorrectionValues] = useState<Record<string, string>>({});

  const handleAction = async (taskId: string, action: 'approve' | 'reject' | 'correct') => {
    try {
      const correctedValue = correctionValues[taskId];
      await apiClient(`/review/${taskId}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ correctedValue }),
      });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Action failed: ${msg}`);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-elevated border border-surface-border rounded-lg text-gray-400">
        Review queue is clear! No pending low-confidence OCR frames.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-5 bg-surface-elevated border border-surface-border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Task #{task.id.slice(0, 8)}</span>
              <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded font-mono">
                Priority: {task.priority}
              </span>
            </div>

            <p className="text-xs text-gray-400">
              Match: <span className="font-mono text-gray-300">{task.match_id}</span>
            </p>

            <div className="mt-2 bg-surface p-3 rounded border border-surface-border font-mono text-xs">
              <p className="text-gray-400">Raw OCR Text: <span className="text-white font-bold">{task.score_frames?.raw_text}</span></p>
              <p className="text-gray-400 mt-1">Confidence: <span className="text-yellow-400">{((task.score_frames?.confidence ?? 0) * 100).toFixed(1)}%</span></p>
              {task.score_frames?.image_hash && (
                <p className="text-gray-500 text-[10px] mt-1 truncate">Hash: {task.score_frames.image_hash}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Corrected score"
              value={correctionValues[task.id] || ''}
              onChange={(e) =>
                setCorrectionValues({ ...correctionValues, [task.id]: e.target.value })
              }
              className="px-3 py-1.5 bg-surface border border-surface-border rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent"
            />

            <button
              onClick={() => handleAction(task.id, 'approve')}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-xs font-bold rounded transition"
            >
              Approve
            </button>

            <button
              onClick={() => handleAction(task.id, 'correct')}
              className="px-3 py-1.5 bg-accent hover:bg-accent-600 text-xs font-bold rounded transition"
            >
              Correct
            </button>

            <button
              onClick={() => handleAction(task.id, 'reject')}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-bold rounded transition"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
