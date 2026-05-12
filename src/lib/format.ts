export function formatUSD(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}×`;
}

export function formatMonth(yyyyMm: string): { zh: string; en: string } {
  const [y, m] = yyyyMm.split("-");
  return {
    zh: `${y} 年 ${parseInt(m, 10)} 月`,
    en: new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1).toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    }),
  };
}
