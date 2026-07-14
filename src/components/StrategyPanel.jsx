/**
 * StrategyPanel – Active Illustrious 18 deviations with visual severity.
 *
 * - "standard"    → muted/grayed, minor expected adjustments
 * - "notable"     → normal styling, clear count-driven changes
 * - "aggressive"  → highlighted yellow/amber, goes against basic strategy
 */
import { Card, Chip, Tooltip } from "@heroui/react";

const SEVERITY_STYLES = {
  standard: {
    row: "bg-surface-secondary/30 border-border/20 opacity-60",
    chip: "default",
    chipVariant: "flat",
    label: "Standard",
  },
  notable: {
    row: "bg-success/5 border-success/20",
    chip: "success",
    chipVariant: "flat",
    label: "Notable",
  },
  aggressive: {
    row: "bg-warning/8 border-warning/30 ring-1 ring-warning/20",
    chip: "warning",
    chipVariant: "soft",
    label: "Aggressive",
  },
};

export default function StrategyPanel({ trueCount, activeDeviations, insurance, nextThreshold }) {
  const grouped = {
    aggressive: activeDeviations.filter((d) => d.severity === "aggressive"),
    notable: activeDeviations.filter((d) => d.severity === "notable"),
    standard: activeDeviations.filter((d) => d.severity === "standard"),
  };

  return (
    <Card className="gap-4">
      <Card.Header>
        <Card.Title className="text-sm">Strategy Deviations</Card.Title>
        <Card.Description className="text-xs">
          {activeDeviations.length > 0
            ? `${activeDeviations.length} deviation${activeDeviations.length > 1 ? "s" : ""} active`
            : "Follow Basic Strategy"}
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-3">
        {/* Insurance */}
        <div className={`flex items-center justify-between rounded-md border px-3 py-2 ${
          insurance.take ? "border-success/30 bg-success/5" : "border-border/30"
        }`}>
          <div className="flex flex-col">
            <span className="text-xs font-medium">Insurance</span>
            <span className="text-[10px] text-muted">TC ≥ 5 threshold</span>
          </div>
          <Chip
            color={insurance.take ? "success" : "default"}
            size="sm"
            variant={insurance.take ? "soft" : "flat"}
          >
            {insurance.label}
          </Chip>
        </div>

        {/* Aggressive deviations — highlighted */}
        {grouped.aggressive.length > 0 && (
          <DeviationGroup
            deviations={grouped.aggressive}
            title="Against Basic Strategy"
            titleColor="text-warning"
          />
        )}

        {/* Notable deviations — normal */}
        {grouped.notable.length > 0 && (
          <DeviationGroup
            deviations={grouped.notable}
            title="Count Adjustments"
            titleColor="text-success"
          />
        )}

        {/* Standard deviations — muted */}
        {grouped.standard.length > 0 && (
          <DeviationGroup
            deviations={grouped.standard}
            title="Standard Plays"
            titleColor="text-muted"
          />
        )}

        {activeDeviations.length === 0 && (
          <div className="text-xs text-muted text-center py-2">
            No deviations active at TC = {trueCount >= 0 ? "+" : ""}{trueCount}
          </div>
        )}

        {/* Next deviation hint */}
        {nextThreshold !== null && (
          <div className="flex items-center gap-2 text-[10px] text-muted border-t border-border/30 pt-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            Next deviation unlocks at TC ≥ {nextThreshold >= 0 ? "+" : ""}{nextThreshold}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

function DeviationGroup({ deviations, title, titleColor }) {
  if (deviations.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className={`text-[10px] uppercase tracking-wider font-semibold ${titleColor}`}>
        {title}
      </span>
      {deviations.map((d, i) => {
        const s = SEVERITY_STYLES[d.severity];
        return (
          <Tooltip key={i}>
            <div className={`flex items-center justify-between rounded-md border px-3 py-1.5 transition-colors ${s.row}`}>
              <div className="flex items-center gap-2">
                <Chip color={s.chip} size="sm" variant={s.chipVariant} className="h-5 px-1.5 text-[9px]">
                  TC≥{d.tc}
                </Chip>
                <span className={`text-xs font-medium ${d.severity === "standard" ? "text-muted" : ""}`}>
                  {d.action}
                </span>
              </div>
              <span className="text-[10px] text-muted font-mono">{d.hand}</span>
            </div>
            <Tooltip.Content className="max-w-56 text-xs leading-relaxed" placement="left">
              {d.description}
            </Tooltip.Content>
          </Tooltip>
        );
      })}
    </div>
  );
}
