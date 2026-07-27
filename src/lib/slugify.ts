/**
 * Slug helpers with Latvian diacritic transliteration.
 * ā→a č→c ē→e ģ→g ī→i ķ→k ļ→l ņ→n š→s ū→u ž→z
 */

const MAP: Record<string, string> = {
  ā: "a", č: "c", ē: "e", ģ: "g", ī: "i", ķ: "k", ļ: "l", ņ: "n", š: "s", ū: "u", ž: "z",
  Ā: "a", Č: "c", Ē: "e", Ģ: "g", Ī: "i", Ķ: "k", Ļ: "l", Ņ: "n", Š: "s", Ū: "u", Ž: "z",
  á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n", ü: "u", ö: "o", ä: "a", å: "a", ø: "o", æ: "ae", ß: "ss",
};

export function transliterate(input: string): string {
  return input.replace(/[^\u0000-\u007F]/g, (ch) => MAP[ch] ?? ch);
}

export function slugify(input: string): string {
  return transliterate(input)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
