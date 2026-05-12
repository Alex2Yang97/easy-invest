"use client";

import { Fragment, useState } from "react";
import type { DcaTransaction } from "@/lib/dca";
import {
  formatDate,
  formatShares,
  formatUSD,
} from "@/lib/format";

type Props = {
  transactions: DcaTransaction[];
};

const INITIAL_LIMIT = 12;

export function TransactionLog({ transactions }: Props) {
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
                日期 <span className="opacity-60">/ Date</span>
              </th>
              <th className="font-medium px-2 py-2 text-right">
                成交价 <span className="opacity-60">/ Price</span>
              </th>
              <th className="font-medium px-2 py-2 text-right">
                买入股数 <span className="opacity-60">/ Shares</span>
              </th>
              <th className="font-medium px-2 py-2 text-right hidden sm:table-cell">
                累计股数 <span className="opacity-60">/ Cum.</span>
              </th>
              <th className="font-medium px-2 py-2 text-right">
                持仓价值 <span className="opacity-60">/ Value</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t, i) => {
              const isElision = i === elidedAt;
              const date = formatDate(t.date);
              return (
                <Fragment key={t.date}>
                  {isElision && (
                    <tr className="text-muted">
                      <td colSpan={5} className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => setExpanded(true)}
                          className="text-[11px] hover:text-foreground transition"
                        >
                          展开剩余 {total - INITIAL_LIMIT} 笔 / Show{" "}
                          {total - INITIAL_LIMIT} more ↓
                        </button>
                      </td>
                    </tr>
                  )}
                  <tr
                    className="border-t border-line/60 hover:bg-foreground/[0.02] transition"
                  >
                    <td className="px-2 py-2">
                      <div>{date.zh}</div>
                      <div className="text-[10.5px] text-muted">{date.en}</div>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {formatUSD(t.price)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {formatShares(t.sharesBought)}
                    </td>
                    <td className="px-2 py-2 text-right hidden sm:table-cell text-muted">
                      {formatShares(t.cumulativeShares)}
                    </td>
                    <td className="px-2 py-2 text-right font-medium">
                      {formatUSD(t.valueAfter)}
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
            收起 / Collapse ↑
          </button>
        </div>
      )}
    </div>
  );
}
