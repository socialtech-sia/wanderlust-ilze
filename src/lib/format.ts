import type { Lang } from "@/lib/language";

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "";
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDuration(minutes: number | null | undefined, lang: Lang): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hSuffix = { lv: "h", en: "h", es: "h" }[lang];
  const mSuffix = { lv: "min", en: "min", es: "min" }[lang];
  if (h === 0) return `${m} ${mSuffix}`;
  if (m === 0) return `${h} ${hSuffix}`;
  return `${h} ${hSuffix} ${m} ${mSuffix}`;
}
