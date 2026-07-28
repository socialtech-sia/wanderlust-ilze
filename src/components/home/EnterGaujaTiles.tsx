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
    <section data-header-tone="dark" className="surface-dark section-y">
      <div className="container-editorial">
      <div className="max-w-2xl">
        <p className="text-eyebrow">09 · Enter Gauja</p>
        <h2 className="mt-2 display-2">
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
              className="group relative flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:hairline"
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-1"
                style={{ backgroundColor: color }}
              />
              <EnterGaujaGlyph category={key} className="h-16 w-16" size={64} />
              <span
                className="font-eg-plate mt-4 inline-flex self-start px-3 py-1 text-[11px] font-bold uppercase text-white"
                style={{ backgroundColor: color, letterSpacing: "0.02em" }}
              >
                {tField(cat, "name", lang)}
              </span>
              <p className="mt-3 text-sm text-ink-muted">
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
    </div>
    </section>
  );
}
