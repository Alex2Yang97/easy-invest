"use client";

import { useState } from "react";
import { formatDate, formatShares, formatUSD } from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";
import { colorForIndex } from "@/lib/palette";
import type { PortfolioTransaction } from "@/lib/portfolio";

type Props = {
  locale: Locale;
  transactions: PortfolioTransaction[];
  tickers: string[];
};

export function PortfolioTransactionLog({
  locale,
  transactions,
  tickers,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const total = transactions.length;
  const colorByTicker = new Map<string, string>(
    tickers.map((tk, i) => [tk, colorForIndex(i)]),
  );

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full rounded-2xl border border-line bg-card/60 px-5 sm:px-7 py-4 text-left hover:border-foreground/40 transition flex items-center justify-between gap-3"
      >
        <span className="text-[13px] font-semibold tracking-wide">
          {t(locale, "result.txns.section")}
        </span>
        <span className="text-[12px] text-muted tabular">
          {t(locale, "result.txns.view", { n: total })}
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-7">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="text-[13px] font-semibold tracking-wide">
          {t(locale, "result.txns.section")}
        </h2>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[11px] text-muted hover:text-foreground transition"
        >
          {t(locale, "result.txns.collapse")}
        </button>
      </div>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-[12.5px] tabular">
          <thead>
            <tr className="text-[11px] text-muted text-left">
              <th className="font-medium px-2 py-2">
                {t(locale, "result.txns.col.date")}
              </th>
              <th className="font-medium px-2 py-2">
                {t(locale, "portfolio.txns.col.ticker")}
              </th>
              <th className="font-medium px-2 py-2 text-right">
                {t(locale, "result.txns.col.price")}
              </th>
              <th className="font-medium px-2 py-2 text-right">
                {t(locale, "result.txns.col.shares")}
              </th>
              <th className="font-medium px-2 py-2 text-right hidden sm:table-cell">
                {t(locale, "result.txns.col.cumShares")}
              </th>
              <th className="font-medium px-2 py-2 text-right">
                {t(locale, "portfolio.txns.col.amount")}
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr
                key={`${tx.date}-${tx.ticker}-${i}`}
                className="border-t border-line/60 hover:bg-foreground/[0.02] transition"
              >
                <td className="px-2 py-2">{formatDate(tx.date, locale)}</td>
                <td className="px-2 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block size-2 rounded-sm"
                      style={{
                        backgroundColor:
                          colorByTicker.get(tx.ticker) ?? "var(--muted)",
                      }}
                    />
                    <span className="font-mono text-[11.5px]">
                      {tx.ticker}
                    </span>
                  </span>
                </td>
                <td className="px-2 py-2 text-right">
                  {formatUSD(tx.price)}
                </td>
                <td className="px-2 py-2 text-right">
                  {formatShares(tx.sharesDelta)}
                </td>
                <td className="px-2 py-2 text-right hidden sm:table-cell text-muted">
                  {formatShares(tx.cumulativeShares)}
                </td>
                <td className="px-2 py-2 text-right font-medium">
                  {formatUSD(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[11px] text-muted hover:text-foreground transition"
        >
          {t(locale, "result.txns.collapse")}
        </button>
      </div>
    </div>
  );
}
