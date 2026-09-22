'use client';

interface MatchNode {
  id: string;
  bracket_round: number;
  bracket_position: number;
  player_a: string | null;
  player_b: string | null;
  winner: string | null;
  status: string;
}

interface BracketViewProps {
  matches: MatchNode[];
}

export function BracketView({ matches }: BracketViewProps) {
  // Group by round
  const rounds = matches.reduce<Record<number, MatchNode[]>>((acc, m) => {
    const r = m.bracket_round ?? 1;
    if (!acc[r]) acc[r] = [];
    acc[r].push(m);
    return acc;
  }, {});

  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  if (matches.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-elevated border border-surface-border rounded-lg text-gray-400">
        Tournament bracket has not been generated yet.
      </div>
    );
  }

  return (
    <div className="p-6 bg-surface-elevated border border-surface-border rounded-lg overflow-x-auto">
      <div className="flex gap-8 min-w-[700px] items-stretch">
        {roundNumbers.map((r) => (
          <div key={r} className="flex-1 flex flex-col justify-around gap-6">
            <h4 className="text-xs uppercase font-bold tracking-wider text-accent border-b border-surface-border pb-1">
              Round {r}
            </h4>

            <div className="flex flex-col justify-around gap-4 h-full">
              {rounds[r]?.map((match) => (
                <div
                  key={match.id}
                  className="bg-surface border border-surface-border rounded-md p-3 text-xs flex flex-col gap-1.5 shadow-sm"
                >
                  <div
                    className={`flex justify-between items-center py-1 px-2 rounded ${
                      match.winner && match.winner === match.player_a
                        ? 'bg-accent/20 text-accent font-bold'
                        : 'text-gray-300'
                    }`}
                  >
                    <span>{match.player_a ? `Player ${match.player_a.slice(0, 6)}` : 'TBD'}</span>
                    {match.winner === match.player_a && <span>🏆</span>}
                  </div>

                  <div className="h-px bg-surface-border" />

                  <div
                    className={`flex justify-between items-center py-1 px-2 rounded ${
                      match.winner && match.winner === match.player_b
                        ? 'bg-accent/20 text-accent font-bold'
                        : 'text-gray-300'
                    }`}
                  >
                    <span>{match.player_b ? `Player ${match.player_b.slice(0, 6)}` : 'TBD'}</span>
                    {match.winner === match.player_b && <span>🏆</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
