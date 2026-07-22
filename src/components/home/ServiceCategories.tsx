import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Compass, Mountain, Car, ArrowUpRight } from "lucide-react";
import { useCurrentLanguage } from "@/hooks/use-current-language";

const CATEGORIES = [
  {
    key: "tours" as const,
    to: "/$lang/tours" as const,
    icon: Compass,
    img: "https://images.unsplash.com/photo-1568486004327-9e2af64ac2ac?auto=format&fit=crop&w=1600&q=70",
    alt: "Turaida medieval castle tower rising above the Gauja valley",
  },
  {
    key: "hiking" as const,
    to: "/$lang/hiking" as const,
    icon: Mountain,
    img: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=70",
    alt: "Forest hiking trail winding through Gauja National Park pines",
  },
  {
    key: "transfers" as const,
    to: "/$lang/transfers" as const,
    icon: Car,
    img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1600&q=70",
    alt: "Scenic Latvian countryside road used for private transfers",
  },
];

const DESC: Record<"tours" | "hiking" | "transfers", { lv: string; en: string; es: string }> = {
  tours: {
    lv: "Vēsture un stāsti Siguldas, Cēsu, Līgatnes pilīs un muzejos.",
    en: "History and stories in the castles and museums of Sigulda, Cēsis and Līgatne.",
    es: "Historia y relatos en los castillos y museos de Sigulda, Cēsis y Līgatne.",
  },
  hiking: {
    lv: "No vieglām ģimenes takām līdz dienas maršrutiem Gaujas Nacionālajā parkā.",
    en: "From gentle family trails to full-day routes in Gauja National Park.",
    es: "Desde sendas familiares hasta rutas de día completo en el PN Gauja.",
  },
  transfers: {
    lv: "Ērts Volvo XC60 līdz 4 personām — no Rīgas, lidostas vai Jūrmalas.",
    en: "Comfortable Volvo XC60 for up to 4 — from Riga, the airport, or Jūrmala.",
    es: "Volvo XC60 cómodo para 4 personas — desde Riga, aeropuerto o Jūrmala.",
  },
};

export function ServiceCategories() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();

  return (
    <section className="container-editorial py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-eyebrow">01 · {t("nav.tours")}</p>
        <h2 className="mt-2 font-display text-3xl md:text-5xl">{t("home.categories_title")}</h2>
        <p className="mt-3 text-ink-muted">{t("home.categories_subtitle")}</p>
      </div>
      <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.key}
              to={c.to}
              params={{ lang }}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-ink text-paper shadow-card transition-all hover:shadow-editorial"
            >
              <img
                src={c.img}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="relative z-10 p-6">
                <Icon className="h-6 w-6 text-paper/90" />
                <h3 className="mt-4 font-display text-2xl text-paper md:text-3xl">
                  {t(`nav.${c.key}`)}
                </h3>
                <p className="mt-2 text-sm text-paper/80">{DESC[c.key][lang]}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-paper">
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
