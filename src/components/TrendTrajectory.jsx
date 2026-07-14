/**
 * TrendTrajectory – HeroUI Pro AreaChart with split-colour zones.
 *
 * Positive trend values are always rendered in green, negative in red.
 * This is achieved by feeding two separate data keys into recharts:
 *   - trendPositive: max(0, trend) — green area
 *   - trendNegative: min(0, trend) — red area
 */
import {
  AreaChartRoot,
  AreaChartGrid,
  AreaChartTooltip,
  AreaChartXAxis,
  AreaChartYAxis,
} from "@heroui-pro/react";
import { Area } from "recharts";
import { Card } from "@heroui/react";
import { classifyTrendShort } from "../lib/trendEngine";

const resultLabel = (r) => {
  if (r === "A") return "Player A Win";
  if (r === "B") return "Player B Win";
  return "Tie";
};

const resultColorClass = (r) => {
  if (r === "A") return "text-success";
  if (r === "B") return "text-danger";
  return "text-muted";
};

export default function TrendTrajectory({ history }) {
  if (history.length === 0) return null;

  const data = history.map((d) => {
    const t = +d.trend.toFixed(3);
    return {
      round: d.round,
      result: d.result,
      trendPositive: Math.max(0, t),
      trendNegative: Math.min(0, t),
      trend: t,
      zone: classifyTrendShort(t),
    };
  });

  return (
    <Card className="gap-3">
      <Card.Header>
        <Card.Title className="text-sm">Trend Trajectory</Card.Title>
        <Card.Description className="text-xs">
          EWMA trend per round —{" "}
          <span className="text-success font-medium">green</span> = Player A,{" "}
          <span className="text-danger font-medium">red</span> = Player B
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <AreaChartRoot data={data} height={260} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <AreaChartGrid
            vertical={false}
            stroke="currentColor"
            className="text-border"
            opacity={0.4}
          />
          <AreaChartXAxis
            dataKey="round"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
            label={{
              value: "Round",
              position: "insideBottom",
              offset: -4,
              style: { fontSize: 10, fill: "currentColor", opacity: 0.4 },
            }}
          />
          <AreaChartYAxis
            domain={[-1, 1]}
            ticks={[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]}
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
            tickFormatter={(v) => (v === 0 ? "0" : v > 0 ? `+${v}` : `${v}`)}
            label={{
              value: "Trend",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fontSize: 10, fill: "currentColor", opacity: 0.4 },
            }}
          />
          <AreaChartTooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload;
              const v = Number(row?.trend ?? 0);
              const r = row?.result;
              const zone = classifyTrendShort(v);
              return (
                <div className="rounded-xl border border-border bg-popover px-3 py-2.5 shadow-lg text-xs">
                  <p className="font-semibold mb-1.5">Round #{label}</p>
                  <div className="flex flex-col gap-1">
                    <p className={resultColorClass(r)}>
                      {resultLabel(r)}
                    </p>
                    <p>
                      Trend:{" "}
                      <span className="font-mono">
                        {v >= 0 ? "+" : ""}{v.toFixed(3)}
                      </span>
                    </p>
                    <p className="text-muted">{zone}</p>
                  </div>
                </div>
              );
            }}
          />
          {/* Green area for positive values */}
          <Area
            dataKey="trendPositive"
            type="monotone"
            stroke="rgb(34,165,70)"
            strokeWidth={2}
            fill="rgba(34,165,70,0.18)"
            dot={false}
            activeDot={{
              r: 5,
              stroke: "rgb(34,165,70)",
              strokeWidth: 2,
              fill: "var(--color-background, #fff)",
            }}
          />
          {/* Red area for negative values */}
          <Area
            dataKey="trendNegative"
            type="monotone"
            stroke="rgb(200,50,50)"
            strokeWidth={2}
            fill="rgba(200,50,50,0.18)"
            dot={false}
            activeDot={{
              r: 5,
              stroke: "rgb(200,50,50)",
              strokeWidth: 2,
              fill: "var(--color-background, #fff)",
            }}
          />
        </AreaChartRoot>
      </Card.Content>
    </Card>
  );
}
