'use client';

import Link from 'next/link';
import { formatEUR } from '../lib/currency';
import { getCountryByCode } from '@antigravity/core';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface TournamentCardProps {
  id: string;
  name: string;
  format: string;
  size: number;
  entryFee: number;
  prizePool: number;
  status: string;
  gameTitle?: string;
  region?: string;
  countryCode?: string;
  enrolledCount?: number;
}

export function TournamentCard({
  id,
  name,
  format,
  size,
  entryFee,
  prizePool,
  status,
  gameTitle,
  region = 'Worldwide',
  countryCode,
  enrolledCount = 0,
}: TournamentCardProps) {
  const country = countryCode ? getCountryByCode(countryCode) : null;

  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-all duration-200 group">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="copper">
              {format.replace(/_/g, ' ')}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 font-mono text-[10px]">
              {country ? `${country.flag} ${country.name}` : `🌍 ${region}`}
            </Badge>
          </div>

          <Badge
            variant={
              status === 'REGISTRATION' || status === 'OPEN'
                ? 'success'
                : status === 'ACTIVE' || status === 'IN_PROGRESS'
                ? 'copper'
                : 'secondary'
            }
          >
            {status.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div>
          <CardTitle className="text-base group-hover:text-accent-400 transition-colors line-clamp-1">
            {name}
          </CardTitle>
          {gameTitle && (
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider block mt-1">
              {gameTitle}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 p-3 bg-secondary/60 border border-border rounded-xl text-center text-xs">
          <div>
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">Slots</span>
            <span className="font-mono font-bold text-foreground">
              {enrolledCount > 0 ? `${enrolledCount}/${size}` : `${size} Cap`}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">Entry Fee</span>
            <span className="font-mono font-bold text-foreground">
              {entryFee === 0 ? <span className="text-emerald-400">FREE</span> : formatEUR(entryFee)}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">Prize Pool</span>
            <span className="font-mono font-bold text-accent-400">
              {prizePool === 0 ? 'Trophies' : formatEUR(prizePool)}
            </span>
          </div>
        </div>

        <Link href={`/tournaments/${id}`} className="block w-full">
          <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            View Tournament Bracket
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
