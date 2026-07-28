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
        "text-utility inline-flex items-center gap-1.5",
        size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]",
      )}
      style={{ backgroundColor: color, color: "#fff" }}
    >
      {label}
    </span>
  );
}
