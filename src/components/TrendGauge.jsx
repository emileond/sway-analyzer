/**
 * TrendGauge – Bipolar SVG gauge showing player vs dealer advantage.
 * Repurposed for blackjack: left = dealer advantage, right = player advantage.
 */
import { Chip } from "@heroui/react";
import { classifyTrend } from "../lib/trendEngine";

export default function TrendGauge({ trend }) {
  const angle = trend * 90;
  const absT = Math.abs(trend);
  const zone = classifyTrend(trend);

  // Needle colour: interpolate red (dealer) → gray → green (player)
  const pct = (trend + 1) / 2;
  const r = Math.round(180 + (34 - 180) * pct);
  const g = Math.round(55 + (165 - 55) * pct);
  const b = Math.round(55 + (75 - 55) * pct);
  const needleColor = `rgb(${r},${g},${b})`;

  const tickValues = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];

  const leading =
    absT <= 0.4
      ? null
      : trend > 0
        ? "Player"
        : "Dealer";

  const leadingColor = leading === "Player" ? "success" : "danger";

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="-140 -120 280 155" className="w-full max-w-lg">
        <defs>
          <filter id="glow-player" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor="rgb(34,165,70)" floodOpacity="0.25" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-dealer" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor="rgb(200,50,50)" floodOpacity="0.25" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        {leading === "Player" && (
          <path
            d={arcPath(-36, 90, 90)}
            fill="none"
            stroke="rgb(34,165,70)"
            strokeWidth="14"
            opacity="0.12"
            filter="url(#glow-player)"
          />
        )}
        {leading === "Dealer" && (
          <path
            d={arcPath(-90, 36, 90)}
            fill="none"
            stroke="rgb(200,50,50)"
            strokeWidth="14"
            opacity="0.12"
            filter="url(#glow-dealer)"
          />
        )}

        {/* Zone arcs */}
        <ArcSegment from={-90} to={-67.5} r={90} stroke="rgb(180,40,40)" label="Edge" />
        <ArcSegment from={-67.5} to={-36} r={90} stroke="rgb(210,130,40)" />
        <ArcSegment from={-36} to={36} r={90} stroke="rgb(130,150,165)" opacity={0.3} />
        <ArcSegment from={36} to={67.5} r={90} stroke="rgb(210,130,40)" />
        <ArcSegment from={67.5} to={90} r={90} stroke="rgb(34,155,65)" label="Edge" />

        {/* Tick marks + labels */}
        {tickValues.map((v) => {
          const deg = v * 90;
          const inner = arcPt(deg, 78);
          const outer = arcPt(deg, 85);
          const labelPos = arcPt(deg, 68);
          const showLabel = [-1, -0.5, 0, 0.5, 1].includes(v);
          return (
            <g key={v}>
              <line
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="currentColor"
                strokeWidth={v === 0 ? 2 : 1}
                className="text-muted"
                opacity={v === 0 ? 0.7 : 0.35}
              />
              {showLabel && (
                <text
                  x={labelPos.x}
                  y={labelPos.y + 3}
                  textAnchor="middle"
                  className="text-[8px]"
                  fill="currentColor"
                  opacity={0.5}
                >
                  {v === 1 ? "P" : v === -1 ? "D" : v.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}

        {/* Needle */}
        <line
          x1="0" y1="8"
          x2="0" y2="-82"
          stroke={needleColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          transform={`rotate(${angle})`}
          style={{ transition: "transform 0.4s cubic-bezier(.4,0,.2,1)" }}
        />
        <circle cx="0" cy="0" r="6" fill={needleColor} />
        <circle cx="0" cy="0" r="3" fill="var(--color-background, #fff)" />

        {/* Labels */}
        <text
          x="-122" y="14"
          textAnchor="middle"
          className="text-[14px] font-bold"
          fill={leading === "Dealer" ? "rgb(200,50,50)" : "rgb(160,80,80)"}
          opacity={leading === "Dealer" ? 1 : 0.5}
        >
          Dealer
        </text>
        <text
          x="122" y="14"
          textAnchor="middle"
          className="text-[14px] font-bold"
          fill={leading === "Player" ? "rgb(34,165,70)" : "rgb(80,140,90)"}
          opacity={leading === "Player" ? 1 : 0.5}
        >
          Player
        </text>

        <text
          x="0" y="-100"
          textAnchor="middle"
          className="text-[9px]"
          fill="currentColor"
          opacity={0.4}
        >
          BALANCED
        </text>
      </svg>

      {/* Leading indicator chip */}
      <div className="flex items-center gap-2">
        {leading ? (
          <Chip color={leadingColor} variant="primary" size="sm">
            {leading} trend — {zone}
          </Chip>
        ) : (
          <Chip color="default" variant="soft" size="sm">
            Balanced — {zone}
          </Chip>
        )}
      </div>
    </div>
  );
}

function ArcSegment({ from, to, r, stroke, opacity = 0.65, label }) {
  const d = arcPath(from, to, r);
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="round"
        opacity={opacity}
      />
      {label && (
        <text
          x={arcPt((from + to) / 2, 102).x}
          y={arcPt((from + to) / 2, 102).y + 3}
          textAnchor="middle"
          className="text-[6px]"
          fill="currentColor"
          opacity={0.35}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function arcPath(from, to, r) {
  const s = arcPt(from, r);
  const e = arcPt(to, r);
  const large = to - from > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function arcPt(deg, r) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: +(Math.cos(rad) * r).toFixed(2), y: +(Math.sin(rad) * r).toFixed(2) };
}
