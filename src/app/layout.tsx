import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_SC } from "next/font/google";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { t } from "@/lib/i18n";
import { getLocale, getTheme } from "@/lib/locale.server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: t(locale, "meta.title"),
    description: t(locale, "meta.description"),
    metadataBase: new URL("https://easy-invest.app"),
  };
}

// Runs before paint to apply the user's chosen theme (or system pref).
// Avoids a light-flash-on-dark-system load.
const themeBootstrap = `(function(){try{
  var m=document.cookie.match(/(?:^|;\\s*)theme=(system|light|dark)/);
  var t=m?m[1]:'system';
  var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  if(dark)document.documentElement.classList.add('dark');
}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const theme = await getTheme();
  const htmlLang = locale === "zh" ? "zh-CN" : "en";

  return (
    <html
      lang={htmlLang}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSC.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily:
            "var(--font-geist-sans), var(--font-noto-sc), -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        }}
      >
        <header className="sticky top-0 z-10 backdrop-blur-md bg-background/70 border-b border-line/60">
          <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 h-12 flex items-center justify-end gap-2">
            <LocaleSwitch locale={locale} />
            <ThemeSwitch locale={locale} initialTheme={theme} />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
