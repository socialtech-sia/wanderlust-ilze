import { test, expect, type Page } from "@playwright/test";

const LANGS = ["lv", "en", "es"] as const;
type Lang = (typeof LANGS)[number];

/** Статические маршруты. Слаг услуги добавляется отдельно — он свой на каждом языке. */
const STATIC_PATHS = [
  "",
  "/tours",
  "/hiking",
  "/transfers",
  "/book",
  "/contact",
  "/faq",
  "/about",
  "/privacy",
  "/terms",
  "/cookies",
];

/** Ключ i18n, просочившийся в текст: "home.hero_trust", "cta.book_now". */
const I18N_KEY = /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)*(?:\.[a-z][a-z0-9_]*){1,3}\b/;
const I18N_ALLOW = /\.(lv|com|eu|org|net|jpg|png|webp|svg|xml|json)\b|wanderlust\.lv|entergauja\.lv|@/;

interface Collected {
  consoleErrors: string[];
  failedRequests: string[];
}

function collect(page: Page): Collected {
  const c: Collected = { consoleErrors: [], failedRequests: [] };
  page.on("console", (m) => {
    if (m.type() === "error") c.consoleErrors.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) c.failedRequests.push(`${r.status()} ${r.url()}`);
  });
  page.on("requestfailed", (r) => c.failedRequests.push(`FAILED ${r.url()}`));
  return c;
}

async function serviceSlug(page: Page, lang: Lang): Promise<string | null> {
  await page.goto(`/${lang}/tours`, { waitUntil: "domcontentloaded" });
  const href = await page.locator(`a[href^="/${lang}/s/"]`).first().getAttribute("href");
  return href ? href.split("/s/")[1] : null;
}

test.describe("Матрица страниц", () => {
  for (const lang of LANGS) {
    for (const path of STATIC_PATHS) {
      const url = `/${lang}${path}`;
      test(`${url}`, async ({ page }, testInfo) => {
        const c = collect(page);
        const resp = await page.goto(url, { waitUntil: "networkidle" });

        expect(resp?.status(), "HTTP-статус").toBe(200);

        // --- ровно один h1, уровни без пропусков ---
        const levels = await page.$$eval("h1,h2,h3,h4,h5,h6", (els) =>
          els
            .filter((e) => (e.textContent ?? "").trim().length > 0)
            .map((e) => Number(e.tagName[1])),
        );
        expect(levels.filter((l) => l === 1).length, "количество h1").toBe(1);
        let prev = 0;
        const jumps: string[] = [];
        for (const l of levels) {
          if (prev && l > prev + 1) jumps.push(`h${prev}->h${l}`);
          prev = l;
        }
        expect(jumps, "пропуски уровней заголовков").toEqual([]);

        // --- alt у картинок ---
        const noAlt = await page.$$eval("img", (els) =>
          els
            .filter((e) => !e.hasAttribute("alt") && e.getAttribute("aria-hidden") !== "true")
            .map((e) => (e as HTMLImageElement).currentSrc || e.getAttribute("src") || "?"),
        );
        expect(noAlt, "картинки без alt").toEqual([]);

        // --- битые картинки ---
        const broken = await page.$$eval("img", (els) =>
          els
            .filter((e) => {
              const i = e as HTMLImageElement;
              return i.complete && i.naturalWidth === 0;
            })
            .map((e) => e.getAttribute("src") || "?"),
        );
        expect(broken, "не загрузившиеся картинки").toEqual([]);

        // --- непереведённые ключи ---
        const leaked = await page.evaluate(
          ({ re, allow }) => {
            const rx = new RegExp(re);
            const ax = new RegExp(allow);
            const out: string[] = [];
            const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let n: Node | null;
            while ((n = walk.nextNode())) {
              const t = (n.textContent ?? "").trim();
              if (!t || t.length > 120) continue;
              const m = t.match(rx);
              if (m && !ax.test(t) && !t.includes(" ")) out.push(t);
            }
            return out.slice(0, 5);
          },
          { re: I18N_KEY.source, allow: I18N_ALLOW.source },
        );
        expect(leaked, "непереведённые ключи i18n").toEqual([]);

        // --- <head> ---
        const head = await page.evaluate(() => ({
          title: document.title,
          desc: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
          hreflang: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map(
            (l) => l.getAttribute("hreflang") ?? "",
          ),
          ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? "",
          ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "",
        }));
        expect(head.title.length, "title").toBeGreaterThan(5);
        expect(head.desc.length, "description").toBeGreaterThan(20);
        expect(head.canonical, "canonical").toContain(`/${lang}`);
        for (const l of LANGS) expect(head.hreflang, `hreflang ${l}`).toContain(l);
        expect(head.ogTitle.length, "og:title").toBeGreaterThan(5);
        expect(head.ogImage.length, "og:image").toBeGreaterThan(5);

        // --- горизонтальное переполнение ---
        // Проверяем ФАКТ прокрутки страницы, а не «элемент вылез за край».
        // Вылезти за край может и намеренно скрытый элемент: партнёрский бейдж
        // Enter Gauja в свёрнутом состоянии стоит на translate-x-4 с opacity-0,
        // это его анимация появления, и горизонтальной прокрутки он не даёт.
        const scroll = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          culprits: Array.from(document.querySelectorAll<HTMLElement>("body *"))
            .filter((e) => {
              const st = getComputedStyle(e);
              if (st.opacity === "0" || st.visibility === "hidden") return false;
              const r = e.getBoundingClientRect();
              return r.width > 0 && r.right > document.documentElement.clientWidth + 1;
            })
            .slice(0, 5)
            .map((e) => `${e.tagName.toLowerCase()}.${(e.className || "").toString().slice(0, 40)}`),
        }));
        expect(
          scroll.scrollWidth,
          `горизонтальная прокрутка; кандидаты: ${scroll.culprits.join(", ")}`,
        ).toBeLessThanOrEqual(scroll.clientWidth + 1);

        // --- CLS ---
        const cls = await page.evaluate(
          () =>
            new Promise<number>((resolve) => {
              let v = 0;
              const po = new PerformanceObserver((list) => {
                for (const e of list.getEntries() as unknown as Array<{
                  value: number;
                  hadRecentInput: boolean;
                }>) {
                  if (!e.hadRecentInput) v += e.value;
                }
              });
              try {
                po.observe({ type: "layout-shift", buffered: true });
              } catch {
                resolve(0);
                return;
              }
              setTimeout(() => {
                po.disconnect();
                resolve(v);
              }, 1200);
            }),
        );
        expect(cls, "CLS").toBeLessThan(0.1);

        // --- консоль и сеть ---
        const ignorable = /favicon|analytics|gtag/i;
        expect(c.failedRequests.filter((r) => !ignorable.test(r)), "запросы 4xx/5xx").toEqual([]);
        expect(c.consoleErrors.filter((e) => !ignorable.test(e)), "ошибки в консоли").toEqual([]);

        testInfo.annotations.push({ type: "cls", description: String(cls) });
      });
    }
  }

  for (const lang of LANGS) {
    test(`/${lang}/s/<услуга> — детальная`, async ({ page }) => {
      const slug = await serviceSlug(page, lang);
      expect(slug, "нашёлся слаг услуги").toBeTruthy();
      const c = collect(page);
      const resp = await page.goto(`/${lang}/s/${slug}`, { waitUntil: "networkidle" });
      expect(resp?.status()).toBe(200);
      expect(await page.locator("h1").count(), "один h1").toBe(1);
      const noAlt = await page.$$eval("img", (els) =>
        els.filter((e) => !e.hasAttribute("alt") && e.getAttribute("aria-hidden") !== "true").length,
      );
      expect(noAlt, "картинки без alt").toBe(0);
      expect(c.failedRequests.filter((r) => !/favicon/i.test(r))).toEqual([]);
    });
  }

  for (const lang of LANGS) {
    test(`/${lang}/404 — несуществующий адрес`, async ({ page }) => {
      const resp = await page.goto(`/${lang}/nothing-here-xyz`, { waitUntil: "domcontentloaded" });
      expect(resp?.status(), "статус 404").toBe(404);
      expect(await page.locator("body").innerText()).not.toBe("");
    });
  }
});
