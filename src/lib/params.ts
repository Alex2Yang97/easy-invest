import { z } from "zod";

const monthRe = /^\d{4}-(0[1-9]|1[0-2])$/;

export const BacktestParams = z.object({
  ticker: z
    .string()
    .trim()
    .min(1)
    .max(15)
    .transform((v) => v.toUpperCase()),
  start: z.string().regex(monthRe, "格式应为 YYYY-MM"),
  amount: z.coerce.number().positive().max(1_000_000),
});

export type BacktestParamsT = z.infer<typeof BacktestParams>;

export function parseParams(sp: Record<string, string | string[] | undefined>):
  | { ok: true; data: BacktestParamsT }
  | { ok: false; error: string } {
  const raw = {
    ticker: typeof sp.ticker === "string" ? sp.ticker : "",
    start: typeof sp.start === "string" ? sp.start : "",
    amount: typeof sp.amount === "string" ? sp.amount : "",
  };
  const parsed = BacktestParams.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  return { ok: true, data: parsed.data };
}

export function buildBacktestUrl(p: BacktestParamsT): string {
  const q = new URLSearchParams({
    ticker: p.ticker,
    start: p.start,
    amount: String(p.amount),
  });
  return `/backtest?${q.toString()}`;
}
