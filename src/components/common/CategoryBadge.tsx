import type { EnterGaujaCategoryRow } from "@/hooks/use-services";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/language";
import { tField } from "@/lib/language";

type Cat = Database["public"]["Enums"]["enter_gauja_category"];

const FALLBACK: Record<Cat, { lv: string; en: string; es: string; hex: string }> = {
  action: { lv: "Piedzīvojums", en: "Action", es: "Aventura", hex: "#F05366" },
  nature: { lv: "Daba", en: "Nature", es: "Naturaleza", hex: "#4F6F19" },
  history: { lv: "Vēsture", en: "History", es: "Historia", hex: "#D1701A" },
  culture: { lv: "Kultūra", en: "Culture", es: "Cultura", hex: "#51869D" },
  getaround: { lv: "Gauja Get-around", en: "Gauja Get-around", es: "Gauja Get-around", hex: "#6987B6" },
};

export function CategoryBadge({
  category,
  lang,
  categoriesData,
  size = "sm",
}: {
  category: Cat;
  lang: Lang;
  categoriesData?: EnterGaujaCategoryRow[];
  size?: "sm" | "md";
}) {
  const row = categoriesData?.find((c) => c.key === category);
  const label = row ? tField(row, "name", lang) : FALLBACK[category][lang];
  const color = row?.color_hex ?? FALLBACK[category].hex;
  return (
    <span
      className={cn(
        "text-utility inline-flex items-center gap-1.5 rounded-full border border-white/30 font-bold leading-none text-white shadow-[0_2px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm",
        size === "sm"
          ? "px-2.5 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-[11px]"
          : "px-3.5 py-1.5 text-[11px] sm:px-4 sm:py-2 sm:text-[12px] lg:text-[13px]",
      )}
      style={{
        backgroundImage: `linear-gradient(160deg, color-mix(in oklab, ${color} 96%, white) 0%, color-mix(in oklab, ${color} 88%, black) 100%)`,
        textShadow: "0 1px 2px rgba(0,0,0,0.45)",
      }}
    >
      {label}
    </span>
  );
}
