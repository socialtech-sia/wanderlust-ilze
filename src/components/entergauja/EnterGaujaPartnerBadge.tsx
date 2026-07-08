/**
 * Sticky Enter Gauja partner badge (guidelines §3 — floating badge fixed
 * to the right of the screen). Composition: official logo on top + solid
 * rectangular category plate with the category name in DIN Pro Bold white.
 * No rounded corners on the plate, no logo recoloring.
 */

import { useEffect, useState } from "react";
import {
  ENTER_GAUJA_ROOT_URL,
  type EnterGaujaCategoryInfo,
} from "@/lib/enter-gauja";
import { EnterGaujaLogo } from "./EnterGaujaLogo";

export { EnterGaujaLogo } from "./EnterGaujaLogo";

interface Props {
  category?: EnterGaujaCategoryInfo;
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

  return (
    <a
      href={target}
      target="_blank"
      rel="noopener"
      aria-label={`Enter Gauja${category ? ` — ${category.label}` : ""}`}
      className={[
        "eg-badge fixed right-0 top-[120px] z-40 hidden w-[132px] shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition-all duration-300 md:block",
        "max-md:fixed max-md:bottom-[90px] max-md:top-auto max-md:w-[96px]",
        visible ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0 translate-x-4",
      ].join(" ")}
    >
      <img
        src={EG_LOGO_ASSET_URL}
        alt="Enter Gauja — Gauja National Park Latvia"
        className="block w-full"
        loading="lazy"
        decoding="async"
      />
      {category && (
        <span
          className="font-eg-plate flex h-[30px] items-center justify-center text-[14px] font-bold uppercase text-white"
          style={{
            backgroundColor: category.color,
            letterSpacing: "0.02em",
          }}
        >
          {category.label}
        </span>
      )}
    </a>
  );
}

// Local re-export to avoid a duplicate <EnterGaujaLogo/> component tree for a
// tiny image. Import at module scope for SSR.
import { EG_LOGO_ASSET } from "@/lib/enter-gauja";
const EG_LOGO_ASSET_URL = EG_LOGO_ASSET.url;

/** Compact horizontal variant — inline / footer use. */
export function EnterGaujaPartnerChip({
  category,
}: {
  category?: EnterGaujaCategoryInfo;
}) {
  const target = category?.url ?? ENTER_GAUJA_ROOT_URL;
  return (
    <a
      href={target}
      target="_blank"
      rel="noopener"
      aria-label={`Enter Gauja${category ? ` — ${category.label}` : ""}`}
      className="inline-flex items-stretch overflow-hidden bg-white shadow ring-1 ring-black/10"
    >
      <span className="flex items-center bg-white px-2 py-1">
        <EnterGaujaLogo className="h-8 w-8" size={32} />
      </span>
      {category && (
        <span
          className="font-eg-plate flex items-center px-3 py-1 text-[11px] font-bold uppercase text-white"
          style={{ backgroundColor: category.color, letterSpacing: "0.02em" }}
        >
          {category.label}
        </span>
      )}
    </a>
  );
}
