import { BacktestForm } from "@/components/BacktestForm";
import { PRESETS } from "@/lib/presets";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="mx-auto w-full max-w-2xl px-5 sm:px-8 py-10 sm:py-16">
        <header className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[11px] tracking-wide text-muted mb-5">
            <span className="size-1.5 rounded-full bg-accent" />
            easy-invest · 个人化定投回测
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
            如果当年，
            <br />
            <span className="text-muted">你一直在定投…</span>
          </h1>
          <p className="mt-4 text-[15px] text-muted leading-relaxed max-w-md">
            选个标的、定个金额、回到过去某个月。我们替你算清楚，今天会有多少。
            <br />
            <span className="opacity-80">
              Pick an asset, set an amount, go back in time. We&apos;ll show you
              where you&apos;d be today.
            </span>
          </p>
        </header>

        <section className="rounded-2xl border border-line bg-card/70 backdrop-blur-sm p-5 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
          <BacktestForm />
        </section>

        <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] text-muted">
          <Hint
            title="只需输入 3 个数"
            titleEn="3 inputs"
            body="标的、月投、起始月 — 30 秒看结果"
            bodyEn="Asset, monthly amount, start month"
          />
          <Hint
            title="基于真实月线"
            titleEn="Real monthly data"
            body="Yahoo Finance 历史收盘价（含分红再投）"
            bodyEn="Adjusted closes from Yahoo Finance"
          />
          <Hint
            title="一键分享"
            titleEn="Shareable"
            body="每个结果都有专属链接，可发到朋友圈"
            bodyEn="Every result has a unique URL"
          />
        </section>

        <footer className="mt-16 pt-8 border-t border-line text-[11px] text-muted leading-relaxed">
          <p>
            ⚠️ 仅供历史回顾，不构成任何投资建议。
            <span className="opacity-80">
              {" "}
              Historical reference only, not investment advice.
            </span>
          </p>
          <p className="mt-2">
            支持 {PRESETS.length} 个常用预设 + 任意美股代码 ·{" "}
            <span className="opacity-80">
              {PRESETS.length} presets + any US ticker
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}

function Hint({
  title,
  titleEn,
  body,
  bodyEn,
}: {
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-card/40 p-3.5">
      <div className="text-foreground font-semibold text-[12.5px]">
        {title} <span className="text-muted font-normal">/ {titleEn}</span>
      </div>
      <div className="mt-1 leading-snug">
        {body}
        <div className="opacity-75">{bodyEn}</div>
      </div>
    </div>
  );
}
