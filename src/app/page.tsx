import { HomeForms } from "@/components/HomeForms";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale.server";
import { PRESETS } from "@/lib/presets";

export default async function Home() {
  const locale = await getLocale();
  return (
    <div className="flex-1 flex flex-col">
      <main className="mx-auto w-full max-w-2xl px-5 sm:px-8 py-10 sm:py-16">
        <header className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[11px] tracking-wide text-muted mb-5">
            <span className="size-1.5 rounded-full bg-accent" />
            {t(locale, "home.badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
            {t(locale, "home.h1.line1")}
            <br />
            <span className="text-muted">{t(locale, "home.h1.line2")}</span>
          </h1>
          <p className="mt-4 text-[15px] text-muted leading-relaxed max-w-md">
            {t(locale, "home.lede")}
          </p>
        </header>

        <section className="rounded-2xl border border-line bg-card/70 backdrop-blur-sm p-5 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
          <HomeForms locale={locale} />
        </section>

        <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] text-muted">
          <Hint
            title={t(locale, "home.hint1.title")}
            body={t(locale, "home.hint1.body")}
          />
          <Hint
            title={t(locale, "home.hint2.title")}
            body={t(locale, "home.hint2.body")}
          />
          <Hint
            title={t(locale, "home.hint3.title")}
            body={t(locale, "home.hint3.body")}
          />
        </section>

        <footer className="mt-16 pt-8 border-t border-line text-[11px] text-muted leading-relaxed">
          <p>{t(locale, "home.footer.disclaimer")}</p>
          <p className="mt-2">
            {t(locale, "home.footer.support", { count: PRESETS.length })}
          </p>
        </footer>
      </main>
    </div>
  );
}

function Hint({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-line bg-card/40 p-3.5">
      <div className="text-foreground font-semibold text-[12.5px]">{title}</div>
      <div className="mt-1 leading-snug">{body}</div>
    </div>
  );
}
