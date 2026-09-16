/**
 * Enter Gauja category symbols — official low-poly ("Klinšu grafikas")
 * PNGs from the brand kit. Rendered as <img> so the artwork is used
 * as-is (no derivative works — guidelines §1/§2).
 */

import { EG_SYMBOL_ASSET, type EnterGaujaKey } from "@/lib/enter-gauja";

interface GlyphProps {
  category: EnterGaujaKey;
  className?: string;
  size?: number;
}

export function EnterGaujaGlyph({ category, className, size = 64 }: GlyphProps) {
  const asset = EG_SYMBOL_ASSET[category];
  if (!asset) return null;
  return (
    <img
      src={asset}
      alt=""
      aria-hidden
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

/**
 * Category pin block — official mountain graphic + category plate on top,
 * used in the partner backlink block (guidelines §4). The pin itself is
 * the raster asset; a small plate is stacked below for the label.
 */
export function EnterGaujaPin({
  category,
  color,
  label,
  className,
}: {
  category: EnterGaujaKey;
  color: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={["inline-flex flex-col items-center gap-2", className].filter(Boolean).join(" ")}>
      <EnterGaujaGlyph category={category} className="h-20 w-20" size={80} />
      {label && (
        <span
          className="font-eg-plate px-3 py-1 text-[11px] font-bold uppercase text-white"
          style={{ backgroundColor: color, letterSpacing: "0.02em" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
