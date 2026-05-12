"use client";

import { useEffect, useState } from "react";
import { isTheme, t, type Locale, type Theme, THEMES } from "@/lib/i18n";

type Props = {
  locale: Locale;
  initialTheme: Theme;
};

const ONE_YEAR = 60 * 60 * 24 * 365;

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeSwitch({ locale, initialTheme }: Props) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // Listen for system theme changes when in "system" mode.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  // Reconcile with cookie/localStorage in case of mismatch on first paint.
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)theme=(system|light|dark)/);
    if (m && isTheme(m[1]) && m[1] !== theme) {
      setTheme(m[1]);
    }
  }, [theme]);

  function set(next: Theme) {
    setTheme(next);
    document.cookie = `theme=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    applyTheme(next);
  }

  return (
    <div
      role="group"
      aria-label={t(locale, "header.theme")}
      className="inline-flex items-center rounded-full border border-line bg-card p-0.5"
    >
      {THEMES.map((th) => {
        const active = th === theme;
        return (
          <button
            key={th}
            type="button"
            onClick={() => set(th)}
            aria-pressed={active}
            title={t(locale, `header.theme.${th}`)}
            className={`inline-flex items-center justify-center size-7 rounded-full transition ${
              active
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            <ThemeIcon theme={th} />
          </button>
        );
      })}
    </div>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  const common = {
    width: 13,
    height: 13,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (theme === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  if (theme === "dark") {
    return (
      <svg {...common}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  );
}
