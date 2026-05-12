"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PRESETS } from "@/lib/presets";

type Props = {
  defaultTicker?: string;
  defaultStart?: string;
  defaultAmount?: number;
  compact?: boolean;
};

const AMOUNT_CHIPS = [100, 500, 1000, 2000];

export function BacktestForm({
  defaultTicker = "SPY",
  defaultStart = "2015-01",
  defaultAmount = 500,
  compact = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [ticker, setTicker] = useState(defaultTicker);
  const [customTicker, setCustomTicker] = useState(
    PRESETS.some((p) => p.ticker === defaultTicker) ? "" : defaultTicker,
  );
  const [start, setStart] = useState(defaultStart);
  const [amount, setAmount] = useState(String(defaultAmount));

  const isCustom = !PRESETS.some((p) => p.ticker === ticker);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalTicker = (isCustom ? customTicker : ticker).trim().toUpperCase();
    if (!finalTicker) return;
    const amt = Math.max(1, Number(amount) || 0);
    const q = new URLSearchParams({
      ticker: finalTicker,
      start,
      amount: String(amt),
    });
    startTransition(() => {
      router.push(`/backtest?${q.toString()}`);
    });
  }

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1990 + 1 }, (_, i) => 1990 + i);
  const [startY, startM] = start.split("-");
  const amountNum = Number(amount) || 0;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-7">
      <Field
        labelZh="选择标的"
        labelEn="Pick an asset"
        helpZh="6 个常用预设，或输入任意美股代码（如 TSLA、NVDA）"
        helpEn="6 presets, or any US ticker"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESETS.map((p) => {
            const active = ticker === p.ticker;
            return (
              <button
                type="button"
                key={p.ticker}
                onClick={() => setTicker(p.ticker)}
                className={`text-left rounded-xl border px-3 py-2.5 transition ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-line bg-card hover:border-foreground/40"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[15px] font-semibold leading-tight">
                    {p.nameZh}
                  </span>
                  <span
                    className={`text-[10px] tabular tracking-wide ${
                      active ? "opacity-70" : "text-muted"
                    }`}
                  >
                    {p.ticker}
                  </span>
                </div>
                <div
                  className={`mt-1 text-[11px] leading-snug ${
                    active ? "opacity-80" : "text-muted"
                  }`}
                >
                  {p.nameEn}
                </div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setTicker("__custom__")}
            className={`text-left rounded-xl border px-3 py-2.5 transition ${
              isCustom
                ? "border-foreground bg-foreground text-background"
                : "border-line border-dashed bg-card hover:border-foreground/40"
            }`}
          >
            <div className="text-[15px] font-semibold leading-tight">
              自定义
            </div>
            <div
              className={`mt-1 text-[11px] leading-snug ${
                isCustom ? "opacity-80" : "text-muted"
              }`}
            >
              Custom ticker
            </div>
          </button>
        </div>

        {isCustom && (
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="例如 / e.g. TSLA, NVDA, AAPL"
            value={customTicker}
            onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
            className="mt-3 w-full rounded-xl border border-line bg-card px-4 py-3 text-[15px] font-mono uppercase outline-none focus:border-foreground/60"
          />
        )}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          labelZh="起始月份"
          labelEn="Start month"
          helpZh="每月第一个交易日买入"
          helpEn="Buys on the 1st trading day each month"
        >
          <div className="flex gap-2">
            <select
              value={startY}
              onChange={(e) => setStart(`${e.target.value}-${startM}`)}
              className="flex-1 rounded-xl border border-line bg-card px-3 py-3 text-[15px] outline-none focus:border-foreground/60"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y} 年
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
                  {String(m).padStart(2, "0")} 月
                </option>
              ))}
            </select>
          </div>
        </Field>

        <Field
          labelZh="月投金额"
          labelEn="Monthly amount"
          helpZh="每月定投美元金额，任意正数"
          helpEn="USD per month, any positive number"
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
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3.5 text-[15px] font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
      >
        {pending
          ? "计算中… / Crunching…"
          : compact
            ? "重新计算 / Recompute"
            : "看回测 / See backtest →"}
      </button>
    </form>
  );
}

function Field({
  labelZh,
  labelEn,
  helpZh,
  helpEn,
  children,
}: {
  labelZh: string;
  labelEn: string;
  helpZh?: string;
  helpEn?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold tracking-wide">
          {labelZh}{" "}
          <span className="text-muted font-normal">/ {labelEn}</span>
        </span>
      </div>
      {children}
      {(helpZh || helpEn) && (
        <div className="mt-1.5 text-[11px] text-muted leading-snug">
          {helpZh && <span>{helpZh}</span>}
          {helpZh && helpEn && <span> · </span>}
          {helpEn && <span>{helpEn}</span>}
        </div>
      )}
    </label>
  );
}
