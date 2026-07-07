import { useRouterState, useRouter } from "@tanstack/react-router";
import { LANGUAGES, LANG_SHORT, type Lang } from "@/lib/language";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const current = useCurrentLanguage();
  const location = useRouterState({ select: (s) => s.location });
  const router = useRouter();

  function swapLang(target: Lang): string {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return `/${target}`;
    parts[0] = target;
    return `/${parts.join("/")}`;
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-background/70 p-0.5 backdrop-blur"
    >
      {LANGUAGES.map((l) => {
        const active = l === current;
        const pathname = swapLang(l);
        const href = `${pathname}${location.searchStr ?? ""}${location.hash ? `#${location.hash}` : ""}`;
        return (
          <a
            key={l}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              if (active) return;
              router.navigate({
                to: pathname,
                search: location.search as never,
                hash: location.hash || undefined,
              });
            }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-ink-muted hover:text-foreground",
            )}
          >
            {LANG_SHORT[l]}
          </a>
        );
      })}
    </div>
  );
}
