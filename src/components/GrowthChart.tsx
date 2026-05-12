"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DcaPoint } from "@/lib/dca";
import { formatUSD } from "@/lib/format";

type Props = {
  series: DcaPoint[];
  gainPositive: boolean;
};

export function GrowthChart({ series, gainPositive }: Props) {
  const data = series.map((p) => ({
    month: p.month,
    contributed: Math.round(p.contributed),
    value: Math.round(p.value),
  }));

  const accent = gainPositive ? "#047857" : "#be123c";

  return (
    <div className="h-[280px] sm:h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="valFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.22} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="currentColor"
            strokeOpacity={0.08}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickFormatter={(v: string) => v.slice(0, 4)}
            interval="preserveStartEnd"
            minTickGap={48}
            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.55 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatUSD(v, { compact: true })}
            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.55 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={accent}
            strokeWidth={2}
            fill="url(#valFill)"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="contributed"
            stroke="currentColor"
            strokeOpacity={0.45}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload.find((p) => p.dataKey === "value")?.value ?? 0;
  const contributed =
    payload.find((p) => p.dataKey === "contributed")?.value ?? 0;
  const gain = value - contributed;
  const gainPct = contributed > 0 ? gain / contributed : 0;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-sm tabular">
      <div className="font-semibold mb-1">{label}</div>
      <Row label="持仓 / Value" value={formatUSD(value)} bold />
      <Row label="投入 / Invested" value={formatUSD(contributed)} muted />
      <Row
        label="盈亏 / P&L"
        value={`${formatUSD(gain)} (${gain >= 0 ? "+" : ""}${(gainPct * 100).toFixed(1)}%)`}
        color={gain >= 0 ? "var(--accent)" : "var(--loss)"}
      />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 leading-tight">
      <span className={muted ? "text-muted" : ""}>{label}</span>
      <span
        className={bold ? "font-semibold" : ""}
        style={color ? { color } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
