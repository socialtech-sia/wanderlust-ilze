import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/use-reveal";

/**
 * SIGNATURE ELEMENT — sandstone strata.
 *
 * A horizontal band of 4–6 ribbons of varying height and tone, reading as a
 * geological cut through the Gauja valley. Used in exactly three places:
 *  1. transition between a dark and a light section,
 *  2. progress in the booking wizard,
 *  3. hover reaction at the bottom of a service card.
 * Nowhere else — otherwise it stops being a signature and becomes noise.
 */

export interface StrataBand {
  /** height in px */
  h: number;
  /** css color */
  c: string;
  /** 0..1 */
  o?: number;
}

export const SANDSTONE_BANDS: StrataBand[] = [
  { h: 3, c: "var(--sandstone-bright)", o: 0.9 },
  { h: 7, c: "var(--sandstone)", o: 1 },
  { h: 2, c: "var(--bone-faint)", o: 0.55 },
  { h: 11, c: "color-mix(in oklab, var(--sandstone) 55%, var(--pine))", o: 1 },
  { h: 4, c: "color-mix(in oklab, var(--sandstone) 30%, var(--pine))", o: 1 },
  { h: 8, c: "var(--pine-raised)", o: 1 },
];

export function StrataDivider({
  bands = SANDSTONE_BANDS,
  className,
  flip = false,
}: {
  bands?: StrataBand[];
  className?: string;
  flip?: boolean;
}) {
  const ref = useReveal<HTMLDivElement>("data-strata");
  const ordered = flip ? [...bands].reverse() : bands;

  return (
    <div
      ref={ref}
      data-strata="in"
      aria-hidden="true"
      className={cn("pointer-events-none w-full select-none overflow-hidden", className)}
    >
      {ordered.map((b, i) => (
        <span
          key={i}
          style={{
            height: `${b.h}px`,
            backgroundColor: b.c,
            opacity: b.o ?? 1,
            transitionDelay: `${i * 70}ms`,
          }}
        />
      ))}
    </div>
  );
}

/** Category-tinted strata that surfaces at the bottom of a service card on hover. */
export function StrataHoverBar({ colors }: { colors: string[] }) {
  const palette = colors.length ? colors : ["var(--sandstone)"];
  const bands = [3, 6, 2, 5].map((h, i) => ({
    h,
    c: palette[i % palette.length],
    o: [0.95, 1, 0.5, 0.8][i],
  }));

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 origin-bottom scale-y-0 opacity-0 transition-[transform,opacity] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:scale-y-100 group-focus-visible:opacity-100"
    >
      {bands.map((b, i) => (
        <span
          key={i}
          className="block"
          style={{ height: `${b.h}px`, backgroundColor: b.c, opacity: b.o }}
        />
      ))}
    </div>
  );
}
