/**
 * HistoryTable – Chronological round log with pagination and trend delta.
 */
import { useState } from "react";
import { Card, Pagination, Chip } from "@heroui/react";
import { classifyTrendShort } from "../lib/trendEngine";

const ROWS_PER_PAGE = 10;

export default function HistoryTable({ history }) {
  const [page, setPage] = useState(1);

  const sorted = [...history].reverse();
  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ROWS_PER_PAGE;
  const pageRows = sorted.slice(start, start + ROWS_PER_PAGE);

  const resultLabel = (r) => {
    if (r === "A") return "A Win";
    if (r === "B") return "B Win";
    return "Tie";
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
            No rounds played yet. Click a button above to start.
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
                <th className="px-4 py-2 text-right">ΔT</th>
                <th className="px-4 py-2">Zone</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, idx) => {
                const globalIdx = start + idx;
                const prevTrend = globalIdx < sorted.length - 1 ? sorted[globalIdx + 1]?.trend : 0;
                const delta = row.trend - (prevTrend ?? 0);

                return (
                  <tr
                    key={row.round}
                    className="border-b border-border/40 hover:bg-surface-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-2 tabular-nums text-muted">
                      {row.round}
                    </td>
                    <td className="px-4 py-2">
                      <Chip color={resultColor(row.result)} size="sm" variant="soft">
                        {resultLabel(row.result)}
                      </Chip>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-mono">
                      {row.trend >= 0 ? "+" : ""}
                      {row.trend.toFixed(3)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-mono text-xs">
                      <span className={delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-muted"}>
                        {delta >= 0 ? "+" : ""}
                        {delta.toFixed(3)}
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

      {totalPages > 1 && (
        <div className="flex justify-center px-4 py-3">
          <Pagination page={safePage} total={totalPages} onChange={setPage} />
        </div>
      )}
    </Card>
  );
}
