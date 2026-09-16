/**
 * "Sadarbība ar Enter Gauja" cooperation note (guidelines §4).
 * Compact single-row inset: official category graphic, cooperation
 * eyebrow + category name + short official intro, text link and the
 * official Enter Gauja logo.
 */

import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { EnterGaujaLogo } from "./EnterGaujaLogo";
import {
  EG_BLOCK_ASSET,
  EG_OFFICIAL_INTRO_LV,
  type EnterGaujaCategoryInfo,
} from "@/lib/enter-gauja";
import { useCurrentLanguage } from "@/hooks/use-current-language";

/** First one-and-a-half to two sentences of the official intro. */
function shorten(text: string): string {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  if (!parts?.length) return text;
  return parts.slice(0, 2).join("").trim();
}

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

  const body =
    lang === "lv" && category
      ? shorten(EG_OFFICIAL_INTRO_LV[category.key])
      : t("entergauja.backlink_body", {
          defaultValue:
            "Wanderlust.lv is an Enter Gauja partner. Discover nature trails, castles and cultural events across the Gauja Valley.",
        });

  return (
    <aside
      className="entergauja-block container-editorial my-12"
      itemScope
      itemType="https://schema.org/WPSideBar"
    >
      <div
        className="flex flex-col gap-4 rounded-lg border border-border/60 p-4 md:flex-row md:items-center md:gap-6 md:p-5"
        style={{ backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)` }}
      >
        {/* Category graphic */}
        {block ? (
          <img
            src={block}
            alt={`Enter Gauja — ${category?.label ?? ""}`}
            width={128}
            height={96}
            loading="lazy"
            decoding="async"
            className="h-20 w-auto max-w-[128px] shrink-0 object-contain object-left md:h-24"
          />
        ) : null}

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-eyebrow text-muted-foreground">
            {t("entergauja.ribbon", { defaultValue: "Sadarbība ar Enter Gauja" })}
          </p>
          <p
            className="mt-0.5 text-sm font-semibold"
            style={{ color }}
          >
            {category?.label ?? "Enter Gauja"}
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>

        {/* Link + logo */}
        <div className="flex shrink-0 items-center gap-4">
          <a
            href={href}
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color }}
          >
            {category?.label ?? "Enter Gauja"}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <EnterGaujaLogo
            className="h-7 w-7 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
            size={28}
          />
        </div>
      </div>
    </aside>
  );
}
