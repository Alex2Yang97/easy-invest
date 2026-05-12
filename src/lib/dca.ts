import {
  DEFAULT_STRATEGY,
  MA_CONFIG,
  TP_CONFIG,
  type StrategyId,
} from "./strategies";
import type { DailyPoint } from "./yahoo";

export type DcaTransaction = {
  date: string;
  kind: "buy" | "sell";
  price: number;
  amount: number;
  sharesDelta: number;
  cumulativeShares: number;
  cumulativeBuy: number;
  cumulativeSell: number;
  valueAfter: number;
};

export type DcaDailyPoint = {
  date: string;
  close: number;
  shares: number;
  contributed: number;
  realized: number;
  value: number;
};

export type DcaNextBuy = {
  date: string;
  estimatedPrice: number;
  estimatedAmount: number;
  estimatedShares: number;
};

export type DcaSummary = {
  strategyId: StrategyId;
  startDate: string;
  endDate: string;
  months: number;
  baseAmount: number;
  totalContributed: number;
  totalRealized: number;
  netInvested: number;
  finalShares: number;
  finalHoldings: number;
  finalValue: number;
  finalClose: number;
  gain: number;
  totalReturnPct: number;
  cagr: number;
  multiple: number;
  buyCount: number;
  sellCount: number;
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

function rollingMean(points: DailyPoint[], window: number): (number | null)[] {
  const out: (number | null)[] = new Array(points.length).fill(null);
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    sum += points[i].close;
    if (i >= window) sum -= points[i - window].close;
    if (i >= window - 1) out[i] = sum / window;
  }
  return out;
}

type MonthlyAction =
  | { kind: "buy"; amount: number }
  | { kind: "sell"; amount: number }
  | null;

type DecisionCtx = {
  monthIndex: number;
  price: number;
  shares: number;
  cycleInvested: number;
  ma: number | null;
};

function decideMonthly(
  strategy: StrategyId,
  baseAmount: number,
  ctx: DecisionCtx,
): MonthlyAction {
  if (strategy === "vanilla") return { kind: "buy", amount: baseAmount };

  if (strategy === "va") {
    const target = baseAmount * ctx.monthIndex;
    const portfolio = ctx.shares * ctx.price;
    const delta = target - portfolio;
    if (delta > 0.01) return { kind: "buy", amount: delta };
    if (delta < -0.01) return { kind: "sell", amount: -delta };
    return null;
  }

  if (strategy === "ma") {
    let mult = 1.0;
    if (ctx.ma != null && ctx.ma > 0) {
      const dev = (ctx.price - ctx.ma) / ctx.ma;
      mult = MA_CONFIG.multiplierFor(dev);
    }
    return { kind: "buy", amount: baseAmount * mult };
  }

  // tp: monthly buy; take-profit checked separately after the buy
  return { kind: "buy", amount: baseAmount };
}

export function simulateDca(
  points: DailyPoint[],
  baseAmount: number,
  latestPrice?: number,
  strategy: StrategyId = DEFAULT_STRATEGY,
): DcaSummary {
  if (points.length === 0) {
    throw new Error("no history data");
  }

  const maSeries =
    strategy === "ma" ? rollingMean(points, MA_CONFIG.window) : null;

  const transactions: DcaTransaction[] = [];
  const daily: DcaDailyPoint[] = [];
  const seenMonths = new Set<string>();
  let shares = 0;
  let contributed = 0;
  let realized = 0;
  let cycleInvested = 0;
  let monthIndex = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.close <= 0) continue;

    const ym = ymOf(p.date);
    if (!seenMonths.has(ym)) {
      seenMonths.add(ym);
      monthIndex += 1;

      const ma = maSeries ? maSeries[i] : null;
      const action = decideMonthly(strategy, baseAmount, {
        monthIndex,
        price: p.close,
        shares,
        cycleInvested,
        ma,
      });

      if (action) {
        if (action.kind === "buy" && action.amount > 0) {
          const sharesBought = action.amount / p.close;
          shares += sharesBought;
          contributed += action.amount;
          cycleInvested += action.amount;
          transactions.push({
            date: p.date,
            kind: "buy",
            price: p.close,
            amount: action.amount,
            sharesDelta: sharesBought,
            cumulativeShares: shares,
            cumulativeBuy: contributed,
            cumulativeSell: realized,
            valueAfter: shares * p.close + realized,
          });
        } else if (action.kind === "sell" && action.amount > 0) {
          const wantShares = action.amount / p.close;
          const sharesSold = Math.min(shares, wantShares);
          const actualAmount = sharesSold * p.close;
          shares -= sharesSold;
          realized += actualAmount;
          transactions.push({
            date: p.date,
            kind: "sell",
            price: p.close,
            amount: actualAmount,
            sharesDelta: -sharesSold,
            cumulativeShares: shares,
            cumulativeBuy: contributed,
            cumulativeSell: realized,
            valueAfter: shares * p.close + realized,
          });
        }
      }

      // Target-profit trigger fires after the monthly buy
      if (strategy === "tp" && shares > 0 && cycleInvested > 0) {
        const cycleValue = shares * p.close;
        const cycleGain = (cycleValue - cycleInvested) / cycleInvested;
        if (cycleGain >= TP_CONFIG.targetGain) {
          const sharesSold = shares;
          const sellAmount = sharesSold * p.close;
          shares = 0;
          realized += sellAmount;
          cycleInvested = 0;
          transactions.push({
            date: p.date,
            kind: "sell",
            price: p.close,
            amount: sellAmount,
            sharesDelta: -sharesSold,
            cumulativeShares: shares,
            cumulativeBuy: contributed,
            cumulativeSell: realized,
            valueAfter: realized,
          });
        }
      }
    }

    daily.push({
      date: p.date,
      close: p.close,
      shares,
      contributed,
      realized,
      value: shares * p.close + realized,
    });
  }

  if (transactions.length === 0) {
    throw new Error("no buy transactions");
  }

  const firstTx = transactions[0];
  const lastDay = daily[daily.length - 1];
  const months = monthIndex;
  const years = months / 12;
  const finalHoldings = lastDay.shares * lastDay.close;
  const finalValue = finalHoldings + realized;
  const totalContributed = contributed;
  const totalRealized = realized;
  const netInvested = totalContributed - totalRealized;
  const gain = finalValue - totalContributed;
  const totalReturnPct = totalContributed > 0 ? gain / totalContributed : 0;
  const multiple = totalContributed > 0 ? finalValue / totalContributed : 0;
  const cagr =
    years > 0 && multiple > 0 ? Math.pow(multiple, 1 / years) - 1 : 0;
  const buyCount = transactions.filter((t) => t.kind === "buy").length;
  const sellCount = transactions.length - buyCount;

  const nextBuyMonth = addMonth(ymOf(lastDay.date));
  const nextBuyDate = firstWeekdayOf(nextBuyMonth);
  const nextPrice = latestPrice ?? lastDay.close;

  let nextAmount = baseAmount;
  if (strategy === "va") {
    const target = baseAmount * (monthIndex + 1);
    const portfolio = shares * nextPrice;
    nextAmount = Math.max(0, target - portfolio);
  } else if (strategy === "ma" && nextPrice > 0) {
    const w = MA_CONFIG.window;
    if (points.length >= w) {
      let sum = 0;
      for (let i = points.length - w; i < points.length; i++) {
        sum += points[i].close;
      }
      const ma = sum / w;
      const dev = (nextPrice - ma) / ma;
      nextAmount = baseAmount * MA_CONFIG.multiplierFor(dev);
    }
  }

  const nextBuy: DcaNextBuy | null =
    nextAmount > 0
      ? {
          date: nextBuyDate,
          estimatedPrice: nextPrice,
          estimatedAmount: nextAmount,
          estimatedShares: nextPrice > 0 ? nextAmount / nextPrice : 0,
        }
      : null;

  return {
    strategyId: strategy,
    startDate: firstTx.date,
    endDate: lastDay.date,
    months,
    baseAmount,
    totalContributed,
    totalRealized,
    netInvested,
    finalShares: lastDay.shares,
    finalHoldings,
    finalValue,
    finalClose: lastDay.close,
    gain,
    totalReturnPct,
    cagr,
    multiple,
    buyCount,
    sellCount,
    transactions,
    daily,
    nextBuy,
  };
}
