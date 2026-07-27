import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { tField } from "@/lib/language";
import type { HomeTestimonial } from "@/lib/home-data";

export function Testimonials({ items }: { items: HomeTestimonial[] }) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();

  const visible = items.filter((r) => tField(r, "text", lang));
  if (!visible.length) return null;

  return (
    <section className="bg-paper-alt py-20 md:py-28">
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="text-eyebrow">11 · {t("testimonials.eyebrow")}</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">{t("testimonials.title")}</h2>
          <p className="mt-3 text-ink-muted">{t("testimonials.subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {visible.map((r) => (
            <figure
              key={r.id}
              className="flex flex-col rounded-2xl border border-border/60 bg-card p-6"
            >
              <div className="flex gap-0.5" aria-label={`${r.rating}/5`}>
                {Array.from({ length: Math.max(0, Math.min(5, r.rating ?? 5)) }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-moss text-moss" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                {tField(r, "text", lang)}
              </blockquote>
              <figcaption className="mt-5 text-xs text-ink-muted">
                {r.author_name}
                {r.author_country ? ` · ${r.author_country}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
