import type { EnterGaujaCategoryRow } from "@/hooks/use-services";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/language";
import { tField } from "@/lib/language";
import { readableTextOn } from "@/lib/contrast";

type Cat = Database["public"]["Enums"]["enter_gauja_category"];

const FALLBACK: Record<Cat, { lv: string; en: string; es: string; hex: string }> = {
  action: { lv: "Piedzīvojums", en: "Action", es: "Aventura", hex: "#F05366" },
  nature: { lv: "Daba", en: "Nature", es: "Naturaleza", hex: "#4F6F19" },
  history: { lv: "Vēsture", en: "History", es: "Historia", hex: "#D1701A" },
  culture: { lv: "Kultūra", en: "Culture", es: "Cultura", hex: "#51869D" },
  getaround: {
    lv: "Gauja Get-around",
    en: "Gauja Get-around",
    es: "Gauja Get-around",
    hex: "#6987B6",
  },
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
  // Фон — РОВНО договорный цвет, без градиента.
  //
  // Раньше здесь был linear-gradient от color-mix(цвет 96%, white) до
  // color-mix(цвет 88%, black). Он делал две нехорошие вещи сразу: подмешивал
  // белый, то есть уводил фон от цвета, зафиксированного договором (п. 5.3), и
  // растягивал фон по светлоте настолько, что ни один цвет текста не давал
  // 4.5:1 на обоих концах — белый проваливался на светлом крае (3.22), тёмный
  // на тёмном (4.4). На сплошном договорном цвете подобрать текст удаётся:
  // худший случай по пяти категориям — 4.53:1.
  const textColor = readableTextOn(color);
  return (
    <span
      className={cn(
        "text-utility inline-flex items-center gap-1.5 rounded-full border border-white/30 font-bold leading-none shadow-[0_2px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm",
        size === "sm"
          ? "px-2.5 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-[11px]"
          : "px-3.5 py-1.5 text-[11px] sm:px-4 sm:py-2 sm:text-[12px] lg:text-[13px]",
      )}
      // textShadow убран намеренно: он подпирал белый текст там, где тому не
      // хватало контраста, но в расчёт WCAG тень не входит и проблему только
      // маскировала.
      style={{ backgroundColor: color, color: textColor }}
    >
      {label}
    </span>
  );
}
