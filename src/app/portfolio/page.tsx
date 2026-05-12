import Link from "next/link";
import type { Metadata } from "next";
import { PortfolioForm } from "@/components/PortfolioForm";
import { PortfolioGrowthChart } from "@/components/PortfolioGrowthChart";
import { PortfolioTransactionLog } from "@/components/PortfolioTransactionLog";
import { PortfolioWeightDonut } from "@/components/PortfolioWeightDonut";
import { ShareButton } from "@/components/ShareButton";
import {
  formatDate,
  formatMultiple,
  formatPercent,
  formatShares,
  formatUSD,
} from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/locale.server";
import { colorForIndex } from "@/lib/palette";
import {
  parsePortfolioParams,
  type PortfolioAssetSpec,
  type PortfolioParamsT,
} from "@/lib/params";
import {
  simulatePortfolio,
  type PortfolioNextBuy,
  type PortfolioPerAssetSummary,
} from "@/lib/portfolio";
import { fetchPortfolioHistory } from "@/lib/yahoo";

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
  const parsed = parsePortfolioParams(sp);
  if (!parsed.ok) return { title: t(locale, "meta.title") };
  const { assets, start, amount } = parsed.data;
  const amountStr = formatUSD(amount);
  return {
    title: t(locale, "portfolio.meta.title", {
      count: assets.length,
      start,
      amount: amountStr,
    }),
    description: t(locale, "portfolio.meta.description", {
      count: assets.length,
      start,
      amount: amountStr,
    }),
  };
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const parsed = parsePortfolioParams(sp);

  if (!parsed.ok) {
    return (
      <ErrorView
        locale={locale}
        title={t(locale, "error.params.title")}
        detail={t(locale, parsed.errorKey)}
      />
    );
  }
  const { assets, start, amount } = parsed.data;

  const history = await fetchPortfolioHistory(
    assets.map((a) => ({ ticker: a.ticker, weight: a.weight / 100 })),
    start,
  );
  if (!history.ok) {
    return (
      <ErrorView
        locale={locale}
        title={t(locale, "error.fetch.title")}
        detail={t(locale, history.errorKey, history.errorParams)}
        params={parsed.data}
      />
    );
  }

  const latestPrices: Record<string, number> = {};
  for (const m of history.meta) {
    if (m.latestPrice && m.latestPrice > 0) {
      latestPrices[m.ticker] = m.latestPrice;
    }
  }

  const summary = simulatePortfolio(history.series, amount, latestPrices);
  const tickers = history.series.map((s) => s.ticker);
  const startLabel = formatDate(summary.startDate, locale);
  const endLabel = formatDate(summary.endDate, locale);
  const gainPositive = summary.gain >= 0;
  const accentClass = gainPositive ? "text-accent" : "text-loss";
  const latestDate =
    history.meta.find((m) => m.latestDate)?.latestDate ?? summary.endDate;

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
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {assets.map((a, i) => (
              <span
                key={a.ticker}
                className="inline-flex items-center gap-1.5 rounded-md bg-card border border-line px-2 py-0.5 text-[11px]"
              >
                <span
                  className="inline-block size-2 rounded-sm"
                  style={{ backgroundColor: colorForIndex(i) }}
                />
                <span className="font-mono tabular">{a.ticker}</span>
                <span className="text-muted tabular">{a.weight}%</span>
              </span>
            ))}
            <span className="text-[12px] text-muted ml-1">
              {startLabel} → {endLabel}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {t(locale, "portfolio.result.title", {
              date: startLabel,
              amount: formatUSD(amount),
            })}
          </h1>
          <p className="mt-2 text-[12.5px] text-muted leading-snug">
            {t(locale, "portfolio.result.subtitle", { count: assets.length })}
          </p>
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
            />
            <Stat
              label={t(locale, "portfolio.stat.assets")}
              value={String(assets.length)}
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
            <PortfolioGrowthChart
              locale={locale}
              daily={summary.daily}
              tickers={tickers}
            />
          </div>
          <p className="mt-3 text-[11px] text-muted leading-snug">
            {t(locale, "portfolio.legend.driftBuy")}
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-card/70 p-5 sm:p-7">
          <h2 className="text-[13px] font-semibold mb-4 tracking-wide">
            {t(locale, "portfolio.weights.section")}
          </h2>
          <PortfolioWeightDonut
            locale={locale}
            perAsset={summary.perAsset}
          />
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-card p-5 sm:p-7">
          <h2 className="text-[13px] font-semibold mb-4 tracking-wide">
            {t(locale, "portfolio.perAsset.section")}
          </h2>
          <PerAssetTable locale={locale} perAsset={summary.perAsset} />
        </section>

        {summary.nextBuy && (
          <NextPortfolioCard
            locale={locale}
            nextBuy={summary.nextBuy}
            latestDate={latestDate}
          />
        )}

        <section className="mt-8 rounded-2xl border border-line bg-card/70 p-5 sm:p-7">
          <h2 className="text-[13px] font-semibold mb-4 tracking-wide">
            {t(locale, "result.tweakSection")}
          </h2>
          <PortfolioForm
            locale={locale}
            defaultAssets={assets}
            defaultStart={start}
            defaultAmount={amount}
            compact
          />
        </section>

        <section className="mt-8">
          <PortfolioTransactionLog
            locale={locale}
            transactions={summary.transactions}
            tickers={tickers}
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

function PerAssetTable({
  locale,
  perAsset,
}: {
  locale: Locale;
  perAsset: PortfolioPerAssetSummary[];
}) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-[12.5px] tabular">
        <thead>
          <tr className="text-[11px] text-muted text-left">
            <th className="font-medium px-2 py-2">
              {t(locale, "portfolio.perAsset.col.ticker")}
            </th>
            <th className="font-medium px-2 py-2 text-right">
              {t(locale, "portfolio.perAsset.col.target")}
            </th>
            <th className="font-medium px-2 py-2 text-right">
              {t(locale, "portfolio.perAsset.col.actual")}
            </th>
            <th className="font-medium px-2 py-2 text-right hidden sm:table-cell">
              {t(locale, "portfolio.perAsset.col.shares")}
            </th>
            <th className="font-medium px-2 py-2 text-right">
              {t(locale, "portfolio.perAsset.col.contributed")}
            </th>
            <th className="font-medium px-2 py-2 text-right">
              {t(locale, "portfolio.perAsset.col.value")}
            </th>
            <th className="font-medium px-2 py-2 text-right">
              {t(locale, "portfolio.perAsset.col.gain")}
            </th>
          </tr>
        </thead>
        <tbody>
          {perAsset.map((p, i) => {
            const gainPos = p.gain >= 0;
            return (
              <tr
                key={p.ticker}
                className="border-t border-line/60 hover:bg-foreground/[0.02] transition"
              >
                <td className="px-2 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block size-2 rounded-sm"
                      style={{ backgroundColor: colorForIndex(i) }}
                    />
                    <span className="font-mono">{p.ticker}</span>
                  </span>
                </td>
                <td className="px-2 py-2 text-right text-muted">
                  {(p.targetWeight * 100).toFixed(0)}%
                </td>
                <td className="px-2 py-2 text-right">
                  {(p.finalWeight * 100).toFixed(1)}%
                </td>
                <td className="px-2 py-2 text-right hidden sm:table-cell text-muted">
                  {formatShares(p.finalShares)}
                </td>
                <td className="px-2 py-2 text-right text-muted">
                  {formatUSD(p.contributed)}
                </td>
                <td className="px-2 py-2 text-right font-medium">
                  {formatUSD(p.finalValue)}
                </td>
                <td
                  className={`px-2 py-2 text-right ${gainPos ? "text-accent" : "text-loss"}`}
                >
                  {gainPos ? "+" : ""}
                  {formatUSD(p.gain)}
                  <div className="text-[10px] tabular">
                    {formatPercent(p.totalReturnPct)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NextPortfolioCard({
  locale,
  nextBuy,
  latestDate,
}: {
  locale: Locale;
  nextBuy: PortfolioNextBuy;
  latestDate?: string;
}) {
  const nextLabel = formatDate(nextBuy.date, locale);
  const priceLabel = latestDate ? formatDate(latestDate, locale) : "";
  return (
    <section className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/40 p-5 sm:p-7">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="inline-block size-1.5 rounded-full bg-accent" />
        <h2 className="text-[13px] font-semibold tracking-wide">
          {t(locale, "next.section")}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
        <Stat label={t(locale, "next.estDate")} value={nextLabel} />
        <Stat
          label={t(locale, "portfolio.next.total")}
          value={formatUSD(nextBuy.totalAmount)}
        />
      </div>
      <div className="rounded-xl border border-line bg-card/60 p-3">
        <table className="w-full text-[12px] tabular">
          <thead>
            <tr className="text-[10.5px] text-muted text-left">
              <th className="font-medium px-2 py-1.5">
                {t(locale, "portfolio.perAsset.col.ticker")}
              </th>
              <th className="font-medium px-2 py-1.5 text-right">
                {t(locale, "portfolio.next.allocAmount")}
              </th>
              <th className="font-medium px-2 py-1.5 text-right hidden sm:table-cell">
                {t(locale, "portfolio.next.allocShares")}
              </th>
            </tr>
          </thead>
          <tbody>
            {nextBuy.perAsset.map((a) => (
              <tr key={a.ticker} className="border-t border-line/40">
                <td className="px-2 py-1.5 font-mono">{a.ticker}</td>
                <td className="px-2 py-1.5 text-right">
                  {a.amount > 0 ? formatUSD(a.amount) : "—"}
                </td>
                <td className="px-2 py-1.5 text-right text-muted hidden sm:table-cell">
                  {a.amount > 0 ? formatShares(a.shares) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {priceLabel && (
        <p className="mt-3 text-[11px] text-muted leading-snug">
          {t(locale, "portfolio.next.note", { dateLabel: priceLabel })}
        </p>
      )}
    </section>
  );
}

function ErrorView({
  locale,
  title,
  detail,
  params,
}: {
  locale: Locale;
  title: string;
  detail: string;
  params?: PortfolioParamsT;
}) {
  const defaultAssets: PortfolioAssetSpec[] | undefined = params?.assets;
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
          <PortfolioForm
            locale={locale}
            defaultAssets={defaultAssets}
            defaultStart={params?.start}
            defaultAmount={params?.amount}
            compact
          />
        </div>
      </main>
    </div>
  );
}
