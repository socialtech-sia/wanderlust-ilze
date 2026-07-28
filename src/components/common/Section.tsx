import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/use-reveal";

/** Wraps children in an SSR-safe scroll reveal (final state rendered server-side). */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      data-reveal="in"
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * Editorial section shell: asymmetric 12-column grid with a vertical
 * layer-marking eyebrow in the free left field (>=1280px only).
 */
export function Section({
  eyebrow,
  children,
  className,
  tone = "dark",
  id,
  compact = false,
}: {
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light" | "deep" | "none";
  id?: string;
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      data-header-tone={tone === "light" ? "light" : "dark"}
      className={cn(
        tone === "light" && "surface-light",
        tone === "dark" && "surface-dark",
        tone === "deep" && "surface-dark surface-deep",
        compact ? "section-y-sm" : "section-y",
        className,
      )}
    >
      <div className="container-editorial">
        <div className="xl:grid xl:grid-cols-12 xl:gap-10">
          {eyebrow ? (
            <div className="hidden xl:col-span-1 xl:flex xl:justify-start">
              <span className="eyebrow-vertical sticky top-32">{eyebrow}</span>
            </div>
          ) : null}
          <div className={cn(eyebrow ? "xl:col-span-11" : "xl:col-span-12")}>
            {eyebrow ? <p className="text-eyebrow mb-4 xl:hidden">{eyebrow}</p> : null}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Standard section heading block (7 of 12 columns, offset). */
export function SectionHead({
  title,
  text,
  className,
  action,
}: {
  title: ReactNode;
  text?: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <Reveal className={cn("max-w-2xl", className)}>
      <h2 className="display-2 text-foreground">{title}</h2>
      {text ? <p className="mt-4 text-base leading-relaxed text-muted-foreground">{text}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </Reveal>
  );
}
