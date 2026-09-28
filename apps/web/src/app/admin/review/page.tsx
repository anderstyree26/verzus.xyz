'use client';

import { useQuery } from '@tanstack/react-query';
import { ReviewQueue } from '../../../components/ReviewQueue';
import { apiClient } from '../../../lib/api';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';

export default function AdminReviewPage() {
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['review-tasks'],
    queryFn: () => apiClient<Array<any>>('/review/queue'),
    refetchInterval: 15000,
  });

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-card border border-border rounded-3xl shadow-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="copper">HITL AUDIT ENGINE</Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {tasks?.length || 0} PENDING REVIEWS
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground truncate">
            HITL Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Audit low-confidence OCR reads and settle dispute flags to ensure competitive integrity.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center text-xs text-muted-foreground">
          Loading HITL audit tasks...
        </Card>
      ) : (
        <ReviewQueue initialTasks={tasks ?? []} />
      )}
    </div>
  );
}
