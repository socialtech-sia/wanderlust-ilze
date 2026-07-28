import { useTranslation } from "react-i18next";

const STEPS = ["s1", "s2", "s3", "s4"] as const;

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section data-header-tone="light" className="surface-light section-y">
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="text-eyebrow">03 · Process</p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl">{t("howitworks.title")}</h2>
          <p className="mt-3 text-ink-muted">{t("howitworks.subtitle")}</p>
        </div>

        <ol className="relative mt-10 grid gap-8 md:mt-14 md:grid-cols-4 md:gap-6">
          <span
            aria-hidden
            className="absolute left-[15px] top-2 hidden h-px w-full bg-border md:left-0 md:block"
          />
          <span
            aria-hidden
            className="absolute left-[15px] top-3 block h-[calc(100%-2rem)] w-px bg-border md:hidden"
          />
          {STEPS.map((s, i) => (
            <li key={s} className="relative pl-11 md:pl-0">
              <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-paper font-display text-sm text-foreground md:relative md:mb-5">
                {i + 1}
              </span>
              <h3 className="font-display text-xl leading-tight text-foreground">
                {t(`howitworks.${s}_title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {t(`howitworks.${s}_text`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
