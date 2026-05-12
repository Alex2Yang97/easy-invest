import { z } from "zod";
import {
  DEFAULT_STRATEGY,
  isStrategyId,
  type StrategyId,
} from "./strategies";

const monthRe = /^\d{4}-(0[1-9]|1[0-2])$/;

export const BacktestParams = z.object({
  ticker: z
    .string()
    .trim()
    .min(1)
    .max(15)
    .transform((v) => v.toUpperCase()),
  start: z.string().regex(monthRe),
  amount: z.coerce.number().positive().max(1_000_000),
  strategy: z
    .string()
    .optional()
    .transform((v): StrategyId =>
      v && isStrategyId(v) ? v : DEFAULT_STRATEGY,
    ),
});

export type BacktestParamsT = z.infer<typeof BacktestParams>;

export type ParamsErrorKey =
  | "error.params.ticker"
  | "error.params.start"
  | "error.params.amount";

export function parseParams(sp: Record<string, string | string[] | undefined>):
  | { ok: true; data: BacktestParamsT }
  | { ok: false; errorKey: ParamsErrorKey } {
  const raw = {
    ticker: typeof sp.ticker === "string" ? sp.ticker : "",
    start: typeof sp.start === "string" ? sp.start : "",
    amount: typeof sp.amount === "string" ? sp.amount : "",
    strategy: typeof sp.strategy === "string" ? sp.strategy : undefined,
  };
  const parsed = BacktestParams.safeParse(raw);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    if (field === "ticker") return { ok: false, errorKey: "error.params.ticker" };
    if (field === "start") return { ok: false, errorKey: "error.params.start" };
    return { ok: false, errorKey: "error.params.amount" };
  }
  return { ok: true, data: parsed.data };
}

export function buildBacktestUrl(p: BacktestParamsT): string {
  const q = new URLSearchParams({
    ticker: p.ticker,
    start: p.start,
    amount: String(p.amount),
  });
  if (p.strategy !== DEFAULT_STRATEGY) {
    q.set("strategy", p.strategy);
  }
  return `/backtest?${q.toString()}`;
}
