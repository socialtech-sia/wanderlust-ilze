/**
 * Dynamic sitemap.xml — combines static routes and every published service
 * across all supported languages, with hreflang alternates per URL.
 * Aligned with Enter Gauja Vadlīnijas 2025 (pages 28, 35, 43, 50).
 */

import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { LANGUAGES } from "@/lib/language";
import { SITE_URL } from "@/lib/seo";

const STATIC_PATHS: { path: string; priority: string; changefreq: string }[] = [
  { path: "", priority: "1.0", changefreq: "weekly" },
  { path: "/tours", priority: "0.9", changefreq: "weekly" },
  { path: "/hiking", priority: "0.9", changefreq: "weekly" },
  { path: "/transfers", priority: "0.8", changefreq: "monthly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.7", changefreq: "monthly" },
  { path: "/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/cookies", priority: "0.3", changefreq: "yearly" },
];

interface ServiceRow {
  slug_lv: string | null;
  slug_en: string | null;
  slug_es: string | null;
  updated_at: string | null;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const services = await fetchServices();

        const urls: string[] = [];

        for (const s of STATIC_PATHS) {
          urls.push(renderUrl(s.path, s.priority, s.changefreq));
        }

        for (const svc of services) {
          const slugPerLang: Record<string, string | null> = {
            lv: svc.slug_lv,
            en: svc.slug_en ?? svc.slug_lv,
            es: svc.slug_es ?? svc.slug_en ?? svc.slug_lv,
          };
          const anySlug = svc.slug_lv ?? svc.slug_en ?? svc.slug_es;
          if (!anySlug) continue;
          urls.push(
            renderServiceUrl(slugPerLang, svc.updated_at ?? undefined),
          );
        }

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
          `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
          urls.join("\n") +
          `\n</urlset>\n`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

function renderUrl(path: string, priority: string, changefreq: string): string {
  const perLangLoc: string[] = [];
  for (const lang of LANGUAGES) {
    const href = `${SITE_URL}/${lang}${path}`;
    perLangLoc.push(
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`,
    );
  }
  perLangLoc.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/lv${path}" />`,
  );
  return [
    `  <url>`,
    `    <loc>${SITE_URL}/lv${path}</loc>`,
    ...perLangLoc,
    `    <priority>${priority}</priority>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `  </url>`,
  ].join("\n");
}

function renderServiceUrl(
  slugPerLang: Record<string, string | null>,
  updatedAt?: string,
): string {
  const perLangLoc: string[] = [];
  for (const lang of LANGUAGES) {
    const slug = slugPerLang[lang];
    if (!slug) continue;
    perLangLoc.push(
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE_URL}/${lang}/s/${slug}" />`,
    );
  }
  const lvSlug = slugPerLang.lv ?? slugPerLang.en ?? slugPerLang.es;
  perLangLoc.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/lv/s/${lvSlug}" />`,
  );
  const parts = [
    `  <url>`,
    `    <loc>${SITE_URL}/lv/s/${lvSlug}</loc>`,
    ...perLangLoc,
  ];
  if (updatedAt) parts.push(`    <lastmod>${updatedAt.slice(0, 10)}</lastmod>`);
  parts.push(`    <priority>0.8</priority>`, `    <changefreq>monthly</changefreq>`, `  </url>`);
  return parts.join("\n");
}

async function fetchServices(): Promise<ServiceRow[]> {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/services?select=slug_lv,slug_en,slug_es,updated_at&is_active=eq.true`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return [];
    return (await res.json()) as ServiceRow[];
  } catch {
    return [];
  }
}
