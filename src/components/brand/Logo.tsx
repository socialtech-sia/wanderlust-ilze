import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type LogoVariant = "mark" | "horizontal" | "stacked";
export type LogoTone = "light" | "dark" | "auto";

interface LogoProps {
  variant?: LogoVariant;
  tone?: LogoTone;
  /** Size of the square mark in pixels. */
  size?: number;
  /** Hide the small uppercase tagline (horizontal / stacked). */
  showTagline?: boolean;
  className?: string;
}

const SANDSTONE = "var(--sandstone)";

function toneColor(tone: LogoTone): string {
  if (tone === "light") return "var(--bone)";
  if (tone === "dark") return "var(--pine)";
  return "currentColor";
}

function LogoMark({ size, color }: { size: number; color: string }) {
  const compact = size < 48;
  const box = Math.round(size * 0.6) / 1; // inner framed box
  const letter = size * (compact ? 0.56 : 0.34);

  return (
    <span
      aria-hidden="true"
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0"
        style={{ border: `2px solid ${SANDSTONE}` }}
      />
      {!compact && (
        <span
          className="absolute"
          style={{
            inset: Math.max(3, Math.round(size * 0.11)),
            border: `1px solid color-mix(in oklab, ${SANDSTONE} 45%, transparent)`,
          }}
        />
      )}
      <span
        className="relative flex flex-col items-center justify-center leading-none"
        style={{ width: box }}
      >
        <span
          style={{
            fontFamily: '"Source Serif 4", serif',
            fontSize: letter,
            lineHeight: 1,
            color,
            fontVariationSettings: '"opsz" 60, "wght" 420',
          }}
        >
          W
        </span>
        {!compact && (
          <span
            style={{
              marginTop: Math.max(2, size * 0.05),
              width: "40%",
              height: 1,
              backgroundColor: SANDSTONE,
            }}
          />
        )}
      </span>
    </span>
  );
}

export function Logo({
  variant = "horizontal",
  tone = "auto",
  size = 40,
  showTagline = true,
  className,
}: LogoProps) {
  const { t } = useTranslation();
  const color = toneColor(tone);
  const tagline = t("brand.tagline", {
    defaultValue: "SERTIFICĒTA GIDE · GAUJAS IELEJA",
  });

  const wordmark = (
    <span
      style={{
        fontFamily: '"Source Serif 4", serif',
        fontVariationSettings: '"opsz" 60, "wght" 390',
        letterSpacing: "-0.004em",
        fontSize: size * 0.58,
        lineHeight: 1.05,
        color,
      }}
    >
      Wanderlust
    </span>
  );

  /*
    Подпись лежит на hero-фотографии, которую клиент меняет из админки, и до
    этой правки была набрана 8.4 px краской в 70 % — на засвеченном небе это
    1.37:1, то есть её там просто не было.

    Кегль поднят до 11 px, краска до 85 %. Разрядка при этом ужата с 0.16em до
    0.10em намеренно: при новом кегле прежняя разрядка растянула бы подпись на
    226 px и выдавила бы меню из строки на узких десктопах. С 0.10em блок
    логотипа шире прежнего примерно на 30 px — ровно на столько же ужаты
    зазоры в меню (Header.tsx).

    Контраст на подложке шапки (.header-scrim, худший случай — белый кадр):
    5.30:1. На тёмном лесу — 8.48:1.
  */
  const caption = (
    <span
      className="text-utility"
      style={{
        fontFamily: '"Archivo Narrow", sans-serif',
        fontWeight: 650,
        textTransform: "uppercase",
        letterSpacing: "0.10em",
        fontSize: Math.max(10, size * 0.275),
        color: `color-mix(in oklab, ${color} 85%, transparent)`,
      }}
    >
      {tagline}
    </span>
  );

  if (variant === "mark") {
    return (
      <span className={cn("inline-flex", className)}>
        <LogoMark size={size} color={color} />
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span className={cn("inline-flex flex-col items-center gap-2", className)}>
        <LogoMark size={size} color={color} />
        {wordmark}
        <span
          style={{
            width: size * 1.4,
            height: 1,
            backgroundColor: `color-mix(in oklab, ${SANDSTONE} 55%, transparent)`,
          }}
        />
        {showTagline && caption}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark size={size} color={color} />
      <span className="flex flex-col justify-center">
        {wordmark}
        {showTagline && caption}
      </span>
    </span>
  );
}
