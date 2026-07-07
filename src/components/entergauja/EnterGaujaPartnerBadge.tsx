/**
 * Sticky Enter Gauja partner badge — right edge on desktop, floating bottom
 * on mobile, per brand guidelines page 17.
 *
 * "Elementu ar logotipu un kategorijas nosaukumu ieteicams piestiprināt
 *  ekrāna labajā pusē. Ritinot lapu, logotips paliks lietotājam redzamajā
 *  acu skatiena laukā. Nospiežot uz logotipu, lietotājs tiks novirzīts
 *  uz Enter Gauja sākumlapu ar konkrētā partnera pakalpojumiem."
 */

import { useEffect, useState } from "react";
import {
  ENTER_GAUJA_ROOT_URL,
  type EnterGaujaCategoryInfo,
} from "@/lib/enter-gauja";

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
  const color = category?.color ?? "#4F6F19";

  return (
    <a
      href={target}
      target="_blank"
      rel="noopener"
      aria-label={`Enter Gauja${category ? ` — ${category.label}` : ""}`}
      className={[
        "fixed z-40 select-none transition-all duration-300",
        "right-3 top-1/2 -translate-y-1/2",
        "hidden md:flex",
        visible ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0 translate-x-4",
      ].join(" ")}
    >
      <div className="flex flex-col items-stretch overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-black/10">
        <div className="flex items-center justify-center bg-white px-3 py-2">
          <EnterGaujaLogo className="h-10 w-auto" />
        </div>
        {category && (
          <div
            className="flex items-center justify-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
            style={{ backgroundColor: color, fontFamily: "'Barlow Condensed', 'DIN Alternate', sans-serif" }}
          >
            {category.label}
          </div>
        )}
      </div>
    </a>
  );
}

/**
 * Compact horizontal variant for mobile / inline use.
 * Guidelines page 17 — placed within footer / next to page CTAs.
 */
export function EnterGaujaPartnerChip({ category }: { category?: EnterGaujaCategoryInfo }) {
  const target = category?.url ?? ENTER_GAUJA_ROOT_URL;
  const color = category?.color ?? "#4F6F19";
  return (
    <a
      href={target}
      target="_blank"
      rel="noopener"
      aria-label={`Enter Gauja${category ? ` — ${category.label}` : ""}`}
      className="inline-flex items-stretch overflow-hidden rounded-sm bg-white shadow ring-1 ring-black/10"
    >
      <span className="flex items-center bg-white px-2.5 py-1.5">
        <EnterGaujaLogo className="h-6 w-auto" />
      </span>
      {category && (
        <span
          className="flex items-center px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
          style={{ backgroundColor: color, fontFamily: "'Barlow Condensed', 'DIN Alternate', sans-serif" }}
        >
          {category.label}
        </span>
      )}
    </a>
  );
}

/**
 * Text-based Enter Gauja wordmark (SVG) — approximates the low-poly wordmark
 * from the brand book without requiring the licensed DIN Pro font.
 * If/when the user provides the official logo SVG, swap this for an <img>.
 */
export function EnterGaujaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 44" className={className} role="img" aria-label="Enter Gauja">
      <rect x="0" y="0" width="88" height="44" fill="#4F6F19" />
      <g fill="#FFFFFF" fontFamily="'Barlow Condensed', 'DIN Alternate', sans-serif" fontWeight="900">
        <text x="6" y="14" fontSize="12">EN</text>
        <text x="30" y="14" fontSize="12">TER</text>
        <text x="6" y="27" fontSize="12">GAU</text>
        <text x="34" y="27" fontSize="12">JA</text>
        <text x="6" y="40" fontSize="6" letterSpacing="0.6">GAUJA NATIONAL PARK</text>
      </g>
    </svg>
  );
}
