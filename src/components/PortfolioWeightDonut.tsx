"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { t, type Locale } from "@/lib/i18n";
import { ASSET_PALETTE, colorForIndex } from "@/lib/palette";
import type { PortfolioPerAssetSummary } from "@/lib/portfolio";

type Props = {
  locale: Locale;
  perAsset: PortfolioPerAssetSummary[];
};

export function PortfolioWeightDonut({ locale, perAsset }: Props) {
  const target = perAsset.map((p) => ({
    ticker: p.ticker,
    value: p.targetWeight,
  }));
  const actual = perAsset.map((p) => ({
    ticker: p.ticker,
    value: p.finalWeight,
  }));

  return (
    <div className="grid grid-cols-2 gap-4">
      <DonutBlock
        label={t(locale, "portfolio.weights.target")}
        data={target}
      />
      <DonutBlock
        label={t(locale, "portfolio.weights.actual")}
        data={actual}
      />
      <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1">
        {perAsset.map((p, i) => (
          <span
            key={p.ticker}
            className="inline-flex items-center gap-1.5 text-[11px] tabular"
          >
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: colorForIndex(i) }}
            />
            <span className="font-mono">{p.ticker}</span>
            <span className="text-muted">
              {(p.targetWeight * 100).toFixed(0)}%→
              {(p.finalWeight * 100).toFixed(0)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function DonutBlock({
  label,
  data,
}: {
  label: string;
  data: { ticker: string; value: number }[];
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[11px] text-muted mb-1.5">{label}</div>
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="ticker"
              innerRadius="60%"
              outerRadius="92%"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell
                  key={d.ticker}
                  fill={ASSET_PALETTE[i % ASSET_PALETTE.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
