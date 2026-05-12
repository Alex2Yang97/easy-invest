import Link from "next/link";
import type { Metadata } from "next";
import { BacktestForm } from "@/components/BacktestForm";
import { GrowthChart } from "@/components/GrowthChart";
import { ShareButton } from "@/components/ShareButton";
import { TransactionLog } from "@/components/TransactionLog";
import { simulateDca, type DcaNextBuy } from "@/lib/dca";
import {
  formatDate,
  formatMultiple,
  formatPercent,
  formatShares,
  formatUSD,
} from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/locale.server";
import { parseParams } from "@/lib/params";
import { findPreset, presetName } from "@/lib/presets";
import { fetchDailyHistory } from "@/lib/yahoo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const locale = await getLocale();
  const parsed = parseParams(sp);
  if (!parsed.ok) return { title: t(locale, "meta.title") };
  const { ticker, start, amount } = parsed.data;
  const amountStr = formatUSD(amount);
  const ogUrl = `/api/og?ticker=${encodeURIComponent(
    ticker,
  )}&start=${start}&amount=${amount}&lang=${locale}`;
  return {
    title: t(locale, "meta.backtest.title", {
      ticker,
      start,
      amount: amountStr,
    }),
    description: t(locale, "meta.backtest.description", {
      ticker,
      start,
      amount: amountStr,
    }),
    openGraph: {
      title: t(locale, "meta.og.title", { ticker }),
      description: t(locale, "meta.og.description", {
        start,
        amount: amountStr,
      }),
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogUrl],
    },
  };
}

export default async function BacktestPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const parsed = parseParams(sp);

  if (!parsed.ok) {
    return (
      <ErrorView
        locale={locale}
        title={t(locale, "error.params.title")}
        detail={t(locale, parsed.errorKey)}
      />
    );
  }
  const { ticker, start, amount } = parsed.data;

  const history = await fetchDailyHistory(ticker, start);
  if (!history.ok) {
    return (
      <ErrorView
        locale={locale}
        title={t(locale, "error.fetch.title")}
        detail={t(locale, history.errorKey, history.errorParams)}
        ticker={ticker}
        start={start}
        amount={amount}
      />
    );
  }

  const summary = simulateDca(history.points, amount, history.latestPrice);
  const preset = findPreset(ticker);
  const assetName = preset
    ? presetName(preset, locale)
    : history.nameLong ?? ticker;
  const startLabel = formatDate(summary.startDate, locale);
  const endLabel = formatDate(summary.endDate, locale);
  const gainPositive = summary.gain >= 0;
  const accentClass = gainPositive ? "text-accent" : "text-loss";

  return (
    <div className="flex-1 flex flex-col">
      <main className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-8 sm:py-12">
        <nav className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-[13px] text-muted hover:text-foreground transition inline-flex items-center gap-1.5"
          >
            <span>←</span>
            <span>{t(locale, "nav.back")}</span>
          </Link>
          <ShareButton locale={locale} />
        </nav>

        <header className="mb-8">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-[11px] font-mono tabular tracking-wider text-muted bg-card border border-line rounded-md px-2 py-0.5">
              {ticker}
            </span>
            <span className="text-[13px] text-muted">
              {startLabel} → {endLabel}
            </span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {t(locale, "result.title", {
              date: startLabel,
              amount: formatUSD(amount),
              asset: assetName,
            })}
          </h1>
        </header>

        <section className="rounded-2xl border border-line bg-card p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
          <div className="text-[12px] text-muted mb-2">
            {t(locale, "result.youdHave")}
          </div>
          <div
            className={`text-5xl sm:text-6xl font-bold tracking-tight tabular ${accentClass}`}
          >
            {formatUSD(summary.finalValue)}
          </div>
          <div className="mt-3 flex items-baseline gap-2 text-[14px] tabular">
            <span className={`font-semibold ${accentClass}`}>
              {gainPositive ? "+" : ""}
              {formatUSD(summary.gain)}
            </span>
            <span className="text-muted">
              ({formatPercent(summary.totalReturnPct)} ·{" "}
              {formatMultiple(summary.multiple)})
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <Stat
              label={t(locale, "result.stat.invested")}
              value={formatUSD(summary.totalContributed)}
            />
            <Stat
              label={t(locale, "result.stat.shares")}
              value={formatShares(summary.finalShares)}
              sub={`@ ${formatUSD(summary.finalClose)}`}
            />
            <Stat
              label={t(locale, "result.stat.months")}
              value={`${summary.months}`}
              sub={t(locale, "result.stat.monthsSub", {
                years: (summary.months / 12).toFixed(1),
              })}
            />
            <Stat
              label={t(locale, "result.stat.cagr")}
              value={formatPercent(summary.cagr)}
              valueClass={accentClass}
            />
          </div>

          <div className="mt-7 -mx-2 sm:mx-0">
            <GrowthChart
              locale={locale}
              daily={summary.daily}
              transactions={summary.transactions}
              gainPositive={gainPositive}
            />
          </div>
          <Legend locale={locale} />
        </section>

        {summary.nextBuy && (
          <NextDcaCard
            locale={locale}
            nextBuy={summary.nextBuy}
            assetName={assetName}
            latestDate={history.latestDate}
          />
        )}

        <section className="mt-8 rounded-2xl border border-line bg-card p-5 sm:p-7">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 className="text-[13px] font-semibold tracking-wide">
              {t(locale, "result.txns.section")}
            </h2>
            <span className="text-[11px] text-muted tabular">
              {t(locale, "result.txns.count", {
                n: summary.transactions.length,
              })}
            </span>
          </div>
          <TransactionLog
            locale={locale}
            transactions={summary.transactions}
          />
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-card/70 p-5 sm:p-7">
          <h2 className="text-[13px] font-semibold mb-4 tracking-wide">
            {t(locale, "result.tweakSection")}
          </h2>
          <BacktestForm
            locale={locale}
            defaultTicker={ticker}
            defaultStart={start}
            defaultAmount={amount}
            compact
          />
        </section>

        <footer className="mt-10 text-[11px] text-muted leading-relaxed">
          <p>{t(locale, "result.footer.dataSource")}</p>
          <p className="mt-3">{t(locale, "result.footer.disclaimer")}</p>
        </footer>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-[11px] text-muted leading-tight">{label}</div>
      <div
        className={`mt-1 text-lg sm:text-xl font-semibold tabular ${valueClass ?? ""}`}
      >
        {value}
      </div>
      {sub && <div className="text-[10.5px] text-muted tabular">{sub}</div>}
    </div>
  );
}

function Legend({ locale }: { locale: Locale }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-[2px] w-4 rounded bg-accent" />
        {t(locale, "result.legend.value")}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-[2px] w-4 border-t-2 border-dashed border-muted" />
        {t(locale, "result.legend.invested")}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-1.5 rounded-full bg-accent" />
        {t(locale, "result.legend.buy")}
      </span>
    </div>
  );
}

function NextDcaCard({
  locale,
  nextBuy,
  assetName,
  latestDate,
}: {
  locale: Locale;
  nextBuy: DcaNextBuy;
  assetName: string;
  latestDate?: string;
}) {
  const nextLabel = formatDate(nextBuy.date, locale);
  const priceLabel = latestDate ? formatDate(latestDate, locale) : "";
  const priceFmt = formatUSD(nextBuy.estimatedPrice);
  return (
    <section className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/40 p-5 sm:p-7">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="inline-block size-1.5 rounded-full bg-accent" />
        <h2 className="text-[13px] font-semibold tracking-wide">
          {t(locale, "next.section")}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Stat label={t(locale, "next.estDate")} value={nextLabel} />
        <Stat
          label={t(locale, "next.amount")}
          value={formatUSD(nextBuy.monthlyAmount)}
          sub={t(locale, "next.amountSub", { asset: assetName })}
        />
        <Stat
          label={t(locale, "next.estShares")}
          value={formatShares(nextBuy.estimatedShares)}
          sub={t(locale, "next.estSharesSub", {
            price: priceFmt,
            dateLabel: priceLabel,
          })}
        />
      </div>
      <p className="mt-4 text-[11px] text-muted leading-snug">
        {t(locale, "next.note", { price: priceFmt, dateLabel: priceLabel })}
      </p>
    </section>
  );
}

function ErrorView({
  locale,
  title,
  detail,
  ticker,
  start,
  amount,
}: {
  locale: Locale;
  title: string;
  detail: string;
  ticker?: string;
  start?: string;
  amount?: number;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <main className="mx-auto w-full max-w-2xl px-5 sm:px-8 py-12">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-[13px] text-muted hover:text-foreground transition inline-flex items-center gap-1.5"
          >
            <span>←</span>
            <span>{t(locale, "nav.back")}</span>
          </Link>
        </nav>
        <div className="rounded-2xl border border-loss/30 bg-loss-soft/30 p-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-2 text-[14px] text-muted">{detail}</p>
        </div>
        <div className="mt-8 rounded-2xl border border-line bg-card p-5 sm:p-7">
          <h2 className="text-[13px] font-semibold mb-4 tracking-wide">
            {t(locale, "error.tryAgain")}
          </h2>
          <BacktestForm
            locale={locale}
            defaultTicker={ticker ?? "SPY"}
            defaultStart={start ?? "2015-01"}
            defaultAmount={amount ?? 500}
            compact
          />
        </div>
      </main>
    </div>
  );
}
