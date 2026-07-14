import { useCallback, useRef, useState } from "react";
import { Button, Card, Popover, Separator } from "@heroui/react";
import {
  computeTrend,
  computeMomentum,
  computeVolatility,
  reversalProbability,
  computeStreak,
  computeFatigue,
  encodeResult,
} from "./lib/trendEngine";
import ControlPanel from "./components/ControlPanel";
import StickyScoreBar from "./components/StickyScoreBar";
import TrendGauge from "./components/TrendGauge";
import StatusCard from "./components/StatusCard";
import TrendTrajectory from "./components/TrendTrajectory";
import HistoryTable from "./components/HistoryTable";
import FormulaDisplay from "./components/FormulaDisplay";

function App() {
  const [alpha, setAlpha] = useState(0.25);
  const [trend, setTrend] = useState(0);
  const [momentum, setMomentum] = useState(0);
  const [volatility, setVolatility] = useState(0);
  const [history, setHistory] = useState([]);
  const [configOpen, setConfigOpen] = useState(false);

  const prevTrendRef = useRef(0);
  const lastEncodedRef = useRef(0);

  const handleScore = useCallback(
    (result) => {
      const encoded = encodeResult(result);
      const prevT = trend;

      const nextTrend = computeTrend(trend, encoded, alpha);
      const nextMomentum = computeMomentum(momentum, nextTrend, trend, alpha);
      const nextVolatility = computeVolatility(volatility, nextTrend, trend, alpha);

      prevTrendRef.current = prevT;
      lastEncodedRef.current = encoded;

      setTrend(nextTrend);
      setMomentum(nextMomentum);
      setVolatility(nextVolatility);
      setHistory((prev) => [
        ...prev,
        { round: prev.length + 1, result, trend: nextTrend },
      ]);
    },
    [trend, momentum, volatility, alpha],
  );

  const handleReset = useCallback(() => {
    setTrend(0);
    setMomentum(0);
    setVolatility(0);
    setHistory([]);
    prevTrendRef.current = 0;
    lastEncodedRef.current = 0;
    setConfigOpen(false);
  }, []);

  const streak = computeStreak(history);
  const fatigue = computeFatigue(history);
  const reversalProb = reversalProbability(trend, streak, volatility, fatigue);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-6">
        {/* ── Header ── */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Game Trend &amp; Reversion Simulator
            </h1>
            <p className="text-xs text-muted max-w-xl leading-relaxed">
              Tracks directional momentum via EWMA. Visualises trend decay,
              streak fatigue, and statistical probability of reversion to the mean.
            </p>
          </div>

          {/* Config popover trigger */}
          <Popover isOpen={configOpen} onOpenChange={setConfigOpen}>
            <Button isIconOnly variant="secondary" aria-label="Settings">
              <SettingsIcon />
            </Button>
            <Popover.Content className="w-80">
              <Popover.Dialog>
                <Popover.Heading>Configuration</Popover.Heading>
                <ControlPanel
                  alpha={alpha}
                  onAlphaChange={setAlpha}
                  onReset={handleReset}
                  roundCount={history.length}
                />
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        </header>

        {/* ── Scoreboard + Input (sticky) ── */}
        <StickyScoreBar history={history} onScore={handleScore} />

        {/* ── Gauge + Status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gap-3">
            <Card.Header>
              <Card.Title>Trend Gauge</Card.Title>
            </Card.Header>
            <Card.Content>
              <TrendGauge trend={trend} />
            </Card.Content>
          </Card>

          <div className="flex flex-col gap-4">
            <StatusCard
              trend={trend}
              momentum={momentum}
              volatility={volatility}
              fatigue={fatigue}
              reversalProb={reversalProb}
              roundCount={history.length}
            />
            <FormulaDisplay
              trend={trend}
              prevTrend={prevTrendRef.current}
              alpha={alpha}
              lastEncoded={lastEncodedRef.current}
              roundCount={history.length}
            />
          </div>
        </div>

        {/* ── Trend Trajectory ── */}
        <TrendTrajectory history={history} />

        <Separator />

        {/* ── History ── */}
        <HistoryTable history={history} />

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-muted py-4">
          Educational tool — EWMA model for trend analysis demonstration.
        </footer>
      </div>
    </div>
  );
}

/** Inline gear SVG icon (no external dependency). */
function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default App;
