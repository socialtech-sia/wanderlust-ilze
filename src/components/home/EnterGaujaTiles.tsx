import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { useEnterGaujaCategories } from "@/hooks/use-services";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { tField } from "@/lib/language";
import { EnterGaujaGlyph } from "@/components/entergauja/EnterGaujaCategoryIcon";
import type { EnterGaujaKey } from "@/lib/enter-gauja";

export function EnterGaujaTiles() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { data } = useEnterGaujaCategories();

  return (
    <section className="container-editorial py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-eyebrow">03 · Enter Gauja</p>
        <h2 className="mt-2 font-display text-3xl md:text-5xl">
          {t("home.gauja_title")}
        </h2>
        <p className="mt-3 text-ink-muted">{t("home.gauja_subtitle")}</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {data?.map((cat) => {
          const key = cat.key as EnterGaujaKey;
          const color = cat.color_hex ?? "#7A8A2E";
          return (
            <Link
              key={cat.key}
              to="/$lang/tours"
              params={{ lang }}
              search={{ category: cat.key }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-1"
                style={{ backgroundColor: color }}
              />
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: color }}
              >
                <EnterGaujaGlyph category={key} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl text-foreground">
                {tField(cat, "name", lang)}
              </h3>
              <p className="mt-2 text-sm text-ink-muted">
                {tField(cat, "description", lang)}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-ink-muted">
                {t("cta.explore")}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
