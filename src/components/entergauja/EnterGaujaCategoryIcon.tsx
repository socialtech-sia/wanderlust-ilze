/**
 * Enter Gauja category pictograms — minimalist single-color glyphs that
 * echo the pin/mountain graphic from the brand book (pages 19–22) without
 * copying the licensed vector art. The `Pin` variant wraps the glyph in
 * the trapezoidal category-colored badge used at the bottom-left of the
 * partner backlink block on the guidelines examples.
 */

import type { EnterGaujaKey } from "@/lib/enter-gauja";

type IconProps = { className?: string };

function NatureGlyph({ className }: IconProps) {
  // Stylised fir tree
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2 L6 10 L9 10 L4.5 16 L9 16 L4 22 L20 22 L15 16 L19.5 16 L15 10 L18 10 Z" />
    </svg>
  );
}

function HistoryGlyph({ className }: IconProps) {
  // Castle turret
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 8h2V5h3v3h2V5h4v3h2V5h3v3h2v3h-1v11H4V11H3V8Zm5 6h3v4H8v-4Zm5 0h3v4h-3v-4Z" />
    </svg>
  );
}

function CultureGlyph({ className }: IconProps) {
  // Austra star / sun cross
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2 L14 8 L20 6 L16 11 L22 12 L16 13 L20 18 L14 16 L12 22 L10 16 L4 18 L8 13 L2 12 L8 11 L4 6 L10 8 Z" />
    </svg>
  );
}

function ActionGlyph({ className }: IconProps) {
  // Lightning
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" />
    </svg>
  );
}

const GLYPHS = {
  nature: NatureGlyph,
  history: HistoryGlyph,
  culture: CultureGlyph,
  action: ActionGlyph,
} as const;

export function EnterGaujaGlyph({
  category,
  className,
}: {
  category: EnterGaujaKey;
  className?: string;
}) {
  const G = GLYPHS[category] ?? NatureGlyph;
  return <G className={className} />;
}

/**
 * Category "pin" graphic — trapezoidal badge in the category color with the
 * glyph knocked out in white and a small chevron top marker. Mirrors the
 * mountain-pin cluster from brand book page 19.
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
    <div
      className={["relative inline-flex flex-col items-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Angular mountain silhouette behind the pin */}
      <svg
        viewBox="0 0 160 90"
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-[180%] max-w-none opacity-60"
        aria-hidden
      >
        <polygon points="0,90 40,30 70,60 110,10 160,90" fill="#E5E1D6" />
        <polygon points="20,90 60,45 90,70 130,30 160,60 160,90" fill="#D8D2C1" />
      </svg>

      {/* Trapezoidal pin */}
      <div className="relative flex flex-col items-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-md text-white shadow-md"
          style={{ backgroundColor: color }}
        >
          <EnterGaujaGlyph category={category} className="h-8 w-8" />
        </div>
        {/* Pointed base */}
        <div
          className="h-3 w-3 -mt-1 rotate-45"
          style={{ backgroundColor: color }}
        />
        {label && (
          <div
            className="mt-2 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white rounded-sm"
            style={{
              backgroundColor: color,
              fontFamily: "'Barlow Condensed', 'DIN Alternate', sans-serif",
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
