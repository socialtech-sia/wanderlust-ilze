/**
 * Единственное место, где живут адреса entergauja.com.
 *
 * Их сайт переехал: домен entergauja.lv больше не резолвится, структура
 * теперь /<locale>/<раздел>/<слаг>, слаги в каждом языке свои и переводу
 * не поддаются (lv "enter-daba" → en "nature", но lv "enter-kultura" →
 * en "enter-culture", а прокат лодок в английской версии так и остался
 * с латышским слагом). Поэтому здесь лежат не правила, а фактические
 * пути — каждый проверен запросом.
 *
 * Если они снова поменяют структуру — править только эту таблицу.
 * Проверка: `npm run check:eg-links`.
 */

import type { Lang } from "@/lib/language";

export const EG_ORIGIN = "https://entergauja.com";

/** Языки, которые есть у них: lv, ru, en, de, lt, ee. Мы ведём только на два. */
export type EgLocale = "lv" | "en";

/**
 * Наш язык → их локаль.
 * Испанского у Enter Gauja нет, поэтому с ES ведём на английскую версию.
 */
export function egLocale(lang: Lang): EgLocale {
  return lang === "lv" ? "lv" : "en";
}

export type EgPageKey =
  | "root"
  | "nature"
  | "history"
  | "culture"
  | "action"
  | "getaround"
  | "excursions"
  | "rentalocal";

/**
 * Пути без домена, по локалям.
 *
 * Источник — переключатель языков на самих страницах entergauja.com
 * (он отдаёт точный адрес перевода), а не машинный перевод слагов.
 *
 * Важно: сайт отвечает 200 даже на несуществующий слаг — молча показывает
 * родительский раздел. Поэтому проверять ссылки одним кодом ответа нельзя,
 * скрипт проверки дополнительно сверяет <title> страницы.
 */
const EG_PATHS: Record<EgPageKey, Record<EgLocale, string>> = {
  // Корень: без завершающего слэша отдаёт 302 на версию со слэшем.
  root: { lv: "/lv/", en: "/en/" },

  nature: { lv: "/lv/ko-darit/enter-daba", en: "/en/things-to-do/nature" },
  history: { lv: "/lv/ko-darit/enter-vesture", en: "/en/things-to-do/history" },
  culture: { lv: "/lv/ko-darit/enter-kultura", en: "/en/things-to-do/enter-culture" },
  action: {
    lv: "/lv/ko-darit/enter-aktivaja-atputa",
    en: "/en/things-to-do/enter-action",
  },

  // «Gauja Get-around» как отдельного раздела у них больше нет. Ближайшее по
  // смыслу — «Kā nokļūt / Getting here»: поезд, автобус, авто, трансферы.
  // Это же и наш тип услуги `transfer`. Прокат лодок и велосипедов лежит
  // отдельно (/ko-darit/laivu-un-velosipedu-noma) и покрывает только аренду.
  getaround: { lv: "/lv/enter-gauja/ka-noklut", en: "/en/enter-gauja/getting-here" },

  // Два их раздела про гидов — уместны на странице «О гиде».
  excursions: {
    lv: "/lv/ko-darit/enter-ekskursijas",
    en: "/en/things-to-do/enter-excursions",
  },
  rentalocal: { lv: "/lv/ko-darit/rent-a-local", en: "/en/things-to-do/rent-a-local" },
};

/** Абсолютный адрес страницы Enter Gauja для нашего языка. */
export function egUrl(key: EgPageKey, lang: Lang): string {
  return EG_ORIGIN + EG_PATHS[key][egLocale(lang)];
}

/** Все пары (ключ, локаль) — для скрипта проверки ссылок. */
export function egAllPaths(): { key: EgPageKey; locale: EgLocale; url: string }[] {
  const out: { key: EgPageKey; locale: EgLocale; url: string }[] = [];
  for (const key of Object.keys(EG_PATHS) as EgPageKey[]) {
    for (const locale of ["lv", "en"] as const) {
      out.push({ key, locale, url: EG_ORIGIN + EG_PATHS[key][locale] });
    }
  }
  return out;
}
