/**
 * StatusCard – Trend analysis combined with card count context.
 */
import { Card, Chip, Tooltip } from "@heroui/react";
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
  trueCount,
}) {
  const zone = classifyTrend(trend);
  const risk = riskLevel(reversalProb);
  const mLabel = momentumLabel(momentum);

  const riskChipColor = {
    Low: "success",
    Moderate: "warning",
    High: "danger",
  };

  // Contextual insight based on count + trend
  const countInsight = getCountInsight(trueCount, trend, risk);

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
          <span className="text-xs text-muted uppercase tracking-wide">
            Zone
          </span>
          <Chip size="sm" variant="soft">
            {zone}
          </Chip>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric
            icon={<GaugeIcon />}
            label="Reversal P"
            value={`${reversalProb}%`}
            color={
              reversalProb >= 60
                ? "text-danger"
                : reversalProb >= 30
                  ? "text-warning"
                  : "text-success"
            }
            tip="Composite probability (0–100%) that the current trend will reverse, combining saturation, streak fatigue, momentum opposition, and volatility."
          />
          <Metric
            icon={<ZapIcon />}
            label="Momentum"
            value={mLabel}
            tip="Rate of change of the trend. Positive means acceleration toward Player wins, negative toward Dealer wins."
          />
          <Metric
            icon={<WaveIcon />}
            label="Volatility"
            value={volatility.toFixed(4)}
            tip="EWMA of squared trend changes. Higher values indicate an unstable trend."
          />
          <Metric
            icon={<ClockIcon />}
            label="Fatigue"
            value={`${fatigue} rounds`}
            tip="Consecutive rounds the trend has stayed above the dominance threshold (|T| > 0.4)."
          />
        </div>

        {/* Count + Trend Insight */}
        {countInsight && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-medium ${
              countInsight.type === "opportunity"
                ? "border-success/30 bg-success/10 text-success"
                : countInsight.type === "caution"
                  ? "border-warning/30 bg-warning/10 text-warning"
                  : "border-border/30 bg-surface-secondary/30 text-muted"
            }`}
          >
            {countInsight.label}
          </div>
        )}

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
      </Card.Content>
    </Card>
  );
}

function getCountInsight(trueCount, trend, risk) {
  const tc = trueCount ?? 0;

  if (tc >= 3 && trend < -0.3) {
    return {
      type: "opportunity",
      label: `Strong count (+${tc}) suggests dealer advantage streak may reverse. Consider increasing bets.`,
    };
  }
  if (tc <= -2 && trend > 0.3) {
    return {
      type: "caution",
      label: `Negative count (${tc}) while trend favors player. House edge is elevated — keep minimum bets.`,
    };
  }
  if (tc >= 4) {
    return {
      type: "opportunity",
      label: `High true count (+${tc}). Player edge ~${((tc * 0.5 - 0.5)).toFixed(1)}%. Maximum bet recommended.`,
    };
  }
  if (risk === "High" && tc >= 2) {
    return {
      type: "caution",
      label: `Trend exhaustion at positive count. Reversion likely but count still favors you.`,
    };
  }
  return null;
}

function Metric({ icon, label, value, color = "", tip }) {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-surface-secondary/50 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <span className="text-muted [&>svg]:size-3">{icon}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted">
          {label}
        </span>
        {tip && (
          <Tooltip delay={0}>
            <span className="ml-auto cursor-help text-muted hover:text-foreground transition-colors">
              <HelpIcon />
            </span>
            <Tooltip.Content className="max-w-64 text-xs leading-relaxed" placement="top">
              {tip}
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>
      <span className={`text-sm font-semibold tabular-nums ${color}`}>
        {value}
      </span>
    </div>
  );
}

/* ── Inline SVG icons ── */

function GaugeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
      <path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
      <path d="M2 12c1.5-3 3.5-3 5 0s3.5 3 5 0 3.5-3 5 0 3.5 3 5 0" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
    </svg>
  );
}
