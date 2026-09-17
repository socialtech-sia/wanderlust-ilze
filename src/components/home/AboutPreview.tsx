import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Award, Languages, CalendarDays } from "lucide-react";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { tField, LANG_LABELS, isLang } from "@/lib/language";
import type { HomeProfile } from "@/lib/home-data";
import { firstImageSrc } from "@/lib/images";
import { TripAdvisorRating } from "@/components/home/TripAdvisorRating";

const LANG_NAMES: Record<string, { lv: string; en: string; es: string }> = {
  lv: { lv: "latviešu", en: "Latvian", es: "letón" },
  en: { lv: "angļu", en: "English", es: "inglés" },
  ru: { lv: "krievu", en: "Russian", es: "ruso" },
  es: { lv: "spāņu", en: "Spanish", es: "español" },
};

function certLabel(cert: unknown): string {
  if (typeof cert === "string") return cert;
  if (cert && typeof cert === "object") {
    const c = cert as Record<string, unknown>;
    const v = c.name ?? c.title ?? c.label;
    if (typeof v === "string") return v;
  }
  return "";
}

export function AboutPreview({ profile }: { profile?: HomeProfile | null }) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();

  const shortBio = profile ? tField(profile, "short_bio", lang) : "";
  const bio = profile ? tField(profile, "bio", lang) : "";
  const paragraphs = [shortBio, ...bio.split(/\n{2,}/)]
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 3);

  const spoken = (profile?.languages_spoken ?? []).map((code) => {
    const entry = LANG_NAMES[code];
    if (entry) return entry[lang];
    return isLang(code) ? LANG_LABELS[code] : code.toUpperCase();
  });

  const certs = Array.isArray(profile?.certifications)
    ? (profile.certifications as unknown[]).map(certLabel).filter(Boolean).slice(0, 4)
    : [];

  // В базе лежит ПУТЬ в бакете (profile/1789…webp), а не адрес. Раньше он
  // подставлялся в src как есть — браузер считал его относительным к текущей
  // странице и получал 404 на /lv/profile/…webp. Портрет, загруженный через
  // админку, из-за этого не появлялся никогда.
  const avatar = firstImageSrc(profile?.avatar_storage_path);

  return (
    <section data-header-tone="light" className="surface-light section-y">
      <div className="container-editorial grid gap-10 md:grid-cols-2 md:items-start md:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-paper-alt md:aspect-[3/4]">
          {avatar ? (
            <img
              src={avatar}
              alt={
                profile?.full_name
                  ? `${profile.full_name} — Wanderlust.lv guide in Gauja National Park`
                  : "Wanderlust.lv local guide in Gauja National Park"
              }
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 border border-border/60 text-center">
              <span className="font-display text-5xl text-ink-muted/60">
                {(profile?.full_name ?? "Ilze Gulbe")
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="text-xs uppercase tracking-wider text-ink-muted">
                {profile?.full_name ?? "Ilze Gulbe"}
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="text-eyebrow">06 · {t("home.about_eyebrow")}</p>
          <h2 className="mt-2 display-2">{profile?.full_name ?? "Ilze Gulbe"}</h2>
          <p className="mt-1 text-ink-muted">{profile ? tField(profile, "role", lang) : ""}</p>

          <div className="mt-6 space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="max-w-lg text-base leading-relaxed text-foreground/90">
                {p}
              </p>
            ))}
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {profile?.years_of_experience ? (
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-moss-deep" aria-hidden />
                <div>
                  <dt className="text-xs uppercase tracking-wider text-ink-muted">
                    {t("home.years_label")}
                  </dt>
                  <dd className="text-sm text-foreground">
                    {t("home.years_value", { count: profile.years_of_experience })}
                  </dd>
                </div>
              </div>
            ) : null}
            {spoken.length ? (
              <div className="flex items-start gap-2.5">
                <Languages className="mt-0.5 h-4 w-4 shrink-0 text-moss-deep" aria-hidden />
                <div>
                  <dt className="text-xs uppercase tracking-wider text-ink-muted">
                    {t("facts.languages_title")}
                  </dt>
                  <dd className="text-sm text-foreground">{spoken.join(", ")}</dd>
                </div>
              </div>
            ) : null}
            {certs.length ? (
              <div className="flex items-start gap-2.5 sm:col-span-2">
                <Award className="mt-0.5 h-4 w-4 shrink-0 text-moss-deep" aria-hidden />
                <div>
                  <dt className="text-xs uppercase tracking-wider text-ink-muted">
                    {t("home.certs_label")}
                  </dt>
                  <dd className="text-sm text-foreground">{certs.join(" · ")}</dd>
                </div>
              </div>
            ) : null}
          </dl>

          <Link
            to="/$lang/about"
            params={{ lang }}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-moss-deep"
          >
            {t("home.about_cta")} <ArrowRight className="h-4 w-4" />
          </Link>

          <TripAdvisorRating />
        </div>
      </div>
    </section>
  );
}
