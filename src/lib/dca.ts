import type { DailyPoint } from "./yahoo";

export type DcaTransaction = {
  date: string;
  price: number;
  amount: number;
  sharesBought: number;
  cumulativeShares: number;
  cumulativeContributed: number;
  valueAfter: number;
};

export type DcaDailyPoint = {
  date: string;
  close: number;
  shares: number;
  contributed: number;
  value: number;
};

export type DcaNextBuy = {
  date: string;
  estimatedPrice: number;
  estimatedShares: number;
  monthlyAmount: number;
};

export type DcaSummary = {
  startDate: string;
  endDate: string;
  months: number;
  monthlyAmount: number;
  totalContributed: number;
  finalShares: number;
  finalValue: number;
  finalClose: number;
  gain: number;
  totalReturnPct: number;
  cagr: number;
  multiple: number;
  transactions: DcaTransaction[];
  daily: DcaDailyPoint[];
  nextBuy: DcaNextBuy | null;
};

function ymOf(isoDay: string): string {
  return isoDay.slice(0, 7);
}

function addMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map((s) => parseInt(s, 10));
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

function firstWeekdayOf(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map((s) => parseInt(s, 10));
  const d = new Date(Date.UTC(y, m - 1, 1));
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${String(m).padStart(2, "0")}-${dd}`;
}

export function simulateDca(
  points: DailyPoint[],
  monthlyAmount: number,
  latestPrice?: number,
): DcaSummary {
  if (points.length === 0) {
    throw new Error("没有可用历史数据");
  }

  const transactions: DcaTransaction[] = [];
  const daily: DcaDailyPoint[] = [];
  const seenMonths = new Set<string>();
  let shares = 0;
  let contributed = 0;

  for (const p of points) {
    if (p.close <= 0) continue;
    const ym = ymOf(p.date);
    if (!seenMonths.has(ym)) {
      seenMonths.add(ym);
      const sharesBought = monthlyAmount / p.close;
      shares += sharesBought;
      contributed += monthlyAmount;
      transactions.push({
        date: p.date,
        price: p.close,
        amount: monthlyAmount,
        sharesBought,
        cumulativeShares: shares,
        cumulativeContributed: contributed,
        valueAfter: shares * p.close,
      });
    }
    daily.push({
      date: p.date,
      close: p.close,
      shares,
      contributed,
      value: shares * p.close,
    });
  }

  if (transactions.length === 0) {
    throw new Error("没有发生买入交易");
  }

  const firstTx = transactions[0];
  const lastTx = transactions[transactions.length - 1];
  const lastDay = daily[daily.length - 1];
  const months = transactions.length;
  const years = months / 12;
  const finalValue = lastDay.value;
  const totalContributed = lastDay.contributed;
  const gain = finalValue - totalContributed;
  const totalReturnPct =
    totalContributed > 0 ? gain / totalContributed : 0;
  const multiple = totalContributed > 0 ? finalValue / totalContributed : 0;
  const cagr =
    years > 0 && multiple > 0 ? Math.pow(multiple, 1 / years) - 1 : 0;

  const nextBuyMonth = addMonth(ymOf(lastTx.date));
  const nextBuyDate = firstWeekdayOf(nextBuyMonth);
  const nextPrice = latestPrice ?? lastDay.close;
  const nextBuy: DcaNextBuy = {
    date: nextBuyDate,
    estimatedPrice: nextPrice,
    estimatedShares: nextPrice > 0 ? monthlyAmount / nextPrice : 0,
    monthlyAmount,
  };

  return {
    startDate: firstTx.date,
    endDate: lastDay.date,
    months,
    monthlyAmount,
    totalContributed,
    finalShares: lastDay.shares,
    finalValue,
    finalClose: lastDay.close,
    gain,
    totalReturnPct,
    cagr,
    multiple,
    transactions,
    daily,
    nextBuy,
  };
}
