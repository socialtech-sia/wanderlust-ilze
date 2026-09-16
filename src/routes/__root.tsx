import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Button } from "@/components/ui/button";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { Logo } from "@/components/brand/Logo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <Link to="/" aria-label="Wanderlust.lv" className="mb-8 inline-flex text-foreground">
          <Logo variant="stacked" tone="auto" size={56} />
        </Link>
        <p className="text-eyebrow">404</p>
        <h1 className="mt-2 font-display text-5xl text-foreground">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </Button>
          <Button asChild variant="outline">
            <a href="/">Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Ilze Gulbe · SIA Creatus Real Estate" },
      { name: "theme-color", content: "#1E2B1F" },
      { property: "og:site_name", content: "Wanderlust.lv" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://wanderlust.lv/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Wanderlust.lv" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://wanderlust.lv/og-image.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      // Google Fonts убраны: их таблица стилей была render-blocking и лежала на
      // чужом origin, то есть до первой отрисовки браузер шёл за DNS, TLS и CSS
      // к постороннему хосту. Объявления @font-face теперь в src/fonts.css,
      // файлы — в /public/fonts.
      //
      // Шрифты СОЗНАТЕЛЬНО не предзагружаются, хотя заголовок первого экрана
      // набран Source Serif 4. Причина в измерении, а не в принципе:
      // при font-display: swap текст рисуется запасным шрифтом сразу, то есть
      // на момент отрисовки шрифт не нужен, а preload двух подмножеств
      // (latin 120 КБ + latin-ext 99 КБ — латышские диакритики лежат в
      // latin-ext) отбирал 219 КБ пропускной способности у настоящего
      // LCP-элемента, картинки hero. Замер это подтвердил, цифры в отчёте.
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: "Wanderlust.lv",
          url: "https://wanderlust.lv",
          logo: "https://wanderlust.lv/logo.png",
          areaServed: "Gauja National Park, Latvia",
          knowsAbout: [
            "Enter Gauja",
            "Enter Nature",
            "Enter History",
            "Enter Culture",
            "Sigulda",
            "Cēsis",
            "Līgatne",
            "Turaida",
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="lv">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n} defaultNS="translation">
        <Outlet />
      </I18nextProvider>
    </QueryClientProvider>
  );
}
