import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ServicesListPage } from "@/components/services/ServicesListPage";
import { routeHead } from "@/lib/route-head";
import { DEFAULT_LANG, isLang, type Lang } from "@/lib/language";
import { loadServicesForList, servicesToItemListJsonLd } from "@/lib/services-jsonld";
import { ROUTE_SEO } from "@/lib/seo-strings";
import { serviceListSearchSchema } from "@/lib/service-filters";

export const Route = createFileRoute("/$lang/hiking")({
  validateSearch: serviceListSearchSchema,
  staticData: { enterGaujaCategory: "nature" as const },
  loader: () => loadServicesForList("hiking"),
  head: ({ params, loaderData }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
    const listName = ROUTE_SEO.hiking.title[lang];
    const services = loaderData?.services ?? [];
    const extraJsonLd = services.length
      ? [servicesToItemListJsonLd(lang, listName, services)]
      : undefined;
    return routeHead({ params, routeKey: "hiking", path: "/hiking", extraJsonLd });
  },
  component: RouteComp,
});

function RouteComp() {
  const { category, difficulty } = Route.useSearch();
  const { services, settings, mediaAlt } = Route.useLoaderData();
  return (
    <ServicesListPage
      type="hiking"
      navKey="hiking"
      services={services}
      settings={settings}
      mediaAlt={mediaAlt}
      category={category}
      difficulty={difficulty}
    />
  );
}
