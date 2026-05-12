"use client";

import { Fragment, useState } from "react";
import type { DcaTransaction } from "@/lib/dca";
import { formatDate, formatShares, formatUSD } from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  transactions: DcaTransaction[];
};

const INITIAL_LIMIT = 12;

export function TransactionLog({ locale, transactions }: Props) {
  const [expanded, setExpanded] = useState(false);
  const total = transactions.length;
  const showAll = expanded || total <= INITIAL_LIMIT;
  const visible = showAll
    ? transactions
    : [
        ...transactions.slice(0, 6),
        ...transactions.slice(transactions.length - 6),
      ];
  const elidedAt = showAll ? -1 : 6;

  return (
    <div>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-[12.5px] tabular">
          <thead>
            <tr className="text-[11px] text-muted text-left">
              <th className="font-medium px-2 py-2">
                {t(locale, "result.txns.col.date")}
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
            {visible.map((tx, i) => {
              const isElision = i === elidedAt;
              return (
                <Fragment key={tx.date}>
                  {isElision && (
                    <tr className="text-muted">
                      <td colSpan={5} className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => setExpanded(true)}
                          className="text-[11px] hover:text-foreground transition"
                        >
                          {t(locale, "result.txns.expand", {
                            n: total - INITIAL_LIMIT,
                          })}
                        </button>
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-line/60 hover:bg-foreground/[0.02] transition">
                    <td className="px-2 py-2">{formatDate(tx.date, locale)}</td>
                    <td className="px-2 py-2 text-right">
                      {formatUSD(tx.price)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {formatShares(tx.sharesBought)}
                    </td>
                    <td className="px-2 py-2 text-right hidden sm:table-cell text-muted">
                      {formatShares(tx.cumulativeShares)}
                    </td>
                    <td className="px-2 py-2 text-right font-medium">
                      {formatUSD(tx.valueAfter)}
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {expanded && total > INITIAL_LIMIT && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-[11px] text-muted hover:text-foreground transition"
          >
            {t(locale, "result.txns.collapse")}
          </button>
        </div>
      )}
    </div>
  );
}
