/**
 * StickyScoreBar – Score + input row for blackjack context.
 */
import { useEffect, useRef } from "react";
import ScoreCard from "./ScoreCard";
import InputPanel from "./InputPanel";

export default function StickyScoreBar({ history, onResult, stuck, onStuckChange, showingResult }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => onStuckChange?.(!entry.isIntersecting),
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
            <div className="flex items-center gap-3">
              <ScoreCard history={history} compact />
              {showingResult && (
                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                  <InputPanel onResult={onResult} compact />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <ScoreCard history={history} />
              <div className="flex flex-col gap-2 lg:w-52">
                {showingResult ? (
                  <>
                    <span className="text-xs font-medium text-muted">Log Result</span>
                    <InputPanel onResult={onResult} />
                  </>
                ) : (
                  <div className="flex flex-col gap-1 justify-center text-center text-xs text-muted">
                    <span>Deal cards, then log result</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
