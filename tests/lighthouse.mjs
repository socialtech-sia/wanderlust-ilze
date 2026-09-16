// Lighthouse по мобильному профилю. Запускается в образе Playwright:
// Chrome там уже есть, отдельный браузер качать не нужно.
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { writeFileSync } from "node:fs";

const urls = process.argv.slice(2);
if (!urls.length) {
  console.error("укажите адреса");
  process.exit(2);
}

const chrome = await launch({
  chromePath: process.env.CHROME_PATH,
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
});

const out = [];
for (const url of urls) {
  const res = await lighthouse(
    url,
    { port: chrome.port, output: "json", logLevel: "error" },
    // Мобильный профиль — требование п. 4.5 договора.
    undefined,
  );
  const c = res.lhr.categories;
  const row = {
    url,
    performance: Math.round(c.performance.score * 100),
    accessibility: Math.round(c.accessibility.score * 100),
    bestPractices: Math.round(c["best-practices"].score * 100),
    seo: Math.round(c.seo.score * 100),
    lcp: res.lhr.audits["largest-contentful-paint"]?.displayValue,
    cls: res.lhr.audits["cumulative-layout-shift"]?.displayValue,
    tbt: res.lhr.audits["total-blocking-time"]?.displayValue,
    fcp: res.lhr.audits["first-contentful-paint"]?.displayValue,
  };
  out.push(row);
  console.log(
    `${url}\n  Performance ${row.performance}  A11y ${row.accessibility}  BestPractices ${row.bestPractices}  SEO ${row.seo}` +
      `\n  FCP ${row.fcp}  LCP ${row.lcp}  TBT ${row.tbt}  CLS ${row.cls}`,
  );
}
await chrome.kill();
writeFileSync("/out/lighthouse.json", JSON.stringify(out, null, 2));
