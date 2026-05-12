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
import type { PortfolioDailyPoint } from "@/lib/portfolio";
import { formatDate, formatUSD } from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";
import { colorForIndex } from "@/lib/palette";

type Props = {
  locale: Locale;
  daily: PortfolioDailyPoint[];
  tickers: string[];
};

type Row = {
  date: string;
  contributed: number;
} & Record<string, number | string>;

export function PortfolioGrowthChart({ locale, daily, tickers }: Props) {
  const stride = Math.max(1, Math.floor(daily.length / 600));
  const rows: Row[] = [];

  function rowFor(p: PortfolioDailyPoint): Row {
    const row: Row = {
      date: p.date,
      contributed: Math.round(p.totalContributed),
    };
    for (const tk of tickers) {
      row[tk] = Math.round(p.perAsset[tk]?.value ?? 0);
    }
    return row;
  }

  for (let i = 0; i < daily.length; i += stride) {
    rows.push(rowFor(daily[i]));
  }
  const last = daily[daily.length - 1];
  if (rows.length === 0 || rows[rows.length - 1].date !== last.date) {
    rows.push(rowFor(last));
  }

  return (
    <div className="h-[320px] sm:h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={rows}
          margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        >
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
            content={<PortfolioTooltip locale={locale} tickers={tickers} />}
            cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }}
          />
          {tickers.map((tk, i) => (
            <Area
              key={tk}
              type="monotone"
              dataKey={tk}
              stackId="value"
              stroke={colorForIndex(i)}
              strokeWidth={1}
              fill={colorForIndex(i)}
              fillOpacity={0.55}
              isAnimationActive={false}
            />
          ))}
          <Line
            type="monotone"
            dataKey="contributed"
            stroke="currentColor"
            strokeOpacity={0.55}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function PortfolioTooltip({
  locale,
  tickers,
  active,
  payload,
  label,
}: {
  locale: Locale;
  tickers: string[];
  active?: boolean;
  payload?: Array<{ name: string; value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const contributed = payload.find((p) => p.dataKey === "contributed")?.value;
  let total = 0;
  const perTicker: { ticker: string; value: number; color: string }[] = [];
  for (let i = 0; i < tickers.length; i++) {
    const tk = tickers[i];
    const v = payload.find((p) => p.dataKey === tk)?.value ?? 0;
    total += v;
    perTicker.push({ ticker: tk, value: v, color: colorForIndex(i) });
  }
  const dateLabel = label ? formatDate(label, locale) : "";
  const gain = contributed != null ? total - contributed : 0;
  const gainPct = contributed && contributed > 0 ? gain / contributed : 0;

  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-sm tabular min-w-[180px]">
      <div className="font-semibold mb-1">{dateLabel}</div>
      <div className="flex items-center justify-between gap-4 leading-tight font-semibold">
        <span>{t(locale, "chart.tooltip.value")}</span>
        <span>{formatUSD(total)}</span>
      </div>
      {contributed != null && (
        <>
          <div className="flex items-center justify-between gap-4 leading-tight text-muted">
            <span>{t(locale, "chart.tooltip.invested")}</span>
            <span>{formatUSD(contributed)}</span>
          </div>
          <div
            className="flex items-center justify-between gap-4 leading-tight"
            style={{
              color: gain >= 0 ? "var(--accent)" : "var(--loss)",
            }}
          >
            <span>{t(locale, "chart.tooltip.pnl")}</span>
            <span>
              {formatUSD(gain)} ({gain >= 0 ? "+" : ""}
              {(gainPct * 100).toFixed(1)}%)
            </span>
          </div>
        </>
      )}
      <div className="mt-1.5 pt-1.5 border-t border-line/60 flex flex-col gap-0.5">
        {perTicker.map((p) => (
          <div
            key={p.ticker}
            className="flex items-center justify-between gap-4 leading-tight"
          >
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block size-2 rounded-sm"
                style={{ backgroundColor: p.color }}
              />
              <span className="font-mono">{p.ticker}</span>
            </span>
            <span className="text-muted">{formatUSD(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
