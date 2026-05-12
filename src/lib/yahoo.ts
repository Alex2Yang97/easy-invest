import "server-only";
import YahooFinance from "yahoo-finance2";

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
