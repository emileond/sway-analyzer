/**
 * FormulaDisplay – Compact live EWMA calculation, designed to sit
 * below StatusCard in the same column.
 */
import { Card } from "@heroui/react";

export default function FormulaDisplay({ trend, prevTrend, alpha, lastEncoded, roundCount }) {
  if (roundCount === 0) return null;

  return (
    <Card className="gap-2">
      <Card.Header>
        <Card.Title className="text-xs">Live Calculation — Round #{roundCount}</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="font-mono text-[11px] leading-relaxed bg-surface-secondary/40 rounded-md px-3 py-2.5 overflow-x-auto">
          <div>
            <span className="text-warning">T_n</span>
            {" = "}
            <span className="text-success">α</span>
            {" × "}
            <span className="text-accent">R_n</span>
            {" + (1−"}
            <span className="text-success">α</span>
            {") × "}
            <span className="text-warning">T_{'{n-1}'}</span>
          </div>
          <div className="mt-1 text-muted">
            {trend.toFixed(4)} = {alpha.toFixed(2)} × ({lastEncoded >= 0 ? "+" : ""}
            {lastEncoded}) + {(1 - alpha).toFixed(2)} × ({prevTrend >= 0 ? "+" : ""}
            {prevTrend.toFixed(4)})
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
