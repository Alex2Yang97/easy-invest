export type StrategyId = "vanilla" | "va" | "ma" | "tp";

export const STRATEGY_IDS: readonly StrategyId[] = [
  "vanilla",
  "va",
  "ma",
  "tp",
] as const;

export const DEFAULT_STRATEGY: StrategyId = "vanilla";

export function isStrategyId(v: unknown): v is StrategyId {
  return (
    typeof v === "string" && (STRATEGY_IDS as readonly string[]).includes(v)
  );
}

export const MA_CONFIG = {
  window: 200,
  multiplierFor(deviation: number): number {
    if (deviation >= 0) return 0.5;
    if (deviation >= -0.1) return 1.0;
    if (deviation >= -0.2) return 1.5;
    return 2.0;
  },
};

export const TP_CONFIG = {
  targetGain: 0.3,
};
