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
  "form.strategy.label": "定投策略",
  "form.strategy.help": "默认定额定投；选其他策略会和定额做对比",
  "form.submit.first": "看回测 →",
  "form.submit.compact": "重新计算",
  "form.submit.pending": "计算中…",

  // strategies — labels for picker + result page
  "strategy.vanilla.name": "定额定投",
  "strategy.vanilla.short": "每月固定金额买入",
  "strategy.vanilla.detail": "最简单、最经典：不管价格高低，每月雷打不动投同样的钱。",
  "strategy.va.name": "定期不定额（价值平均）",
  "strategy.va.short": "目标账户每月增长固定金额",
  "strategy.va.detail":
    "目标账户价值每月 +{amount}；落后多买、超前少买甚至卖出（Edleson 价值平均法）。",
  "strategy.ma.name": "均线偏离定投",
  "strategy.ma.short": "低于 200 日均线越多，买越多",
  "strategy.ma.detail":
    "价格高于 MA200 时只投 0.5×，正常 1×，跌破 10%/20% 加仓到 1.5×/2×。",
  "strategy.tp.name": "目标止盈定投",
  "strategy.tp.short": "本轮浮盈达 30% 时清仓重启",
  "strategy.tp.detail":
    "每月正常买入，当本轮持仓浮盈 ≥ 30%，全部卖出落袋，下个月重新开始。",

  // backtest result
  "result.youdHave": "今天你的账户里有",
  "result.title": "如果你从 {date} 起，每月投 {amount} 到 {asset}…",
  "result.title.va":
    "如果你从 {date} 起，按价值平均法（目标 {amount}/月）定投 {asset}…",
  "result.title.ma":
    "如果你从 {date} 起，按均线偏离法定投 {asset}（基础 {amount}/月）…",
  "result.title.tp":
    "如果你从 {date} 起，每月投 {amount} 到 {asset}，浮盈 30% 止盈…",
  "result.stat.invested": "总买入",
  "result.stat.realized": "已止盈",
  "result.stat.netInvested": "净投入",
  "result.stat.shares": "持仓份额",
  "result.stat.months": "持有月数",
  "result.stat.monthsSub": "{years} 年",
  "result.stat.cagr": "年化收益",
  "result.stat.sells": "卖出 {n} 次",
  "result.legend.value": "总价值（持仓+已落袋）",
  "result.legend.invested": "累计投入",
  "result.legend.buy": "买入日",
  "result.legend.sell": "卖出日",
  "result.legend.compare": "定额定投基准",
  "result.compare.section": "对比定额定投",
  "result.compare.vanilla": "定额定投基准",
  "result.compare.thisStrategy": "本策略",
  "result.compare.delta": "差额",
  "result.compare.deltaPos": "本策略多赚 {amount}（+{pct}%）",
  "result.compare.deltaNeg": "本策略少赚 {amount}（{pct}%）",
  "result.compare.deltaSame": "和定额定投几乎一致",
  "result.tweakSection": "换个参数试试",
  "explore.section": "换个策略会怎样？",
  "explore.subtitle": "用同样的参数跑了其他三种策略，点开看完整结果",
  "explore.viewLink": "深入查看 →",
  "explore.delta.pos": "比当前多 {amount}",
  "explore.delta.neg": "比当前少 {amount}",
  "explore.delta.same": "和当前几乎一致",
  "result.footer.dataSource":
    "数据源：Yahoo Finance 日度调整后收盘价（含分红再投）。每月首个交易日按当日收盘价交易。",
  "result.footer.disclaimer":
    "⚠️ 仅供历史回顾，不构成任何投资建议。过往业绩不代表未来表现。",
  "result.txns.section": "交易明细",
  "result.txns.count": "{n} 笔",
  "result.txns.view": "查看 {n} 笔交易明细 ↓",
  "result.txns.col.date": "日期",
  "result.txns.col.kind": "方向",
  "result.txns.col.price": "成交价",
  "result.txns.col.shares": "股数",
  "result.txns.col.cumShares": "累计股数",
  "result.txns.col.value": "总价值",
  "result.txns.kind.buy": "买",
  "result.txns.kind.sell": "卖",
  "result.txns.expand": "展开剩余 {n} 笔 ↓",
  "result.txns.collapse": "收起 ↑",

  // next DCA
  "next.section": "下一次定投",
  "next.estDate": "预计交易日",
  "next.amount": "本次投入",
  "next.amountSub": "买入 {asset}",
  "next.estShares": "预计买入股数",
  "next.estSharesSub": "@ {price} · {dateLabel} 收盘",
  "next.note":
    "按 {dateLabel} 收盘价 {price} 估算；实际成交价以当日收盘为准。",

  // chart tooltip
  "chart.tooltip.value": "总价值",
  "chart.tooltip.invested": "投入",
  "chart.tooltip.pnl": "盈亏",
  "chart.tooltip.bought": "本月买入",
  "chart.tooltip.bought.yes": "✓",
  "chart.tooltip.buyDay": "本月买入",
  "chart.tooltip.sellDay": "卖出",
  "chart.tooltip.compare": "定额定投基准",

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
  "form.start.help": "Trades on the 1st trading day of each month",
  "form.start.year": "{y}",
  "form.start.month": "{m}",
  "form.amount.label": "Monthly amount",
  "form.amount.help": "USD per month, any positive number",
  "form.strategy.label": "Strategy",
  "form.strategy.help": "Defaults to vanilla DCA; other strategies are compared to vanilla",
  "form.submit.first": "See backtest →",
  "form.submit.compact": "Recompute",
  "form.submit.pending": "Crunching…",

  "strategy.vanilla.name": "Vanilla DCA",
  "strategy.vanilla.short": "Fixed amount every month",
  "strategy.vanilla.detail":
    "The classic. Same dollar amount every month regardless of price.",
  "strategy.va.name": "Value Averaging",
  "strategy.va.short": "Target portfolio grows by a fixed amount",
  "strategy.va.detail":
    "Portfolio targets +{amount}/month. Buy more when behind, less or sell when ahead (Edleson).",
  "strategy.ma.name": "MA-Deviation",
  "strategy.ma.short": "Buy more the farther below MA200",
  "strategy.ma.detail":
    "Above MA200: 0.5×. Within 0 to −10%: 1×. −10 to −20%: 1.5×. Below −20%: 2×.",
  "strategy.tp.name": "Target Profit",
  "strategy.tp.short": "Sell everything once cycle gain hits 30%",
  "strategy.tp.detail":
    "Monthly buys; when this cycle's unrealized gain ≥ 30%, sell all and restart fresh next month.",

  "result.youdHave": "You'd have today",
  "result.title": "If you had DCA'd {amount}/mo into {asset} starting {date}…",
  "result.title.va":
    "If you had value-averaged into {asset} (target {amount}/mo) starting {date}…",
  "result.title.ma":
    "If you had MA-deviation DCA'd into {asset} ({amount}/mo base) starting {date}…",
  "result.title.tp":
    "If you had DCA'd {amount}/mo into {asset} with 30% profit-taking, starting {date}…",
  "result.stat.invested": "Bought",
  "result.stat.realized": "Sold",
  "result.stat.netInvested": "Net in",
  "result.stat.shares": "Shares",
  "result.stat.months": "Months",
  "result.stat.monthsSub": "{years} yr",
  "result.stat.cagr": "CAGR",
  "result.stat.sells": "{n} sells",
  "result.legend.value": "Total value (held + realized)",
  "result.legend.invested": "Cumulative bought",
  "result.legend.buy": "Buy",
  "result.legend.sell": "Sell",
  "result.legend.compare": "Vanilla DCA baseline",
  "result.compare.section": "vs Vanilla DCA",
  "result.compare.vanilla": "Vanilla DCA",
  "result.compare.thisStrategy": "This strategy",
  "result.compare.delta": "Δ",
  "result.compare.deltaPos": "{amount} ahead of vanilla (+{pct}%)",
  "result.compare.deltaNeg": "{amount} behind vanilla ({pct}%)",
  "result.compare.deltaSame": "About the same as vanilla DCA",
  "result.tweakSection": "Tweak parameters",
  "explore.section": "What if you'd used another strategy?",
  "explore.subtitle": "Same inputs, three other strategies — tap one to see its full backtest",
  "explore.viewLink": "Explore →",
  "explore.delta.pos": "{amount} ahead of current",
  "explore.delta.neg": "{amount} behind current",
  "explore.delta.same": "About the same as current",
  "result.footer.dataSource":
    "Data: Yahoo Finance adjusted daily closes (dividends reinvested). Each trade executes on the 1st trading day of the month.",
  "result.footer.disclaimer":
    "⚠️ Historical reference only, not investment advice. Past performance does not guarantee future results.",
  "result.txns.section": "Transactions",
  "result.txns.count": "{n} txns",
  "result.txns.view": "View {n} transactions ↓",
  "result.txns.col.date": "Date",
  "result.txns.col.kind": "Side",
  "result.txns.col.price": "Price",
  "result.txns.col.shares": "Shares",
  "result.txns.col.cumShares": "Cum.",
  "result.txns.col.value": "Value",
  "result.txns.kind.buy": "Buy",
  "result.txns.kind.sell": "Sell",
  "result.txns.expand": "Show {n} more ↓",
  "result.txns.collapse": "Collapse ↑",

  "next.section": "Next trade",
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
  "chart.tooltip.buyDay": "Buy",
  "chart.tooltip.sellDay": "Sell",
  "chart.tooltip.compare": "Vanilla baseline",

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
