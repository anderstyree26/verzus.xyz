'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Plus } from 'lucide-react';

interface Season {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminSeasonsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  );

  const { data: seasons, isLoading } = useQuery<Season[]>({
    queryKey: ['admin-seasons'],
    queryFn: () => apiClient<Season[]>('/seasons'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient('/seasons', {
        method: 'POST',
        body: JSON.stringify({
          name,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasons'] });
      setIsCreating(false);
      setName('');
    },
  });

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-card border border-border rounded-3xl shadow-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="copper">LADDER CYCLES</Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {seasons?.length || 0} TOTAL SEASONS
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground truncate">
            Seasons & Ladder Resets
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure competitive season schedules, ladder soft-resets, and seasonal prize pool rewards.
          </p>
        </div>

        <Button
          variant="default"
          size="default"
          onClick={() => setIsCreating(true)}
          className="font-bold text-xs gap-1.5 flex-shrink-0 shadow-md shadow-primary/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Season</span>
        </Button>
      </div>

      {/* Season Creation Form */}
      {isCreating && (
        <Card className="bg-card border-primary/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">
              Launch New Competitive Season
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Starting a season sets the active timeframe for ladder standings and seasonal leaderboard rewards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Season Title
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Season 1: Genesis Cup"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Start Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    End Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={createMutation.isPending || !name}
                  className="text-xs font-bold"
                >
                  {createMutation.isPending ? 'Launching...' : 'Confirm & Launch Season'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Seasons Data Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground">
            Season History & Active Windows
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Past and current competitive periods recorded in the global ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              Loading competitive seasons...
            </div>
          ) : !seasons || seasons.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No seasons created yet. Click "+ Create New Season" above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Season Name</TableHead>
                  <TableHead className="font-bold">Duration</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right">Season ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seasons.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold text-foreground">
                      {s.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(s.starts_at).toLocaleDateString()} — {new Date(s.ends_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {s.is_active ? (
                        <Badge variant="copper" className="font-mono text-[10px]">
                          LIVE ACTIVE ●
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          CONCLUDED
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {s.id.substring(0, 8)}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
