export type Preset = {
  ticker: string;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  earliestYear: number;
};

export const PRESETS: Preset[] = [
  {
    ticker: "SPY",
    nameZh: "标普 500",
    nameEn: "S&P 500 ETF",
    descZh: "美国 500 大公司，宽基代表",
    descEn: "500 largest US companies",
    earliestYear: 1993,
  },
  {
    ticker: "QQQ",
    nameZh: "纳斯达克 100",
    nameEn: "Nasdaq 100 ETF",
    descZh: "科技股集中营",
    descEn: "Tech-heavy growth bet",
    earliestYear: 1999,
  },
  {
    ticker: "VTI",
    nameZh: "全美市场",
    nameEn: "Total US Market",
    descZh: "约 4000 家美股全覆盖",
    descEn: "~4000 US stocks, broadest base",
    earliestYear: 2001,
  },
  {
    ticker: "GLD",
    nameZh: "黄金",
    nameEn: "Gold ETF",
    descZh: "避险资产经典",
    descEn: "Classic safe-haven asset",
    earliestYear: 2004,
  },
  {
    ticker: "TLT",
    nameZh: "长期国债",
    nameEn: "20+ Year Treasury",
    descZh: "降息周期受益",
    descEn: "Long-duration US Treasury",
    earliestYear: 2002,
  },
  {
    ticker: "BTC-USD",
    nameZh: "比特币",
    nameEn: "Bitcoin",
    descZh: "波动最大，故事最猛",
    descEn: "Highest volatility, biggest swings",
    earliestYear: 2014,
  },
];

export function findPreset(ticker: string): Preset | undefined {
  return PRESETS.find((p) => p.ticker.toUpperCase() === ticker.toUpperCase());
}
