import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { useSiteSettings } from "@/hooks/use-services";
import { Instagram, Facebook, Mail, Phone, ExternalLink } from "lucide-react";
import { openConsentSettings } from "@/lib/cookie-consent";
import { ENTER_GAUJA_ORDER, ENTER_GAUJA_CATEGORIES } from "@/lib/enter-gauja";
import { EnterGaujaLogo } from "@/components/entergauja/EnterGaujaLogo";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { data: settings } = useSiteSettings();
  const year = new Date().getFullYear();

  const email = (settings?.contact_email as string) ?? "";
  const phone = (settings?.contact_phone as string) ?? "";
  const facebook = settings?.social_facebook as string | undefined;
  const instagram = settings?.social_instagram as string | undefined;
  const footerText = (settings?.[`footer_text_${lang}`] as string) ?? "";

  return (
    <footer className="mt-24 border-t border-border/60 bg-paper-alt">
      <div className="container-editorial grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link
            to="/$lang"
            params={{ lang }}
            aria-label="Wanderlust.lv"
            className="inline-flex text-foreground"
          >
            <Logo variant="horizontal" tone="auto" size={44} />
          </Link>
          <p className="mt-4 max-w-md text-sm text-ink-muted">{footerText}</p>
          <p className="mt-6 text-eyebrow">{t("home.partner_text")}</p>
        </div>

        <nav aria-label={t("footer.sitemap")}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {t("footer.sitemap")}
          </p>
          <ul className="space-y-2 text-sm">
            {(["tours", "hiking", "transfers", "about", "faq", "contact"] as const).map(
              (k) => (
                <li key={k}>
                  <Link
                    to={`/$lang/${k}` as "/$lang/tours"}
                    params={{ lang }}
                    className="text-foreground/80 hover:text-foreground"
                  >
                    {t(`nav.${k}`)}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {t("footer.contact")}
          </p>
          <ul className="space-y-2 text-sm">
            {phone && (
              <li>
                <a href={`tel:${phone}`} className="inline-flex items-center gap-2 hover:text-foreground text-foreground/80">
                  <Phone className="h-3.5 w-3.5" /> {phone}
                </a>
              </li>
            )}
            {email && (
              <li>
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 hover:text-foreground text-foreground/80">
                  <Mail className="h-3.5 w-3.5" /> {email}
                </a>
              </li>
            )}
          </ul>
          <div className="mt-5 flex gap-3">
            {facebook && (
              <a href={facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-ink-muted hover:text-foreground hover:border-foreground">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-ink-muted hover:text-foreground hover:border-foreground">
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Enter Gauja community partner line (guidelines p.16, 29) */}
      <div className="border-t border-border">
        <div className="container-editorial flex flex-col items-start gap-3 py-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <a
              href="https://entergauja.com/"
              target="_blank"
              rel="noopener"
              className="opacity-50 grayscale transition hover:opacity-100 hover:grayscale-0"
              aria-label="Enter Gauja"
            >
              <EnterGaujaLogo className="h-6 w-6" size={24} />
            </a>
            <p className="text-eyebrow tracking-[0.16em]">
              {t("entergauja.footer_title", {
                defaultValue:
                  lang === "lv"
                    ? "Enter Gauja kopienas partneris"
                    : lang === "es"
                      ? "Partner de la comunidad Enter Gauja"
                      : "Enter Gauja community partner",
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {ENTER_GAUJA_ORDER.map((k) => {
              const c = ENTER_GAUJA_CATEGORIES[k];
              return (
                <a
                  key={k}
                  href={c.url}
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex items-center gap-1.5 text-eyebrow tracking-[0.16em] transition-colors hover:text-foreground"
                >
                  <span
                    aria-hidden
                    className="inline-block h-[6px] w-[6px] shrink-0 transition-transform duration-200 group-hover:scale-150"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.label}
                  <ExternalLink className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-70" />
                </a>
              );
            })}
          </div>
        </div>
      </div>


      <div className="border-t border-border/50">
        <div className="container-editorial flex flex-col items-start justify-between gap-3 py-5 text-xs text-ink-muted md:flex-row md:items-center">
          <p>{t("footer.rights", { year, defaultValue: `© ${year} Wanderlust.lv` })}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/$lang/privacy" params={{ lang }} className="hover:text-foreground">
              {LEGAL_LABELS[lang].privacy}
            </Link>
            <Link to="/$lang/cookies" params={{ lang }} className="hover:text-foreground">
              {LEGAL_LABELS[lang].cookies}
            </Link>
            <Link to="/$lang/terms" params={{ lang }} className="hover:text-foreground">
              {LEGAL_LABELS[lang].terms}
            </Link>
            <button
              type="button"
              onClick={openConsentSettings}
              className="hover:text-foreground"
            >
              {LEGAL_LABELS[lang].manage}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

const LEGAL_LABELS = {
  lv: {
    privacy: "Privātuma politika",
    cookies: "Sīkdatņu politika",
    terms: "Lietošanas noteikumi",
    manage: "Sīkdatņu iestatījumi",
  },
  en: {
    privacy: "Privacy policy",
    cookies: "Cookie policy",
    terms: "Terms of service",
    manage: "Cookie preferences",
  },
  es: {
    privacy: "Política de privacidad",
    cookies: "Política de cookies",
    terms: "Términos del servicio",
    manage: "Preferencias de cookies",
  },
} as const;
