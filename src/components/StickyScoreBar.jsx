/**
 * StickyScoreBar – Scoreboard that sticks to top on scroll.
 * Changes visual style when stuck but keeps consistent dimensions
 * to prevent scroll layout shifts.
 */
import { useEffect, useRef, useState } from "react";
import ScoreCard from "./ScoreCard";

export default function StickyScoreBar({ history }) {
  const sentinelRef = useRef(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-0 w-full" />
      <div
        className={`sticky top-0 z-40 ${
          stuck
            ? "bg-surface-secondary/95 backdrop-blur-sm border-b border-border/60 shadow-sm"
            : ""
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-0">
          <ScoreCard history={history} />
        </div>
      </div>
    </>
  );
}
