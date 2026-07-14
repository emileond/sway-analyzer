/**
 * CountDisplay – Running count, true count, EV, and deck penetration.
 * Primary info panel for card counting.
 */
import { Card, Chip } from "@heroui/react";

export default function CountDisplay({ countSummary }) {
  const {
    trueCount,
    runningCount,
    edgePercent,
    isAdvantage,
    isStrongAdvantage,
    penetration,
    decksRemaining,
    recommendation,
    penetrationStatus,
  } = countSummary;

  const rcColor =
    runningCount > 0
      ? "text-success"
      : runningCount < 0
        ? "text-danger"
        : "text-muted";

  const tcColor =
    trueCount >= 3
      ? "text-success"
      : trueCount >= 1
        ? "text-success/80"
        : trueCount <= -2
          ? "text-danger"
          : trueCount < 0
            ? "text-danger/80"
            : "text-muted";

  const edgeColor =
    edgePercent > 1
      ? "text-success"
      : edgePercent > 0
        ? "text-success/70"
        : edgePercent > -0.5
          ? "text-warning"
          : "text-danger";

  return (
    <Card className="gap-4">
      <Card.Header>
        <Card.Title className="text-sm flex items-center gap-2">
          Card Count
          {isStrongAdvantage && (
            <Chip color="success" variant="primary" size="sm">
              Hot Shoe
            </Chip>
          )}
          {isAdvantage && !isStrongAdvantage && (
            <Chip color="success" variant="soft" size="sm">
              Player Edge
            </Chip>
          )}
        </Card.Title>
      </Card.Header>

      <Card.Content className="flex flex-col gap-4">
        {/* True Count - Hero */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
            True Count
          </span>
          <span className={`text-5xl font-bold tabular-nums tracking-tight ${tcColor}`}>
            {trueCount >= 0 ? "+" : ""}
            {trueCount}
          </span>
        </div>

        {/* Running Count + Edge */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5 rounded-md bg-surface-secondary/50 px-3 py-2">
            <span className="text-[9px] uppercase tracking-wider text-muted">
              Running Count
            </span>
            <span className={`text-lg font-bold tabular-nums ${rcColor}`}>
              {runningCount >= 0 ? "+" : ""}
              {runningCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-md bg-surface-secondary/50 px-3 py-2">
            <span className="text-[9px] uppercase tracking-wider text-muted">
              Player Edge
            </span>
            <span className={`text-lg font-bold tabular-nums ${edgeColor}`}>
              {edgePercent >= 0 ? "+" : ""}
              {edgePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Bet Recommendation */}
        <div className="flex items-center justify-between rounded-md border border-border/30 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-muted">
            Bet Sizing
          </span>
          <Chip color={recommendation.color} size="sm" variant="soft">
            {recommendation.label}
          </Chip>
        </div>

        {/* Deck Penetration */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted">
              Penetration
            </span>
            <span className="text-xs font-mono tabular-nums text-muted">
              {Math.round(penetration * 100)}% · {decksRemaining.toFixed(1)} decks left
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, penetration * 100)}%`,
                backgroundColor:
                  penetration > 0.75
                    ? "var(--color-success)"
                    : penetration > 0.5
                      ? "var(--color-warning)"
                      : "var(--color-neutral, #64748b)",
              }}
            />
          </div>
          <p className="text-[10px] text-muted leading-relaxed">
            {penetrationStatus}
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}
