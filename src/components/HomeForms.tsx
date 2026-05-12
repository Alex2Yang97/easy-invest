"use client";

import { useState } from "react";
import { BacktestForm } from "@/components/BacktestForm";
import { PortfolioForm } from "@/components/PortfolioForm";
import { t, type Locale } from "@/lib/i18n";

type Mode = "single" | "portfolio";

type Props = {
  locale: Locale;
  initialMode?: Mode;
};

export function HomeForms({ locale, initialMode = "single" }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <div>
      <div
        role="tablist"
        aria-label="form mode"
        className="mb-5 inline-flex rounded-xl border border-line bg-card/60 p-1"
      >
        <TabButton
          active={mode === "single"}
          onClick={() => setMode("single")}
          label={t(locale, "home.tab.single")}
        />
        <TabButton
          active={mode === "portfolio"}
          onClick={() => setMode("portfolio")}
          label={t(locale, "home.tab.portfolio")}
        />
      </div>
      <p className="mb-5 text-[12px] text-muted leading-snug">
        {mode === "single"
          ? t(locale, "home.tab.hint.single")
          : t(locale, "home.tab.hint.portfolio")}
      </p>
      {mode === "single" ? (
        <BacktestForm locale={locale} />
      ) : (
        <PortfolioForm locale={locale} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition ${
        active
          ? "bg-foreground text-background"
          : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
