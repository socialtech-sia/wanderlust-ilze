/**
 * Enter Gauja backlink block for partner pages (guidelines page 29).
 * Placed near the bottom of category / list pages to reinforce the
 * community cross-link and share SEO authority.
 */

import { useTranslation } from "react-i18next";
import { EnterGaujaLogo } from "./EnterGaujaPartnerBadge";
import type { EnterGaujaCategoryInfo } from "@/lib/enter-gauja";

export function EnterGaujaBacklinkBlock({
  category,
}: {
  category?: EnterGaujaCategoryInfo;
}) {
  const { t } = useTranslation();
  const href = category?.url ?? "https://entergauja.lv/";
  const color = category?.color ?? "#4F6F19";
  const cta = category
    ? t("entergauja.cta_view_category", { category: category.label })
    : t("entergauja.cta_view");

  return (
    <aside
      className="entergauja-block container-editorial my-16"
      itemScope
      itemType="https://schema.org/WPSideBar"
    >
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-border/60 bg-paper-alt/70 p-8 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-4">
          <EnterGaujaLogo className="h-14 w-auto" />
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color }}
            >
              {category?.label ?? "Enter Gauja"}
            </p>
            <p className="mt-1 max-w-xl text-sm text-foreground/80">
              {t("entergauja.backlink_body")}
            </p>
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center justify-center rounded-sm px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: color,
            fontFamily: "'Barlow Condensed', 'DIN Alternate', sans-serif",
          }}
        >
          {cta}
        </a>
      </div>
    </aside>
  );
}
