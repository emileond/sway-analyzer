/**
 * StickyScoreBar – Score + input row that compresses into a thin sticky bar.
 *
 * Normal state: full ScoreCard + InputPanel in a grid.
 * Stuck state: single-row flat bar — [A 3 | R12 | B 2] [A] [Tie] [B]
 *   - No shadows, no blur, flat surface background
 *   - Player labels inline, no win bar, no percentages
 *   - Trend trajectory is hidden via onStuckChange callback
 */
import { useEffect, useRef } from "react";
import ScoreCard from "./ScoreCard";
import InputPanel from "./InputPanel";

export default function StickyScoreBar({ history, onScore, stuck, onStuckChange }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => onStuckChange(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onStuckChange]);

  return (
    <>
      <div ref={sentinelRef} className="h-0 w-full" />

      <div
        className={`sticky top-0 z-40 transition-all duration-300 ${
          stuck
            ? "bg-surface-secondary border-b border-border/60"
            : ""
        }`}
      >
        <div
          className={`mx-auto max-w-6xl transition-all duration-300 ${
            stuck ? "px-4 py-1.5" : "px-4 py-0"
          }`}
        >
          {stuck ? (
            /* ── Compact sticky row ── */
            <div className="flex items-center gap-3">
              <ScoreCard history={history} compact />
              <div className="flex items-center gap-1.5 ml-auto shrink-0">
                <InputPanel onScore={onScore} compact />
              </div>
            </div>
          ) : (
            /* ── Full layout ── */
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <ScoreCard history={history} />
              <div className="flex flex-col gap-2 lg:w-52">
                <span className="text-xs font-medium text-muted">Log Round</span>
                <InputPanel onScore={onScore} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
