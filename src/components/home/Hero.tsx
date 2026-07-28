import { useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-gauja.jpg";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { useSiteSettings } from "@/hooks/use-services";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Split a headline into up to `max` visually balanced lines. */
function splitLines(text: string, max = 3): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [text];
  const lines = Math.min(max, words.length);
  const per = Math.ceil(words.length / lines);
  const out: string[] = [];
  for (let i = 0; i < words.length; i += per) out.push(words.slice(i, i + per).join(" "));
  return out;
}

export function Hero() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { data: settings } = useSiteSettings();

  const headline = ((settings?.[`hero_headline_${lang}`] as string) ?? "") || t("home.categories_title");
  const subline = (settings?.[`hero_subline_${lang}`] as string) ?? "";
  const lines = splitLines(headline, 3);

  const stageRef = useRef<HTMLDivElement | null>(null);

  // Rendered in final state for SSR; armed before first client paint, then released.
  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(stage.querySelectorAll<HTMLElement>("[data-heroline]"));
    els.forEach((el) => el.setAttribute("data-heroline", "armed"));
    const id = requestAnimationFrame(() => {
      els.forEach((el, i) => {
        el.style.transitionDelay = `${120 + i * 110}ms`;
        el.setAttribute("data-heroline", "in");
      });
    });
    return () => cancelAnimationFrame(id);
  }, [headline]);

  return (
    <section
      data-header-tone="dark"
      className="surface-dark relative isolate -mt-16 flex min-h-[92svh] items-end overflow-hidden md:-mt-20"
    >
      <img
        src={heroImg}
        alt="Aerial view of the Gauja river valley with sandstone cliffs and pine forest, Sigulda, Latvia"
        width={1920}
        height={1280}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Pine-toned gradient: the image sinks into the page instead of into black. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--pine)_35%,transparent)_0%,color-mix(in_oklab,var(--pine)_20%,transparent)_38%,color-mix(in_oklab,var(--pine)_88%,transparent)_88%,var(--pine)_100%)]"
      />

      <div ref={stageRef} className="container-editorial relative z-10 pb-20 pt-32 md:pb-28 md:pt-40">
        <p data-heroline="in" className="text-utility text-bone-muted">
          Gauja · Sigulda · Cēsis · Līgatne
        </p>

        <h1 className="mt-5 max-w-4xl text-bone">
          {lines.map((line, i) => (
            <span key={i} data-heroline="in" className="display-1 block text-bone">
              {line}
            </span>
          ))}
        </h1>

        {subline ? (
          <p data-heroline="in" className="mt-7 max-w-md text-base leading-relaxed text-bone-muted">
            {subline}
          </p>
        ) : null}

        <div data-heroline="in" className="mt-9 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to="/$lang/book" params={{ lang }}>
              {t("cta.book_now")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline-light" size="lg">
            <Link to="/$lang/tours" params={{ lang }}>
              {t("nav.tours")}
            </Link>
          </Button>
        </div>

        <p data-heroline="in" className="text-utility mt-8 text-bone-faint">
          {t("home.hero_trust")}
        </p>
      </div>
    </section>
  );
}
