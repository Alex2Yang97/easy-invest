export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";
export const LOCALE_LABEL: Record<Locale, string> = {
  zh: "中文",
  en: "EN",
};

export type Theme = "system" | "light" | "dark";
export const THEMES: Theme[] = ["system", "light", "dark"];

type Dict = Record<string, string>;

const zh: Dict = {
  // brand / header
  "brand.tagline": "个人化定投回测",
  "header.lang": "语言",
  "header.theme": "主题",
  "header.theme.system": "跟随系统",
  "header.theme.light": "浅色",
  "header.theme.dark": "深色",

  // home
  "home.badge": "easy-invest · 个人化定投回测",
  "home.h1.line1": "如果当年，",
  "home.h1.line2": "你一直在定投…",
  "home.lede":
    "选个标的、定个金额、回到过去某个月。我们替你算清楚，今天会有多少。",
  "home.hint1.title": "只需输入 3 个数",
  "home.hint1.body": "标的、月投、起始月 — 30 秒看结果",
  "home.hint2.title": "基于真实日线",
  "home.hint2.body": "Yahoo Finance 历史调整后收盘价（含分红再投）",
  "home.hint3.title": "一键分享",
  "home.hint3.body": "每个结果都有专属链接，可发到朋友圈",
  "home.footer.disclaimer": "⚠️ 仅供历史回顾，不构成任何投资建议。",
  "home.footer.support": "支持 {count} 个常用预设 + 任意美股代码",

  // form
  "form.asset.label": "选择标的",
  "form.asset.help": "6 个常用预设，或输入任意美股代码（如 TSLA、NVDA）",
  "form.asset.custom": "自定义",
  "form.asset.customPlaceholder": "例如 TSLA, NVDA, AAPL",
  "form.start.label": "起始月份",
  "form.start.help": "每月第一个交易日买入",
  "form.start.year": "{y} 年",
  "form.start.month": "{m} 月",
  "form.amount.label": "月投金额",
  "form.amount.help": "每月定投美元金额，任意正数",
  "form.submit.first": "看回测 →",
  "form.submit.compact": "重新计算",
  "form.submit.pending": "计算中…",

  // backtest result
  "result.youdHave": "今天你的账户里有",
  "result.title": "如果你从 {date} 起，每月定投 {amount} 到 {asset}…",
  "result.stat.invested": "总投入",
  "result.stat.shares": "持仓份额",
  "result.stat.months": "持有月数",
  "result.stat.monthsSub": "{years} 年",
  "result.stat.cagr": "年化收益",
  "result.legend.value": "持仓价值",
  "result.legend.invested": "累计投入",
  "result.legend.buy": "买入日",
  "result.tweakSection": "换个参数试试",
  "result.footer.dataSource":
    "数据源：Yahoo Finance 日度调整后收盘价（含分红再投）。每月首个交易日按当日收盘价买入。",
  "result.footer.disclaimer":
    "⚠️ 仅供历史回顾，不构成任何投资建议。过往业绩不代表未来表现。",
  "result.txns.section": "每月交易明细",
  "result.txns.count": "{n} 笔",
  "result.txns.col.date": "日期",
  "result.txns.col.price": "成交价",
  "result.txns.col.shares": "买入股数",
  "result.txns.col.cumShares": "累计股数",
  "result.txns.col.value": "持仓价值",
  "result.txns.expand": "展开剩余 {n} 笔 ↓",
  "result.txns.collapse": "收起 ↑",

  // next DCA
  "next.section": "下一次定投",
  "next.estDate": "预计买入日",
  "next.amount": "本次投入",
  "next.amountSub": "买入 {asset}",
  "next.estShares": "预计买入股数",
  "next.estSharesSub": "@ {price} · {dateLabel} 收盘",
  "next.note":
    "按 {dateLabel} 收盘价 {price} 估算；实际成交价以当日收盘为准。",

  // chart tooltip
  "chart.tooltip.value": "持仓",
  "chart.tooltip.invested": "投入",
  "chart.tooltip.pnl": "盈亏",
  "chart.tooltip.bought": "本月买入",
  "chart.tooltip.bought.yes": "✓",
  "chart.tooltip.buyDay": "本月买入",

  // share
  "share.label": "分享链接",
  "share.copied": "已复制",
  "share.shareTitle": "我的定投回测",

  // errors
  "error.params.title": "参数错误",
  "error.fetch.title": "拉取数据失败",
  "error.tryAgain": "重新输入",
  "error.invalidMonth": "起始月份格式错误",
  "error.futureMonth": "起始月份不能在未来",
  "error.notEnoughData": "「{ticker}」在 {start} 之后没有足够的历史数据",
  "error.notFound": "找不到代码「{ticker}」，请检查",
  "error.fetchFailed": "数据获取失败：{msg}",
  "error.params.ticker": "标的代码无效",
  "error.params.start": "起始月份格式应为 YYYY-MM",
  "error.params.amount": "金额必须是 1–1,000,000 之间的正数",

  // back nav
  "nav.back": "easy-invest",

  // metadata
  "meta.title": "如果当年… · easy-invest",
  "meta.description":
    "如果当年你每月定投到标普 500，今天会有多少？输入金额、起始月份和标的，立即查看个人化定投回测。",
  "meta.backtest.title": "{ticker} 从 {start} 起月投 {amount} · easy-invest",
  "meta.backtest.description":
    "如果你从 {start} 开始每月定投 {amount} 到 {ticker}，今天会有多少？看个人化历史回测结果。",
  "meta.og.title": "{ticker} 定投回测",
  "meta.og.description": "从 {start} 起每月 {amount}",
};

const en: Dict = {
  "brand.tagline": "Personalized DCA backtest",
  "header.lang": "Language",
  "header.theme": "Theme",
  "header.theme.system": "System",
  "header.theme.light": "Light",
  "header.theme.dark": "Dark",

  "home.badge": "easy-invest · Personalized DCA backtest",
  "home.h1.line1": "What if you had been",
  "home.h1.line2": "dollar-cost-averaging all along…",
  "home.lede":
    "Pick an asset, set an amount, go back in time. We'll show you where you'd be today.",
  "home.hint1.title": "3 inputs",
  "home.hint1.body": "Asset, monthly amount, start month — 30s to result",
  "home.hint2.title": "Real daily data",
  "home.hint2.body": "Adjusted daily closes from Yahoo (dividends reinvested)",
  "home.hint3.title": "Shareable",
  "home.hint3.body": "Every result has a unique URL you can share",
  "home.footer.disclaimer":
    "⚠️ Historical reference only, not investment advice.",
  "home.footer.support": "{count} presets + any US ticker",

  "form.asset.label": "Pick an asset",
  "form.asset.help": "6 presets, or any US ticker (e.g. TSLA, NVDA)",
  "form.asset.custom": "Custom",
  "form.asset.customPlaceholder": "e.g. TSLA, NVDA, AAPL",
  "form.start.label": "Start month",
  "form.start.help": "Buys on the 1st trading day of each month",
  "form.start.year": "{y}",
  "form.start.month": "{m}",
  "form.amount.label": "Monthly amount",
  "form.amount.help": "USD per month, any positive number",
  "form.submit.first": "See backtest →",
  "form.submit.compact": "Recompute",
  "form.submit.pending": "Crunching…",

  "result.youdHave": "You'd have today",
  "result.title": "If you had DCA'd {amount}/mo into {asset} starting {date}…",
  "result.stat.invested": "Invested",
  "result.stat.shares": "Shares",
  "result.stat.months": "Months",
  "result.stat.monthsSub": "{years} yr",
  "result.stat.cagr": "CAGR",
  "result.legend.value": "Portfolio value",
  "result.legend.invested": "Cumulative invested",
  "result.legend.buy": "Buy day",
  "result.tweakSection": "Tweak parameters",
  "result.footer.dataSource":
    "Data: Yahoo Finance adjusted daily closes (dividends reinvested). Each contribution buys at the 1st trading day's close.",
  "result.footer.disclaimer":
    "⚠️ Historical reference only, not investment advice. Past performance does not guarantee future results.",
  "result.txns.section": "Monthly transactions",
  "result.txns.count": "{n} txns",
  "result.txns.col.date": "Date",
  "result.txns.col.price": "Price",
  "result.txns.col.shares": "Shares",
  "result.txns.col.cumShares": "Cum.",
  "result.txns.col.value": "Value",
  "result.txns.expand": "Show {n} more ↓",
  "result.txns.collapse": "Collapse ↑",

  "next.section": "Next DCA",
  "next.estDate": "Estimated date",
  "next.amount": "Amount",
  "next.amountSub": "Buy {asset}",
  "next.estShares": "Est. shares",
  "next.estSharesSub": "@ {price} · {dateLabel} close",
  "next.note":
    "Estimate based on {dateLabel} close at {price}; actual fill at that day's close.",

  "chart.tooltip.value": "Value",
  "chart.tooltip.invested": "Invested",
  "chart.tooltip.pnl": "P&L",
  "chart.tooltip.bought": "Bought",
  "chart.tooltip.bought.yes": "✓",
  "chart.tooltip.buyDay": "Buy day",

  "share.label": "Share",
  "share.copied": "Copied",
  "share.shareTitle": "My DCA backtest",

  "error.params.title": "Invalid input",
  "error.fetch.title": "Couldn't fetch data",
  "error.tryAgain": "Try again",
  "error.invalidMonth": "Start month format is invalid",
  "error.futureMonth": "Start month can't be in the future",
  "error.notEnoughData":
    "Not enough history for {ticker} after {start}",
  "error.notFound": "Couldn't find ticker {ticker}, please check",
  "error.fetchFailed": "Couldn't fetch data: {msg}",
  "error.params.ticker": "Invalid ticker",
  "error.params.start": "Start month must be YYYY-MM",
  "error.params.amount": "Amount must be a positive number 1–1,000,000",

  "nav.back": "easy-invest",

  "meta.title": "What if… · easy-invest",
  "meta.description":
    "What if you had been DCA-ing into the S&P 500? Enter amount, start month, and ticker to see your personalized backtest in seconds.",
  "meta.backtest.title": "{ticker} {amount}/mo since {start} · easy-invest",
  "meta.backtest.description":
    "If you had DCA'd {amount}/mo into {ticker} since {start}, where would you be? See your personalized backtest.",
  "meta.og.title": "{ticker} DCA backtest",
  "meta.og.description": "{amount}/mo since {start}",
};

const dicts: Record<Locale, Dict> = { zh, en };

export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  let s = dicts[locale]?.[key] ?? dicts[DEFAULT_LOCALE][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

export function isTheme(v: unknown): v is Theme {
  return v === "system" || v === "light" || v === "dark";
}
