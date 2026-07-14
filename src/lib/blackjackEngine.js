/**
 * ═══════════════════════════════════════════════════════════════════════
 *  Blackjack Card Counting Engine (Zen Count — Level 2)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Zen Count (Arnold Snyder) — balanced Level 2 system:
 *   - Betting Correlation:  0.96
 *   - Playing Efficiency:   0.63  (Hi-Lo is only 0.51)
 *   - Insurance Correlation: 0.85
 *
 *  Card values:
 *   2,3,7 → +1  |  4,5,6 → +2
 *   8,9 → 0
 *   10,J,Q,K → −2  |  A → −1
 *
 *  Includes:
 *   - Zen Count deviations
 *   - Deck penetration tracking
 *   - Granular bet spread
 */

// ── Card Encoding ───────────────────────────────────────────────────

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["♠", "♥", "♦", "♣"];

/**
 * Encode a dealt card into a Zen Count value.
 * 2,3,7 → +1  |  4,5,6 → +2  |  8,9 → 0  |  10,J,Q,K → −2  |  A → −1
 */
export function encodeCard(card) {
  const c = card.toUpperCase().replace(/[♠♥♦♣]/g, "").trim();
  if (c === "2" || c === "3" || c === "7") return 1;
  if (c === "4" || c === "5" || c === "6") return 2;
  if (c === "8" || c === "9") return 0;
  if (c === "10" || c === "J" || c === "Q" || c === "K") return -2;
  if (c === "A") return -1;
  return 0;
}

/**
 * Get all 52 card identifiers.
 */
export function getAllCards() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(`${rank}${suit}`);
    }
  }
  return cards;
}

/**
 * Get display rank from a card string like "K♠".
 */
export function getCardRank(card) {
  return card.replace(/[♠♥♦♣]/g, "").trim();
}

/**
 * Get display suit from a card string like "K♠".
 */
export function getCardSuit(card) {
  const match = card.match(/([♠♥♦♣])/);
  return match ? match[1] : "";
}

/**
 * Get the Zen Count color class for a card (for UI tinting).
 * Returns "count-pos", "count-neg", or "count-neutral".
 */
export function getCardCountColor(card) {
  const v = encodeCard(card);
  if (v > 0) return "count-pos";
  if (v < 0) return "count-neg";
  return "count-neutral";
}

// ── Shoe State ──────────────────────────────────────────────────────

/**
 * Initialize a fresh shoe state.
 */
export function initShoeState(totalDecks = 6) {
  return {
    totalDecks,
    cardsDealt: 0,
    runningCount: 0,
    trueCount: 0,
    decksRemaining: totalDecks,
    penetration: 0,
    totalCardsInShoe: totalDecks * 52,
  };
}

/**
 * Update shoe state with a newly dealt card.
 */
export function updateShoeState(prevState, cardString) {
  const cardValue = encodeCard(cardString);

  const cardsDealt = prevState.cardsDealt + 1;
  const runningCount = prevState.runningCount + cardValue;

  const exactDecksRemaining = prevState.totalDecks - cardsDealt / 52;
  const decksRemaining = Math.max(0.25, Math.round(exactDecksRemaining * 2) / 2);

  // Truncated toward zero — standard for balanced counting systems
  const trueCount =
    exactDecksRemaining > 0 ? Math.trunc(runningCount / decksRemaining) : 0;

  const penetration = cardsDealt / prevState.totalCardsInShoe;

  return {
    ...prevState,
    cardsDealt,
    runningCount,
    trueCount,
    decksRemaining,
    penetration,
  };
}

/**
 * Undo the last card from shoe state. Requires knowing the card.
 */
export function undoShoeState(prevState, cardString) {
  const cardValue = encodeCard(cardString);

  const cardsDealt = Math.max(0, prevState.cardsDealt - 1);
  const runningCount = prevState.runningCount - cardValue;

  const exactDecksRemaining = prevState.totalDecks - cardsDealt / 52;
  const decksRemaining = Math.max(0.25, Math.round(exactDecksRemaining * 2) / 2);

  const trueCount =
    exactDecksRemaining > 0 ? Math.trunc(runningCount / decksRemaining) : 0;

  const penetration = cardsDealt / prevState.totalCardsInShoe;

  return {
    ...prevState,
    cardsDealt,
    runningCount,
    trueCount,
    decksRemaining,
    penetration,
  };
}

// ── Derived Analysis ────────────────────────────────────────────────

/**
 * Get full count summary with EV and recommendations.
 */
export function getCountSummary(shoeState) {
  const { trueCount, runningCount, penetration, decksRemaining } = shoeState;

  // Zen Count edge: ~0.26% per +1 TC (Level 2 scales ~2× faster than Hi-Lo), base house edge ~−0.5%
  const baseEdge = -0.005;
  const currentEV = baseEdge + trueCount * 0.0026;
  const edgePercent = currentEV * 100;

  // Advantage state
  const isAdvantage = currentEV > 0;
  const isStrongAdvantage = currentEV > 0.01; // >1% edge

  // Recommendation
  const recommendation = getBetRecommendation(trueCount);

  // Insurance
  const insurance = getInsuranceDecision(trueCount);

  // Penetration status
  const penetrationStatus = getPenetrationStatus(penetration, trueCount);

  return {
    trueCount,
    runningCount,
    currentEV,
    edgePercent,
    isAdvantage,
    isStrongAdvantage,
    penetration,
    decksRemaining,
    recommendation,
    insurance,
    penetrationStatus,
  };
}

// ── Bet Spread ──────────────────────────────────────────────────────

/**
 * Granular bet sizing recommendation based on True Count.
 * Returns { units, label, color, nextThreshold, nextLabel }.
 */
export function getBetRecommendation(trueCount) {
  if (trueCount <= -2)
    return { units: 0, label: "Sit Out", color: "danger", nextThreshold: -1, nextLabel: "Minimum Bet" };
  if (trueCount <= 3)
    return { units: 1, label: "Minimum Bet", color: "default", nextThreshold: 4, nextLabel: "2x Base" };
  if (trueCount <= 5)
    return { units: 2, label: "2x Base", color: "warning", nextThreshold: 6, nextLabel: "4x Base" };
  if (trueCount <= 7)
    return { units: 4, label: "4x Base", color: "warning", nextThreshold: 8, nextLabel: "8x Max" };
  return { units: 8, label: "8x Max", color: "success", nextThreshold: null, nextLabel: null };
}

// ── Insurance Decision ──────────────────────────────────────────────

/**
 * Insurance is profitable when TC >= 5 (Zen Count — Snyder's Blackbelt in Blackjack).
 */
export function getInsuranceDecision(trueCount) {
  if (trueCount >= 6) return { take: true, label: "Take Insurance", confidence: "High" };
  if (trueCount >= 5) return { take: true, label: "Take Insurance", confidence: "Marginal" };
  return { take: false, label: "Decline Insurance", confidence: "" };
}

// ── Penetration Status ──────────────────────────────────────────────

function getPenetrationStatus(penetration, _trueCount) {
  if (penetration < 0.25) return "Early shoe — count is unreliable";
  if (penetration < 0.5) return "Mid shoe — count building";
  if (penetration < 0.75) return "Deep shoe — high opportunity zone";
  if (penetration < 0.85) return "Very deep — excellent advantage potential";
  return "Near end — consider leaving table";
}

// ── Zen Count Deviations ────────────────────────────────────────────

/**
 * Returns active deviations for a given true count (Zen Count specific).
 * Each deviation includes: deviation name, true count threshold, and action.
 */
export function getActiveDeviations(trueCount) {
  // severity: "standard" = minor/expected, "notable" = clear deviation, "aggressive" = against basic strategy
  const allDeviations = [
    // ── Negative count deviations ──
    { tc: -1, action: "Hit 15 vs Dealer 10", hand: "15 vs 10", description: "Normally stand — negative count forces hit", severity: "notable" },

    // ── TC 0 — first positive adjustments ──
    { tc: 0, action: "Stand 12 vs Dealer 3", hand: "12 vs 3", description: "Normally hit — earliest positive deviation", severity: "standard" },
    { tc: 0, action: "Stand 12 vs Dealer 4", hand: "12 vs 4", description: "Normally hit", severity: "standard" },

    // ── TC 1 ──
    { tc: 1, action: "Stand 13 vs Dealer 2", hand: "13 vs 2", description: "Normally hit", severity: "standard" },
    { tc: 1, action: "Stand 12 vs Dealer 5", hand: "12 vs 5", description: "Normally hit", severity: "standard" },
    { tc: 1, action: "Stand 12 vs Dealer 6", hand: "12 vs 6", description: "Normally hit", severity: "standard" },

    // ── TC 2 — moderate deviations ──
    { tc: 2, action: "Stand 13 vs Dealer 3", hand: "13 vs 3", description: "Normally hit", severity: "standard" },
    { tc: 2, action: "Stand 13 vs Dealer 4", hand: "13 vs 4", description: "Normally hit", severity: "standard" },
    { tc: 2, action: "Stand 14 vs Dealer 5", hand: "14 vs 5", description: "Normally hit", severity: "standard" },
    { tc: 2, action: "Stand 14 vs Dealer 6", hand: "14 vs 6", description: "Normally hit", severity: "standard" },
    { tc: 2, action: "Double 9 vs Dealer 2", hand: "9 vs 2", description: "Normally hit", severity: "notable" },

    // ── TC 3 — strong count ──
    { tc: 3, action: "Stand 15 vs Dealer 8", hand: "15 vs 8", description: "Normally hit", severity: "notable" },
    { tc: 3, action: "Stand 16 vs Dealer 9", hand: "16 vs 9", description: "Normally hit", severity: "notable" },
    { tc: 3, action: "Double 10 vs Dealer 10", hand: "10 vs 10", description: "Normally hit — aggressive", severity: "aggressive" },

    // ── TC 4 — strong deviation ──
    { tc: 4, action: "Stand 16 vs Dealer 10", hand: "16 vs 10", description: "Most famous deviation — normally hit", severity: "notable" },
    { tc: 4, action: "Double 9 vs Dealer Ace", hand: "9 vs A", description: "Normally hit — aggressive", severity: "aggressive" },

    // ── TC 5 — aggressive plays ──
    { tc: 5, action: "Stand 13 vs Dealer Ace", hand: "13 vs A", description: "Normally hit — very aggressive", severity: "aggressive" },
    { tc: 5, action: "Stand 14 vs Dealer Ace", hand: "14 vs A", description: "Normally hit — very aggressive", severity: "aggressive" },
    { tc: 5, action: "Double 10 vs Dealer 9", hand: "10 vs 9", description: "Normally hit — aggressive", severity: "aggressive" },

    // ── TC 6 — maximum aggression ──
    { tc: 6, action: "Double 10 vs Dealer Ace", hand: "10 vs A", description: "Normally hit — maximum aggression", severity: "aggressive" },
    { tc: 6, action: "Stand 12 vs Dealer Ace", hand: "12 vs A", description: "Normally hit — extreme deviation", severity: "aggressive" },
  ];

  return allDeviations.filter((d) => trueCount >= d.tc);
}

/**
 * Get the count threshold for the next deviation that would activate.
 */
export function getNextDeviationThreshold(trueCount) {
  const thresholds = [-1, 0, 1, 2, 3, 4, 5, 6];
  for (const t of thresholds) {
    if (t > trueCount) return t;
  }
  return null;
}

// ── Playing Efficiency & Betting Correlation ────────────────────────

/**
 * Zen Count system statistics.
 */
export function getSystemStats() {
  return {
    name: "Zen Count",
    playingEfficiency: 0.63,  // How well it handles playing decisions (Hi-Lo: 0.51)
    bettingCorrelation: 0.96, // How well it correlates with optimal bet sizing (Hi-Lo: 0.97)
    insuranceCorrelation: 0.85, // How well it identifies insurance situations (Hi-Lo: 0.76)
    level: 2, // Level 2 system
    balanced: true,
  };
}
