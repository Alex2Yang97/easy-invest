import { t, type Locale } from "./i18n";

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

export function formatMonth(yyyyMm: string, locale: Locale): string {
  const [y, m] = yyyyMm.split("-");
  if (locale === "zh") {
    return `${y} 年 ${parseInt(m, 10)} 月`;
  }
  return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1).toLocaleString(
    "en-US",
    {
      month: "short",
      year: "numeric",
    },
  );
}

export function formatDate(isoDay: string, locale: Locale): string {
  const [y, m, d] = isoDay.split("-").map((s) => parseInt(s, 10));
  if (locale === "zh") {
    return `${y} 年 ${m} 月 ${d} 日`;
  }
  return new Date(y, m - 1, d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatYearOption(year: number, locale: Locale): string {
  return t(locale, "form.start.year", { y: year });
}

export function formatMonthOption(month: number, locale: Locale): string {
  return t(locale, "form.start.month", { m: String(month).padStart(2, "0") });
}

export function formatShares(n: number): string {
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(3);
  return n.toFixed(4);
}
