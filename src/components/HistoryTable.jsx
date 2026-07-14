/**
 * HistoryTable – Round log with count data and "Load More" button.
 */
import { useState } from "react";
import { Button, Card, Chip } from "@heroui/react";
import { classifyTrendShort } from "../lib/trendEngine";

const INITIAL_ROWS = 10;
const LOAD_MORE_ROWS = 10;

export default function HistoryTable({ history }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ROWS);

  const sorted = [...history].reverse();
  const visibleRows = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  const resultLabel = (r) => {
    if (r === "A") return "Win";
    if (r === "B") return "Loss";
    return "Push";
  };

  const resultColor = (r) => {
    if (r === "A") return "success";
    if (r === "B") return "danger";
    return "default";
  };

  return (
    <Card className="gap-0 overflow-hidden">
      <Card.Header className="px-4 py-3">
        <Card.Title>Round History</Card.Title>
        {history.length === 0 && (
          <Card.Description>
            No rounds played yet. Deal cards and log a result to start.
          </Card.Description>
        )}
        {history.length > 0 && (
          <Card.Description>
            Showing {visibleRows.length} of {sorted.length} rounds
          </Card.Description>
        )}
      </Card.Header>

      {history.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2 text-right">Trend (T)</th>
                <th className="px-4 py-2 text-right">TC</th>
                <th className="px-4 py-2 text-right">RC</th>
                <th className="px-4 py-2">Zone</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                return (
                  <tr
                    key={row.round}
                    className="border-b border-border/40 hover:bg-surface-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-2 tabular-nums text-muted">
                      {row.round}
                    </td>
                    <td className="px-4 py-2">
                      <Chip
                        color={resultColor(row.result)}
                        size="sm"
                        variant="soft"
                      >
                        {resultLabel(row.result)}
                      </Chip>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-mono">
                      {row.trend >= 0 ? "+" : ""}
                      {row.trend.toFixed(3)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-mono text-xs">
                      <span className={
                        (row.trueCount ?? 0) > 0
                          ? "text-success"
                          : (row.trueCount ?? 0) < 0
                            ? "text-danger"
                            : "text-muted"
                      }>
                        {(row.trueCount ?? 0) >= 0 ? "+" : ""}{row.trueCount ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-mono text-xs">
                      <span className={
                        (row.runningCount ?? 0) > 0
                          ? "text-success"
                          : (row.runningCount ?? 0) < 0
                            ? "text-danger"
                            : "text-muted"
                      }>
                        {(row.runningCount ?? 0) >= 0 ? "+" : ""}{row.runningCount ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {classifyTrendShort(row.trend)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center px-4 py-3">
          <Button
            variant="secondary"
            onPress={() => setVisibleCount((c) => c + LOAD_MORE_ROWS)}
          >
            Load More ({sorted.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </Card>
  );
}
