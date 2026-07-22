import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { useProfile } from "@/hooks/use-services";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { tField } from "@/lib/language";
import { Award, Languages } from "lucide-react";

import { routeHead } from "@/lib/route-head";

export const Route = createFileRoute("/$lang/about")({
  head: ({ params }) => routeHead({ params, routeKey: "about", path: "/about" }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { data: profile } = useProfile();
  const certs = (profile?.certifications as { name: string; year?: number }[] | null) ?? [];

  return (
    <>
      <section className="relative -mt-16 min-h-[42vh] overflow-hidden md:-mt-20 md:min-h-[52vh]">
        <img
          src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=70"
          alt="Misty Gauja river valley at sunrise, seen from Sigulda ridge"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/20 to-ink/70" />
        <div className="container-editorial relative z-10 flex h-full items-end pb-14 pt-32 text-paper md:pb-20 md:pt-40">
          <div>
            <p className="text-eyebrow text-paper/90">{t("home.about_eyebrow")}</p>
            <h1 className="mt-3 font-display text-4xl md:text-6xl">
              {profile?.full_name ?? t("about.title")}
            </h1>
            <p className="mt-2 text-paper/80">{profile ? tField(profile, "role", lang) : ""}</p>
          </div>
        </div>
      </section>

      <section className="container-editorial grid gap-12 py-16 md:grid-cols-3">
        <div className="md:col-span-2 prose prose-neutral max-w-none text-foreground/90">
          {profile && <ReactMarkdown>{tField(profile, "bio", lang)}</ReactMarkdown>}
        </div>
        <aside className="space-y-8">
          {profile?.years_of_experience != null && (
            <div>
              <p className="text-eyebrow">—</p>
              <p className="mt-1 font-display text-5xl text-foreground">{profile.years_of_experience}</p>
              <p className="text-sm text-ink-muted">{t("about.years_experience")}</p>
            </div>
          )}
          {certs.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-eyebrow">
                <Award className="h-4 w-4" /> {t("about.certifications")}
              </div>
              <ul className="space-y-1.5 text-sm text-foreground">
                {certs.map((c, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{c.name}</span>
                    {c.year && <span className="text-ink-muted">{c.year}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {profile?.languages_spoken?.length ? (
            <div>
              <div className="mb-2 flex items-center gap-2 text-eyebrow">
                <Languages className="h-4 w-4" /> {t("about.languages")}
              </div>
              <p className="text-sm text-foreground">
                {profile.languages_spoken.map((l) => l.toUpperCase()).join(" · ")}
              </p>
            </div>
          ) : null}
        </aside>
      </section>
    </>
  );
}
