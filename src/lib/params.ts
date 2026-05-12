import { z } from "zod";
import {
  DEFAULT_STRATEGY,
  isStrategyId,
  type StrategyId,
} from "./strategies";

const monthRe = /^\d{4}-(0[1-9]|1[0-2])$/;
const tickerRe = /^[A-Z0-9.\-=^]{1,15}$/;
const assetSpecRe = /^([A-Z0-9.\-=^]{1,15}):(\d{1,3})$/;

export const PORTFOLIO_MIN_ASSETS = 2;
export const PORTFOLIO_MAX_ASSETS = 8;

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

export type PortfolioAssetSpec = { ticker: string; weight: number };

export type PortfolioParamsT = {
  assets: PortfolioAssetSpec[];
  start: string;
  amount: number;
};

export type PortfolioParamsErrorKey =
  | "error.params.assets"
  | "error.params.assetsCount"
  | "error.params.assetsDup"
  | "error.params.weightSum"
  | "error.params.start"
  | "error.params.amount";

function parseAssetsParam(raw: string):
  | { ok: true; assets: PortfolioAssetSpec[] }
  | { ok: false; errorKey: PortfolioParamsErrorKey } {
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length < PORTFOLIO_MIN_ASSETS || parts.length > PORTFOLIO_MAX_ASSETS) {
    return { ok: false, errorKey: "error.params.assetsCount" };
  }
  const assets: PortfolioAssetSpec[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const m = part.toUpperCase().match(assetSpecRe);
    if (!m) return { ok: false, errorKey: "error.params.assets" };
    const ticker = m[1];
    const weight = parseInt(m[2], 10);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 100) {
      return { ok: false, errorKey: "error.params.weightSum" };
    }
    if (seen.has(ticker)) {
      return { ok: false, errorKey: "error.params.assetsDup" };
    }
    seen.add(ticker);
    assets.push({ ticker, weight });
  }
  const sum = assets.reduce((s, a) => s + a.weight, 0);
  if (sum !== 100) {
    return { ok: false, errorKey: "error.params.weightSum" };
  }
  return { ok: true, assets };
}

export function parsePortfolioParams(
  sp: Record<string, string | string[] | undefined>,
):
  | { ok: true; data: PortfolioParamsT }
  | { ok: false; errorKey: PortfolioParamsErrorKey } {
  const rawAssets = typeof sp.assets === "string" ? sp.assets : "";
  const rawStart = typeof sp.start === "string" ? sp.start : "";
  const rawAmount = typeof sp.amount === "string" ? sp.amount : "";

  const parsedAssets = parseAssetsParam(rawAssets);
  if (!parsedAssets.ok) return parsedAssets;

  if (!monthRe.test(rawStart)) {
    return { ok: false, errorKey: "error.params.start" };
  }
  const amount = Number(rawAmount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
    return { ok: false, errorKey: "error.params.amount" };
  }

  // Normalize: store weights as integer percents in URL; engine uses fractions
  return {
    ok: true,
    data: { assets: parsedAssets.assets, start: rawStart, amount },
  };
}

export function buildPortfolioUrl(p: PortfolioParamsT): string {
  const assetsStr = p.assets
    .map((a) => `${a.ticker}:${a.weight}`)
    .join(",");
  const q = new URLSearchParams({
    assets: assetsStr,
    start: p.start,
    amount: String(p.amount),
  });
  return `/portfolio?${q.toString()}`;
}

export function isValidTicker(v: string): boolean {
  return tickerRe.test(v);
}
