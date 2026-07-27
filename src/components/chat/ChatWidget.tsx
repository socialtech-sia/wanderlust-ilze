import { lazy, Suspense, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/hooks/use-services";
import { useCurrentLanguage } from "@/hooks/use-current-language";

// Panel content is code-split: the initial bundle only carries this button.
const ChatPanel = lazy(() =>
  import("./ChatPanel").then((m) => ({ default: m.ChatPanel })),
);

export function ChatWidget() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { data: settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const enabled = settings?.chatbot_enabled !== false;
  if (!mounted || !enabled) return null;

  const greeting =
    (settings?.[`chatbot_greeting_${lang}`] as string | undefined) ?? t("chat.greeting");

  return (
    <>
      <button
        type="button"
        aria-label={t("chat.title")}
        onClick={() => setOpen(true)}
        className="group fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-moss-deep text-paper shadow-lg transition-transform duration-200 hover:scale-105 motion-reduce:transition-none md:bottom-24 md:right-6 md:h-14 md:w-14"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100 md:block">
          {t("chat.title")}
        </span>
      </button>

      {open ? (
        <Suspense fallback={null}>
          <ChatPanel lang={lang} greeting={greeting} onClose={() => setOpen(false)} />
        </Suspense>
      ) : null}
    </>
  );
}
