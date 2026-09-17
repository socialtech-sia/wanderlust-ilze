import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { KeyFacts } from "@/components/home/KeyFacts";
import { ServiceCategories } from "@/components/home/ServiceCategories";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { RegionSection } from "@/components/home/RegionSection";
import { AboutPreview } from "@/components/home/AboutPreview";
import { WhyGuide } from "@/components/home/WhyGuide";
import { Seasons } from "@/components/home/Seasons";
import { EnterGaujaTiles } from "@/components/home/EnterGaujaTiles";
import { FaqPreview } from "@/components/home/FaqPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalCta } from "@/components/home/FinalCta";
import { EnterGaujaBadge } from "@/components/home/EnterGaujaBadge";

import { routeHead } from "@/lib/route-head";
import { getHomeData } from "@/lib/home-data.functions";
import { DEFAULT_LANG, isLang, tField, type Lang } from "@/lib/language";
import { buildFaqPage } from "@/lib/seo";

export const Route = createFileRoute("/$lang/")({
  loader: () => getHomeData(),
  head: ({ params, loaderData }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
    const faqItems = (loaderData?.faq ?? [])
      .map((f) => ({ q: tField(f, "question", lang), a: tField(f, "answer", lang) }))
      .filter((it) => it.q && it.a);
    return routeHead({
      params,
      routeKey: "home",
      path: "/",
      extraJsonLd: faqItems.length ? [buildFaqPage(faqItems)] : undefined,
    });
  },
  component: HomePage,
});

function HomePage() {
  const { services, faq, profile, testimonials, settings, mediaAlt } = Route.useLoaderData();

  return (
    <>
      <Hero settings={settings} profile={profile} mediaAlt={mediaAlt} />
      <KeyFacts />
      <ServiceCategories services={services} settings={settings} mediaAlt={mediaAlt} />
      <HowItWorks />
      <FeaturedServices services={services} mediaAlt={mediaAlt} />
      <RegionSection />
      <AboutPreview profile={profile} mediaAlt={mediaAlt} />
      <WhyGuide />
      <Testimonials items={testimonials} />
      <Seasons />
      <EnterGaujaTiles />
      <FaqPreview items={faq} />
      <FinalCta />
      <EnterGaujaBadge />
    </>
  );
}
