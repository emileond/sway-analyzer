/**
 * StrategyPanel – Active Illustrious 18 deviations and betting recommendations.
 */
import { Card, Chip, Tooltip } from "@heroui/react";

export default function StrategyPanel({ trueCount, activeDeviations, insurance, nextThreshold }) {
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
        <div className="flex items-center justify-between rounded-md border border-border/30 px-3 py-2">
          <div className="flex flex-col">
            <span className="text-xs font-medium">Insurance</span>
            <span className="text-[10px] text-muted">TC ≥ 3 threshold</span>
          </div>
          <Chip
            color={insurance.take ? "success" : "default"}
            size="sm"
            variant={insurance.take ? "soft" : "flat"}
          >
            {insurance.label}
          </Chip>
        </div>

        {/* Active Deviations */}
        {activeDeviations.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {activeDeviations.map((d, i) => (
              <Tooltip key={i}>
                <div className="flex items-center justify-between rounded-md bg-success/5 border border-success/20 px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <Chip color="success" size="sm" variant="flat" className="h-5 px-1.5 text-[9px]">
                      TC≥{d.tc}
                    </Chip>
                    <span className="text-xs font-medium">{d.action}</span>
                  </div>
                  <span className="text-[10px] text-muted font-mono">{d.hand}</span>
                </div>
                <Tooltip.Content className="max-w-56 text-xs leading-relaxed" placement="left">
                  {d.description}
                </Tooltip.Content>
              </Tooltip>
            ))}
          </div>
        ) : (
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
