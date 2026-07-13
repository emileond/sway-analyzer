/**
 * StatsBar – Win counts, percentages, and streak information.
 */
import { Card, Chip } from "@heroui/react";
import { computeStats, computeStreak } from "../lib/trendEngine";

export default function StatsBar({ history }) {
  const stats = computeStats(history);
  const streak = computeStreak(history);

  const streakLabel =
    streak === 0
      ? "No streak"
      : streak > 0
        ? `A × ${Math.abs(streak)}`
        : `B × ${Math.abs(streak)}`;

  const streakColor =
    streak === 0 ? "default" : streak > 0 ? "success" : "danger";

  return (
    <Card className="gap-3">
      <Card.Header>
        <Card.Title className="text-sm">Match Statistics</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {/* Player A */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-success">A</span>
            <span className="tabular-nums font-bold">{stats.aWins}</span>
            <span className="text-muted tabular-nums">({stats.aPct}%)</span>
          </div>

          {/* Ties */}
          <div className="flex items-center gap-2">
            <span className="text-muted">Ties</span>
            <span className="tabular-nums font-bold">{stats.ties}</span>
          </div>

          {/* Player B */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-danger">B</span>
            <span className="tabular-nums font-bold">{stats.bWins}</span>
            <span className="text-muted tabular-nums">({stats.bPct}%)</span>
          </div>

          {/* Separator */}
          <span className="text-border">|</span>

          {/* Streak */}
          <Chip color={streakColor} variant="soft" size="sm">
            {streakLabel}
          </Chip>

          {/* Total */}
          <span className="text-muted ml-auto">
            {stats.total} round{stats.total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Win bar */}
        {stats.total > 0 && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-secondary flex">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${stats.aPct}%` }}
            />
            <div
              className="h-full bg-muted/40 transition-all duration-300"
              style={{ width: `${Math.round((stats.ties / stats.total) * 100)}%` }}
            />
            <div
              className="h-full bg-danger transition-all duration-300"
              style={{ width: `${stats.bPct}%` }}
            />
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
