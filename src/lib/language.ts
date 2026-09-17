export const LANGUAGES = ["lv", "en", "es"] as const;
export type Lang = (typeof LANGUAGES)[number];
export const DEFAULT_LANG: Lang = "lv";

export function isLang(v: unknown): v is Lang {
  return typeof v === "string" && (LANGUAGES as readonly string[]).includes(v);
}

export const LANG_LABELS: Record<Lang, string> = {
  lv: "Latviešu",
  en: "English",
  es: "Español",
};

export const LANG_SHORT: Record<Lang, string> = {
  lv: "LV",
  en: "EN",
  es: "ES",
};

/** Read translated field from a DB row with fallback chain. */
export function tField<T extends Record<string, unknown>>(
  row: T | null | undefined,
  base: string,
  lang: Lang,
): string {
  if (!row) return "";
  const val =
    (row[`${base}_${lang}` as keyof T] as string | null | undefined) ??
    (row[`${base}_en` as keyof T] as string | null | undefined) ??
    (row[`${base}_lv` as keyof T] as string | null | undefined);
  return (val ?? "") as string;
}

/**
 * Значение поля СТРОГО на запрошенном языке, без отката на другие.
 *
 * tField откатывается на en и lv — для текста это правильно, лучше показать
 * хоть что-то. Для SEO-полей наоборот: латышский meta_title на английской
 * странице хуже, чем заголовок, собранный из английского названия. Поэтому
 * здесь пусто значит пусто, а решение о запасном варианте принимает
 * вызывающий код.
 */
export function tFieldStrict<T extends Record<string, unknown>>(
  row: T | null | undefined,
  base: string,
  lang: Lang,
): string {
  if (!row) return "";
  const val = row[`${base}_${lang}` as keyof T] as string | null | undefined;
  return (val ?? "").trim();
}

/** Best available slug for a service in the requested language. */
export function tSlug<T extends Record<string, unknown>>(row: T, lang: Lang): string {
  return (
    (row[`slug_${lang}` as keyof T] as string | null | undefined) ??
    (row.slug_en as string | null | undefined) ??
    (row.slug_lv as string | null | undefined) ??
    ""
  );
}
