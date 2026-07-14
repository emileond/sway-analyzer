/**
 * ═══════════════════════════════════════════════════════════════════════
 *  Blackjack Card Counting Engine (Hi-Lo System)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Enhanced Hi-Lo with:
 *   - Full Illustrious 18 deviations
 *   - Key counting indices
 *   - Deck penetration tracking
 *   - Ace side count for insurance
 *   - Granular bet spread
 *   - Playing efficiency & betting correlation
 */

// ── Card Encoding ───────────────────────────────────────────────────

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["♠", "♥", "♦", "♣"];

/**
 * Encode a dealt card into a Hi-Lo count value.
 * Accepts strings like "2", "7", "K", "A", or "10".
 */
export function encodeCard(card) {
  const c = card.toUpperCase().replace(/[♠♥♦♣]/g, "").trim();
  if (["2", "3", "4", "5", "6"].includes(c)) return 1;
  if (["7", "8", "9"].includes(c)) return 0;
  if (["10", "J", "Q", "K", "A"].includes(c)) return -1;
  return 0;
}

/**
 * Check if a card is an ace.
 */
export function isAce(card) {
  const c = card.toUpperCase().replace(/[♠♥♦♣]/g, "").trim();
  return c === "A";
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
 * Get the Hi-Lo color class for a card (for UI tinting).
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
    acesDealt: 0,
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
  const aceAdded = isAce(cardString) ? 1 : 0;

  const cardsDealt = prevState.cardsDealt + 1;
  const runningCount = prevState.runningCount + cardValue;
  const acesDealt = prevState.acesDealt + aceAdded;

  const exactDecksRemaining = prevState.totalDecks - cardsDealt / 52;
  const decksRemaining = Math.max(0.25, Math.round(exactDecksRemaining * 2) / 2);

  // Truncated (floored) toward zero, standard for Hi-Lo
  const trueCount =
    exactDecksRemaining > 0 ? Math.floor(runningCount / decksRemaining) : 0;

  const penetration = cardsDealt / prevState.totalCardsInShoe;

  // Aces remaining estimate (for side count)
  const totalAcesInShoe = prevState.totalDecks * 4;
  const acesRemaining = totalAcesInShoe - acesDealt;
  const decksExactRemaining = Math.max(0.25, exactDecksRemaining);
  const aceDensity = acesRemaining / (decksExactRemaining * 52);

  return {
    ...prevState,
    cardsDealt,
    runningCount,
    trueCount,
    decksRemaining,
    acesDealt,
    acesRemaining,
    aceDensity,
    penetration,
  };
}

/**
 * Undo the last card from shoe state. Requires knowing the card.
 */
export function undoShoeState(prevState, cardString) {
  const cardValue = encodeCard(cardString);
  const aceRemoved = isAce(cardString) ? 1 : 0;

  const cardsDealt = Math.max(0, prevState.cardsDealt - 1);
  const runningCount = prevState.runningCount - cardValue;
  const acesDealt = Math.max(0, prevState.acesDealt - aceRemoved);

  const exactDecksRemaining = prevState.totalDecks - cardsDealt / 52;
  const decksRemaining = Math.max(0.25, Math.round(exactDecksRemaining * 2) / 2);

  const trueCount =
    exactDecksRemaining > 0 ? Math.floor(runningCount / decksRemaining) : 0;

  const penetration = cardsDealt / prevState.totalCardsInShoe;

  const totalAcesInShoe = prevState.totalDecks * 4;
  const acesRemaining = totalAcesInShoe - acesDealt;
  const decksExactRemaining = Math.max(0.25, exactDecksRemaining);
  const aceDensity = acesRemaining / (decksExactRemaining * 52);

  return {
    ...prevState,
    cardsDealt,
    runningCount,
    trueCount,
    decksRemaining,
    acesDealt,
    acesRemaining,
    aceDensity,
    penetration,
  };
}

// ── Derived Analysis ────────────────────────────────────────────────

/**
 * Get full count summary with EV and recommendations.
 */
export function getCountSummary(shoeState) {
  const { trueCount, runningCount, penetration, decksRemaining, aceDensity } =
    shoeState;

  // Player edge: base house edge ~-0.5%, each +1 TC shifts ~0.5%
  const baseEdge = -0.005;
  const currentEV = baseEdge + trueCount * 0.005;
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
    aceDensity,
    recommendation,
    insurance,
    penetrationStatus,
  };
}

// ── Bet Spread ──────────────────────────────────────────────────────

/**
 * Granular bet sizing recommendation based on True Count.
 * Returns { units, label, color }.
 */
export function getBetRecommendation(trueCount) {
  if (trueCount <= -2)
    return { units: 0, label: "Sit Out / Minimum", color: "danger" };
  if (trueCount <= 0)
    return { units: 1, label: "Minimum Bet", color: "default" };
  if (trueCount <= 1)
    return { units: 1, label: "Minimum Bet", color: "default" };
  if (trueCount === 2)
    return { units: 2, label: "2x Base Bet", color: "warning" };
  if (trueCount === 3)
    return { units: 4, label: "4x Base Bet", color: "warning" };
  if (trueCount === 4)
    return { units: 6, label: "6x Base Bet", color: "success" };
  if (trueCount === 5)
    return { units: 8, label: "8x Max Bet", color: "success" };
  return { units: 10, label: "10x Max Bet", color: "success" };
}

// ── Insurance Decision ──────────────────────────────────────────────

/**
 * Insurance is profitable when TC >= 3 (approximately).
 */
export function getInsuranceDecision(trueCount) {
  if (trueCount >= 4) return { take: true, label: "Take Insurance", confidence: "High" };
  if (trueCount >= 3) return { take: true, label: "Take Insurance", confidence: "Marginal" };
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

// ── Illustrious 18 (Full) ──────────────────────────────────────────

/**
 * Returns active deviations for a given true count.
 * Each deviation includes: deviation name, true count threshold, and action.
 */
export function getActiveDeviations(trueCount) {
  const allDeviations = [
    { tc: 3, action: "Take Insurance", hand: "Any", description: "Insurance becomes +EV" },
    { tc: 0, action: "Stand 16 vs Dealer 10", hand: "16 vs 10", description: "Normally hit" },
    { tc: 2, action: "Stand 12 vs Dealer 3", hand: "12 vs 3", description: "Normally hit" },
    { tc: 2, action: "Stand 12 vs Dealer 2", hand: "12 vs 2", description: "Normally hit" },
    { tc: 3, action: "Stand 12 vs Dealer 4", hand: "12 vs 4", description: "Normally hit" },
    { tc: 4, action: "Stand 15 vs Dealer 10", hand: "15 vs 10", description: "Normally hit" },
    { tc: 5, action: "Stand 15 vs Dealer 9", hand: "15 vs 9", description: "Normally hit" },
    { tc: 5, action: "Stand 16 vs Dealer 9", hand: "16 vs 9", description: "Normally hit" },
    { tc: 4, action: "Stand 16 vs Dealer 10", hand: "16 vs 10", description: "Already stand at TC>=0" },
    { tc: 4, action: "Double 10 vs Dealer Ace", hand: "10 vs A", description: "Normally hit" },
    { tc: 5, action: "Double 10 vs Dealer 9", hand: "10 vs 9", description: "Normally hit" },
    { tc: 4, action: "Double 11 vs Dealer Ace", hand: "11 vs A", description: "Normally double" },
    { tc: 2, action: "Double 9 vs Dealer 2", hand: "9 vs 2", description: "Normally hit" },
    { tc: 5, action: "Double 9 vs Dealer 7", hand: "9 vs 7", description: "Normally stand" },
    { tc: 3, action: "Stand 13 vs Dealer 2", hand: "13 vs 2", description: "Normally stand — borderline" },
    { tc: -1, action: "Hit 13 vs Dealer 3", hand: "13 vs 3", description: "Normally stand — negative count" },
    { tc: 0, action: "Hit 12 vs Dealer 6", hand: "12 vs 6", description: "Normally stand — negative count" },
    { tc: 2, action: "Split 10s vs Dealer 5", hand: "10,10 vs 5", description: "Advanced — never split 10s normally" },
  ];

  return allDeviations.filter((d) => trueCount >= d.tc);
}

/**
 * Get the count threshold for the next deviation that would activate.
 */
export function getNextDeviationThreshold(trueCount) {
  const thresholds = [0, 1, 2, 3, 4, 5];
  for (const t of thresholds) {
    if (t > trueCount) return t;
  }
  return null;
}

// ── Playing Efficiency & Betting Correlation ────────────────────────

/**
 * Hi-Lo system statistics.
 */
export function getSystemStats() {
  return {
    name: "Hi-Lo",
    playingEfficiency: 0.51, // How well it handles playing decisions
    bettingCorrelation: 0.97, // How well it correlates with optimal bet sizing
    insuranceCorrelation: 0.76, // How well it identifies insurance situations
    level: 1, // balanced system
    balanced: true,
  };
}
