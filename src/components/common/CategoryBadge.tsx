import type { EnterGaujaCategoryRow } from "@/hooks/use-services";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/language";
import { tField } from "@/lib/language";

type Cat = Database["public"]["Enums"]["enter_gauja_category"];

const FALLBACK: Record<Cat, { lv: string; en: string; es: string; hex: string }> = {
  action: { lv: "Piedzīvojums", en: "Action", es: "Aventura", hex: "#D97757" },
  nature: { lv: "Daba", en: "Nature", es: "Naturaleza", hex: "#6B8E4E" },
  history: { lv: "Vēsture", en: "History", es: "Historia", hex: "#A67C52" },
  culture: { lv: "Kultūra", en: "Culture", es: "Cultura", hex: "#7B6BA8" },
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
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
      )}
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {label}
    </span>
  );
}
