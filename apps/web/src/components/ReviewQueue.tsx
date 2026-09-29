'use client';

import { useState } from 'react';
import { apiClient } from '../lib/api';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CheckCircle2, AlertTriangle, Check, X, Edit3 } from 'lucide-react';

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
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (taskId: string, action: 'approve' | 'reject' | 'correct') => {
    try {
      setProcessingId(taskId);
      const correctedValue = correctionValues[taskId];
      await apiClient(`/review/${taskId}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ correctedValue }),
      });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Action failed: ${msg}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center bg-card border-border">
        <div className="w-12 h-12 rounded-2xl bg-secondary mx-auto flex items-center justify-center text-emerald-400 mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
          Review Queue is Cleared
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No contested matches or low-confidence scoreframes currently require human moderation.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const confidencePct = ((task.score_frames?.confidence ?? 0) * 100).toFixed(1);
        const isBusy = processingId === task.id;

        return (
          <Card key={task.id} className="bg-card border-border p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm text-foreground">
                    Audit Task #{task.id.slice(0, 8)}
                  </span>
                  <Badge variant="warning" className="font-mono text-[10px]">
                    Priority {task.priority}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    Confidence: {confidencePct}%
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  Match Room ID: <span className="font-mono text-foreground">{task.match_id}</span>
                </p>

                <div className="bg-secondary/60 p-3 rounded-xl border border-border font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Extracted Score Text:</span>
                    <span className="text-foreground font-bold">
                      {task.score_frames?.raw_text || 'N/A'}
                    </span>
                  </div>
                  {task.score_frames?.image_hash && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Frame Hash:</span>
                      <span className="text-muted-foreground truncate max-w-xs">
                        {task.score_frames.image_hash}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap flex-shrink-0">
                <Input
                  type="text"
                  placeholder="Correct score value..."
                  value={correctionValues[task.id] || ''}
                  onChange={(e) =>
                    setCorrectionValues({ ...correctionValues, [task.id]: e.target.value })
                  }
                  className="w-40 text-xs"
                />

                <Button
                  variant="default"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => handleAction(task.id, 'approve')}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBusy || !correctionValues[task.id]}
                  onClick={() => handleAction(task.id, 'correct')}
                  className="text-xs font-bold gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Correct
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => handleAction(task.id, 'reject')}
                  className="text-xs font-bold gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
