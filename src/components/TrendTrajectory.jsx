/**
 * TrendTrajectory – HeroUI Pro AreaChart showing the EWMA trend over rounds.
 *
 * Uses @heroui-pro/react AreaChart with recharts primitives for:
 *   - Interactive tooltips with ChartTooltipContent
 *   - Proper axis labels
 *   - Grid lines
 *   - Smooth monotone curves
 *   - Gradient fill under the line
 */
import {
  AreaChartRoot,
  AreaChartArea,
  AreaChartGrid,
  AreaChartTooltip,
  AreaChartXAxis,
  AreaChartYAxis,
  AreaChartTooltipContent,
} from "@heroui-pro/react";
import { Card } from "@heroui/react";
import { classifyTrendShort } from "../lib/trendEngine";

export default function TrendTrajectory({ history }) {
  if (history.length === 0) return null;

  // Build recharts-compatible data
  const data = history.map((d) => ({
    round: d.round,
    trend: +d.trend.toFixed(3),
    zone: classifyTrendShort(d.trend),
  }));

  const lastTrend = history[history.length - 1].trend;
  const lineColor = lastTrend >= 0 ? "rgb(34,165,70)" : "rgb(200,50,50)";
  const fillColor = lastTrend >= 0 ? "rgba(34,165,70,0.2)" : "rgba(200,50,50,0.2)";

  return (
    <Card className="gap-3">
      <Card.Header>
        <Card.Title className="text-sm">Trend Trajectory</Card.Title>
        <Card.Description className="text-xs">
          EWMA trend value per round — hover for details
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
            content={
              <AreaChartTooltipContent
                labelFormatter={(label) => `Round #${label}`}
                valueFormatter={(value) => {
                  const v = Number(value);
                  const zone = classifyTrendShort(v);
                  return `${v >= 0 ? "+" : ""}${v.toFixed(3)} — ${zone}`;
                }}
              />
            }
          />
          <AreaChartArea
            dataKey="trend"
            type="monotone"
            stroke={lineColor}
            strokeWidth={2.5}
            fill={fillColor}
            dot={false}
            activeDot={{
              r: 5,
              stroke: lineColor,
              strokeWidth: 2,
              fill: "var(--color-background, #fff)",
            }}
          />
        </AreaChartRoot>
      </Card.Content>
    </Card>
  );
}
