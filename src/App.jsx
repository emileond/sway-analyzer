import { useCallback, useMemo, useState } from "react";
import { Button, Card, Popover, Separator } from "@heroui/react";
import {
  initShoeState,
  updateShoeState,
  undoShoeState,
  getCountSummary,
  getActiveDeviations,
  getInsuranceDecision,
  getNextDeviationThreshold,
} from "./lib/blackjackEngine";
import { updateEngine } from "./lib/trendEngine";
import ControlPanel from "./components/ControlPanel";
import StickyScoreBar from "./components/StickyScoreBar";
import TrendGauge from "./components/TrendGauge";
import StatusCard from "./components/StatusCard";
import TrendTrajectory from "./components/TrendTrajectory";
import HistoryTable from "./components/HistoryTable";
import CardInput from "./components/CardInput";
import CountDisplay from "./components/CountDisplay";
import StrategyPanel from "./components/StrategyPanel";

function App() {
  const [alpha, setAlpha] = useState(0.25);
  const [totalDecks, setTotalDecks] = useState(6);
  const [configOpen, setConfigOpen] = useState(false);

  const [shoeState, setShoeState] = useState(() => initShoeState(6));
  const [roundCards, setRoundCards] = useState([]);
  const [engineState, setEngineState] = useState({});
  const [history, setHistory] = useState([]);

  const countSummary = useMemo(() => getCountSummary(shoeState), [shoeState]);
  const activeDeviations = useMemo(
    () => getActiveDeviations(shoeState.trueCount),
    [shoeState.trueCount],
  );
  const nextThreshold = useMemo(
    () => getNextDeviationThreshold(shoeState.trueCount),
    [shoeState.trueCount],
  );
  const insurance = useMemo(
    () => getInsuranceDecision(shoeState.trueCount),
    [shoeState.trueCount],
  );

  const trend = engineState.trendSlow ?? 0;
  const momentum = engineState.velocity ?? 0;
  const volatility = engineState.volatility ?? 0;
  const fatigue = engineState.fatigue ?? 0;
  const reversalProb = engineState.reversalProb ?? 0;

  const handleDealCard = useCallback((card) => {
    setShoeState((prev) => updateShoeState(prev, card));
    setRoundCards((prev) => [...prev, card]);
  }, []);

  const handleUndoCard = useCallback(() => {
    setRoundCards((prev) => {
      if (prev.length === 0) return prev;
      const lastCard = prev[prev.length - 1];
      setShoeState((s) => undoShoeState(s, lastCard));
      return prev.slice(0, -1);
    });
  }, []);

  const handleResult = useCallback(
    (result) => {
      const newState = updateEngine(engineState, result, {
        alphaFast: alpha,
        alphaSlow: alpha * 0.6,
      });
      setEngineState(newState);
      setHistory((prev) => [
        ...prev,
        {
          round: prev.length + 1,
          result,
          trend: newState.trendSlow ?? 0,
          trueCount: shoeState.trueCount,
          runningCount: shoeState.runningCount,
          cardsDealt: roundCards.length,
        },
      ]);
      setRoundCards([]);
    },
    [engineState, alpha, shoeState.trueCount, shoeState.runningCount, roundCards.length],
  );

  const handleReset = useCallback(() => {
    setShoeState(initShoeState(totalDecks));
    setRoundCards([]);
    setEngineState({});
    setHistory([]);
    setConfigOpen(false);
  }, [totalDecks]);

  const handleNewShoe = useCallback(() => {
    setShoeState(initShoeState(totalDecks));
    setRoundCards([]);
  }, [totalDecks]);

  const handleDeckChange = useCallback((decks) => {
    setTotalDecks(decks);
    setShoeState(initShoeState(decks));
    setRoundCards([]);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Blackjack Trend &amp; Count Analyzer
            </h1>
            <p className="text-xs text-muted max-w-xl leading-relaxed">
              Tracks card count with Zen Count (Level 2) and player win/loss trends via EWMA.
              Visualises advantage zones, strategy deviations, and streak reversion.
            </p>
          </div>
          <Popover isOpen={configOpen} onOpenChange={setConfigOpen}>
            <Button isIconOnly variant="secondary" aria-label="Settings">
              <SettingsIcon />
            </Button>
            <Popover.Content className="w-80">
              <Popover.Heading>Configuration</Popover.Heading>
              <ControlPanel
                alpha={alpha}
                onAlphaChange={setAlpha}
                onReset={handleReset}
                onNewShoe={handleNewShoe}
                roundCount={history.length}
                totalDecks={totalDecks}
                onDeckChange={handleDeckChange}
              />
            </Popover.Content>
          </Popover>
        </header>

        {/* Session Stats */}
        <SessionStats history={history} countSummary={countSummary} />

        {/* Sticky Scoreboard */}
        <StickyScoreBar history={history} />

        {/* Card Input + Count Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gap-4">
            <Card.Header>
              <Card.Title className="text-sm">Deal Cards &amp; Log Result</Card.Title>
              <Card.Description className="text-xs">
                Tap cards as they are dealt, then pick the round result.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <CardInput
                onDealCard={handleDealCard}
                onUndo={handleUndoCard}
                onResult={handleResult}
                roundCards={roundCards}
              />
            </Card.Content>
          </Card>

          <div className="flex flex-col gap-4">
            <CountDisplay countSummary={countSummary} />
            <StrategyPanel
              trueCount={shoeState.trueCount}
              activeDeviations={activeDeviations}
              insurance={insurance}
              nextThreshold={nextThreshold}
            />
          </div>
        </div>

        {/* Trend Gauge + Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gap-3">
            <Card.Header>
              <Card.Title>Trend Gauge</Card.Title>
            </Card.Header>
            <Card.Content>
              <TrendGauge trend={trend} />
            </Card.Content>
          </Card>

          <StatusCard
            trend={trend}
            momentum={momentum}
            volatility={volatility}
            fatigue={fatigue}
            reversalProb={reversalProb}
            roundCount={history.length}
            trueCount={shoeState.trueCount}
          />
        </div>

        {/* Trend Trajectory */}
        <TrendTrajectory history={history} />

        <Separator />

        {/* History */}
        <HistoryTable history={history} />

        <footer className="text-center text-xs text-muted py-4">
          Educational tool — Zen Count card counting and EWMA trend analysis for blackjack.
        </footer>
      </div>
    </div>
  );
}

/**
 * Compact session stats bar showing key metrics at a glance.
 */
function SessionStats({ history, countSummary }) {
  if (history.length === 0) return null;

  const wins = history.filter((h) => h.result === "A").length;
  const losses = history.filter((h) => h.result === "B").length;
  const total = history.length;
  const winRate = Math.round((wins / total) * 100);

  // Simple expected P/L: wins = +1, losses = -1, pushes = 0
  const netResult = wins - losses;
  const avgTrueCountAtResult =
    history.reduce((sum, h) => sum + (h.trueCount ?? 0), 0) / total;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/30 bg-surface-secondary/20 px-4 py-2.5 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="text-muted">Hands:</span>
        <span className="font-semibold tabular-nums">{total}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted">Win Rate:</span>
        <span className={`font-semibold tabular-nums ${winRate >= 50 ? "text-success" : winRate < 45 ? "text-danger" : "text-muted"}`}>
          {winRate}%
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted">Net:</span>
        <span className={`font-semibold tabular-nums ${netResult > 0 ? "text-success" : netResult < 0 ? "text-danger" : "text-muted"}`}>
          {netResult > 0 ? "+" : ""}{netResult}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted">Avg TC:</span>
        <span className="font-semibold tabular-nums font-mono">
          {avgTrueCountAtResult >= 0 ? "+" : ""}{avgTrueCountAtResult.toFixed(1)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted">Current TC:</span>
        <span className={`font-semibold tabular-nums font-mono ${
          countSummary.trueCount >= 2 ? "text-success" : countSummary.trueCount <= -1 ? "text-danger" : "text-muted"
        }`}>
          {countSummary.trueCount >= 0 ? "+" : ""}{countSummary.trueCount}
        </span>
      </div>
    </div>
  );
}

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
