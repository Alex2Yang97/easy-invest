import { addMonth, firstWeekdayOf, ymOf } from "./dates";
import type { DailyPoint } from "./yahoo";

export type PortfolioAsset = {
  ticker: string;
  weight: number; // 0–1, weights sum to ~1.0
};

export type AssetSeries = {
  ticker: string;
  weight: number;
  points: DailyPoint[]; // aligned: identical length and dates across all series
};

export type PortfolioTransaction = {
  date: string;
  ticker: string;
  price: number;
  amount: number;
  sharesDelta: number;
  cumulativeShares: number;
};

export type PortfolioDailyAssetSnapshot = {
  shares: number;
  value: number;
  weight: number;
};

export type PortfolioDailyPoint = {
  date: string;
  totalValue: number;
  totalContributed: number;
  perAsset: Record<string, PortfolioDailyAssetSnapshot>;
};

export type PortfolioPerAssetSummary = {
  ticker: string;
  targetWeight: number;
  finalWeight: number;
  finalShares: number;
  finalPrice: number;
  finalValue: number;
  contributed: number;
  gain: number;
  totalReturnPct: number;
};

export type PortfolioNextBuy = {
  date: string;
  totalAmount: number;
  perAsset: { ticker: string; amount: number; price: number; shares: number }[];
};

export type PortfolioSummary = {
  startDate: string;
  endDate: string;
  months: number;
  baseAmount: number;
  totalContributed: number;
  finalValue: number;
  gain: number;
  totalReturnPct: number;
  cagr: number;
  multiple: number;
  perAsset: PortfolioPerAssetSummary[];
  transactions: PortfolioTransaction[];
  daily: PortfolioDailyPoint[];
  nextBuy: PortfolioNextBuy | null;
};

export function alignDailySeries(
  raw: { ticker: string; weight: number; points: DailyPoint[] }[],
): AssetSeries[] {
  if (raw.length === 0) return [];

  const cleaned = raw.map((s) => ({
    ticker: s.ticker,
    weight: s.weight,
    points: s.points.filter((p) => p.close > 0),
  }));

  const dateSets = cleaned.map((s) => new Set(s.points.map((p) => p.date)));
  const baseDates = cleaned[0].points.map((p) => p.date);
  const commonDates = baseDates.filter((d) =>
    dateSets.every((set) => set.has(d)),
  );

  const pointMaps = cleaned.map(
    (s) => new Map(s.points.map((p) => [p.date, p] as const)),
  );

  return cleaned.map((s, k) => ({
    ticker: s.ticker,
    weight: s.weight,
    points: commonDates.map((d) => pointMaps[k].get(d)!),
  }));
}

/**
 * Drift-buy allocation: each monthly contribution is distributed preferentially
 * to underweight assets, pushing the portfolio back toward target weights.
 * Never sells.
 */
function allocateDriftBuy(
  baseAmount: number,
  currentValue: number[],
  weights: number[],
): number[] {
  const totalCurrent = currentValue.reduce((s, v) => s + v, 0);
  const totalAfter = totalCurrent + baseAmount;
  const targetValue = weights.map((w) => totalAfter * w);
  const gap = currentValue.map((cv, k) => Math.max(0, targetValue[k] - cv));
  const totalGap = gap.reduce((s, v) => s + v, 0);

  if (totalGap <= 0) {
    return weights.map((w) => baseAmount * w);
  }
  if (totalGap >= baseAmount) {
    return gap.map((g) => (baseAmount * g) / totalGap);
  }
  const remainder = baseAmount - totalGap;
  return gap.map((g, k) => g + remainder * weights[k]);
}

export function simulatePortfolio(
  assets: AssetSeries[],
  baseAmount: number,
  latestPrices?: Record<string, number>,
): PortfolioSummary {
  if (assets.length < 2) {
    throw new Error("portfolio requires at least 2 assets");
  }
  const numDays = assets[0].points.length;
  if (numDays === 0) {
    throw new Error("no aligned history data");
  }
  for (const a of assets) {
    if (a.points.length !== numDays) {
      throw new Error("asset series not aligned");
    }
  }

  const tickers = assets.map((a) => a.ticker);
  const weights = assets.map((a) => a.weight);

  const shares: number[] = new Array(assets.length).fill(0);
  const contributedByAsset: number[] = new Array(assets.length).fill(0);
  const cumulativeSharesByAsset: number[] = new Array(assets.length).fill(0);

  const transactions: PortfolioTransaction[] = [];
  const daily: PortfolioDailyPoint[] = [];
  const seenMonths = new Set<string>();
  let totalContributed = 0;
  let monthIndex = 0;

  for (let i = 0; i < numDays; i++) {
    const date = assets[0].points[i].date;
    const prices = assets.map((a) => a.points[i].close);

    const ym = ymOf(date);
    if (!seenMonths.has(ym)) {
      seenMonths.add(ym);
      monthIndex += 1;

      const currentValue = shares.map((s, k) => s * prices[k]);
      const buy = allocateDriftBuy(baseAmount, currentValue, weights);

      for (let k = 0; k < assets.length; k++) {
        if (buy[k] <= 0 || prices[k] <= 0) continue;
        const sharesBought = buy[k] / prices[k];
        shares[k] += sharesBought;
        contributedByAsset[k] += buy[k];
        cumulativeSharesByAsset[k] = shares[k];
        totalContributed += buy[k];
        transactions.push({
          date,
          ticker: tickers[k],
          price: prices[k],
          amount: buy[k],
          sharesDelta: sharesBought,
          cumulativeShares: shares[k],
        });
      }
    }

    let totalValue = 0;
    const perAsset: Record<string, PortfolioDailyAssetSnapshot> = {};
    for (let k = 0; k < assets.length; k++) {
      const value = shares[k] * prices[k];
      totalValue += value;
      perAsset[tickers[k]] = { shares: shares[k], value, weight: 0 };
    }
    if (totalValue > 0) {
      for (const t of tickers) {
        perAsset[t].weight = perAsset[t].value / totalValue;
      }
    }
    daily.push({ date, totalValue, totalContributed, perAsset });
  }

  if (transactions.length === 0) {
    throw new Error("no buy transactions");
  }

  const lastDay = daily[daily.length - 1];
  const finalPrices = assets.map((a) => a.points[numDays - 1].close);

  const months = monthIndex;
  const years = months / 12;
  const finalValue = lastDay.totalValue;
  const gain = finalValue - totalContributed;
  const totalReturnPct = totalContributed > 0 ? gain / totalContributed : 0;
  const multiple = totalContributed > 0 ? finalValue / totalContributed : 0;
  const cagr =
    years > 0 && multiple > 0 ? Math.pow(multiple, 1 / years) - 1 : 0;

  const perAsset: PortfolioPerAssetSummary[] = assets.map((a, k) => {
    const finalAssetValue = shares[k] * finalPrices[k];
    const contributedK = contributedByAsset[k];
    const assetGain = finalAssetValue - contributedK;
    return {
      ticker: a.ticker,
      targetWeight: a.weight,
      finalWeight: finalValue > 0 ? finalAssetValue / finalValue : 0,
      finalShares: shares[k],
      finalPrice: finalPrices[k],
      finalValue: finalAssetValue,
      contributed: contributedK,
      gain: assetGain,
      totalReturnPct: contributedK > 0 ? assetGain / contributedK : 0,
    };
  });

  const nextBuyMonth = addMonth(ymOf(lastDay.date));
  const nextBuyDate = firstWeekdayOf(nextBuyMonth);
  const nextPrices = assets.map((a, k) => {
    const fromLatest = latestPrices?.[a.ticker];
    return fromLatest && fromLatest > 0 ? fromLatest : finalPrices[k];
  });
  const currentValueAtNext = shares.map((s, k) => s * nextPrices[k]);
  const nextBuyAmounts = allocateDriftBuy(
    baseAmount,
    currentValueAtNext,
    weights,
  );
  const totalNextAmount = nextBuyAmounts.reduce((s, v) => s + v, 0);
  const nextBuy: PortfolioNextBuy | null =
    totalNextAmount > 0
      ? {
          date: nextBuyDate,
          totalAmount: totalNextAmount,
          perAsset: assets.map((a, k) => ({
            ticker: a.ticker,
            amount: nextBuyAmounts[k],
            price: nextPrices[k],
            shares: nextPrices[k] > 0 ? nextBuyAmounts[k] / nextPrices[k] : 0,
          })),
        }
      : null;

  const firstTx = transactions[0];
  return {
    startDate: firstTx.date,
    endDate: lastDay.date,
    months,
    baseAmount,
    totalContributed,
    finalValue,
    gain,
    totalReturnPct,
    cagr,
    multiple,
    perAsset,
    transactions,
    daily,
    nextBuy,
  };
}
