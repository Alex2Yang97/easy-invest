import Link from "next/link";
import type { Metadata } from "next";
import { BacktestForm } from "@/components/BacktestForm";
import { GrowthChart } from "@/components/GrowthChart";
import { ShareButton } from "@/components/ShareButton";
import { TransactionLog } from "@/components/TransactionLog";
import {
  simulateDca,
  type DcaNextBuy,
  type DcaSummary,
} from "@/lib/dca";
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
import {
  DEFAULT_STRATEGY,
  STRATEGY_IDS,
  type StrategyId,
} from "@/lib/strategies";
import { fetchDailyHistory } from "@/lib/yahoo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function titleKeyFor(strategy: StrategyId): string {
  if (strategy === "va") return "result.title.va";
  if (strategy === "ma") return "result.title.ma";
  if (strategy === "tp") return "result.title.tp";
  return "result.title";
}

function buildUrl(
  ticker: string,
  start: string,
  amount: number,
  strategy: StrategyId,
): string {
  const q = new URLSearchParams({
    ticker,
    start,
    amount: String(amount),
  });
  if (strategy !== DEFAULT_STRATEGY) q.set("strategy", strategy);
  return `/backtest?${q.toString()}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const locale = await getLocale();
  const parsed = parseParams(sp);
  if (!parsed.ok) return { title: t(locale, "meta.title") };
  const { ticker, start, amount, strategy } = parsed.data;
  const amountStr = formatUSD(amount);
  const ogParams = new URLSearchParams({
    ticker,
    start,
    amount: String(amount),
    lang: locale,
  });
  if (strategy !== DEFAULT_STRATEGY) ogParams.set("strategy", strategy);
  const ogUrl = `/api/og?${ogParams.toString()}`;
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
  const { ticker, start, amount, strategy } = parsed.data;

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
        strategy={strategy}
      />
    );
  }

  const allSummaries: Record<StrategyId, DcaSummary> = {
    vanilla: simulateDca(history.points, amount, history.latestPrice, "vanilla"),
    va: simulateDca(history.points, amount, history.latestPrice, "va"),
    ma: simulateDca(history.points, amount, history.latestPrice, "ma"),
    tp: simulateDca(history.points, amount, history.latestPrice, "tp"),
  };
  const summary = allSummaries[strategy];
  const vanillaSummary = strategy === "vanilla" ? null : allSummaries.vanilla;

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
            {strategy !== DEFAULT_STRATEGY && (
              <span className="text-[11px] tracking-wide text-accent bg-accent-soft/50 border border-accent/20 rounded-md px-2 py-0.5">
                {t(locale, `strategy.${strategy}.name`)}
              </span>
            )}
            <span className="text-[13px] text-muted">
              {startLabel} → {endLabel}
            </span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {t(locale, titleKeyFor(strategy), {
              date: startLabel,
              amount: formatUSD(amount),
              asset: assetName,
            })}
          </h1>
          {strategy !== DEFAULT_STRATEGY && (
            <p className="mt-2 text-[12.5px] text-muted leading-snug">
              {t(locale, `strategy.${strategy}.detail`, {
                amount: formatUSD(amount),
              })}
            </p>
          )}
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
          <div className="mt-3 flex items-baseline gap-2 text-[14px] tabular flex-wrap">
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
              sub={
                summary.totalRealized > 0
                  ? t(locale, "result.stat.netInvested") +
                    " " +
                    formatUSD(summary.netInvested)
                  : undefined
              }
            />
            <Stat
              label={t(locale, "result.stat.shares")}
              value={formatShares(summary.finalShares)}
              sub={`@ ${formatUSD(summary.finalClose)}`}
            />
            <Stat
              label={t(locale, "result.stat.months")}
              value={`${summary.months}`}
              sub={
                summary.sellCount > 0
                  ? t(locale, "result.stat.sells", { n: summary.sellCount })
                  : t(locale, "result.stat.monthsSub", {
                      years: (summary.months / 12).toFixed(1),
                    })
              }
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
              vanillaDaily={vanillaSummary?.daily}
            />
          </div>
          <Legend
            locale={locale}
            hasSells={summary.sellCount > 0}
            hasCompare={!!vanillaSummary}
          />
        </section>

        <ExploreStrategies
          locale={locale}
          currentStrategy={strategy}
          summaries={allSummaries}
          ticker={ticker}
          start={start}
          amount={amount}
        />

        {summary.nextBuy && (
          <NextDcaCard
            locale={locale}
            nextBuy={summary.nextBuy}
            assetName={assetName}
            latestDate={history.latestDate}
          />
        )}

        <section className="mt-8 rounded-2xl border border-line bg-card/70 p-5 sm:p-7">
          <h2 className="text-[13px] font-semibold mb-4 tracking-wide">
            {t(locale, "result.tweakSection")}
          </h2>
          <BacktestForm
            locale={locale}
            defaultTicker={ticker}
            defaultStart={start}
            defaultAmount={amount}
            defaultStrategy={strategy}
            compact
          />
        </section>

        <section className="mt-8">
          <TransactionLog
            locale={locale}
            transactions={summary.transactions}
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

function Legend({
  locale,
  hasSells,
  hasCompare,
}: {
  locale: Locale;
  hasSells: boolean;
  hasCompare: boolean;
}) {
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
      {hasCompare && (
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[2px] w-4 border-t-2 border-dotted border-muted" />
          {t(locale, "result.legend.compare")}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-1.5 rounded-full bg-accent" />
        {t(locale, "result.legend.buy")}
      </span>
      {hasSells && (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-0 border-x-[4px] border-x-transparent border-b-[6px]"
            style={{ borderBottomColor: "var(--loss)" }}
          />
          {t(locale, "result.legend.sell")}
        </span>
      )}
    </div>
  );
}

function ExploreStrategies({
  locale,
  currentStrategy,
  summaries,
  ticker,
  start,
  amount,
}: {
  locale: Locale;
  currentStrategy: StrategyId;
  summaries: Record<StrategyId, DcaSummary>;
  ticker: string;
  start: string;
  amount: number;
}) {
  const current = summaries[currentStrategy];
  const others = STRATEGY_IDS.filter((id) => id !== currentStrategy);
  return (
    <section className="mt-8 rounded-2xl border border-line bg-card/40 p-5 sm:p-7">
      <div className="mb-4">
        <h2 className="text-[13px] font-semibold tracking-wide">
          {t(locale, "explore.section")}
        </h2>
        <p className="mt-1 text-[11.5px] text-muted leading-snug">
          {t(locale, "explore.subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {others.map((id) => {
          const s = summaries[id];
          const delta = s.finalValue - current.finalValue;
          const deltaPct =
            current.finalValue > 0
              ? (delta / current.finalValue) * 100
              : 0;
          const tinyDiff = Math.abs(deltaPct) < 0.5;
          const ahead = delta > 0;
          const deltaText = tinyDiff
            ? t(locale, "explore.delta.same")
            : ahead
              ? t(locale, "explore.delta.pos", {
                  amount: formatUSD(Math.abs(delta)),
                })
              : t(locale, "explore.delta.neg", {
                  amount: formatUSD(Math.abs(delta)),
                });
          const deltaColor = tinyDiff
            ? "text-muted"
            : ahead
              ? "text-accent"
              : "text-loss";
          return (
            <Link
              key={id}
              href={buildUrl(ticker, start, amount, id)}
              className="group rounded-xl border border-line bg-card p-4 hover:border-foreground/40 transition flex flex-col gap-2"
            >
              <div className="text-[13px] font-semibold leading-tight">
                {t(locale, `strategy.${id}.name`)}
              </div>
              <div className="text-[11px] text-muted leading-snug">
                {t(locale, `strategy.${id}.short`)}
              </div>
              <div className="mt-1 text-xl font-bold tabular">
                {formatUSD(s.finalValue)}
              </div>
              <div className={`text-[11px] tabular ${deltaColor}`}>
                {deltaText}
              </div>
              <div className="mt-1 text-[11px] text-muted group-hover:text-foreground transition">
                {t(locale, "explore.viewLink")}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
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
          value={formatUSD(nextBuy.estimatedAmount)}
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
  strategy,
}: {
  locale: Locale;
  title: string;
  detail: string;
  ticker?: string;
  start?: string;
  amount?: number;
  strategy?: StrategyId;
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
            defaultStrategy={strategy ?? DEFAULT_STRATEGY}
            compact
          />
        </div>
      </main>
    </div>
  );
}
