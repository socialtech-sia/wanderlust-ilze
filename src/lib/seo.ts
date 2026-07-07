/**
 * Centralised SEO helpers aligned with Enter Gauja Vadlīnijas 2025
 * (pages 15, 27-28, 34-35, 41-42, 49-50 — meta / Open Graph / Schema / Breadcrumbs / hreflang).
 *
 * All helpers return plain objects that plug straight into a TanStack
 * `createFileRoute({ head: () => ({ meta, links, scripts }) })` return value.
 */

import { LANGUAGES, DEFAULT_LANG, type Lang } from "@/lib/language";
import {
  getEnterGaujaCategory,
  type EnterGaujaKey,
  type EnterGaujaCategoryInfo,
} from "@/lib/enter-gauja";

export const SITE_URL = "https://wanderlust.lv"; // canonical production origin
export const SITE_NAME = "Wanderlust.lv";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.jpg`;

export type MetaTag =
  | { title: string }
  | { charSet: string }
  | { name: string; content: string }
  | { property: string; content: string };
export type LinkTag = { rel: string; href: string; hrefLang?: string; type?: string };
export type ScriptTag = { type: string; children: string };

export interface BuildPageHeadInput {
  /** Route path without language prefix, must start with "/" (e.g. "/tours"). "" for home. */
  path: string;
  /** Current language (from useCurrentLanguage / params). */
  lang: Lang;
  /** Page title (60–65 chars); ` — Wanderlust.lv` suffix is appended if not present. */
  title: string;
  /** 120–160 chars, with core keyword. */
  description: string;
  /** Enter Gauja category associated with the page, when applicable. */
  category?: EnterGaujaKey;
  /** Absolute URL to the Open Graph image (WebP/JPG, 1200×630). */
  ogImage?: string;
  /** og:type — website | article | product. Defaults to "website". */
  ogType?: "website" | "article" | "product";
  /** Additional JSON-LD documents to inject (Breadcrumb + entity schema). */
  jsonLd?: object[];
  /** Set noindex on staging / draft pages. */
  noindex?: boolean;
}

/** Build the full absolute URL for a language-scoped route. */
export function localePath(lang: Lang, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const full = p === "/" ? "" : p;
  return `/${lang}${full}`;
}
export function absoluteUrl(lang: Lang, path: string): string {
  return `${SITE_URL}${localePath(lang, path)}`;
}

/**
 * Compose head meta/links/scripts for a page.
 * Includes: title, description, canonical, hreflang alternates (lv/en/es + x-default),
 * Open Graph + Twitter cards, and any provided JSON-LD scripts.
 */
export function buildPageHead(input: BuildPageHeadInput): {
  meta: MetaTag[];
  links: LinkTag[];
  scripts: ScriptTag[];
} {
  const { path, lang, description, category, jsonLd, noindex } = input;
  const ogType = input.ogType ?? "website";
  const ogImage = input.ogImage ?? DEFAULT_OG_IMAGE;
  const url = absoluteUrl(lang, path);
  const title = input.title.includes(SITE_NAME)
    ? input.title
    : `${input.title} — ${SITE_NAME}`;
  const catInfo = category ? getEnterGaujaCategory(category) : undefined;

  const meta: MetaTag[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: ogLocale(lang) },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  if (noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  if (catInfo) {
    meta.push({ name: "article:tag", content: catInfo.label });
    meta.push({ property: "og:article:section", content: catInfo.label });
  }

  const links: LinkTag[] = [
    { rel: "canonical", href: url },
    ...LANGUAGES.map((l) => ({
      rel: "alternate",
      href: absoluteUrl(l, path),
      hrefLang: l,
    })),
    { rel: "alternate", href: absoluteUrl(DEFAULT_LANG, path), hrefLang: "x-default" },
  ];

  const scripts: ScriptTag[] = (jsonLd ?? []).map((obj) => ({
    type: "application/ld+json",
    children: JSON.stringify(obj),
  }));

  return { meta, links, scripts };
}

function ogLocale(lang: Lang): string {
  switch (lang) {
    case "lv":
      return "lv_LV";
    case "en":
      return "en_US";
    case "es":
      return "es_ES";
  }
}

// -------------------------------------------------------------------- Schemas

export interface BreadcrumbItem {
  name: string;
  path: string; // route path without lang prefix, e.g. "/tours"
}
export function buildBreadcrumbList(lang: Lang, items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(lang, it.path),
    })),
  };
}

export function buildOrganization(): object {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    areaServed: "Gauja National Park, Latvia",
    knowsAbout: ["Enter Gauja", "Sigulda", "Cēsis", "Līgatne", "Turaida"],
    sameAs: [],
  };
}

export function buildWebSite(lang: Lang): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl(lang, "/"),
    inLanguage: lang,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export interface ServiceSchemaInput {
  category: EnterGaujaCategoryInfo;
  title: string;
  description: string;
  imageUrl: string;
  path: string;
  lang: Lang;
  priceEur?: number | null;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
/** Build schema.org entity per Enter Gauja category (pages 27, 34, 42, 49). */
export function buildServiceSchema(s: ServiceSchemaInput): object {
  const url = absoluteUrl(s.lang, s.path);
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": s.category.schemaType,
    name: s.title,
    description: s.description,
    image: s.imageUrl,
    url,
    inLanguage: s.lang,
    isPartOf: {
      "@type": "TouristDestination",
      name: "Gauja National Park",
      url: s.category.url,
    },
  };
  if (s.locationName) {
    base.address = {
      "@type": "PostalAddress",
      addressLocality: s.locationName,
      addressCountry: "LV",
    };
  }
  if (s.latitude != null && s.longitude != null) {
    base.geo = { "@type": "GeoCoordinates", latitude: s.latitude, longitude: s.longitude };
  }
  if (s.priceEur != null) {
    base.offers = {
      "@type": "Offer",
      url,
      price: s.priceEur.toFixed(2),
      priceCurrency: "EUR",
    };
  }
  return base;
}

export interface FaqItem {
  q: string;
  a: string;
}
export function buildFaqPage(items: FaqItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/**
 * Standard alt-text builder per guideline (page 26/33/40/48).
 * Format: `{title} — {location} (Enter {Category})`.
 */
export function serviceImageAlt(input: {
  title: string;
  location?: string | null;
  category?: EnterGaujaCategoryInfo;
}): string {
  const parts = [input.title];
  if (input.location) parts.push(input.location);
  const joined = parts.join(" — ");
  return input.category ? `${joined} (${input.category.label})` : joined;
}
