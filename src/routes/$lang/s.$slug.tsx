import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { Clock, Users, MapPin, Route as RouteIcon, ChevronRight } from "lucide-react";
import { useServiceBySlug, useEnterGaujaCategories } from "@/hooks/use-services";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { tField, tSlug, isLang, DEFAULT_LANG, type Lang } from "@/lib/language";
import { formatDuration, formatPrice } from "@/lib/format";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { EnterGaujaBacklinkBlock } from "@/components/entergauja/EnterGaujaBacklinkBlock";
import { pickPrimaryCategory, defaultCategoryForType } from "@/lib/enter-gauja";
import {
  absoluteUrl,
  buildBreadcrumbList,
  buildPageHead,
  buildServiceSchema,
  serviceImageAlt,
} from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/$lang/s/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .or(`slug_lv.eq.${params.slug},slug_en.eq.${params.slug},slug_es.eq.${params.slug}`)
      .eq("is_active", true)
      .maybeSingle();
    return data;
  },
  head: ({ params, loaderData }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
    if (!loaderData) {
      return buildPageHead({
        path: `/s/${params.slug}`,
        lang,
        title: "Not found",
        description: "The requested service could not be found.",
        noindex: true,
      });
    }
    const title = tField(loaderData, "title", lang) || params.slug;
    const short =
      tField(loaderData, "short_description", lang) ||
      tField(loaderData, "description", lang).slice(0, 155);
    const cat =
      pickPrimaryCategory({
        enter_gauja_categories: loaderData.enter_gauja_categories as string[] | null,
        category: loaderData.category as string | null,
      }) ?? defaultCategoryForType(loaderData.type as string);
    const canonicalSlug = tSlug(loaderData, lang) || params.slug;
    const path = `/s/${canonicalSlug}`;
    const image =
      (loaderData.hero_image_url as string | null) ??
      (loaderData.cover_image_url as string | null) ??
      undefined;
    const jsonLd: object[] = [
      buildBreadcrumbList(lang, [
        { name: "Home", path: "/" },
        { name: "Tours", path: "/tours" },
        { name: title, path },
      ]),
    ];
    if (cat) {
      jsonLd.push(
        buildServiceSchema({
          category: cat,
          title,
          description: short,
          imageUrl: image ?? absoluteUrl(lang, "/og/default.jpg"),
          path,
          lang,
          priceEur:
            loaderData.price_from_eur != null ? Number(loaderData.price_from_eur) : null,
          locationName: (loaderData.location_name as string | null) ?? null,
          latitude: (loaderData.latitude as number | null) ?? null,
          longitude: (loaderData.longitude as number | null) ?? null,
        }),
      );
    }
    return buildPageHead({
      path,
      lang,
      title,
      description: short,
      category: cat?.key,
      ogImage: image ?? undefined,
      ogType: "article",
      jsonLd,
    });
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { slug } = Route.useParams();
  const { data: service, isLoading } = useServiceBySlug(slug);
  const { data: cats } = useEnterGaujaCategories();

  if (isLoading) {
    return (
      <div className="container-editorial py-32">
        <div className="h-96 animate-pulse rounded-3xl bg-paper-alt" />
      </div>
    );
  }
  if (!service) throw notFound();

  const title = tField(service, "title", lang);
  const shortDesc = tField(service, "short_description", lang);
  const desc = tField(service, "description", lang);
  const navKey =
    service.type === "excursion" ? "tours" : service.type === "hiking" ? "hiking" : "transfers";
  const canonicalSlug = tSlug(service, lang);
  const HERO = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=70";

  return (
    <>
      {/* Hero */}
      <section className="relative -mt-16 flex min-h-[62vh] items-end overflow-hidden md:-mt-20 md:min-h-[72vh]">
        <img src={HERO} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/20 to-ink/75" />
        <div className="container-editorial relative z-10 pb-14 pt-32 text-paper md:pb-20 md:pt-40">
          {/* Breadcrumbs */}
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-paper/80">
            <Link to="/$lang" params={{ lang }} className="hover:text-paper">
              {t("nav.home")}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/$lang/${navKey}`} params={{ lang }} className="hover:text-paper">
              {t(`nav.${navKey}`)}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-paper/60">{title}</span>
          </nav>
          <p className="text-eyebrow text-paper/90">{t(`service.${service.type}`)}</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
            {title}
          </h1>
          {shortDesc && <p className="mt-4 max-w-2xl text-base text-paper/85">{shortDesc}</p>}
          {service.enter_gauja_categories?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {service.enter_gauja_categories.map((c) => (
                <CategoryBadge key={c} category={c} lang={lang} categoriesData={cats} size="md" />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Body */}
      <section className="container-editorial py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            {/* Meta */}
            <div className="mb-10 grid gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:grid-cols-2 md:grid-cols-4">
              {service.duration_minutes && (
                <MetaCell icon={<Clock className="h-4 w-4" />} label={t("service.duration")} value={formatDuration(service.duration_minutes, lang)} />
              )}
              {service.max_persons && (
                <MetaCell icon={<Users className="h-4 w-4" />} label={t("booking.persons")} value={t("service.persons_max", { count: service.max_persons })} />
              )}
              {service.location_name && (
                <MetaCell icon={<MapPin className="h-4 w-4" />} label={t("service.location")} value={service.location_name} />
              )}
              {service.difficulty && (
                <MetaCell icon={<RouteIcon className="h-4 w-4" />} label="—" value={t(`service.difficulty_${service.difficulty}`)} />
              )}
              {service.vehicle_info && (
                <MetaCell icon={<RouteIcon className="h-4 w-4" />} label={t("service.vehicle")} value={service.vehicle_info} />
              )}
            </div>

            {/* Description */}
            {desc && (
              <div className="prose prose-neutral max-w-none text-foreground/90">
                <ReactMarkdown>{desc}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Sticky booking card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
              {service.price_from_eur != null && (
                <>
                  <p className="text-eyebrow">
                    {t("service.price_from", { price: formatPrice(Number(service.price_from_eur)) })}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {service.price_per_person ? t("service.price_per_person") : t("service.price_per_trip")}
                  </p>
                </>
              )}
              <Link
                to="/$lang/book"
                params={{ lang }}
                search={{ service: canonicalSlug }}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("service.book_this")}
              </Link>
              <p className="mt-4 text-center text-xs text-ink-muted">
                {t("booking.confirmed_body")}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function MetaCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink-muted">
        {icon} {label}
      </div>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
