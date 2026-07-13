/**
 * StatusCard – Live trend display with multi-metric readout,
 * composite reversal probability, and contextual alerts.
 */
import { Card, Chip } from "@heroui/react";
import {
  classifyTrend,
  riskLevel,
  momentumLabel,
} from "../lib/trendEngine";

export default function StatusCard({
  trend,
  momentum,
  volatility,
  fatigue,
  reversalProb,
  roundCount,
}) {
  const zone = classifyTrend(trend);
  const risk = riskLevel(reversalProb);
  const mLabel = momentumLabel(momentum);

  const riskChipColor = {
    Low: "success",
    Moderate: "warning",
    High: "danger",
  };

  return (
    <Card className="gap-4">
      <Card.Header>
        <Card.Title className="flex items-center gap-3 flex-wrap">
          Trend Analysis
          {roundCount > 0 && (
            <Chip color={riskChipColor[risk]} variant="primary" size="sm">
              {risk} Risk
            </Chip>
          )}
        </Card.Title>
      </Card.Header>

      <Card.Content className="flex flex-col gap-4">
        {/* Primary trend value */}
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tabular-nums tracking-tight">
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(3)}
          </span>
          <span className="text-xs text-muted font-mono">T</span>
        </div>

        {/* Zone */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted uppercase tracking-wide">Zone</span>
          <Chip size="sm" variant="soft">{zone}</Chip>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Reversal P" value={`${reversalProb}%`} color={
            reversalProb >= 60 ? "text-danger" : reversalProb >= 30 ? "text-warning" : "text-success"
          } />
          <Metric label="Momentum" value={mLabel} />
          <Metric label="Volatility (σ²)" value={volatility.toFixed(4)} />
          <Metric label="Fatigue" value={`${fatigue} rounds`} />
        </div>

        {/* Active alert */}
        {risk === "High" && roundCount > 0 && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger animate-risk-pulse">
            Trend Exhaustion: A shift in momentum is highly probable due to
            statistical reversion to the mean.
          </div>
        )}

        {risk === "Moderate" && roundCount > 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Moderate pressure — trend approaching a potential pivot zone.
          </div>
        )}

        {risk === "Low" && roundCount > 0 && (
          <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-sm text-success/80">
            Game is balanced — no significant directional momentum.
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

function Metric({ label, value, color = "" }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-surface-secondary/50 px-3 py-2">
      <span className="text-[10px] uppercase tracking-wider text-muted">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}
