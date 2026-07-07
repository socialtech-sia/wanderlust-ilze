import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useProfile } from "@/hooks/use-services";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { tField } from "@/lib/language";

export function AboutPreview() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { data: profile } = useProfile();

  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="container-editorial grid gap-10 md:grid-cols-2 md:items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-alt md:aspect-[3/4]">
          <img
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1000&q=70"
            alt={profile?.full_name ?? ""}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <p className="text-eyebrow">{t("home.about_eyebrow")}</p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl">
            {profile?.full_name ?? "Ilze Gulbe"}
          </h2>
          <p className="mt-1 text-ink-muted">{profile ? tField(profile, "role", lang) : ""}</p>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/90">
            {profile ? tField(profile, "short_bio", lang) : ""}
          </p>
          <Link
            to="/$lang/about"
            params={{ lang }}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-moss-deep"
          >
            {t("home.about_cta")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
