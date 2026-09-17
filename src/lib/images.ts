import { getPublicUrl } from "@/lib/storage";
import type { MediaAltMap } from "@/lib/home-data";
import type { Lang } from "@/lib/language";

/**
 * Разрешение адресов картинок и адаптивные наборы.
 *
 * Задача — чтобы замена стоковых фотографий на свои сводилась к загрузке
 * файлов через админку, без правки кода. Поэтому каждое место, где раньше
 * стоял URL на Unsplash, теперь спрашивает путь в бакете public-media и
 * использует стоковую картинку только как запасной вариант, пока путь пуст.
 *
 * Где лежат пути:
 *   - услуги и профиль — колонка hero_image_storage_path (уже была, в админке
 *     редактируется через MediaPicker);
 *   - страницы и плитки — ключи site_settings *_storage_path (см. миграцию
 *     20260916160000), в админке — карточка «Attēli» на странице настроек.
 */

/** Ширины, под которые собирается srcset. Совпадают с точками сетки макета. */
export const RESPONSIVE_WIDTHS = [768, 1280, 1920] as const;

/**
 * Итоговый адрес картинки.
 *
 * `stored` — путь в бакете либо пусто; `fallback` — стоковый URL. getPublicUrl
 * сам пропускает абсолютные адреса как есть, поэтому годится для обоих случаев.
 */
export function resolveImageSrc(stored: string | null | undefined, fallback: string): string {
  const path = (stored ?? "").trim();
  return getPublicUrl(path || fallback);
}

/**
 * Первый непустой путь из списка, уже приведённый к адресу.
 *
 * Нужен там, где у картинки несколько источников по старшинству: ключ
 * site_settings перекрывает колонку профиля, а если пусты оба — остаётся
 * запасной вариант. Возвращает пустую строку, когда пусто всё: вызывающий
 * код по ней решает, показывать ли встроенный в бандл ассет.
 */
export function firstImageSrc(...candidates: (string | null | undefined)[]): string {
  for (const candidate of candidates) {
    const path = (candidate ?? "").trim();
    if (path) return getPublicUrl(path);
  }
  return "";
}

/** Значение site_settings как строка. Настройки приходят из jsonb, где под
 *  ключом может лежать что угодно. */
export function settingPath(
  settings: Record<string, unknown> | null | undefined,
  key: string,
): string {
  const value = settings?.[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * srcset для стоковых картинок Unsplash.
 *
 * Unsplash отдаёт нужный размер по параметру `w`, поэтому набор ширин строится
 * переписыванием одного параметра. До этого страницы просили 1920px и на
 * 360-пиксельном телефоне тоже: на странице услуги это и держало LCP.
 *
 * Для файлов из своего бакета возвращается undefined — трансформаций размера
 * там нет, и подсовывать один и тот же файл под несколько ширин бессмысленно.
 */
export function stockSrcSet(url: string): string | undefined {
  if (!/^https?:\/\/images\.unsplash\.com\//.test(url)) return undefined;
  return RESPONSIVE_WIDTHS.map((w) => `${url.replace(/([?&])w=\d+/, `$1w=${w}`)} ${w}w`).join(", ");
}

/**
 * Alt-текст картинки: сначала из базы, потом из кода.
 *
 * Порядок внутри базы — запрошенный язык, затем любой заполненный. Смешение
 * языков здесь меньшее зло: alt в базе описывает НАСТОЯЩУЮ фотографию, а
 * запасной вариант из кода описывает стоковую, которой на странице уже нет.
 * Латышский текст на английской странице неудобен, неверный — хуже.
 *
 * Запасных вариантов два, и это принципиально:
 *   `own`   — картинка своя (путь непуст), но alt в базе не заполнен. Здесь
 *             годится только описание, верное для ЛЮБОЙ фотографии: название
 *             услуги, имя гида, тема раздела.
 *   `stock` — показывается стоковая картинка, и её описание в коде точное.
 *
 * До этого всюду стоял один текст — описание стоковой фотографии. Стоило
 * клиенту загрузить свою, и alt начинал описывать не то, что видно.
 */
export function pickAlt(
  altMap: MediaAltMap | undefined,
  storagePath: string | null | undefined,
  lang: Lang,
  fallbacks: { own: string; stock: string },
): string {
  const path = (storagePath ?? "").trim();
  if (!path) return fallbacks.stock;

  const entry = altMap?.[path];
  if (entry) {
    const exact = entry[lang]?.trim();
    if (exact) return exact;
    const any = [entry.lv, entry.en, entry.es].map((v) => v?.trim()).find(Boolean);
    if (any) return any;
  }
  return fallbacks.own;
}
