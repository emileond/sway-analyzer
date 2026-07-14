/**
 * CardInput – Visual card selection grid for blackjack.
 * Users tap cards as they are dealt. Cards are tinted by count impact.
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

function getCountBadge(rank) {
  const v = encodeCard(rank);
  if (v > 0) return "+1";
  if (v < 0) return "-1";
  return "0";
}

function getCountBadgeColor(rank) {
  const v = encodeCard(rank);
  if (v > 0) return "success";
  if (v < 0) return "danger";
  return "default";
}

export default function CardInput({ onDealCard, onUndo, roundCards = [], disabled = false }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Dealt cards strip */}
      {roundCards.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
              Dealt this round ({roundCards.length})
            </span>
            <Button size="sm" variant="secondary" className="h-6 px-2 text-[10px]" onPress={onUndo}>
              Undo
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg bg-surface-secondary/30 border border-border/30">
            {roundCards.map((card, i) => (
              <MiniCard key={`${card}-${i}`} card={card} />
            ))}
          </div>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-13 gap-1">
        {RANKS.map((rank) => (
          <div key={rank} className="flex flex-col items-center gap-1">
            <span
              className={`text-[9px] font-bold px-1 py-0.5 rounded ${getCountTint(rank)}`}
            >
              <span className={`font-mono ${getCountBadgeColor(rank) === "success" ? "text-success" : getCountBadgeColor(rank) === "danger" ? "text-danger" : "text-muted"}`}>
                {getCountBadge(rank)}
              </span>
            </span>
            {SUITS.map(({ symbol, color }) => (
              <button
                key={`${rank}-${symbol}`}
                disabled={disabled}
                onClick={() => onDealCard(`${rank}${symbol}`)}
                className={`w-7 h-9 sm:w-8 sm:h-10 rounded-md border border-border/50 flex flex-col items-center justify-center
                  transition-all duration-150 hover:scale-110 hover:shadow-md
                  active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed
                  ${getCountTint(rank)} cursor-pointer`}
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
