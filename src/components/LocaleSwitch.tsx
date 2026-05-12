"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, type Locale, LOCALE_LABEL } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const ONE_YEAR = 60 * 60 * 24 * 365;

export function LocaleSwitch({ locale }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function set(next: Locale) {
    if (next === locale) return;
    document.cookie = `locale=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full border border-line bg-card p-0.5 text-[11px] tabular ${
        pending ? "opacity-60" : ""
      }`}
    >
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => set(l)}
            aria-pressed={active}
            className={`px-2.5 py-1 rounded-full transition ${
              active
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {LOCALE_LABEL[l]}
          </button>
        );
      })}
    </div>
  );
}
