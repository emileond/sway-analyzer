/**
 * ═══════════════════════════════════════════════════════════════════════
 *  EWMA Trend & Reversion Engine v2
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Tracks directional game momentum on a [-1, +1] scale using an
 *  Exponentially Weighted Moving Average (EWMA).  Beyond the raw trend
 *  the engine computes several derived signals:
 *
 *  • Trend  (T)   – EWMA of encoded round results.
 *  • Momentum (M) – EWMA of the first derivative of T (acceleration).
 *  • Volatility (σ) – EWMA of squared deviations from T.
 *  • Streak       – Consecutive wins for the leading player.
 *  • Fatigue      – How many consecutive rounds the trend has stayed
 *                   above the dominance threshold (|T| > 0.4).
 *  • Reversal Probability (P) – Composite 0–100 score combining all
 *    of the above signals.
 *
 *  Zones:
 *    [-0.40, +0.40]  Neutral
 *    (+0.40, +0.75]  Player A Dominance
 *    [-0.75, -0.40)  Player B Dominance
 *    (> +0.75)       Player A Over-Saturation
 *    (< -0.75)       Player B Over-Saturation
 * ═══════════════════════════════════════════════════════════════════════
 */

// ── Encoding ──────────────────────────────────────────────────────────

/** Encode a round result string into a numeric input for the EWMA. */
export function encodeResult(result) {
  if (result === "A") return 1;
  if (result === "B") return -1;
  return 0; // Tie
}

// ── Core EWMA ─────────────────────────────────────────────────────────

/**
 * Compute the next EWMA trend value.
 *   T_n = α · R_n + (1 − α) · T_{n-1}
 *
 * @param {number} prev  – Previous trend T_{n-1}
 * @param {number} r     – Encoded round result (+1, 0, −1)
 * @param {number} alpha – Smoothing factor ∈ [0.10, 0.50]
 * @returns {number} Trend value clamped to [−1, +1]
 */
export function computeTrend(prev, r, alpha) {
  const next = alpha * r + (1 - alpha) * prev;
  return clamp(next);
}

/**
 * Compute EWMA of the first derivative (momentum).
 *   M_n = α · (T_n − T_{n-1}) + (1 − α) · M_{n-1}
 *
 * A positive momentum means the trend is accelerating toward Player A;
 * negative means accelerating toward Player B.  Near-zero means the
 * trend is decelerating or stable.
 */
export function computeMomentum(prevM, currentT, prevT, alpha) {
  const delta = currentT - prevT;
  const next = alpha * delta + (1 - alpha) * prevM;
  return clamp(next);
}

/**
 * Compute EWMA of squared deviations (volatility).
 *   σ²_n = α · (T_n − T_{n-1})² + (1 − α) · σ²_{n-1}
 *
 * Higher volatility means the trend is unstable — reversals become
 * more probable even if the absolute trend is moderate.
 */
export function computeVolatility(prevVar, currentT, prevT, alpha) {
  const diff = currentT - prevT;
  const next = alpha * diff * diff + (1 - alpha) * prevVar;
  return Math.max(0, next); // variance is never negative
}

// ── Composite Reversal Probability ────────────────────────────────────

/**
 * Calculate a composite reversal probability score ∈ [0, 100].
 *
 * Factors (each normalised to 0–1):
 *   F1 – Trend saturation   : how far |T| is past the dominance threshold
 *   F2 – Streak fatigue      : longer streaks → higher reversal pressure
 *   F3 – Momentum deceleration: if momentum opposes the trend direction
 *   F4 – Volatility          : unstable trends reverse more often
 *   F5 – Duration fatigue    : time spent in extreme zones
 *
 * Weighted sum → scaled to 0–100.
 */
export function reversalProbability(trend, streak, volatility, fatigue) {
  const absT = Math.abs(trend);

  // F1: Saturation  – ramps up once |T| > 0.4, saturates at 1.0 by |T| = 0.9
  const f1 = clamp((absT - 0.4) / 0.5, 0, 1);

  // F2: Streak fatigue – each extra win beyond 3 adds ~0.15
  const f2 = clamp((Math.abs(streak) - 3) * 0.15, 0, 1);

  // F3: Momentum opposition – when the trend is dominant in one direction
  // but momentum pushes the other way, reversal pressure builds.
  const f3 = clamp(
    trend > 0.4
      ? Math.max(0, -trend * 1.5) * 0.5
      : trend < -0.4
        ? Math.max(0, trend * 1.5) * 0.5
        : 0,
    0,
    1,
  );

  // F4: Volatility – sqrt(variance) normalised; typical range 0–0.3
  const f4 = clamp(Math.sqrt(volatility) / 0.3, 0, 1);

  // F5: Duration fatigue – each round beyond 5 in extreme zone adds 0.1
  const f5 = clamp((fatigue - 5) * 0.1, 0, 1);

  // Weighted combination
  const score =
    f1 * 0.35 + f2 * 0.2 + f3 * 0.15 + f4 * 0.15 + f5 * 0.15;

  return Math.round(clamp(score, 0, 1) * 100);
}

// ── Classification helpers ────────────────────────────────────────────

export function classifyTrend(t) {
  const abs = Math.abs(t);
  if (abs <= 0.4) return "Neutral";
  if (abs <= 0.75) return t > 0 ? "Player A Dominance" : "Player B Dominance";
  return t > 0 ? "Player A Over-Saturation" : "Player B Over-Saturation";
}

export function classifyTrendShort(t) {
  const abs = Math.abs(t);
  if (abs <= 0.4) return "Neutral";
  if (abs <= 0.75) return t > 0 ? "A Dominance" : "B Dominance";
  return t > 0 ? "A Over-Saturation" : "B Over-Saturation";
}

/** Discrete risk label from the composite probability. */
export function riskLevel(prob) {
  if (prob >= 60) return "High";
  if (prob >= 30) return "Moderate";
  return "Low";
}

/** Momentum direction label. */
export function momentumLabel(m) {
  if (m > 0.01) return "Accelerating → A";
  if (m < -0.01) return "Accelerating → B";
  return "Stable";
}

// ── Stats helpers ─────────────────────────────────────────────────────

/** Compute win counts and percentages from history. */
export function computeStats(history) {
  const total = history.length;
  if (total === 0)
    return { aWins: 0, bWins: 0, ties: 0, aPct: 0, bPct: 0, total: 0 };

  const aWins = history.filter((h) => h.result === "A").length;
  const bWins = history.filter((h) => h.result === "B").length;
  const ties = total - aWins - bWins;

  return {
    aWins,
    bWins,
    ties,
    aPct: Math.round((aWins / total) * 100),
    bPct: Math.round((bWins / total) * 100),
    total,
  };
}

/** Compute the current streak (positive = A, negative = B). */
export function computeStreak(history) {
  if (history.length === 0) return 0;
  const last = history[history.length - 1].result;
  if (last === "Tie") return 0;
  let streak = last === "A" ? 1 : -1;
  for (let i = history.length - 2; i >= 0; i--) {
    if (history[i].result === last) {
      streak += last === "A" ? 1 : -1;
    } else {
      break;
    }
  }
  return streak;
}

/** Count consecutive rounds where |T| > 0.4 (fatigue). */
export function computeFatigue(history) {
  let fatigue = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (Math.abs(history[i].trend) > 0.4) {
      fatigue++;
    } else {
      break;
    }
  }
  return fatigue;
}

// ── Utility ───────────────────────────────────────────────────────────

function clamp(v, min = -1, max = 1) {
  return Math.max(min, Math.min(max, v));
}
