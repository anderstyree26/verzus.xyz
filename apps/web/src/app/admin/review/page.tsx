'use client';

import { useQuery } from '@tanstack/react-query';
import { ReviewQueue } from '../../../components/ReviewQueue';
import { apiClient } from '../../../lib/api';

export default function AdminReviewPage() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['review-tasks'],
    queryFn: () => apiClient<Array<any>>('/review/queue'),
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">HITL Review Queue</h1>
        <p className="text-sm text-gray-400">
          Verify and correct low-confidence OCR reads to train models and settle disputes.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-400">Loading tasks...</div>
      ) : (
        <ReviewQueue initialTasks={tasks ?? []} />
      )}
    </div>
  );
}
