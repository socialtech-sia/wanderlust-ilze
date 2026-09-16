import { useTranslation } from "react-i18next";
import { Star, ExternalLink } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-services";

/**
 * Оценка на TripAdvisor и ссылка на профиль.
 *
 * Ссылка и цифры живут в site_settings, а не в коде: профиля у клиента ещё нет,
 * и когда он появится, адрес вписывается через админку — без правки исходников
 * и без пересборки образа.
 *
 * Пустой `tripadvisor_url` = выключено. Тогда компонент не рендерит НИЧЕГО:
 * ни заглушки, ни неактивной кнопки. На живом сайте им делать нечего, а
 * «скоро здесь будет» — худший вид контента.
 */

function num(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function TripAdvisorRating() {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  const url = typeof settings?.tripadvisor_url === "string" ? settings.tripadvisor_url.trim() : "";
  if (!url) return null;

  // 0…5 с шагом в половину звезды — как рисует сам TripAdvisor.
  const rating = Math.min(5, Math.max(0, num(settings?.tripadvisor_rating, 0)));
  const rounded = Math.round(rating * 2) / 2;
  const reviews = Math.max(0, Math.trunc(num(settings?.tripadvisor_review_count, 0)));

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border/60 pt-6">
      <div className="flex items-center gap-2">
        <span
          className="flex items-center gap-0.5"
          role="img"
          aria-label={t("home.tripadvisor_rating_aria", { rating: rounded })}
        >
          {[1, 2, 3, 4, 5].map((i) => {
            const fill = Math.min(1, Math.max(0, rounded - i + 1));
            return (
              <span key={i} className="relative inline-flex h-4 w-4" aria-hidden>
                <Star className="absolute inset-0 h-4 w-4 text-ink-muted/35" />
                {/* Половина звезды — обрезка обёртки по ширине, а не второй иконкой:
                    так дробное значение вроде 4.5 выглядит ровно так же, как целое. */}
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className="h-4 w-4 fill-sandstone text-sandstone" />
                </span>
              </span>
            );
          })}
        </span>
        <span className="text-sm font-semibold text-foreground">{rounded.toFixed(1)}</span>
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-ink-muted">
          {t("home.tripadvisor_caption")}
        </p>
        {reviews > 0 ? (
          <p className="text-sm text-foreground">
            {t("home.tripadvisor_reviews", { count: reviews })}
          </p>
        ) : null}
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-sandstone hover:text-sandstone"
      >
        {t("home.tripadvisor_cta")}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </a>
    </div>
  );
}
