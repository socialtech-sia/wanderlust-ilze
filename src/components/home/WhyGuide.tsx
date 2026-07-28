import { useTranslation } from "react-i18next";

const REASONS = ["i1", "i2", "i3"] as const;

export function WhyGuide() {
  const { t } = useTranslation();

  return (
    <section data-header-tone="dark" className="surface-dark section-y">
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="text-eyebrow">07 · Ar gidi</p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl">{t("why.title")}</h2>
          <p className="mt-3 text-ink-muted">{t("why.subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-10">
          {REASONS.map((r, i) => (
            <div key={r} className="border-t border-border pt-6">
              <span className="text-eyebrow text-ink-muted">0{i + 1}</span>
              <h3 className="mt-3 font-display text-xl leading-tight text-foreground md:text-2xl">
                {t(`why.${r}_title`)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t(`why.${r}_text`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
