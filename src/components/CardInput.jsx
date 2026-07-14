/**
 * CardInput – Card selection with quick-deal categories + full grid.
 * Result buttons live directly below for a fluid deal→result flow.
 */
import { Button } from "@heroui/react";
import { encodeCard } from "../lib/blackjackEngine";

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = [
  { symbol: "♠", color: "text-foreground" },
  { symbol: "♥", color: "text-danger" },
  { symbol: "♦", color: "text-danger" },
  { symbol: "♣", color: "text-foreground" },
];

function getCountTint(rank) {
  const v = encodeCard(rank);
  if (v > 0) return "ring-success/40 bg-success/8";
  if (v < 0) return "ring-danger/40 bg-danger/8";
  return "ring-border/30 bg-surface-secondary/30";
}

function getCountBadgeColor(rank) {
  const v = encodeCard(rank);
  if (v > 0) return "text-success";
  if (v < 0) return "text-danger";
  return "text-muted";
}

function getCountBadge(rank) {
  const v = encodeCard(rank);
  if (v > 0) return "+1";
  if (v < 0) return "-1";
  return "0";
}

/**
 * Quick-deal categories for fast counting.
 * These are the most common actions — in counting you mostly track
 * low vs neutral vs high cards.
 */
const QUICK_DEALS = [
  { label: "Low", sublabel: "2-6", card: "5♠", tint: "success" },
  { label: "Neutral", sublabel: "7-9", card: "8♠", tint: "default" },
  { label: "10/Face", sublabel: "10 K Q J", card: "10♠", tint: "danger" },
  { label: "Ace", sublabel: "A", card: "A♠", tint: "danger" },
];

export default function CardInput({ onDealCard, onUndo, onResult, roundCards = [] }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Dealt cards strip */}
      {roundCards.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
              Dealt this hand ({roundCards.length})
            </span>
            <button
              onClick={onUndo}
              className="text-[10px] text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Undo last
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg bg-surface-secondary/30 border border-border/30">
            {roundCards.map((card, i) => (
              <MiniCard key={`${card}-${i}`} card={card} />
            ))}
          </div>
        </div>
      )}

      {/* Quick-deal buttons */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
          Quick Deal
        </span>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_DEALS.map(({ label, sublabel, card, tint }) => (
            <button
              key={label}
              onClick={() => onDealCard(card)}
              className={`flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-lg border transition-all
                hover:scale-105 active:scale-95 cursor-pointer
                ${tint === "success"
                  ? "border-success/30 bg-success/5 hover:bg-success/10"
                  : tint === "danger"
                    ? "border-danger/30 bg-danger/5 hover:bg-danger/10"
                    : "border-border/30 bg-surface-secondary/30 hover:bg-surface-secondary/50"
                }`}
            >
              <span className="text-sm font-bold leading-none">{label}</span>
              <span className="text-[9px] text-muted leading-none">{sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Full card grid */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
          Full Grid
        </span>
        <div className="grid grid-cols-13 gap-1">
          {RANKS.map((rank) => (
            <div key={rank} className="flex flex-col items-center gap-1">
              <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${getCountTint(rank)}`}>
                <span className={`font-mono ${getCountBadgeColor(rank)}`}>
                  {getCountBadge(rank)}
                </span>
              </span>
              {SUITS.map(({ symbol, color }) => (
                <button
                  key={`${rank}-${symbol}`}
                  onClick={() => onDealCard(`${rank}${symbol}`)}
                  className={`w-7 h-9 sm:w-8 sm:h-10 rounded-md border border-border/50 flex flex-col items-center justify-center
                    transition-all duration-150 hover:scale-110 hover:shadow-md
                    active:scale-95 cursor-pointer
                    ${getCountTint(rank)}`}
                >
                  <span className={`text-[10px] sm:text-xs font-bold leading-none ${color}`}>
                    {rank}
                  </span>
                  <span className={`text-[8px] sm:text-[10px] leading-none ${color}`}>
                    {symbol}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Result buttons — always visible */}
      <div className="flex flex-col gap-2 border-t border-border/30 pt-4">
        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
          Round Result
        </span>
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="flex-1 h-12 text-sm font-semibold"
            onPress={() => onResult("A")}
          >
            Win
          </Button>
          <Button
            variant="danger"
            className="flex-1 h-12 text-sm font-semibold"
            onPress={() => onResult("B")}
          >
            Loss
          </Button>
          <Button
            variant="secondary"
            className="flex-1 h-12 text-sm"
            onPress={() => onResult("Tie")}
          >
            Push
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[9px] text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-success/30 ring-1 ring-success/40" />
          +1 (2-6)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-surface-secondary/50 ring-1 ring-border/30" />
          0 (7-9)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-danger/30 ring-1 ring-danger/40" />
          -1 (10-A)
        </span>
      </div>
    </div>
  );
}

function MiniCard({ card }) {
  const rank = card.replace(/[♠♥♦♣]/g, "").trim();
  const suit = card.match(/([♠♥♦♣])/)?.[1] || "";
  const isRed = suit === "♥" || suit === "♦";
  const v = encodeCard(rank);
  const borderColor =
    v > 0 ? "border-success/40" : v < 0 ? "border-danger/40" : "border-border/40";

  return (
    <div
      className={`w-6 h-8 sm:w-7 sm:h-9 rounded border ${borderColor} bg-background flex flex-col items-center justify-center`}
    >
      <span className={`text-[8px] sm:text-[9px] font-bold leading-none ${isRed ? "text-danger" : "text-foreground"}`}>
        {rank}
      </span>
      <span className={`text-[7px] sm:text-[8px] leading-none ${isRed ? "text-danger" : "text-foreground"}`}>
        {suit}
      </span>
    </div>
  );
}
