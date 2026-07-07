/**
 * Home-page partner block for Enter Gauja — surfaces the community
 * membership plus the four primary categories with links to the
 * entergauja.lv hubs. Editorial layout with pill CTAs to match site style.
 */

import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import {
  ENTER_GAUJA_ORDER,
  ENTER_GAUJA_CATEGORIES,
  ENTER_GAUJA_ROOT_URL,
} from "@/lib/enter-gauja";
import { EnterGaujaLogo } from "@/components/entergauja/EnterGaujaLogo";
import { EnterGaujaGlyph } from "@/components/entergauja/EnterGaujaCategoryIcon";
import { Button } from "@/components/ui/button";

export function EnterGaujaBadge() {
  const { t } = useTranslation();
  return (
    <section className="container-editorial pb-20 md:pb-28">
      <div className="rounded-3xl border border-border/60 bg-paper-alt/70 p-8 md:p-12">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:gap-10 md:text-left">
          <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
            <EnterGaujaLogo className="h-20 w-20 shrink-0" />
            <div>
              <p className="text-eyebrow">Enter Gauja</p>
              <p className="mt-2 max-w-xl font-display text-2xl leading-tight text-foreground">
                {t("home.partner_text", { defaultValue: "Enter Gauja partnership network member" })}
              </p>
              <p className="mt-3 max-w-xl text-sm text-ink-muted">
                {t("entergauja.partner_body", {
                  defaultValue:
                    "Wanderlust.lv ir Enter Gauja kopienas partneris — vienotā Gaujas nacionālā parka tūrisma tīkla daļa, kas apvieno dabu, vēsturi, kultūru un aktīvo atpūtu.",
                })}
              </p>
            </div>
          </div>
          <Button asChild size="md">
            <a href={ENTER_GAUJA_ROOT_URL} target="_blank" rel="noopener" className="group">
              {t("home.partner_learn", { defaultValue: "Uzzināt par Enter Gauja" })}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ENTER_GAUJA_ORDER.map((key) => {
            const c = ENTER_GAUJA_CATEGORIES[key];
            return (
              <a
                key={key}
                href={c.url}
                target="_blank"
                rel="noopener"
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-card"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ backgroundColor: c.color }}
                />
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: c.color }}
                >
                  <EnterGaujaGlyph category={key} className="h-5 w-5" />
                </span>
                <span
                  className="mt-4 text-[13px] font-bold uppercase tracking-[0.16em] text-foreground"
                  style={{
                    fontFamily: "'Barlow Condensed', 'DIN Alternate', sans-serif",
                  }}
                >
                  {c.label}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted">
                  entergauja.lv
                  <ArrowUpRight className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
