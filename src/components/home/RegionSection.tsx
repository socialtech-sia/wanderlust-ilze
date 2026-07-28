import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { ENTER_GAUJA_CATEGORIES } from "@/lib/enter-gauja";

/** Four toponyms the routes are built around, coloured with Enter Gauja palette. */
const PLACES = [
  { key: "sigulda", color: ENTER_GAUJA_CATEGORIES.nature.color, category: "nature" as const },
  { key: "turaida", color: ENTER_GAUJA_CATEGORIES.history.color, category: "history" as const },
  { key: "cesis", color: ENTER_GAUJA_CATEGORIES.culture.color, category: "culture" as const },
  { key: "ligatne", color: ENTER_GAUJA_CATEGORIES.action.color, category: "action" as const },
];

export function RegionSection() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();

  return (
    <section data-header-tone="dark" className="surface-dark surface-deep section-y">
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="text-eyebrow">05 · Gaujas ieleja</p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl">{t("region.title")}</h2>
          <p className="mt-3 text-ink-muted">{t("region.subtitle")}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14">
          {PLACES.map((p) => (
            <article
              key={p.key}
              className="flex flex-col rounded-2xl p-6 text-white md:p-8"
              style={{ backgroundColor: p.color }}
            >
              <h3 className="font-display text-2xl leading-tight md:text-3xl">
                {t(`region.${p.key}_title`)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                {t(`region.${p.key}_text`)}
              </p>
              <Link
                to="/$lang/tours"
                params={{ lang }}
                search={{ category: p.category }}
                className="mt-6 inline-flex items-center gap-1.5 self-start border-b border-white/50 pb-0.5 text-xs font-semibold uppercase tracking-wider text-white hover:border-white"
              >
                {t("region.cta")} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
