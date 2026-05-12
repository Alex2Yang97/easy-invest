import "server-only";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

export type MonthlyPoint = {
  month: string;
  close: number;
};

export type HistoryResult =
  | { ok: true; ticker: string; points: MonthlyPoint[]; nameLong?: string }
  | { ok: false; error: string };

function ym(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function fetchMonthlyHistory(
  ticker: string,
  startMonth: string,
): Promise<HistoryResult> {
  const symbol = ticker.trim().toUpperCase();
  const [yStr, mStr] = startMonth.split("-");
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  if (!Number.isFinite(y) || !Number.isFinite(m)) {
    return { ok: false, error: "起始月份格式错误" };
  }

  const period1 = new Date(Date.UTC(y, m - 1, 1));
  const now = new Date();
  if (period1 > now) {
    return { ok: false, error: "起始月份不能在未来" };
  }

  try {
    const [chart, quote] = await Promise.all([
      yf.chart(symbol, {
        period1,
        period2: now,
        interval: "1mo",
      }),
      yf.quote(symbol).catch(() => null),
    ]);

    const quotes = chart.quotes ?? [];
    const points: MonthlyPoint[] = [];
    for (const q of quotes) {
      const close = q.adjclose ?? q.close;
      if (close == null || !q.date) continue;
      points.push({ month: ym(new Date(q.date)), close });
    }

    if (points.length < 2) {
      return {
        ok: false,
        error: `「${symbol}」在 ${startMonth} 之后没有足够的历史数据`,
      };
    }

    return {
      ok: true,
      ticker: symbol,
      points,
      nameLong: quote?.longName ?? quote?.shortName ?? undefined,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/Not Found|not found|HTTP 404/i.test(msg)) {
      return { ok: false, error: `找不到代码「${symbol}」，请检查` };
    }
    return { ok: false, error: `数据获取失败: ${msg.slice(0, 120)}` };
  }
}
