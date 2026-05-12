import type { MonthlyPoint } from "./yahoo";

export type DcaPoint = {
  month: string;
  contributed: number;
  shares: number;
  value: number;
  close: number;
};

export type DcaSummary = {
  startMonth: string;
  endMonth: string;
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
  series: DcaPoint[];
};

export function simulateDca(
  points: MonthlyPoint[],
  monthlyAmount: number,
): DcaSummary {
  if (points.length === 0) {
    throw new Error("没有可用历史数据");
  }

  let contributed = 0;
  let shares = 0;
  const series: DcaPoint[] = [];

  for (const p of points) {
    if (p.close <= 0) continue;
    contributed += monthlyAmount;
    shares += monthlyAmount / p.close;
    series.push({
      month: p.month,
      contributed,
      shares,
      close: p.close,
      value: shares * p.close,
    });
  }

  const first = series[0];
  const last = series[series.length - 1];
  const months = series.length;
  const years = months / 12;
  const finalValue = last.value;
  const totalContributed = last.contributed;
  const gain = finalValue - totalContributed;
  const totalReturnPct = gain / totalContributed;
  const multiple = finalValue / totalContributed;
  const cagr = years > 0 ? Math.pow(multiple, 1 / years) - 1 : 0;

  return {
    startMonth: first.month,
    endMonth: last.month,
    months,
    monthlyAmount,
    totalContributed,
    finalShares: last.shares,
    finalValue,
    finalClose: last.close,
    gain,
    totalReturnPct,
    cagr,
    multiple,
    series,
  };
}
