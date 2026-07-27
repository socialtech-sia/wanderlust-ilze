import { useTranslation } from "react-i18next";
import { Flower2, Sun, Leaf, Snowflake } from "lucide-react";

const SEASONS = [
  { key: "spring", icon: Flower2 },
  { key: "summer", icon: Sun },
  { key: "autumn", icon: Leaf },
  { key: "winter", icon: Snowflake },
] as const;

export function Seasons() {
  const { t } = useTranslation();

  return (
    <section className="bg-paper-alt py-16 md:py-20">
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="text-eyebrow">08 · Sezonas</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">{t("seasons.title")}</h2>
          <p className="mt-3 text-ink-muted">{t("seasons.subtitle")}</p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-10 md:grid-cols-4">
          {SEASONS.map(({ key, icon: Icon }) => (
            <div key={key} className="rounded-2xl border border-border/60 bg-card p-5">
              <Icon className="h-5 w-5 text-moss-deep" aria-hidden />
              <h3 className="mt-3 font-display text-lg text-foreground">
                {t(`seasons.${key}_title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {t(`seasons.${key}_text`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
