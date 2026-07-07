/**
 * Sticky Enter Gauja partner badge — right edge on desktop, per brand
 * guidelines page 17.
 *
 * Two-tier layout from the guidelines: white block with the Enter Gauja
 * wordmark on top, category-color plate underneath. Site-friendly rounding
 * and shadow so it does not clash with the editorial aesthetic.
 */

import { useEffect, useState } from "react";
import {
  ENTER_GAUJA_ROOT_URL,
  type EnterGaujaCategoryInfo,
} from "@/lib/enter-gauja";
import { EnterGaujaLogo } from "./EnterGaujaLogo";

// Re-export so existing imports of `EnterGaujaLogo` from this module keep working.
export { EnterGaujaLogo } from "./EnterGaujaLogo";

interface Props {
  category?: EnterGaujaCategoryInfo;
  /** Absolute Enter Gauja URL to link to. Defaults to the category hub or root. */
  href?: string;
}

export function EnterGaujaPartnerBadge({ category, href }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const target = href ?? category?.url ?? ENTER_GAUJA_ROOT_URL;
  const color = category?.color ?? "#7A8A2E";

  return (
    <a
      href={target}
      target="_blank"
      rel="noopener"
      aria-label={`Enter Gauja${category ? ` — ${category.label}` : ""}`}
      className={[
        "fixed z-40 select-none transition-all duration-300",
        "right-4 top-1/2 -translate-y-1/2",
        "hidden md:block",
        visible
          ? "opacity-100 translate-x-0"
          : "pointer-events-none opacity-0 translate-x-4",
      ].join(" ")}
    >
      <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
        <div className="flex items-center justify-center bg-white px-3 pt-3 pb-2">
          <EnterGaujaLogo className="h-16 w-16" />
        </div>
        {category && (
          <div
            className="flex items-center justify-center px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white"
            style={{
              backgroundColor: color,
              fontFamily: "'Barlow Condensed', 'DIN Alternate', sans-serif",
            }}
          >
            {category.label}
          </div>
        )}
      </div>
    </a>
  );
}

/**
 * Compact horizontal variant for inline / footer use. Pill radius so it
 * blends with the editorial UI. Mobile-friendly.
 */
export function EnterGaujaPartnerChip({
  category,
}: {
  category?: EnterGaujaCategoryInfo;
}) {
  const target = category?.url ?? ENTER_GAUJA_ROOT_URL;
  const color = category?.color ?? "#7A8A2E";
  return (
    <a
      href={target}
      target="_blank"
      rel="noopener"
      aria-label={`Enter Gauja${category ? ` — ${category.label}` : ""}`}
      className="inline-flex items-stretch overflow-hidden rounded-full bg-white shadow ring-1 ring-black/10"
    >
      <span className="flex items-center bg-white px-3 py-1.5">
        <EnterGaujaLogo className="h-7 w-7" />
      </span>
      {category && (
        <span
          className="flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
          style={{
            backgroundColor: color,
            fontFamily: "'Barlow Condensed', 'DIN Alternate', sans-serif",
          }}
        >
          {category.label}
        </span>
      )}
    </a>
  );
}
