/**
 * Телефон в формате E.164.
 *
 * Зачем отдельный модуль: правила проверки нужны в трёх местах сразу — в форме
 * брони, в форме контактов и (зеркально) в SQL. Держать их в одном файле
 * дешевле, чем ловить расхождение между клиентом и базой.
 *
 * Названия стран НЕ хранятся: их даёт Intl.DisplayNames по коду ISO 3166-1
 * alpha-2, то есть сразу на языке интерфейса и без словаря на три языка в
 * репозитории. Флаг тоже вычисляется из кода страны — парой regional indicator
 * symbols, а не набором картинок.
 */

import type { Lang } from "@/lib/language";

/** Код страны по умолчанию: сайт латвийский, большинство броней местные. */
export const DEFAULT_DIAL_ISO2 = "LV";

/**
 * ISO 3166-1 alpha-2 -> телефонный код страны (ITU-T E.164), без «+».
 *
 * Несколько стран делят один код (NANP: +1, Россия и Казахстан: +7). Это
 * нормально и на проверку не влияет: E.164 не требует, чтобы код однозначно
 * определял страну. Выбор в списке влияет только на то, что подставится.
 */
export const DIAL_CODES: ReadonlyArray<readonly [iso2: string, dial: string]> = [
  ["AD", "376"], ["AE", "971"], ["AF", "93"], ["AG", "1268"], ["AI", "1264"],
  ["AL", "355"], ["AM", "374"], ["AO", "244"], ["AR", "54"], ["AS", "1684"],
  ["AT", "43"], ["AU", "61"], ["AW", "297"], ["AX", "358"], ["AZ", "994"],
  ["BA", "387"], ["BB", "1246"], ["BD", "880"], ["BE", "32"], ["BF", "226"],
  ["BG", "359"], ["BH", "973"], ["BI", "257"], ["BJ", "229"], ["BL", "590"],
  ["BM", "1441"], ["BN", "673"], ["BO", "591"], ["BQ", "599"], ["BR", "55"],
  ["BS", "1242"], ["BT", "975"], ["BW", "267"], ["BY", "375"], ["BZ", "501"],
  ["CA", "1"], ["CD", "243"], ["CF", "236"], ["CG", "242"], ["CH", "41"],
  ["CI", "225"], ["CK", "682"], ["CL", "56"], ["CM", "237"], ["CN", "86"],
  ["CO", "57"], ["CR", "506"], ["CU", "53"], ["CV", "238"], ["CW", "599"],
  ["CY", "357"], ["CZ", "420"], ["DE", "49"], ["DJ", "253"], ["DK", "45"],
  ["DM", "1767"], ["DO", "1809"], ["DZ", "213"], ["EC", "593"], ["EE", "372"],
  ["EG", "20"], ["EH", "212"], ["ER", "291"], ["ES", "34"], ["ET", "251"],
  ["FI", "358"], ["FJ", "679"], ["FK", "500"], ["FM", "691"], ["FO", "298"],
  ["FR", "33"], ["GA", "241"], ["GB", "44"], ["GD", "1473"], ["GE", "995"],
  ["GF", "594"], ["GG", "44"], ["GH", "233"], ["GI", "350"], ["GL", "299"],
  ["GM", "220"], ["GN", "224"], ["GP", "590"], ["GQ", "240"], ["GR", "30"],
  ["GT", "502"], ["GU", "1671"], ["GW", "245"], ["GY", "592"], ["HK", "852"],
  ["HN", "504"], ["HR", "385"], ["HT", "509"], ["HU", "36"], ["ID", "62"],
  ["IE", "353"], ["IL", "972"], ["IM", "44"], ["IN", "91"], ["IO", "246"],
  ["IQ", "964"], ["IR", "98"], ["IS", "354"], ["IT", "39"], ["JE", "44"],
  ["JM", "1876"], ["JO", "962"], ["JP", "81"], ["KE", "254"], ["KG", "996"],
  ["KH", "855"], ["KI", "686"], ["KM", "269"], ["KN", "1869"], ["KP", "850"],
  ["KR", "82"], ["KW", "965"], ["KY", "1345"], ["KZ", "7"], ["LA", "856"],
  ["LB", "961"], ["LC", "1758"], ["LI", "423"], ["LK", "94"], ["LR", "231"],
  ["LS", "266"], ["LT", "370"], ["LU", "352"], ["LV", "371"], ["LY", "218"],
  ["MA", "212"], ["MC", "377"], ["MD", "373"], ["ME", "382"], ["MF", "590"],
  ["MG", "261"], ["MH", "692"], ["MK", "389"], ["ML", "223"], ["MM", "95"],
  ["MN", "976"], ["MO", "853"], ["MP", "1670"], ["MQ", "596"], ["MR", "222"],
  ["MS", "1664"], ["MT", "356"], ["MU", "230"], ["MV", "960"], ["MW", "265"],
  ["MX", "52"], ["MY", "60"], ["MZ", "258"], ["NA", "264"], ["NC", "687"],
  ["NE", "227"], ["NF", "672"], ["NG", "234"], ["NI", "505"], ["NL", "31"],
  ["NO", "47"], ["NP", "977"], ["NR", "674"], ["NU", "683"], ["NZ", "64"],
  ["OM", "968"], ["PA", "507"], ["PE", "51"], ["PF", "689"], ["PG", "675"],
  ["PH", "63"], ["PK", "92"], ["PL", "48"], ["PM", "508"], ["PR", "1787"],
  ["PS", "970"], ["PT", "351"], ["PW", "680"], ["PY", "595"], ["QA", "974"],
  ["RE", "262"], ["RO", "40"], ["RS", "381"], ["RU", "7"], ["RW", "250"],
  ["SA", "966"], ["SB", "677"], ["SC", "248"], ["SD", "249"], ["SE", "46"],
  ["SG", "65"], ["SH", "290"], ["SI", "386"], ["SJ", "47"], ["SK", "421"],
  ["SL", "232"], ["SM", "378"], ["SN", "221"], ["SO", "252"], ["SR", "597"],
  ["SS", "211"], ["ST", "239"], ["SV", "503"], ["SX", "1721"], ["SY", "963"],
  ["SZ", "268"], ["TC", "1649"], ["TD", "235"], ["TG", "228"], ["TH", "66"],
  ["TJ", "992"], ["TK", "690"], ["TL", "670"], ["TM", "993"], ["TN", "216"],
  ["TO", "676"], ["TR", "90"], ["TT", "1868"], ["TV", "688"], ["TW", "886"],
  ["TZ", "255"], ["UA", "380"], ["UG", "256"], ["US", "1"], ["UY", "598"],
  ["UZ", "998"], ["VA", "39"], ["VC", "1784"], ["VE", "58"], ["VG", "1284"],
  ["VI", "1340"], ["VN", "84"], ["VU", "678"], ["WF", "681"], ["WS", "685"],
  ["XK", "383"], ["YE", "967"], ["YT", "262"], ["ZA", "27"], ["ZM", "260"],
  ["ZW", "263"],
] as const;

const DIAL_BY_ISO2 = new Map(DIAL_CODES.map(([iso2, dial]) => [iso2, dial]));

/** Коды стран от длинного к короткому: «+1268» должен выиграть у «+1». */
const DIALS_LONGEST_FIRST = [...new Set(DIAL_CODES.map(([, d]) => d))].sort(
  (a, b) => b.length - a.length,
);

export function dialForIso2(iso2: string): string {
  return DIAL_BY_ISO2.get(iso2.toUpperCase()) ?? DIAL_BY_ISO2.get(DEFAULT_DIAL_ISO2)!;
}

/**
 * Флаг страны как эмодзи.
 *
 * Пара regional indicator symbols: 'L','V' -> 🇱🇻. XK (Косово) кода страны в
 * Unicode не имеет, и пара символов отрисуется как «XK» — это лучше пустоты.
 */
export function flagForIso2(iso2: string): string {
  const code = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Название страны на языке интерфейса. Без ICU вернётся сам код — не пусто. */
export function countryName(iso2: string, lang: Lang): string {
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(iso2.toUpperCase()) ?? iso2;
  } catch {
    return iso2;
  }
}

export interface PhoneParts {
  /** ISO 3166-1 alpha-2 выбранной в списке страны. */
  iso2: string;
  /** Национальная часть номера, как её ввёл посетитель. */
  national: string;
}

export const EMPTY_PHONE: PhoneParts = { iso2: DEFAULT_DIAL_ISO2, national: "" };

export type PhoneErrorCode = "required" | "too_short" | "too_long" | "invalid_chars";

/** Только цифры. Пробелы, скобки и дефисы посетители вставляют постоянно. */
function digits(s: string): string {
  return s.replace(/\D+/g, "");
}

/**
 * Номер целиком в E.164: «+» и до 15 цифр, первая — не ноль.
 *
 * Это то, что уезжает в базу. Формат выбран не из любви к стандартам: в нём
 * номер одинаково набирается из любой страны, и именно его понимают и tel:,
 * и WhatsApp, и любой оператор.
 */
export function toE164(parts: PhoneParts): string {
  const national = digits(parts.national);
  if (!national) return "";
  return `+${dialForIso2(parts.iso2)}${national}`;
}

/**
 * Проверка номера. Возвращает код ошибки либо null.
 *
 * Границы — из самой E.164: не больше 15 цифр вместе с кодом страны. Нижняя
 * граница (7) взята по самым коротким реальным планам нумерации; всё короче
 * почти наверняка опечатка, а не номер.
 */
export function validatePhone(
  parts: PhoneParts,
  options: { required: boolean },
): PhoneErrorCode | null {
  const rawNational = parts.national.trim();
  if (!rawNational) return options.required ? "required" : null;
  // Разрешаем разделители, но не буквы: «29 299 354» — норма, «29-ABC» — нет.
  if (/[^\d\s()+.-]/.test(rawNational)) return "invalid_chars";

  const total = dialForIso2(parts.iso2).length + digits(rawNational).length;
  if (digits(rawNational).length < 4 || total < 7) return "too_short";
  if (total > 15) return "too_long";
  return null;
}

/** Та же проверка, но для готовой строки E.164 (серверная сторона, тесты). */
export function isE164(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value);
}

/**
 * Разбор номера, введённого целиком: «+37129299354», «0037129299354».
 *
 * Нужен не ради красоты. Без него посетитель, по привычке вставляющий номер
 * с кодом в поле национальной части, получает «+371 +371 29299354» — и либо
 * ошибку, либо неверный номер в базе. Возвращает null, если строка не похожа
 * на номер с кодом страны, и тогда поле остаётся как есть.
 */
export function splitFullNumber(raw: string): PhoneParts | null {
  const trimmed = raw.trim();
  const withPlus = trimmed.startsWith("00") ? `+${trimmed.slice(2)}` : trimmed;
  if (!withPlus.startsWith("+")) return null;
  const all = digits(withPlus);
  if (!all) return null;
  const dial = DIALS_LONGEST_FIRST.find((d) => all.startsWith(d));
  if (!dial) return null;
  const iso2 = DIAL_CODES.find(([, d]) => d === dial)?.[0] ?? DEFAULT_DIAL_ISO2;
  return { iso2, national: all.slice(dial.length) };
}
