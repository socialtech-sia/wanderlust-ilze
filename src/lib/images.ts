import { getPublicUrl } from "@/lib/storage";

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
 *     20260916160000).
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
