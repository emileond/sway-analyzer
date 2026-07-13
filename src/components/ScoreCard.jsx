/**
 * ScoreCard – Sports-style scoreboard: Player A | Round N | Player B.
 */
import { Card, Chip } from "@heroui/react";
import { computeStats, computeStreak } from "../lib/trendEngine";

export default function ScoreCard({ history }) {
  const stats = computeStats(history);
  const streak = computeStreak(history);

  const streakLabel =
    streak === 0
      ? null
      : streak > 0
        ? `A ×${Math.abs(streak)}`
        : `B ×${Math.abs(streak)}`;

  const streakColor = streak > 0 ? "success" : "danger";

  return (
    <Card className="gap-0 overflow-hidden">
      <Card.Content className="p-0">
        <div className="flex items-stretch">
          {/* Player A side */}
          <div className="flex-1 flex flex-col items-center justify-center py-5 px-4 bg-success/5 border-r border-border/40">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-success mb-1">
              Player A
            </span>
            <span className="text-4xl font-bold tabular-nums text-success leading-none">
              {stats.aWins}
            </span>
            <span className="text-[10px] text-muted mt-1 tabular-nums">
              {stats.aPct}%
            </span>
          </div>

          {/* Center divider */}
          <div className="flex flex-col items-center justify-center px-4 py-5 gap-1 bg-surface-secondary/30">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
              Round
            </span>
            <span className="text-2xl font-bold tabular-nums leading-none">
              {stats.total || "—"}
            </span>
            {streakLabel && (
              <Chip color={streakColor} size="sm" variant="soft">
                {streakLabel}
              </Chip>
            )}
          </div>

          {/* Player B side */}
          <div className="flex-1 flex flex-col items-center justify-center py-5 px-4 bg-danger/5 border-l border-border/40">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-danger mb-1">
              Player B
            </span>
            <span className="text-4xl font-bold tabular-nums text-danger leading-none">
              {stats.bWins}
            </span>
            <span className="text-[10px] text-muted mt-1 tabular-nums">
              {stats.bPct}%
            </span>
          </div>
        </div>

        {/* Win distribution bar */}
        {stats.total > 0 && (
          <div className="h-1.5 w-full flex">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${stats.aPct}%` }}
            />
            <div
              className="h-full bg-muted/30 transition-all duration-300"
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
