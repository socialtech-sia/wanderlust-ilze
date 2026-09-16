/**
 * Подбор цвета текста под произвольный фон.
 *
 * Нужен там, где фон приходит извне и не может быть изменён: цвета категорий
 * Enter Gauja зафиксированы договором (п. 5.3), а править их из админки клиент
 * всё равно может через `enter_gauja_categories.color_hex`. Жёстко прописанная
 * пара «цвет -> текст» разъехалась бы при первой же такой правке, поэтому
 * цвет текста считается из самого фона.
 */

/** Относительная яркость по WCAG 2.1. */
function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Тёмная краска для текста на светлом фоне. Не чистый чёрный: он режет глаз. */
export const ON_COLOR_DARK = "#131712";
export const ON_COLOR_LIGHT = "#FFFFFF";

/**
 * Белый или тёмный — что даёт больший контраст на этом фоне.
 *
 * На пяти договорных цветах Enter Gauja белый берёт только `nature` (5.80:1);
 * на остальных четырёх он даёт 3.42–4.00 и не дотягивает до AA, а тёмный даёт
 * 4.53–5.29. Отсюда и разнобой в цвете текста на бейджах — он вынужденный:
 * фон менять нельзя, а 4.5:1 нужно.
 */
export function readableTextOn(background: string): string {
  return contrastRatio(ON_COLOR_LIGHT, background) >= contrastRatio(ON_COLOR_DARK, background)
    ? ON_COLOR_LIGHT
    : ON_COLOR_DARK;
}
