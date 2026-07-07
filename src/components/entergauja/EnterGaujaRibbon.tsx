/**
 * "Sadarbība ar Enter Gauja" opening ribbon — decorative chevron strip in the
 * category color, echoing the top-of-block marker from brand book page 19.
 */

export function EnterGaujaRibbon({
  color,
  label,
  className,
}: {
  color: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={["relative flex justify-center", className].filter(Boolean).join(" ")}>
      <div
        className="relative inline-flex items-center gap-2 px-6 py-2 text-white"
        style={{
          backgroundColor: color,
          fontFamily: "'Barlow Condensed', 'DIN Alternate', sans-serif",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontSize: "12px",
          clipPath:
            "polygon(6% 0, 94% 0, 100% 55%, 94% 100%, 6% 100%, 0 55%)",
        }}
      >
        <svg viewBox="0 0 12 8" className="h-2 w-3" fill="currentColor" aria-hidden>
          <polygon points="0,8 6,0 12,8" />
        </svg>
        {label}
      </div>
    </div>
  );
}
