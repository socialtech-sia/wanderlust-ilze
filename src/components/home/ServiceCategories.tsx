import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Compass, Mountain, Car, ArrowUpRight } from "lucide-react";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { formatDuration, formatPrice } from "@/lib/format";
import { statsForType, type HomeService } from "@/lib/home-data";

const CATEGORIES = [
  {
    key: "tours" as const,
    type: "excursion" as const,
    to: "/$lang/tours" as const,
    icon: Compass,
    img: "https://images.unsplash.com/photo-1568486004327-9e2af64ac2ac?auto=format&fit=crop&w=1600&q=70",
    alt: "Turaida medieval castle tower rising above the Gauja valley",
  },
  {
    key: "hiking" as const,
    type: "hiking" as const,
    to: "/$lang/hiking" as const,
    icon: Mountain,
    img: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=70",
    alt: "Forest hiking trail winding through Gauja National Park pines",
  },
  {
    key: "transfers" as const,
    type: "transfer" as const,
    to: "/$lang/transfers" as const,
    icon: Car,
    img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1600&q=70",
    alt: "Scenic Latvian countryside road used for private transfers",
  },
];

const DESC: Record<"tours" | "hiking" | "transfers", { lv: string; en: string; es: string }> = {
  tours: {
    lv: "Pilis, muzeji un pilsētu stāsti Siguldā, Cēsīs un Līgatnē. Piemēroti pirmajai reizei un ģimenēm ar bērniem.",
    en: "Castles, museums and town stories in Sigulda, Cēsis and Līgatne. A good fit for a first visit and for families.",
    es: "Castillos, museos e historias urbanas en Sigulda, Cēsis y Līgatne. Ideal para una primera visita y para familias.",
  },
  hiking: {
    lv: "Takas gar Gauju un smilšakmens klintīm — no vieglām līdz pilnas dienas maršrutiem. Tempu izvēlaties jūs.",
    en: "Trails along the Gauja and its sandstone cliffs — from gentle walks to full-day routes. You set the pace.",
    es: "Senderos junto al Gauja y sus acantilados de arenisca, desde paseos suaves hasta rutas de día completo. Tú marcas el ritmo.",
  },
  transfers: {
    lv: "Volvo XC60 līdz 4 personām no Rīgas, lidostas vai Jūrmalas. Var apvienot ar ekskursiju vienā dienā.",
    en: "A Volvo XC60 for up to four people from Riga, the airport or Jūrmala. Can be combined with a tour on the same day.",
    es: "Un Volvo XC60 para hasta cuatro personas desde Riga, el aeropuerto o Jūrmala. Se puede combinar con una excursión el mismo día.",
  },
};

export function ServiceCategories({ services = [] }: { services?: HomeService[] }) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();

  return (
    <section className="container-editorial py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-eyebrow">02 · {t("nav.tours")}</p>
        <h2 className="mt-2 font-display text-3xl md:text-5xl">{t("home.categories_title")}</h2>
        <p className="mt-3 text-ink-muted">{t("home.categories_subtitle")}</p>
      </div>
      <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const stats = statsForType(services, c.type);
          const duration =
            stats.minDuration && stats.maxDuration
              ? stats.minDuration === stats.maxDuration
                ? formatDuration(stats.minDuration, lang)
                : `${formatDuration(stats.minDuration, lang)} – ${formatDuration(stats.maxDuration, lang)}`
              : null;
          const meta = [
            stats.count ? t("home.options_count", { count: stats.count }) : null,
            duration,
            stats.priceFrom != null
              ? t("home.price_from_short", { price: formatPrice(stats.priceFrom) })
              : null,
          ].filter(Boolean) as string[];

          return (
            <Link
              key={c.key}
              to={c.to}
              params={{ lang }}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-ink text-bone shadow-card transition-all hover:shadow-editorial"
            >
              <img
                src={c.img}
                alt={c.alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent"
              />
              <div className="relative z-10 p-6">
                <Icon className="h-6 w-6 text-bone-muted" />
                <h3 className="mt-4 font-display text-2xl text-bone md:text-3xl">
                  {t(`nav.${c.key}`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-bone-muted">{DESC[c.key][lang]}</p>
                {meta.length > 0 && (
                  <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-bone-muted">
                    {meta.map((m, i) => (
                      <span key={m}>
                        {i > 0 && <span aria-hidden className="mr-2">·</span>}
                        {m}
                      </span>
                    ))}
                  </p>
                )}
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-bone">
                  {t("cta.explore")} <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
