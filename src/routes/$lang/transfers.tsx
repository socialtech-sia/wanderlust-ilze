import { createFileRoute } from "@tanstack/react-router";
import { ServicesListPage } from "@/components/services/ServicesListPage";
import { routeHead } from "@/lib/route-head";
import { DEFAULT_LANG, isLang, type Lang } from "@/lib/language";
import {
  loadServicesForList,
  servicesToItemListJsonLd,
} from "@/lib/services-jsonld";
import { ROUTE_SEO } from "@/lib/seo-strings";

export const Route = createFileRoute("/$lang/transfers")({
  loader: () => loadServicesForList("transfer"),
  head: ({ params, loaderData }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
    const listName = ROUTE_SEO.transfers.title[lang];
    const extraJsonLd = loaderData?.length
      ? [servicesToItemListJsonLd(lang, listName, loaderData)]
      : undefined;
    return routeHead({ params, routeKey: "transfers", path: "/transfers", extraJsonLd });
  },
  component: () => <ServicesListPage type="transfer" navKey="transfers" />,
});
