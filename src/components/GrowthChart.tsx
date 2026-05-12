"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DcaDailyPoint, DcaTransaction } from "@/lib/dca";
import { formatDate, formatUSD } from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  daily: DcaDailyPoint[];
  transactions: DcaTransaction[];
  gainPositive: boolean;
};

export function GrowthChart({
  locale,
  daily,
  transactions,
  gainPositive,
}: Props) {
  const stride = Math.max(1, Math.floor(daily.length / 600));
  const sampled: Array<{
    date: string;
    value: number;
    contributed: number;
  }> = [];
  for (let i = 0; i < daily.length; i += stride) {
    const p = daily[i];
    sampled.push({
      date: p.date,
      value: Math.round(p.value),
      contributed: Math.round(p.contributed),
    });
  }
  const lastDaily = daily[daily.length - 1];
  if (sampled[sampled.length - 1]?.date !== lastDaily.date) {
    sampled.push({
      date: lastDaily.date,
      value: Math.round(lastDaily.value),
      contributed: Math.round(lastDaily.contributed),
    });
  }

  const buys = transactions.map((tx) => ({
    date: tx.date,
    buyValue: Math.round(tx.valueAfter),
  }));

  const merged: Array<{
    date: string;
    value?: number;
    contributed?: number;
    buyValue?: number;
  }> = [];
  const byDate = new Map<string, (typeof merged)[number]>();
  for (const s of sampled) {
    const row = { date: s.date, value: s.value, contributed: s.contributed };
    byDate.set(s.date, row);
    merged.push(row);
  }
  for (const b of buys) {
    const existing = byDate.get(b.date);
    if (existing) {
      existing.buyValue = b.buyValue;
    } else {
      const row = { date: b.date, buyValue: b.buyValue };
      byDate.set(b.date, row);
      merged.push(row);
    }
  }
  merged.sort((a, b) => a.date.localeCompare(b.date));

  const accent = gainPositive ? "#047857" : "#be123c";

  return (
    <div className="h-[300px] sm:h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={merged}
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
            dataKey="date"
            tickFormatter={(v: string) => v.slice(0, 4)}
            interval="preserveStartEnd"
            minTickGap={56}
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
            content={<ChartTooltip locale={locale} />}
            cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={accent}
            strokeWidth={2}
            fill="url(#valFill)"
            isAnimationActive={false}
            connectNulls
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
            connectNulls
          />
          <Scatter
            dataKey="buyValue"
            fill={accent}
            shape="circle"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({
  locale,
  active,
  payload,
  label,
}: {
  locale: Locale;
  active?: boolean;
  payload?: Array<{ name: string; value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload.find((p) => p.dataKey === "value")?.value;
  const contributed = payload.find((p) => p.dataKey === "contributed")?.value;
  const buy = payload.find((p) => p.dataKey === "buyValue")?.value;
  const dateLabel = label ? formatDate(label, locale) : "";
  if (value == null || contributed == null) {
    if (buy != null && dateLabel) {
      return (
        <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-sm tabular">
          <div className="font-semibold mb-1">{dateLabel}</div>
          <Row
            label={t(locale, "chart.tooltip.buyDay")}
            value={formatUSD(buy)}
            bold
          />
        </div>
      );
    }
    return null;
  }
  const gain = value - contributed;
  const gainPct = contributed > 0 ? gain / contributed : 0;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-sm tabular">
      <div className="font-semibold mb-1">{dateLabel}</div>
      <Row
        label={t(locale, "chart.tooltip.value")}
        value={formatUSD(value)}
        bold
      />
      <Row
        label={t(locale, "chart.tooltip.invested")}
        value={formatUSD(contributed)}
        muted
      />
      <Row
        label={t(locale, "chart.tooltip.pnl")}
        value={`${formatUSD(gain)} (${gain >= 0 ? "+" : ""}${(gainPct * 100).toFixed(1)}%)`}
        color={gain >= 0 ? "var(--accent)" : "var(--loss)"}
      />
      {buy != null && (
        <Row
          label={t(locale, "chart.tooltip.bought")}
          value={t(locale, "chart.tooltip.bought.yes")}
          muted
        />
      )}
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
