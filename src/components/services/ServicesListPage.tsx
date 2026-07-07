import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useServicesByType, useEnterGaujaCategories, type ServiceType } from "@/hooks/use-services";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { tField } from "@/lib/language";

type Cat = Database["public"]["Enums"]["enter_gauja_category"];
type Difficulty = Database["public"]["Enums"]["service_difficulty"];

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const HERO_IMG: Record<ServiceType, { img: string; alt: string }> = {
  excursion: {
    img: "https://images.unsplash.com/photo-1568486004327-9e2af64ac2ac?auto=format&fit=crop&w=1920&q=70",
    alt: "Castle",
  },
  hiking: {
    img: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=70",
    alt: "Forest hike",
  },
  transfer: {
    img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=70",
    alt: "Road",
  },
};

type SearchShape = { category?: Cat; difficulty?: Difficulty };

export function ServicesListPage({
  type,
  navKey,
  category,
  difficulty,
}: {
  type: ServiceType;
  navKey: "tours" | "hiking" | "transfers";
  category?: Cat;
  difficulty?: Difficulty;
}) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const navigate = useNavigate();
  const { data, isLoading } = useServicesByType(type);
  const { data: cats } = useEnterGaujaCategories();
  const hero = HERO_IMG[type];

  const filtered = (data ?? []).filter((s) => {
    if (category && !(s.enter_gauja_categories ?? []).includes(category)) return false;
    if (difficulty && s.difficulty !== difficulty) return false;
    return true;
  });

  const to = `/$lang/${navKey}` as "/$lang/tours";

  const goto = (next: SearchShape) =>
    navigate({
      to,
      params: { lang },
      search: (prev: SearchShape) => ({ ...prev, ...next }),
    });

  return (
    <>
      <section className="relative -mt-16 flex min-h-[46vh] items-end overflow-hidden md:-mt-20 md:min-h-[54vh]">
        <img src={hero.img} alt={hero.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/20 to-ink/70" />
        <div className="container-editorial relative z-10 pb-14 pt-32 text-paper md:pb-20 md:pt-40">
          <p className="text-eyebrow text-paper/90">Wanderlust · {t(`nav.${navKey}`)}</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
            {t(`nav.${navKey}`)}
          </h1>
        </div>
      </section>

      <section className="container-editorial py-14">
        {type !== "transfer" && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => goto({ category: undefined })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                !category
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/60 text-ink-muted hover:text-foreground",
              )}
            >
              {t("categories.all")}
            </button>
            {cats?.map((c) => {
              const active = category === c.key;
              const color = c.color_hex ?? "#6B8E4E";
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => goto({ category: active ? undefined : c.key })}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm transition-colors",
                    active ? "text-paper" : "hover:text-foreground",
                  )}
                  style={
                    active
                      ? { backgroundColor: color, borderColor: color }
                      : { borderColor: "var(--border)", color: "var(--ink-muted)" }
                  }
                >
                  {tField(c, "name", lang)}
                </button>
              );
            })}
          </div>
        )}

        {type !== "transfer" && (
          <div className="mb-10 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-widest text-ink-muted">
              {t("service.difficulty")}
            </span>
            <button
              type="button"
              onClick={() => goto({ difficulty: undefined })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                !difficulty
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/60 text-ink-muted hover:text-foreground",
              )}
            >
              {t("categories.all")}
            </button>
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => goto({ difficulty: active ? undefined : d })}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/60 text-ink-muted hover:text-foreground",
                  )}
                >
                  {t(`service.difficulty_${d}`)}
                </button>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-paper-alt" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="py-20 text-center text-ink-muted">{t("service.no_results")}</p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, i) => (
            <ServiceCard key={s.id} service={s} lang={lang} imageIndex={i} />
          ))}
        </div>
      </section>
    </>
  );
}
