"use client";

import { useState } from "react";
import type { DcaTransaction } from "@/lib/dca";
import { formatDate, formatShares, formatUSD } from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  transactions: DcaTransaction[];
};

export function TransactionLog({ locale, transactions }: Props) {
  const [expanded, setExpanded] = useState(false);
  const total = transactions.length;

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
                {t(locale, "result.txns.col.kind")}
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
                {t(locale, "result.txns.col.value")}
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => {
              const isSell = tx.kind === "sell";
              const sharesAbs = Math.abs(tx.sharesDelta);
              return (
                <tr
                  key={`${tx.date}-${tx.kind}-${i}`}
                  className="border-t border-line/60 hover:bg-foreground/[0.02] transition"
                >
                  <td className="px-2 py-2">{formatDate(tx.date, locale)}</td>
                  <td className="px-2 py-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${
                        isSell
                          ? "bg-loss-soft text-loss"
                          : "bg-accent-soft text-accent"
                      }`}
                    >
                      {t(
                        locale,
                        isSell
                          ? "result.txns.kind.sell"
                          : "result.txns.kind.buy",
                      )}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right">
                    {formatUSD(tx.price)}
                  </td>
                  <td
                    className={`px-2 py-2 text-right ${isSell ? "text-loss" : ""}`}
                  >
                    {isSell ? "−" : ""}
                    {formatShares(sharesAbs)}
                  </td>
                  <td className="px-2 py-2 text-right hidden sm:table-cell text-muted">
                    {formatShares(tx.cumulativeShares)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium">
                    {formatUSD(tx.valueAfter)}
                  </td>
                </tr>
              );
            })}
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
