/**
 * SIGNATURE ELEMENT — sandstone strata.
 *
 * Kept only where the device stays functional: the hover bar on service cards
 * (narrow, user-triggered, carries category colours) and the booking stepper.
 */


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
