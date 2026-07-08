/**
 * "Sadarbība ar Enter Gauja" ribbon — rectangular category-color strip
 * with the label in DIN Pro Bold white (guidelines §1: plate corners
 * must not be rounded).
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
    <div
      className={["font-eg-plate flex items-center justify-center px-6 py-2 text-[12px] font-bold uppercase text-white", className]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundColor: color, letterSpacing: "0.08em" }}
    >
      {label}
    </div>
  );
}
