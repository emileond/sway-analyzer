/**
 * Sparkline – Full-width trend trajectory chart.
 *
 * Features:
 *   - Smooth cubic-bezier interpolation between points
 *   - Y-axis labels at key thresholds (-1, -0.5, 0, +0.5, +1)
 *   - Zone shading: neutral band, dominance bands
 *   - Gradient fill under the curve (colour shifts with final trend)
 *   - Data-point dots at first, last, and every 5th round
 *   - Round labels on the X-axis
 */
export default function Sparkline({ history }) {
  if (history.length === 0) return null;

  const width = 800;
  const height = 220;
  const pad = { top: 24, bottom: 28, left: 44, right: 16 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  // Map data → pixel coordinates
  const trendToY = (t) => pad.top + ((1 - t) / 2) * h; // +1 → top, −1 → bottom
  const roundToX = (i) =>
    pad.left + (i / Math.max(1, history.length - 1)) * w;

  const pts = history.map((d, i) => ({ x: roundToX(i), y: trendToY(d.trend) }));

  // Build smooth cubic-bezier path
  const lineD = smoothPath(pts);
  const areaD =
    lineD +
    ` L ${pts[pts.length - 1].x.toFixed(1)},${(pad.top + h).toFixed(1)}` +
    ` L ${pts[0].x.toFixed(1)},${(pad.top + h).toFixed(1)} Z`;

  const lastTrend = history[history.length - 1].trend;
  const lineColor =
    lastTrend >= 0 ? "rgb(34,170,75)" : "rgb(210,55,55)";
  const fillColor =
    lastTrend >= 0 ? "rgba(34,170,75," : "rgba(210,55,55,";

  const gradId = "sparkGrad";
  const yTicks = [
    { val: 1, label: "+1" },
    { val: 0.75, label: "" },
    { val: 0.5, label: "+0.5" },
    { val: 0.25, label: "" },
    { val: 0, label: "0" },
    { val: -0.25, label: "" },
    { val: -0.5, label: "-0.5" },
    { val: -0.75, label: "" },
    { val: -1, label: "-1" },
  ];

  // Determine which round labels to show (max ~8)
  const step = Math.max(1, Math.ceil(history.length / 8));
  const xLabels = history
    .map((d, i) => ({ i, round: d.round }))
    .filter((d) => d.i === 0 || d.i === history.length - 1 || d.i % step === 0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`${fillColor}0.3)`} />
          <stop offset="100%" stopColor={`${fillColor}0.02)`} />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines + Y labels */}
      {yTicks.map(({ val, label }) => {
        const y = trendToY(val);
        const isZero = val === 0;
        return (
          <g key={val}>
            <line
              x1={pad.left}
              y1={y}
              x2={pad.left + w}
              y2={y}
              stroke="currentColor"
              className="text-border"
              strokeWidth={isZero ? 1 : 0.5}
              strokeDasharray={isZero ? "none" : "3 4"}
              opacity={isZero ? 0.6 : 0.35}
            />
            {label && (
              <text
                x={pad.left - 6}
                y={y + 3.5}
                textAnchor="end"
                className="fill-current text-[9px]"
                fill="currentColor"
                opacity={0.5}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}

      {/* Zone bands */}
      {/* Neutral: -0.4 to +0.4 */}
      <rect
        x={pad.left}
        y={trendToY(0.4)}
        width={w}
        height={trendToY(-0.4) - trendToY(0.4)}
        fill="currentColor"
        className="text-muted"
        opacity={0.04}
      />
      {/* A Dominance: +0.4 to +0.75 */}
      <rect
        x={pad.left}
        y={trendToY(0.75)}
        width={w}
        height={trendToY(0.4) - trendToY(0.75)}
        fill="rgb(34,170,75)"
        opacity={0.03}
      />
      {/* B Dominance: -0.4 to -0.75 */}
      <rect
        x={pad.left}
        y={trendToY(-0.4)}
        width={w}
        height={trendToY(-0.75) - trendToY(-0.4)}
        fill="rgb(210,55,55)"
        opacity={0.03}
      />

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradId})`} />

      {/* Trend line */}
      <path
        d={lineD}
        fill="none"
        stroke={lineColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Data point dots */}
      {pts.map((p, i) => {
        const show = i === 0 || i === pts.length - 1 || i % 5 === 0;
        if (!show) return null;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === pts.length - 1 ? 4.5 : 2.5}
            fill={i === pts.length - 1 ? lineColor : "var(--color-background, #fff)"}
            stroke={lineColor}
            strokeWidth={i === pts.length - 1 ? 2 : 1.5}
          />
        );
      })}

      {/* X-axis round labels */}
      {xLabels.map(({ i, round }) => (
        <text
          key={i}
          x={roundToX(i)}
          y={height - 6}
          textAnchor="middle"
          className="fill-current text-[9px]"
          fill="currentColor"
          opacity={0.45}
        >
          R{round}
        </text>
      ))}
    </svg>
  );
}

/** Catmull-Rom → cubic Bezier smooth path through points. */
function smoothPath(pts) {
  if (pts.length < 2) return "";
  if (pts.length === 2)
    return `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)},${pts[1].y.toFixed(1)}`;

  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const tension = 0.3;
    const cp1x = p1.x + ((p2.x - p0.x) * tension);
    const cp1y = p1.y + ((p2.y - p0.y) * tension);
    const cp2x = p2.x - ((p3.x - p1.x) * tension);
    const cp2y = p2.y - ((p3.y - p1.y) * tension);

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return d;
}
