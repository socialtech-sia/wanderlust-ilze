/**
 * Home-page CTA block that surfaces all four primary Enter Gauja categories.
 * Follows brand guidelines pages 7 and 16 — each category shown in its
 * official color, with a link to the corresponding entergauja.lv hub.
 */

import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { ENTER_GAUJA_ORDER, ENTER_GAUJA_CATEGORIES } from "@/lib/enter-gauja";
import { EnterGaujaLogo } from "@/components/entergauja/EnterGaujaPartnerBadge";

export function EnterGaujaBadge() {
  const { t } = useTranslation();
  return (
    <section className="container-editorial pb-20 md:pb-28">
      <div className="rounded-3xl border border-border/60 bg-paper-alt/70 p-8 md:p-12">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="flex items-start gap-5">
            <EnterGaujaLogo className="h-16 w-auto shrink-0" />
            <div>
              <p className="text-eyebrow">Enter Gauja</p>
              <p className="mt-2 max-w-xl font-display text-2xl leading-tight text-foreground">
                {t("home.partner_text")}
              </p>
              <p className="mt-3 max-w-xl text-sm text-ink-muted">
                {t("entergauja.partner_body")}
              </p>
            </div>
          </div>
          <a
            href="https://entergauja.lv/"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-full bg-moss-deep px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-moss"
          >
            {t("home.partner_learn")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ENTER_GAUJA_ORDER.map((key) => {
            const c = ENTER_GAUJA_CATEGORIES[key];
            return (
              <a
                key={key}
                href={c.url}
                target="_blank"
                rel="noopener"
                className="group flex items-center justify-between rounded-sm px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: c.color,
                  fontFamily: "'Barlow Condensed', 'DIN Alternate', sans-serif",
                }}
              >
                <span>{c.label}</span>
                <ExternalLink className="h-3 w-3 opacity-80 transition-opacity group-hover:opacity-100" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
