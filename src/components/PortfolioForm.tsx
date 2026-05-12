"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatMonthOption, formatYearOption } from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";
import {
  PORTFOLIO_MAX_ASSETS,
  PORTFOLIO_MIN_ASSETS,
  isValidTicker,
} from "@/lib/params";

type Row = { ticker: string; weight: string };

type Props = {
  locale: Locale;
  defaultAssets?: { ticker: string; weight: number }[];
  defaultStart?: string;
  defaultAmount?: number;
  compact?: boolean;
};

const AMOUNT_CHIPS = [100, 500, 1000, 2000];
const DEFAULT_ROWS: Row[] = [
  { ticker: "VTI", weight: "60" },
  { ticker: "TLT", weight: "40" },
];

export function PortfolioForm({
  locale,
  defaultAssets,
  defaultStart = "2018-01",
  defaultAmount = 500,
  compact = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState<Row[]>(
    defaultAssets && defaultAssets.length >= PORTFOLIO_MIN_ASSETS
      ? defaultAssets.map((a) => ({
          ticker: a.ticker,
          weight: String(a.weight),
        }))
      : DEFAULT_ROWS,
  );
  const [start, setStart] = useState(defaultStart);
  const [amount, setAmount] = useState(String(defaultAmount));

  const trimmedTickers = rows.map((r) => r.ticker.trim().toUpperCase());
  const sumWeight = rows.reduce(
    (s, r) => s + (parseInt(r.weight, 10) || 0),
    0,
  );
  const hasDup = trimmedTickers.some(
    (t, i) => t.length > 0 && trimmedTickers.indexOf(t) !== i,
  );
  const allTickersValid = trimmedTickers.every((t) => t && isValidTicker(t));
  const allWeightsValid = rows.every((r) => {
    const w = parseInt(r.weight, 10);
    return Number.isFinite(w) && w > 0 && w <= 100;
  });
  const canSubmit =
    !pending &&
    sumWeight === 100 &&
    allTickersValid &&
    allWeightsValid &&
    !hasDup &&
    rows.length >= PORTFOLIO_MIN_ASSETS;

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  }
  function removeRow(i: number) {
    if (rows.length <= PORTFOLIO_MIN_ASSETS) return;
    setRows((rs) => rs.filter((_, k) => k !== i));
  }
  function addRow() {
    if (rows.length >= PORTFOLIO_MAX_ASSETS) return;
    setRows((rs) => [...rs, { ticker: "", weight: "" }]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const assetsStr = rows
      .map(
        (r) =>
          `${r.ticker.trim().toUpperCase()}:${parseInt(r.weight, 10)}`,
      )
      .join(",");
    const amt = Math.max(1, Number(amount) || 0);
    const q = new URLSearchParams({
      assets: assetsStr,
      start,
      amount: String(amt),
    });
    startTransition(() => {
      router.push(`/portfolio?${q.toString()}`);
    });
  }

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1990 + 1 }, (_, i) => 1990 + i);
  const [startY, startM] = start.split("-");
  const amountNum = Number(amount) || 0;

  let weightHint: { text: string; tone: "ok" | "warn" | "err" };
  if (hasDup) {
    weightHint = {
      text: t(locale, "portfolio.form.weightDup"),
      tone: "err",
    };
  } else if (sumWeight === 100) {
    weightHint = {
      text: t(locale, "portfolio.form.weightOk", { sum: sumWeight }),
      tone: "ok",
    };
  } else {
    weightHint = {
      text: t(locale, "portfolio.form.weightOff", { sum: sumWeight }),
      tone: "warn",
    };
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-7">
      <Field
        label={t(locale, "portfolio.form.assets.label")}
        help={t(locale, "portfolio.form.assets.help")}
      >
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => {
            const isDup =
              trimmedTickers[i].length > 0 &&
              trimmedTickers.indexOf(trimmedTickers[i]) !== i;
            return (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={t(
                    locale,
                    "portfolio.form.assets.tickerPlaceholder",
                  )}
                  value={r.ticker}
                  onChange={(e) =>
                    updateRow(i, { ticker: e.target.value.toUpperCase() })
                  }
                  className={`flex-1 min-w-0 rounded-xl border bg-card px-3 py-2.5 text-[14px] font-mono uppercase outline-none focus:border-foreground/60 ${
                    isDup ? "border-loss/60" : "border-line"
                  }`}
                />
                <div className="relative w-20 shrink-0">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100}
                    step={1}
                    placeholder="0"
                    value={r.weight}
                    onChange={(e) =>
                      updateRow(i, {
                        weight: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    className="w-full rounded-xl border border-line bg-card pl-3 pr-7 py-2.5 text-[14px] tabular outline-none focus:border-foreground/60"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted">
                    %
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= PORTFOLIO_MIN_ASSETS}
                  aria-label={t(locale, "portfolio.form.assets.remove")}
                  className="size-9 shrink-0 rounded-lg border border-line bg-card text-muted hover:border-foreground/40 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ×
                </button>
              </div>
            );
          })}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={addRow}
              disabled={rows.length >= PORTFOLIO_MAX_ASSETS}
              className="text-[12px] text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              {t(locale, "portfolio.form.assets.add")}
            </button>
            <span
              className={`text-[12px] tabular ${
                weightHint.tone === "ok"
                  ? "text-accent"
                  : weightHint.tone === "err"
                    ? "text-loss"
                    : "text-muted"
              }`}
            >
              {weightHint.text}
            </span>
          </div>
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label={t(locale, "form.start.label")}
          help={t(locale, "form.start.help")}
        >
          <div className="flex gap-2">
            <select
              value={startY}
              onChange={(e) => setStart(`${e.target.value}-${startM}`)}
              className="flex-1 rounded-xl border border-line bg-card px-3 py-3 text-[15px] outline-none focus:border-foreground/60"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {formatYearOption(y, locale)}
                </option>
              ))}
            </select>
            <select
              value={startM}
              onChange={(e) => setStart(`${startY}-${e.target.value}`)}
              className="flex-1 rounded-xl border border-line bg-card px-3 py-3 text-[15px] outline-none focus:border-foreground/60"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={String(m).padStart(2, "0")}>
                  {formatMonthOption(m, locale)}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <Field
          label={t(locale, "form.amount.label")}
          help={t(locale, "form.amount.help")}
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={1000000}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-line bg-card pl-8 pr-4 py-3 text-[15px] tabular outline-none focus:border-foreground/60"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {AMOUNT_CHIPS.map((chip) => {
              const active = amountNum === chip;
              return (
                <button
                  type="button"
                  key={chip}
                  onClick={() => setAmount(String(chip))}
                  className={`rounded-md border px-2.5 py-1 text-[11px] tabular transition ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-line bg-card text-muted hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  ${chip}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3.5 text-[15px] font-semibold text-background transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending
          ? t(locale, "form.submit.pending")
          : compact
            ? t(locale, "portfolio.form.submit.compact")
            : t(locale, "portfolio.form.submit.first")}
      </button>
    </form>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold tracking-wide">{label}</span>
      </div>
      {children}
      {help && (
        <div className="mt-1.5 text-[11px] text-muted leading-snug">{help}</div>
      )}
    </label>
  );
}
