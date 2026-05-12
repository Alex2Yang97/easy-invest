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
import { parseParams } from "@/lib/params";
import { findPreset } from "@/lib/presets";
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
  const parsed = parseParams(sp);
  if (!parsed.ok) return { title: "回测 / Backtest · easy-invest" };
  const { ticker, start, amount } = parsed.data;
  const ogUrl = `/api/og?ticker=${encodeURIComponent(
    ticker,
  )}&start=${start}&amount=${amount}`;
  return {
    title: `${ticker} 从 ${start} 起月投 $${amount} · easy-invest`,
    description: `如果你从 ${start} 开始每月定投 $${amount} 到 ${ticker}，今天会有多少？看个人化历史回测结果。`,
    openGraph: {
      title: `${ticker} 定投回测 / DCA backtest`,
      description: `从 ${start} 起每月 $${amount}`,
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
  const parsed = parseParams(sp);

  if (!parsed.ok) {
    return <ErrorView title="参数错误 / Invalid input" detail={parsed.error} />;
  }
  const { ticker, start, amount } = parsed.data;

  const history = await fetchDailyHistory(ticker, start);
  if (!history.ok) {
    return (
      <ErrorView
        title="拉取数据失败 / Couldn't fetch data"
        detail={history.error}
        ticker={ticker}
        start={start}
        amount={amount}
      />
    );
  }

  const summary = simulateDca(history.points, amount, history.latestPrice);
  const preset = findPreset(ticker);
  const assetNameZh = preset?.nameZh ?? history.nameLong ?? ticker;
  const assetNameEn = preset?.nameEn ?? history.nameLong ?? ticker;
  const startLabel = formatDate(summary.startDate);
  const endLabel = formatDate(summary.endDate);
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
            <span>easy-invest</span>
          </Link>
          <ShareButton />
        </nav>

        <header className="mb-8">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-[11px] font-mono tabular tracking-wider text-muted bg-card border border-line rounded-md px-2 py-0.5">
              {ticker}
            </span>
            <span className="text-[13px] text-muted">
              {startLabel.zh} → {endLabel.zh}
              <span className="opacity-60">
                {" · "}
                {startLabel.en} → {endLabel.en}
              </span>
            </span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            如果你从 {startLabel.zh}起，
            <br />
            <span>每月定投 </span>
            <span className="tabular">{formatUSD(amount)}</span>
            <span> 到 </span>
            <span>{assetNameZh}</span>
            <span>…</span>
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            If you DCA&apos;d {formatUSD(amount)}/mo into {assetNameEn} starting{" "}
            {startLabel.en}…
          </p>
        </header>

        <section className="rounded-2xl border border-line bg-card p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
          <div className="text-[12px] text-muted mb-2">
            今天你的账户里有 / You&apos;d have today
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
              labelZh="总投入"
              labelEn="Invested"
              value={formatUSD(summary.totalContributed)}
            />
            <Stat
              labelZh="持仓份额"
              labelEn="Shares"
              value={formatShares(summary.finalShares)}
              sub={`@ ${formatUSD(summary.finalClose)}`}
            />
            <Stat
              labelZh="持有月数"
              labelEn="Months"
              value={`${summary.months}`}
              sub={`${(summary.months / 12).toFixed(1)} 年 / yr`}
            />
            <Stat
              labelZh="年化收益"
              labelEn="CAGR"
              value={formatPercent(summary.cagr)}
              valueClass={accentClass}
            />
          </div>

          <div className="mt-7 -mx-2 sm:mx-0">
            <GrowthChart
              daily={summary.daily}
              transactions={summary.transactions}
              gainPositive={gainPositive}
            />
          </div>
          <Legend />
        </section>

        {summary.nextBuy && (
          <NextDcaCard
            nextBuy={summary.nextBuy}
            ticker={ticker}
            assetNameZh={assetNameZh}
            latestDate={history.latestDate}
          />
        )}

        <section className="mt-8 rounded-2xl border border-line bg-card p-5 sm:p-7">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 className="text-[13px] font-semibold tracking-wide">
              每月交易明细{" "}
              <span className="text-muted font-normal">
                / Monthly transactions
              </span>
            </h2>
            <span className="text-[11px] text-muted tabular">
              {summary.transactions.length} 笔 / txns
            </span>
          </div>
          <TransactionLog transactions={summary.transactions} />
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-card/70 p-5 sm:p-7">
          <h2 className="text-[13px] font-semibold mb-4 tracking-wide">
            换个参数试试{" "}
            <span className="text-muted font-normal">/ Tweak parameters</span>
          </h2>
          <BacktestForm
            defaultTicker={ticker}
            defaultStart={start}
            defaultAmount={amount}
            compact
          />
        </section>

        <footer className="mt-10 text-[11px] text-muted leading-relaxed">
          <p>
            数据源：Yahoo Finance
            日度调整后收盘价（含分红再投）。每月首个交易日按当日收盘价买入。
          </p>
          <p className="opacity-80 mt-1">
            Data: Yahoo Finance adjusted daily closes (dividends reinvested).
            Each contribution buys at the 1st trading day&apos;s close.
          </p>
          <p className="mt-3">
            ⚠️ 仅供历史回顾，不构成任何投资建议。Past performance does not
            guarantee future results.
          </p>
        </footer>
      </main>
    </div>
  );
}

function Stat({
  labelZh,
  labelEn,
  value,
  sub,
  valueClass,
}: {
  labelZh: string;
  labelEn: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-[11px] text-muted leading-tight">
        {labelZh}
        <span className="opacity-70"> / {labelEn}</span>
      </div>
      <div
        className={`mt-1 text-lg sm:text-xl font-semibold tabular ${valueClass ?? ""}`}
      >
        {value}
      </div>
      {sub && <div className="text-[10.5px] text-muted tabular">{sub}</div>}
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-[2px] w-4 rounded bg-accent" />
        持仓价值 / Portfolio value
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-[2px] w-4 border-t-2 border-dashed border-muted" />
        累计投入 / Cumulative invested
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-1.5 rounded-full bg-accent" />
        买入日 / Buy day
      </span>
    </div>
  );
}

function NextDcaCard({
  nextBuy,
  ticker,
  assetNameZh,
  latestDate,
}: {
  nextBuy: DcaNextBuy;
  ticker: string;
  assetNameZh: string;
  latestDate?: string;
}) {
  const nextLabel = formatDate(nextBuy.date);
  const priceLabel = latestDate
    ? `${formatDate(latestDate).zh} 收盘`
    : "最新收盘";
  const priceLabelEn = latestDate
    ? `${formatDate(latestDate).en} close`
    : "latest close";
  return (
    <section className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/40 p-5 sm:p-7">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="inline-block size-1.5 rounded-full bg-accent" />
        <h2 className="text-[13px] font-semibold tracking-wide">
          下一次定投{" "}
          <span className="text-muted font-normal">/ Next DCA</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Stat
          labelZh="预计买入日"
          labelEn="Estimated date"
          value={nextLabel.zh}
          sub={nextLabel.en}
        />
        <Stat
          labelZh="本次投入"
          labelEn="Amount"
          value={formatUSD(nextBuy.monthlyAmount)}
          sub={`买入 ${assetNameZh} / Buy ${ticker}`}
        />
        <Stat
          labelZh="预计买入股数"
          labelEn="Est. shares"
          value={`${formatShares(nextBuy.estimatedShares)}`}
          sub={`@ ${formatUSD(nextBuy.estimatedPrice)} · ${priceLabelEn}`}
        />
      </div>
      <p className="mt-4 text-[11px] text-muted leading-snug">
        按 {priceLabel} {formatUSD(nextBuy.estimatedPrice)}{" "}
        估算；实际成交价以当日收盘为准。
        <span className="opacity-80 block">
          Estimate based on {priceLabelEn}; actual fill at that day&apos;s
          close.
        </span>
      </p>
    </section>
  );
}

function ErrorView({
  title,
  detail,
  ticker,
  start,
  amount,
}: {
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
            <span>easy-invest</span>
          </Link>
        </nav>
        <div className="rounded-2xl border border-loss/30 bg-loss-soft/30 p-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-2 text-[14px] text-muted">{detail}</p>
        </div>
        <div className="mt-8 rounded-2xl border border-line bg-card p-5 sm:p-7">
          <h2 className="text-[13px] font-semibold mb-4 tracking-wide">
            重新输入 <span className="text-muted font-normal">/ Try again</span>
          </h2>
          <BacktestForm
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
