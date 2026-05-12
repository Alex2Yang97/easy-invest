import { ImageResponse } from "next/og";
import { simulateDca } from "@/lib/dca";
import { formatPercent, formatUSD } from "@/lib/format";
import { isLocale, t, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { parseParams } from "@/lib/params";
import { findPreset, presetName } from "@/lib/presets";
import { DEFAULT_STRATEGY } from "@/lib/strategies";
import { fetchDailyHistory } from "@/lib/yahoo";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (sp[k] = v));

  const langRaw = sp.lang;
  const locale: Locale = isLocale(langRaw) ? langRaw : DEFAULT_LOCALE;

  const parsed = parseParams(sp);
  if (!parsed.ok) {
    return errorCard(
      t(locale, "error.params.title"),
      t(locale, parsed.errorKey),
    );
  }

  const { ticker, start, amount, strategy } = parsed.data;
  const history = await fetchDailyHistory(ticker, start);
  if (!history.ok) {
    return errorCard(
      t(locale, "error.fetch.title"),
      t(locale, history.errorKey, history.errorParams),
    );
  }

  const summary = simulateDca(
    history.points,
    amount,
    history.latestPrice,
    strategy,
  );
  const preset = findPreset(ticker);
  const assetName = preset
    ? presetName(preset, locale)
    : history.nameLong ?? ticker;
  const gainPositive = summary.gain >= 0;
  const accent = gainPositive ? "#047857" : "#be123c";

  const tagline = t(locale, "brand.tagline");
  const strategyName = t(locale, `strategy.${strategy}.name`);
  const isVanilla = strategy === DEFAULT_STRATEGY;
  const headline =
    locale === "zh"
      ? `每月 ${formatUSD(amount)} 投 ${assetName}，自 ${start}`
      : `${formatUSD(amount)}/mo into ${assetName} since ${start}`;
  const investedLabel =
    locale === "zh"
      ? `累计投入 ${formatUSD(summary.totalContributed)} · 共 ${summary.months} 个月`
      : `Invested ${formatUSD(summary.totalContributed)} over ${summary.months} months`;
  const gainText = `${gainPositive ? "+" : ""}${formatUSD(summary.gain)}`;
  const detailText = `(${formatPercent(summary.totalReturnPct)} · ${formatPercent(summary.cagr)} CAGR)`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#fbfaf6",
          padding: "64px 72px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: accent,
              }}
            />
            <div
              style={{ fontSize: 22, color: "#6b6f7a", letterSpacing: 0.5 }}
            >
              {`easy-invest · ${tagline}`}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {!isVanilla && (
              <div
                style={{
                  fontSize: 20,
                  color: accent,
                  fontWeight: 600,
                  border: `1px solid ${accent}33`,
                  background: `${accent}14`,
                  padding: "6px 14px",
                  borderRadius: 10,
                }}
              >
                {strategyName}
              </div>
            )}
            <div
              style={{
                fontSize: 22,
                color: "#0c111c",
                fontWeight: 600,
                border: "1px solid #e6e3d9",
                padding: "6px 14px",
                borderRadius: 10,
                background: "#ffffff",
              }}
            >
              {ticker}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 60,
            flex: 1,
          }}
        >
          <div style={{ display: "flex", fontSize: 26, color: "#6b6f7a" }}>
            {headline}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: 18,
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 130,
                fontWeight: 800,
                color: accent,
                lineHeight: 1,
                letterSpacing: -2,
              }}
            >
              {formatUSD(summary.finalValue)}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: 20,
              gap: 16,
              fontSize: 30,
            }}
          >
            <span style={{ color: accent, fontWeight: 600 }}>{gainText}</span>
            <span style={{ color: "#6b6f7a" }}>{detailText}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#6b6f7a",
            fontSize: 20,
            borderTop: "1px solid #e6e3d9",
            paddingTop: 22,
          }}
        >
          <div style={{ display: "flex" }}>{investedLabel}</div>
          <div style={{ fontWeight: 600, color: "#0c111c" }}>
            easy-invest.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function errorCard(title: string, detail: string) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#fbfaf6",
          padding: 80,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 22, color: "#6b6f7a" }}>
          easy-invest · DCA backtest
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            marginTop: 36,
            color: "#0c111c",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#6b6f7a", marginTop: 16 }}>
          {detail}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
