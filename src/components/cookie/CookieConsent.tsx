import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { CONSENT_OPEN_EVENT } from "@/lib/cookie-consent";

export function CookieConsent() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { consent, isLoaded, acceptAll, rejectOptional, update } = useCookieConsent();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const openHandler = () => {
      setAnalytics(consent?.analytics ?? false);
      setMarketing(consent?.marketing ?? false);
      setSettingsOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, openHandler);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, openHandler);
  }, [consent]);

  if (!isLoaded) return null;

  const showBanner = consent === null && !settingsOpen;

  const openSettings = () => {
    setAnalytics(consent?.analytics ?? false);
    setMarketing(consent?.marketing ?? false);
    setSettingsOpen(true);
  };

  const saveCustom = () => {
    update({ analytics, marketing });
    setSettingsOpen(false);
  };

  return (
    <>
      {showBanner && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label={t("consent.title")}
          className="fixed inset-x-3 bottom-3 z-[60] md:inset-x-auto md:right-6 md:bottom-6 md:max-w-sm"
        >
          <div className="rounded-xl border border-border/70 bg-background/95 p-3.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Cookie className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-sm text-foreground">
                  {t("consent.title")}
                </h2>
                <p className="mt-1 text-xs leading-snug text-ink-muted">
                  {t("consent.body")}{" "}
                  <Link
                    to="/$lang/cookies"
                    params={{ lang }}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    {t("consent.learn_more")}
                  </Link>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Button size="sm" className="h-8 px-3.5 text-xs" onClick={acceptAll}>
                    {t("consent.accept_all")}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 px-3.5 text-xs" onClick={rejectOptional}>
                    {t("consent.reject")}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs" onClick={openSettings}>
                    {t("consent.customize")}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("consent.settings_title")}</DialogTitle>
            <DialogDescription>{t("consent.body")}</DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <ToggleRow
              title={t("consent.necessary")}
              desc={t("consent.necessary_desc")}
              checked
              disabled
              onChange={() => undefined}
            />
            <ToggleRow
              title={t("consent.analytics")}
              desc={t("consent.analytics_desc")}
              checked={analytics}
              onChange={setAnalytics}
            />
            <ToggleRow
              title={t("consent.marketing")}
              desc={t("consent.marketing_desc")}
              checked={marketing}
              onChange={setMarketing}
            />
          </div>

          <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                rejectOptional();
                setSettingsOpen(false);
              }}
            >
              <X className="mr-1.5 h-4 w-4" />
              {t("consent.reject")}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={saveCustom}>
                {t("consent.save")}
              </Button>
              <Button
                onClick={() => {
                  acceptAll();
                  setSettingsOpen(false);
                }}
              >
                {t("consent.accept_all")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ToggleRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{desc}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        aria-label={title}
      />
    </div>
  );
}
