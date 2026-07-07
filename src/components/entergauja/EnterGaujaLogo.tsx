/**
 * Enter Gauja wordmark — SVG reconstruction of the "EN / TER / GAU / JÅ"
 * low-poly wordmark from the brand book (page 16). The little chevron above
 * "EN" is the abstracted mountain silhouette that appears on the official
 * logo. Solid olive fill; category label lives outside this component (see
 * EnterGaujaPartnerBadge).
 *
 * Pure inline SVG so it renders cleanly on SSR without any font swap.
 */
export function EnterGaujaLogo({
  className,
  color = "#7A8A2E",
  textColor = "#FFFFFF",
}: {
  className?: string;
  color?: string;
  textColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Enter Gauja — Gauja National Park Latvia"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="120" height="120" rx="4" fill={color} />

      {/* Low-poly chevron / mountain glyph */}
      <g fill={textColor}>
        <polygon points="52,14 60,26 68,14 60,8" opacity="0.95" />
        <polygon points="44,20 60,32 76,20 60,26" opacity="0.7" />
      </g>

      {/* Wordmark: EN / TER / GAU / JÅ  */}
      <g
        fill={textColor}
        fontFamily="'Barlow Condensed', 'DIN Alternate', 'Oswald', sans-serif"
        fontWeight={900}
        style={{ fontStretch: "condensed" }}
      >
        <text x="14" y="56" fontSize="22" letterSpacing="1">
          EN
        </text>
        <text x="50" y="56" fontSize="22" letterSpacing="1">
          TER
        </text>
        <text x="14" y="82" fontSize="22" letterSpacing="1">
          GAU
        </text>
        <text
          x="70"
          y="82"
          fontSize="22"
          letterSpacing="1"
          transform="rotate(180 82 74)"
        >
          JÅ
        </text>
      </g>

      {/* Fine baseline caption */}
      <text
        x="60"
        y="106"
        fill={textColor}
        fontFamily="'Barlow Condensed', 'DIN Alternate', sans-serif"
        fontWeight={700}
        fontSize="8"
        letterSpacing="1.2"
        textAnchor="middle"
      >
        GAUJA NATIONAL PARK · LATVIA
      </text>
    </svg>
  );
}

/**
 * Compact horizontal lockup — the "logo + category strip on the right" form
 * shown on brand book page 16. Used inline in copy and inside the sticky
 * partner badge.
 */
export function EnterGaujaLockup({
  category,
  className,
  bg = "#7A8A2E",
  categoryColor,
}: {
  category?: string;
  className?: string;
  bg?: string;
  categoryColor?: string;
}) {
  return (
    <div
      className={["inline-flex items-stretch overflow-hidden rounded-md", className]
        .filter(Boolean)
        .join(" ")}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
    >
      <EnterGaujaLogo className="h-14 w-14 shrink-0" color={bg} />
      <div
        className="flex flex-col justify-center px-3 py-1.5 text-white"
        style={{
          backgroundColor: categoryColor ?? bg,
          fontFamily: "'Barlow Condensed', 'DIN Alternate', sans-serif",
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "0.02em",
        }}
      >
        <span className="text-[11px] uppercase opacity-90">Gauja</span>
        <span className="text-[13px] uppercase">National</span>
        <span className="text-[13px] uppercase">Park</span>
        {category && (
          <span className="mt-1 text-[12px] normal-case opacity-95">{category}</span>
        )}
      </div>
    </div>
  );
}
