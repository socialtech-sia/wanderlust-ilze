/**
 * "Sadarbība ar Enter Gauja" cooperation block (guidelines §4).
 * Composition: white background, official "mountain" graphic (category
 * color) on the left, verbatim LV intro paragraph in the middle,
 * APSKATĪT button on the right, and the official Enter Gauja logo
 * anchored at the bottom edge.
 */

import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { EnterGaujaLogo } from "./EnterGaujaLogo";
import { EnterGaujaRibbon } from "./EnterGaujaRibbon";
import {
  EG_BLOCK_ASSET,
  EG_OFFICIAL_INTRO_LV,
  EG_OLIVE,
  type EnterGaujaCategoryInfo,
} from "@/lib/enter-gauja";
import { useCurrentLanguage } from "@/hooks/use-current-language";

export function EnterGaujaBacklinkBlock({
  category,
}: {
  category?: EnterGaujaCategoryInfo;
}) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const href = category?.url ?? "https://entergauja.lv/";
  const color = category?.color ?? "#7A8A2E";
  const block = category ? EG_BLOCK_ASSET[category.key] : undefined;

  // Guidelines require the LV intro verbatim. On non-LV pages we show the
  // short translated summary, which is site-copy (allowed — the block's
  // body text uses the partner site's font/voice).
  const body =
    lang === "lv" && category
      ? EG_OFFICIAL_INTRO_LV[category.key]
      : t("entergauja.backlink_body", {
          defaultValue:
            "Wanderlust.lv is an Enter Gauja partner. Discover nature trails, castles and cultural events across the Gauja Valley.",
        });

  const ctaLabel = category
    ? `APSKATĪT ${category.label}`
    : "APSKATĪT ENTER GAUJA";

  return (
    <aside
      className="entergauja-block container-editorial my-16"
      itemScope
      itemType="https://schema.org/WPSideBar"
    >
      <div className="relative overflow-hidden border border-border/60 bg-white">
        <EnterGaujaRibbon
          color={color}
          label={t("entergauja.ribbon", {
            defaultValue: "Sadarbība ar Enter Gauja",
          })}
        />

        {/* Decorative geometric shapes in gray tones (guidelines §4). */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 top-16 h-64 w-64 rotate-12 bg-neutral-100" />
          <div className="absolute -left-16 bottom-0 h-40 w-40 -rotate-6 bg-neutral-50" />
        </div>

        <div className="relative grid gap-8 p-8 md:grid-cols-[minmax(0,260px)_1fr_auto] md:items-center md:gap-10 md:p-10">
          {/* Left — official mountain graphic */}
          <div className="flex justify-center md:justify-start">
            {block ? (
              <img
                src={block.url}
                alt={`Enter Gauja — ${category?.label ?? ""}`}
                width={260}
                height={200}
                loading="lazy"
                decoding="async"
                className="h-auto w-full max-w-[260px]"
              />
            ) : (
              <EnterGaujaLogo className="h-24 w-24" size={96} />
            )}
          </div>

          {/* Middle — verbatim LV body copy */}
          <div className="text-center md:text-left">
            <p
              className="font-eg-plate text-[11px] font-bold uppercase"
              style={{ color, letterSpacing: "0.18em" }}
            >
              {category?.label ?? "Enter Gauja"}
            </p>
            <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-foreground">
              {body}
            </p>
          </div>

          {/* Right — CTA */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            <a
              href={href}
              target="_blank"
              rel="noopener"
              className="font-eg-plate group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold uppercase text-white shadow-sm transition-colors"
              style={{
                backgroundColor: color,
                letterSpacing: "0.08em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = EG_OLIVE;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = color;
              }}
            >
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Official logo anchored at the bottom edge (guidelines §4). */}
        <div className="relative flex items-center justify-end border-t border-neutral-100 bg-white px-6 py-4">
          <EnterGaujaLogo className="h-12 w-12" size={48} />
        </div>
      </div>
    </aside>
  );
}
