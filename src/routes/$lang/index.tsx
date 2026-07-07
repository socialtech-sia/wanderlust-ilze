import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { ServiceCategories } from "@/components/home/ServiceCategories";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { EnterGaujaTiles } from "@/components/home/EnterGaujaTiles";
import { AboutPreview } from "@/components/home/AboutPreview";
import { EnterGaujaBadge } from "@/components/home/EnterGaujaBadge";

export const Route = createFileRoute("/$lang/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <ServiceCategories />
      <FeaturedServices />
      <AboutPreview />
      <EnterGaujaTiles />
      <EnterGaujaBadge />
    </>
  );
}
