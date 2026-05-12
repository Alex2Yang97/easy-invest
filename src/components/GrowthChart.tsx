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
  vanillaDaily?: DcaDailyPoint[];
};

type Row = {
  date: string;
  value?: number;
  contributed?: number;
  vanillaValue?: number;
  buyValue?: number;
  sellValue?: number;
};

export function GrowthChart({
  locale,
  daily,
  transactions,
  gainPositive,
  vanillaDaily,
}: Props) {
  const stride = Math.max(1, Math.floor(daily.length / 600));
  const byDate = new Map<string, Row>();
  const merged: Row[] = [];

  function upsert(date: string): Row {
    let row = byDate.get(date);
    if (!row) {
      row = { date };
      byDate.set(date, row);
      merged.push(row);
    }
    return row;
  }

  for (let i = 0; i < daily.length; i += stride) {
    const p = daily[i];
    const row = upsert(p.date);
    row.value = Math.round(p.value);
    row.contributed = Math.round(p.contributed);
  }
  const lastDaily = daily[daily.length - 1];
  const lastRow = upsert(lastDaily.date);
  lastRow.value = Math.round(lastDaily.value);
  lastRow.contributed = Math.round(lastDaily.contributed);

  if (vanillaDaily && vanillaDaily.length > 0) {
    const vStride = Math.max(1, Math.floor(vanillaDaily.length / 600));
    for (let i = 0; i < vanillaDaily.length; i += vStride) {
      const p = vanillaDaily[i];
      const row = upsert(p.date);
      row.vanillaValue = Math.round(p.value);
    }
    const vLast = vanillaDaily[vanillaDaily.length - 1];
    const vLastRow = upsert(vLast.date);
    vLastRow.vanillaValue = Math.round(vLast.value);
  }

  for (const tx of transactions) {
    const row = upsert(tx.date);
    if (tx.kind === "buy") {
      row.buyValue = Math.round(tx.valueAfter);
    } else {
      row.sellValue = Math.round(tx.valueAfter);
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
          {vanillaDaily && (
            <Line
              type="monotone"
              dataKey="vanillaValue"
              stroke="currentColor"
              strokeOpacity={0.55}
              strokeDasharray="2 3"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          )}
          <Line
            type="monotone"
            dataKey="contributed"
            stroke="currentColor"
            strokeOpacity={0.35}
            strokeDasharray="4 4"
            strokeWidth={1.25}
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
          <Scatter
            dataKey="sellValue"
            fill="#be123c"
            shape="triangle"
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
  const vanillaValue = payload.find(
    (p) => p.dataKey === "vanillaValue",
  )?.value;
  const buy = payload.find((p) => p.dataKey === "buyValue")?.value;
  const sell = payload.find((p) => p.dataKey === "sellValue")?.value;
  const dateLabel = label ? formatDate(label, locale) : "";

  if (value == null || contributed == null) {
    if (buy != null && dateLabel) {
      return (
        <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-sm tabular">
          <div className="font-semibold mb-1">{dateLabel}</div>
          <TooltipRow
            label={t(locale, "chart.tooltip.buyDay")}
            value={formatUSD(buy)}
            bold
          />
        </div>
      );
    }
    if (sell != null && dateLabel) {
      return (
        <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-sm tabular">
          <div className="font-semibold mb-1">{dateLabel}</div>
          <TooltipRow
            label={t(locale, "chart.tooltip.sellDay")}
            value={formatUSD(sell)}
            bold
            color="var(--loss)"
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
      <TooltipRow
        label={t(locale, "chart.tooltip.value")}
        value={formatUSD(value)}
        bold
      />
      <TooltipRow
        label={t(locale, "chart.tooltip.invested")}
        value={formatUSD(contributed)}
        muted
      />
      {vanillaValue != null && (
        <TooltipRow
          label={t(locale, "chart.tooltip.compare")}
          value={formatUSD(vanillaValue)}
          muted
        />
      )}
      <TooltipRow
        label={t(locale, "chart.tooltip.pnl")}
        value={`${formatUSD(gain)} (${gain >= 0 ? "+" : ""}${(gainPct * 100).toFixed(1)}%)`}
        color={gain >= 0 ? "var(--accent)" : "var(--loss)"}
      />
      {buy != null && (
        <TooltipRow
          label={t(locale, "chart.tooltip.bought")}
          value={t(locale, "chart.tooltip.bought.yes")}
          muted
        />
      )}
      {sell != null && (
        <TooltipRow
          label={t(locale, "chart.tooltip.sellDay")}
          value={t(locale, "chart.tooltip.bought.yes")}
          color="var(--loss)"
        />
      )}
    </div>
  );
}

function TooltipRow({
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
