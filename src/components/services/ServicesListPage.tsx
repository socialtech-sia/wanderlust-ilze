import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import {
  useEnterGaujaCategories,
  useServicesByType,
  type Service,
  type ServiceType,
} from "@/hooks/use-services";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { tField } from "@/lib/language";
import { pickAlt, resolveImageSrc, settingPath, stockSrcSet } from "@/lib/images";
import { useSiteSettings } from "@/hooks/use-services";
import type { MediaAltMap, SiteSettingsMap } from "@/lib/home-data";

type Cat = Database["public"]["Enums"]["enter_gauja_category"];
type Difficulty = Database["public"]["Enums"]["service_difficulty"];

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const HERO_IMG: Record<ServiceType, { img: string; alt: string }> = {
  excursion: {
    img: "https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=1920&q=70",
    alt: "Medieval castle ruins overlooking the Gauja valley in Latvia",
  },
  hiking: {
    img: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=70",
    alt: "Forest hiking trail through Gauja National Park",
  },
  transfer: {
    img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=70",
    alt: "Scenic road transfer through the Latvian countryside",
  },
};

type SearchShape = { category?: Cat; difficulty?: Difficulty };

/**
 * `services` и `settings` приходят из загрузчика маршрута. Хуки оставлены
 * запасным путём, но именно данные загрузчика попадают в SSR-разметку: без
 * них картинка шапки в первом кадре всегда была стоковой, даже когда своя
 * уже загружена через админку.
 */
export function ServicesListPage({
  type,
  navKey,
  services: ssrServices,
  settings: ssrSettings,
  mediaAlt,
  category,
  difficulty,
}: {
  type: ServiceType;
  navKey: "tours" | "hiking" | "transfers";
  services?: Service[];
  settings?: SiteSettingsMap;
  mediaAlt?: MediaAltMap;
  category?: Cat;
  difficulty?: Difficulty;
}) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const navigate = useNavigate();
  const { data: fromQuery, isLoading: queryLoading } = useServicesByType(type);
  const data = ssrServices ?? fromQuery;
  const isLoading = ssrServices ? false : queryLoading;
  const { data: cats } = useEnterGaujaCategories();
  const hero = HERO_IMG[type];
  // Своя картинка, если путь задан в site_settings, иначе стоковая. Ключи:
  // tours_hero_storage_path, hiking_hero_storage_path, transfers_hero_storage_path.
  const { data: settingsFromQuery } = useSiteSettings();
  const settings = ssrSettings ?? settingsFromQuery;
  const heroKey =
    type === "excursion"
      ? "tours_hero_storage_path"
      : type === "hiking"
        ? "hiking_hero_storage_path"
        : "transfers_hero_storage_path";
  const heroStored = settingPath(settings, heroKey);
  const heroSrc = resolveImageSrc(heroStored, hero.img);
  // Запасной вариант для СВОЕЙ картинки — общий по разделу: описание стоковой
  // фотографии ("Forest hiking trail…") к чужому снимку уже не относится.
  const heroAlt = pickAlt(mediaAlt, heroStored, lang, {
    own: `Wanderlust.lv — ${t(`nav.${navKey}`)}`,
    stock: hero.alt,
  });

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
      <section
        data-header-tone="dark"
        className="surface-dark relative -mt-16 flex min-h-[46vh] items-end overflow-hidden md:-mt-20 md:min-h-[54vh]"
      >
        {/* Стоковая картинка просится по нужной ширине, а не всегда 1920:
            на телефоне это разница в несколько сотен килобайт на LCP-элементе. */}
        <img
          src={heroSrc}
          srcSet={stockSrcSet(heroSrc)}
          sizes="100vw"
          alt={heroAlt}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--pine)_30%,transparent)_0%,color-mix(in_oklab,var(--pine)_85%,transparent)_85%,var(--pine)_100%)]"
        />
        <div className="container-editorial relative z-10 w-full pb-14 pt-32 text-bone md:pb-20 md:pt-40">
          <p className="text-eyebrow text-bone-muted">Wanderlust · {t(`nav.${navKey}`)}</p>
          <h1 className="display-1 mt-4 max-w-3xl text-bone">{t(`nav.${navKey}`)}</h1>
        </div>
      </section>

      <section className="container-editorial py-14">
        {type !== "transfer" && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => goto({ category: undefined })}
              className={cn(
                "text-utility rounded-sm border px-4 py-2 text-[11px] transition-colors",
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
                    "text-utility rounded-sm border px-4 py-2 text-[11px] transition-colors",
                    active ? "text-bone" : "hover:text-foreground",
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
                "text-utility rounded-sm border px-3 py-1.5 text-[10px] transition-colors",
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
                    "text-utility rounded-sm border px-3 py-1.5 text-[10px] transition-colors",
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
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-paper-alt" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="py-20 text-center text-ink-muted">{t("service.no_results")}</p>
        )}

        {/* Карточки услуг — h3. Между ними и h1 страницы не было h2, и уровни
            шли h1 -> h3. Заголовок скрыт от глаза, но не от скринридера:
            структура чинится, вид не меняется. */}
        <h2 className="sr-only">{t("a11y.services_list")}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, i) => (
            <ServiceCard key={s.id} service={s} lang={lang} imageIndex={i} mediaAlt={mediaAlt} />
          ))}
        </div>
      </section>
    </>
  );
}
