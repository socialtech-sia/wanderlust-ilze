import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-gauja.jpg";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { useSiteSettings } from "@/hooks/use-services";

export function Hero() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { data: settings } = useSiteSettings();

  const headline = (settings?.[`hero_headline_${lang}`] as string) ?? "";
  const subline = (settings?.[`hero_subline_${lang}`] as string) ?? "";

  return (
    <section
      data-header-tone="dark"
      className="relative isolate -mt-16 flex min-h-[92vh] items-end overflow-hidden md:-mt-20"
    >

      <img
        src={heroImg}
        alt="Aerial view of the Gauja river valley with sandstone cliffs and pine forest, Sigulda, Latvia"
        width={1920}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/10 to-ink/70"
      />
      <div className="container-editorial relative z-10 pb-16 pt-32 text-paper md:pb-24 md:pt-40">
        <p className="text-eyebrow text-paper/90">Gauja · Sigulda · Cēsis · Līgatne</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] text-paper drop-shadow-md md:text-6xl lg:text-7xl">
          {headline || t("home.categories_title")}
        </h1>
        <p className="mt-6 max-w-xl text-base text-paper/85 md:text-lg">{subline}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary" size="xl">
            <Link to="/$lang/book" params={{ lang }}>
              {t("cta.book_now")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline-light" size="xl">
            <Link to="/$lang/tours" params={{ lang }}>
              {t("nav.tours")}
            </Link>
          </Button>
        </div>
        <p className="mt-6 text-xs uppercase tracking-wider text-paper/80 md:text-sm md:normal-case md:tracking-normal">
          {t("home.hero_trust")}
        </p>
      </div>
    </section>
  );
}
