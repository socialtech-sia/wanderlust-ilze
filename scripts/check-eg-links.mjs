/**
 * Проверка всех ссылок на entergauja.com.
 *
 * Одного кода ответа мало: их сайт на несуществующий слаг отвечает 200 и
 * молча показывает родительский раздел. Поэтому страница считается живой,
 * только если её <title> отличается от <title> заведомо несуществующего
 * адреса в том же разделе.
 *
 *   node scripts/check-eg-links.mjs
 */

import { EG_ORIGIN, egAllPaths } from "../src/lib/entergauja-urls.ts";

const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, "&").trim();

async function fetchPage(url) {
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return { status: res.status, title: m ? decode(m[1]) : "" };
}

/** <title> страницы-заглушки для раздела, которому принадлежит url. */
const fallbackCache = new Map();
async function fallbackTitle(url) {
  const section = new URL(url).pathname.replace(/\/[^/]*$/, "");
  if (!fallbackCache.has(section)) {
    const probe = `${EG_ORIGIN}${section}/zzz-nonexistent-probe-404`;
    fallbackCache.set(section, (await fetchPage(probe)).title);
  }
  return fallbackCache.get(section);
}

/** Корень локали — сам себе заглушка, сверять его с fallback нечем. */
const isLocaleRoot = (url) => /^\/[a-z]{2}\/?$/.test(new URL(url).pathname);

let failed = 0;
const rows = [];
for (const { key, locale, url } of egAllPaths()) {
  const { status, title } = await fetchPage(url);
  const fb = isLocaleRoot(url) ? null : await fallbackTitle(url);
  const ok = status === 200 && title !== "" && title !== fb;
  if (!ok) failed++;
  rows.push({ key, locale, status, title, ok: ok ? "OK" : "BROKEN", url });
}

console.table(rows);
if (failed) {
  console.error(`\n${failed} ссылок сломано — поправь таблицу в src/lib/entergauja-urls.ts`);
  process.exit(1);
}
console.log("\nВсе ссылки на entergauja.com живы.");
