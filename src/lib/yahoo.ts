import "server-only";
import YahooFinance from "yahoo-finance2";
import { alignDailySeries, type AssetSeries } from "./portfolio";

const yf = new YahooFinance({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

export type DailyPoint = {
  date: string;
  close: number;
};

export type HistoryError = {
  ok: false;
  errorKey: string;
  errorParams?: Record<string, string>;
};

export type HistoryResult =
  | {
      ok: true;
      ticker: string;
      points: DailyPoint[];
      nameLong?: string;
      latestPrice?: number;
      latestDate?: string;
    }
  | HistoryError;

function isoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function fetchDailyHistory(
  ticker: string,
  startMonth: string,
): Promise<HistoryResult> {
  const symbol = ticker.trim().toUpperCase();
  const [yStr, mStr] = startMonth.split("-");
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  if (!Number.isFinite(y) || !Number.isFinite(m)) {
    return { ok: false, errorKey: "error.invalidMonth" };
  }

  const period1 = new Date(Date.UTC(y, m - 1, 1));
  const now = new Date();
  if (period1 > now) {
    return { ok: false, errorKey: "error.futureMonth" };
  }

  try {
    const [chart, quote] = await Promise.all([
      yf.chart(symbol, {
        period1,
        period2: now,
        interval: "1d",
      }),
      yf.quote(symbol).catch(() => null),
    ]);

    const quotes = chart.quotes ?? [];
    const points: DailyPoint[] = [];
    for (const q of quotes) {
      const close = q.adjclose ?? q.close;
      if (close == null || !q.date) continue;
      points.push({ date: isoDate(new Date(q.date)), close });
    }

    if (points.length < 20) {
      return {
        ok: false,
        errorKey: "error.notEnoughData",
        errorParams: { ticker: symbol, start: startMonth },
      };
    }

    const last = points[points.length - 1];
    const latestPrice =
      quote?.regularMarketPrice ?? quote?.postMarketPrice ?? last.close;

    return {
      ok: true,
      ticker: symbol,
      points,
      nameLong: quote?.longName ?? quote?.shortName ?? undefined,
      latestPrice,
      latestDate: last.date,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/Not Found|not found|HTTP 404/i.test(msg)) {
      return {
        ok: false,
        errorKey: "error.notFound",
        errorParams: { ticker: symbol },
      };
    }
    return {
      ok: false,
      errorKey: "error.fetchFailed",
      errorParams: { msg: msg.slice(0, 120) },
    };
  }
}

export type PortfolioHistoryAssetMeta = {
  ticker: string;
  weight: number;
  nameLong?: string;
  latestPrice?: number;
  latestDate?: string;
  earliestDate: string;
};

export type PortfolioHistoryResult =
  | {
      ok: true;
      series: AssetSeries[];
      meta: PortfolioHistoryAssetMeta[];
    }
  | HistoryError;

export async function fetchPortfolioHistory(
  assets: { ticker: string; weight: number }[],
  startMonth: string,
): Promise<PortfolioHistoryResult> {
  const results = await Promise.all(
    assets.map((a) => fetchDailyHistory(a.ticker, startMonth)),
  );

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r.ok) return r;
  }

  const okResults = results as Extract<HistoryResult, { ok: true }>[];

  // Reject if any asset's earliest available date is later than startMonth
  for (let i = 0; i < okResults.length; i++) {
    const earliest = okResults[i].points[0]?.date ?? "";
    if (earliest.slice(0, 7) > startMonth) {
      return {
        ok: false,
        errorKey: "error.portfolio.startTooLate",
        errorParams: {
          ticker: okResults[i].ticker,
          earliest: earliest.slice(0, 7),
        },
      };
    }
  }

  const raw = okResults.map((r, i) => ({
    ticker: r.ticker,
    weight: assets[i].weight,
    points: r.points,
  }));
  const series = alignDailySeries(raw);

  if (series.length === 0 || series[0].points.length < 20) {
    return {
      ok: false,
      errorKey: "error.portfolio.notEnoughOverlap",
    };
  }

  const meta: PortfolioHistoryAssetMeta[] = okResults.map((r, i) => ({
    ticker: r.ticker,
    weight: assets[i].weight,
    nameLong: r.nameLong,
    latestPrice: r.latestPrice,
    latestDate: r.latestDate,
    earliestDate: r.points[0]?.date ?? "",
  }));

  return { ok: true, series, meta };
}
