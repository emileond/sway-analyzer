/**
 * ═══════════════════════════════════════════════════════════════════════
 *  EWMA Trend & Reversion Engine v3 (Oscillator/MACD Based)
 * ═══════════════════════════════════════════════════════════════════════
 */

export function encodeResult(result) {
  if (result === "A") return 1;
  if (result === "B") return -1;
  return 0; // Tie
}

// ── Core EWMA ─────────────────────────────────────────────────────────

/**
 * Computes a standard EWMA step.
 */
export function computeEwma(prev, r, alpha) {
  return clamp(alpha * r + (1 - alpha) * prev);
}

/**
 * Compute raw momentum (velocity).
 * Looks at the immediate difference between the raw result and the slow trend,
 * giving you an instant alert when a sudden shift occurs.
 */
export function computeVelocity(currentResult, prevSlowTrend, prevVelocity, alpha = 0.2) {
  const instantChange = currentResult - prevSlowTrend;
  return clamp(alpha * instantChange + (1 - alpha) * prevVelocity);
}

/**
 * Compute EWMA of squared deviations (volatility).
 */
export function computeVolatility(prevVar, currentResult, prevTrend, alpha = 0.15) {
  const diff = currentResult - prevTrend;
  const next = alpha * (diff * diff) + (1 - alpha) * prevVar;
  return Math.max(0, next);
}

// ── Engine State Update ───────────────────────────────────────────────

/**
 * Main update function. Pass the previous state object and the new result string.
 */
export function updateEngine(prevState, resultString, config = { alphaFast: 0.33, alphaSlow: 0.15 }) {
  const r = encodeResult(resultString);

  const trendFast = computeEwma(prevState.trendFast || 0, r, config.alphaFast);
  const trendSlow = computeEwma(prevState.trendSlow || 0, r, config.alphaSlow);

  // The Oscillator (MACD equivalent). Positive = A momentum building. Negative = B momentum building.
  const oscillator = trendFast - trendSlow;

  const velocity = computeVelocity(r, prevState.trendSlow || 0, prevState.velocity || 0);
  const volatility = computeVolatility(prevState.volatility || 0, r, prevState.trendSlow || 0);

  // Update streak
  const isTie = resultString !== "A" && resultString !== "B";
  let streak = isTie ? 0 : (prevState.lastResult === resultString ? prevState.streak + (resultString === "A" ? 1 : -1) : (resultString === "A" ? 1 : -1));

  // Update fatigue (Time spent with Slow Trend > 0.4)
  let fatigue = Math.abs(trendSlow) > 0.4 ? (prevState.fatigue || 0) + 1 : 0;

  const state = {
    lastResult: resultString,
    trendFast,
    trendSlow,
    oscillator,
    velocity,
    volatility,
    streak,
    fatigue
  };

  // Attach probabilities and classifications
  state.reversalProb = calculateReversalProbability(state);
  state.classification = classifyOscillatorTrend(state);

  return state;
}

// ── Composite Reversal Probability ────────────────────────────────────

function calculateReversalProbability(state) {
  const { trendSlow, streak, velocity, volatility, fatigue } = state;
  const absT = Math.abs(trendSlow);

  // F1: Saturation (Slow Trend)
  const f1 = clamp((absT - 0.4) / 0.5, 0, 1);

  // F2: Streak fatigue
  const f2 = clamp((Math.abs(streak) - 2) * 0.20, 0, 1); // Ramped up: streak of 3 is now highly penalized

  // F3: Momentum / Velocity opposition (FIXED)
  // If the slow trend says A is winning, but velocity is swinging negative, reversal is imminent.
  let f3 = 0;
  if (trendSlow > 0.3 && velocity < 0) {
    f3 = clamp(Math.abs(velocity) * 2, 0, 1);
  } else if (trendSlow < -0.3 && velocity > 0) {
    f3 = clamp(Math.abs(velocity) * 2, 0, 1);
  }

  // F4: Volatility
  const f4 = clamp(Math.sqrt(volatility) / 0.4, 0, 1);

  // F5: Duration fatigue
  const f5 = clamp((fatigue - 4) * 0.15, 0, 1);

  // Rebalanced Weights: Momentum opposition (F3) and Streak (F2) get higher priority
  const score = f1 * 0.25 + f2 * 0.25 + f3 * 0.25 + f4 * 0.10 + f5 * 0.15;

  return Math.round(clamp(score, 0, 1) * 100);
}

// ── Classification helpers ────────────────────────────────────────────

/**
 * Classifies the trend based on the Oscillator (Fast - Slow) rather than static thresholds.
 * This alerts you to trends BEFORE the slow baseline catches up.
 */
function classifyOscillatorTrend(state) {
  const { trendSlow, oscillator } = state;
  const absSlow = Math.abs(trendSlow);

  if (absSlow > 0.7) return trendSlow > 0 ? "A Over-Saturation" : "B Over-Saturation";

  // Oscillator break: Fast EWMA has crossed Slow EWMA significantly
  if (oscillator > 0.15) return "A Trend: Early Phase";
  if (oscillator < -0.15) return "B Trend: Early Phase";

  if (absSlow > 0.4) return trendSlow > 0 ? "A Dominance: Late Phase" : "B Dominance: Late Phase";

  return "Neutral / Choppy";
}

// ── UI Helper Exports ───────────────────────────────────────────────

/**
 * Compute streak from history array.
 * Positive = player wins, negative = dealer wins.
 */
export function computeStreak(history) {
  if (history.length === 0) return 0;
  const last = history[history.length - 1].result;
  let streak = last === "A" ? 1 : last === "B" ? -1 : 0;
  for (let i = history.length - 2; i >= 0; i--) {
    if (history[i].result === last) {
      streak += last === "A" ? 1 : last === "B" ? -1 : 0;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Compute fatigue: rounds spent with |trendSlow| > 0.4.
 * Works from history array.
 */
export function computeFatigue(history) {
  let fatigue = 0;
  let state = {};
  for (const h of history) {
    state = updateEngine(state, h.result);
    if (Math.abs(state.trendSlow) > 0.4) {
      fatigue++;
    } else {
      fatigue = 0;
    }
  }
  return fatigue;
}

/**
 * Compute win/loss/tie statistics from history.
 */
export function computeStats(history) {
  const total = history.length;
  const aWins = history.filter((h) => h.result === "A").length;
  const bWins = history.filter((h) => h.result === "B").length;
  const ties = history.filter((h) => h.result !== "A" && h.result !== "B").length;
  const aPct = total > 0 ? Math.round((aWins / total) * 100) : 0;
  const bPct = total > 0 ? Math.round((bWins / total) * 100) : 0;
  const tiePct = total > 0 ? Math.round((ties / total) * 100) : 0;
  return { total, aWins, bWins, ties, aPct, bPct, tiePct };
}

/**
 * Classify trend into a zone label.
 */
export function classifyTrend(trend) {
  const absT = Math.abs(trend);
  if (absT > 0.7) return trend > 0 ? "Player Over-Saturation" : "Dealer Over-Saturation";
  if (absT > 0.4) return trend > 0 ? "Player Dominance" : "Dealer Dominance";
  if (absT > 0.15) return trend > 0 ? "Player Leaning" : "Dealer Leaning";
  return "Neutral / Choppy";
}

/**
 * Short zone label for tables and charts.
 */
export function classifyTrendShort(trend) {
  const absT = Math.abs(trend);
  if (absT > 0.7) return trend > 0 ? "P Over-Sat" : "D Over-Sat";
  if (absT > 0.4) return trend > 0 ? "P Dominance" : "D Dominance";
  if (absT > 0.15) return trend > 0 ? "P Leaning" : "D Leaning";
  return "Neutral";
}

/**
 * Risk level from reversal probability.
 */
export function riskLevel(reversalProb) {
  if (reversalProb >= 60) return "High";
  if (reversalProb >= 30) return "Moderate";
  return "Low";
}

/**
 * Human-readable momentum label.
 */
export function momentumLabel(momentum) {
  const absM = Math.abs(momentum);
  if (absM < 0.05) return "Stable";
  if (absM < 0.15) return momentum > 0 ? "Slight ↑" : "Slight ↓";
  if (absM < 0.3) return momentum > 0 ? "Building ↑" : "Building ↓";
  return momentum > 0 ? "Strong ↑" : "Strong ↓";
}

// ── Utility ───────────────────────────────────────────────────────────

function clamp(v, min = -1, max = 1) {
  return Math.max(min, Math.min(max, v));
}