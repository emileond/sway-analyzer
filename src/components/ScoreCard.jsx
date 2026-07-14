/**
 * ScoreCard – Blackjack scoreboard (Player Wins / Dealer Wins / Pushes).
 * Compact mode: single horizontal row, inline labels, no win bar.
 */
import { Card, Chip } from "@heroui/react";
import { computeStats, computeStreak } from "../lib/trendEngine";

export default function ScoreCard({ history, compact = false }) {
  const stats = computeStats(history);
  const streak = computeStreak(history);

  const streakLabel =
    streak === 0
      ? null
      : streak > 0
        ? `Win ×${Math.abs(streak)}`
        : `Loss ×${Math.abs(streak)}`;

  const streakColor = streak > 0 ? "success" : "danger";

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase text-success">W</span>
          <span className="text-xl font-bold tabular-nums text-success leading-none">
            {stats.aWins}
          </span>
        </div>

        <div className="flex items-baseline gap-1 shrink-0 text-muted">
          <span className="text-[9px] font-semibold uppercase">R</span>
          <span className="text-sm font-bold tabular-nums leading-none">
            {stats.total || "—"}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase text-danger">L</span>
          <span className="text-xl font-bold tabular-nums text-danger leading-none">
            {stats.bWins}
          </span>
        </div>

        {stats.ties > 0 && (
          <div className="flex items-baseline gap-1.5 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted">P</span>
            <span className="text-sm font-bold tabular-nums text-muted leading-none">
              {stats.ties}
            </span>
          </div>
        )}

        {streakLabel && (
          <Chip color={streakColor} size="sm" variant="soft" className="shrink-0">
            {streakLabel}
          </Chip>
        )}
      </div>
    );
  }

  return (
    <Card className="gap-0 overflow-hidden">
      <Card.Content className="p-0">
        <div className="flex items-stretch">
          {/* Player Wins */}
          <div className="flex-1 flex flex-col items-center justify-center py-5 px-4 bg-success/5 border-r border-border/40">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-success mb-1">
              Player Wins
            </span>
            <span className="text-4xl font-bold tabular-nums text-success leading-none">
              {stats.aWins}
            </span>
            <span className="text-[10px] text-muted mt-1 tabular-nums">
              {stats.aPct}%
            </span>
          </div>

          {/* Center */}
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

          {/* Dealer Wins */}
          <div className="flex-1 flex flex-col items-center justify-center py-5 px-4 bg-danger/5 border-l border-border/40">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-danger mb-1">
              Dealer Wins
            </span>
            <span className="text-4xl font-bold tabular-nums text-danger leading-none">
              {stats.bWins}
            </span>
            <span className="text-[10px] text-muted mt-1 tabular-nums">
              {stats.bPct}%
            </span>
          </div>
        </div>

        {/* Win bar */}
        {stats.total > 0 && (
          <div className="h-1.5 w-full flex">
            <div className="h-full bg-success transition-all duration-300" style={{ width: `${stats.aPct}%` }} />
            <div className="h-full bg-muted/30 transition-all duration-300" style={{ width: `${stats.tiePct}%` }} />
            <div className="h-full bg-danger transition-all duration-300" style={{ width: `${stats.bPct}%` }} />
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
