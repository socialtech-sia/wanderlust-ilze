/**
 * Enter Gauja backlink block for partner pages (guidelines page 19/29).
 * Composition: category ribbon on top → three columns (pin graphic ·
 * paragraph · CTA) → Enter Gauja lockup on the far right. Editorial pill
 * CTA so it matches the rest of the site.
 */

import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { EnterGaujaLogo } from "./EnterGaujaLogo";
import { EnterGaujaPin } from "./EnterGaujaCategoryIcon";
import { EnterGaujaRibbon } from "./EnterGaujaRibbon";
import { Button } from "@/components/ui/button";
import type { EnterGaujaCategoryInfo, EnterGaujaKey } from "@/lib/enter-gauja";

export function EnterGaujaBacklinkBlock({
  category,
}: {
  category?: EnterGaujaCategoryInfo;
}) {
  const { t } = useTranslation();
  const href = category?.url ?? "https://entergauja.lv/";
  const color = category?.color ?? "#7A8A2E";
  const cta = category
    ? t("entergauja.cta_view_category", { category: category.label })
    : t("entergauja.cta_view");

  return (
    <aside
      className="entergauja-block container-editorial my-16"
      itemScope
      itemType="https://schema.org/WPSideBar"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-paper-alt/70">
        <EnterGaujaRibbon
          color={color}
          label={t("entergauja.ribbon", { defaultValue: "Sadarbība ar Enter Gauja" })}
          className="-mt-px"
        />

        <div className="grid gap-8 p-8 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-10 md:p-10">
          {/* Left — pin graphic */}
          <div className="flex justify-center md:justify-start">
            {category ? (
              <EnterGaujaPin
                category={category.key as EnterGaujaKey}
                color={color}
                label={category.label}
              />
            ) : (
              <EnterGaujaLogo className="h-20 w-20" />
            )}
          </div>

          {/* Middle — copy */}
          <div className="text-center md:text-left">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color }}
            >
              {category?.label ?? "Enter Gauja"}
            </p>
            <p className="mt-2 font-display text-xl leading-snug text-foreground md:text-2xl">
              {t("entergauja.backlink_body", {
                defaultValue:
                  "Mēs esam Enter Gauja kopienas partneri. Atklāj vairāk par dabas takām, pilīm un kultūras pasākumiem Gaujas ielejā.",
              })}
            </p>
          </div>

          {/* Right — CTA + wordmark */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            <Button asChild variant="category" size="md" style={{ backgroundColor: color }}>
              <a href={href} target="_blank" rel="noopener" className="group">
                {cta}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Button>
            <EnterGaujaLogo className="h-14 w-14 opacity-90" />
          </div>
        </div>
      </div>
    </aside>
  );
}
