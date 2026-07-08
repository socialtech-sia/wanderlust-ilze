/**
 * Official Enter Gauja logo. Guidelines §1: original color and form only —
 * no recoloring, no distortion, no rounded corners. Callers control size
 * via className; keep at least 25% clear space around it.
 */
import { EG_LOGO_ASSET } from "@/lib/enter-gauja";

interface Props {
  className?: string;
  /** Rendered pixel size hint for lazy-loading; defaults to 96. */
  size?: number;
}

export function EnterGaujaLogo({ className, size = 96 }: Props) {
  return (
    <img
      src={EG_LOGO_ASSET.url}
      alt="Enter Gauja — Gauja National Park Latvia"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
