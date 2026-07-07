# План: приведение Wanderlust.lv в соответствие с Enter Gauja Guidelines 2025

## Что говорят guidelines и где сайт уже совпадает

Enter Gauja выстраивает единую партнёрскую экосистему: общий бренд, четыре первичные категории (**Enter Nature / History / Culture / Action**), обязательная визуальная привязка (лого + плашка категории справа/в футере, ссылка на entergauja.lv), единый SEO-стандарт (H1/H2/H3, meta, Open Graph, Schema.org, BreadcrumbList, hreflang, Core Web Vitals, sitemap/robots), cross-linking и backlink-блок партнёра.

Совпадения с текущим сайтом:
- Категории `action / nature / history / culture` уже есть в `tours.tsx` — прямое попадание в первичную типологию Enter Gauja.
- Есть компоненты `EnterGaujaTiles`, `EnterGaujaBadge`, footer с "Enter Gauja partner".
- Мультиязычность LV/EN/ES (guidelines требуют lv/en/ru — обсудим ниже).
- Есть privacy/cookies/terms, header/footer, i18n.

Пробелы (что нужно закрыть):
1. Нет системных `head()` c title/description/OG/Schema/Breadcrumbs/hreflang для страниц.
2. Логотип Enter Gauja + плашка категории не размещены по правилу "правая сторона, sticky, кликабельно на entergauja.lv/enter-{category}".
3. Мапинг Wanderlust-категорий на цвета Enter Gauja не унифицирован (в guidelines заданы конкретные RGB для каждой из 4 категорий).
4. Тексты страниц не приведены к шаблону "ievad 70–100 vārdi + H2 4–7 + FAQ + CTA `Apskatīt Enter {Category}`".
5. Отсутствуют backlink-блок партнёра, sitemap.xml, robots.txt, JSON-LD для TouristAttraction / LandmarksOrHistoricalBuildings / Event / SportsActivityLocation, BreadcrumbList, hreflang.
6. Alt-тексты изображений и имена файлов не следуют схеме `gauja-{category}-{object}-{location}.jpg` / `alt="… (Enter {Category})"`.

---

## Категорийный мэпинг (Wanderlust → Enter Gauja)

| Услуга Wanderlust | Enter Gauja категория | Основной цвет |
|---|---|---|
| Hiking / пешие маршруты | **Enter Nature** | #4F6F19 / #679A40 (зелёный) |
| Экскурсии в замки (Turaida, Cēsis, Sigulda) | **Enter History** | #E38F25 / #9B4922 (охра/терракот) |
| Культурные экскурсии, концерты в замках | **Enter Culture** | #51869D / #003F62 (сине-голубой) |
| Активные туры (rafting, zip-line, велосипед, если добавятся) | **Enter Action** | розово-красный |
| Transfers | вторичная: **Gauja Get-around** | без изменения основной палитры |

Каждая карточка услуги в базе (`services.category`) уже несёт `action/nature/history/culture` — используем как ключ и для цветовых токенов, и для SEO-разметки.

---

## Реализация по этапам

### Этап 1. Дизайн-система категорий (design tokens)
- Добавить в `src/styles.css` CSS-переменные `--eg-nature`, `--eg-nature-alt`, `--eg-history`, `--eg-culture`, `--eg-action` с RGB из guidelines (все 4 базовых + по 1 акценту), плюс `--eg-get-around`, `--eg-eat-drink`.
- Утилита `src/lib/enter-gauja.ts`: `getEnterGaujaCategory(serviceCategory)` → `{ key, label, color, hoverColor, url }` (url = `https://entergauja.lv/enter-{key}/`).
- Кнопки "APSKATĪT" в карточках и на страницах категорий используют цвет соответствующей категории (REGULAR/ACTIVE вариант из guidelines).

### Этап 2. Компонент `EnterGaujaBadge` (по правилу стр. 16–17)
- Sticky-элемент в правом крае вьюпорта (desktop) / фиксированный внизу (mobile): лого Enter Gauja + плашка с именем категории (`DIN Pro Bold`, центрировано, прямоугольник без скруглений).
- На страницах категорий (`/[lang]/tours?category=nature` и т.д. + hiking/transfers) плашка показывает соответствующую категорию.
- Клик ведёт на `https://entergauja.lv/enter-{key}/`.
- Шрифт DIN Pro Bold подключаем через Google Fonts аналог (DIN Pro не бесплатен → использовать **Barlow Condensed 700** или **DIN Alternate**; либо оставить текущий display font только для этой плашки с visual matching). Уточнить с пользователем.

### Этап 3. SEO-модуль (централизованно)
Создать `src/lib/seo.ts` с фабриками:
- `buildPageHead({ title, description, ogImage, category, path })` → массив `{meta, links}` для TanStack `head()` включая:
  - `<title>` по шаблону `Enter {Category} | {topic} — Wanderlust.lv`.
  - `meta description` 120–160 симв. с core keyword.
  - Open Graph (`og:title`, `og:description`, `og:image` абсолютный URL, `og:type`, `og:url`).
  - Twitter card.
  - `link rel=canonical` на текущий язык.
  - `link rel=alternate hreflang="lv|en|es|x-default"` (в guidelines написано lv/en/ru — сейчас у сайта es; см. вопрос ниже).
- `buildBreadcrumbList(items)` → JSON-LD.
- `buildTouristAttraction(service)` / `buildLandmark(service)` / `buildEvent(service)` / `buildSportsActivity(service)` в зависимости от категории.
- JSON-LD рендерим через `scripts: [{ type: "application/ld+json", children: JSON.stringify(...) }]` в `head()`.

Обновить `head()` во всех route-файлах: `__root.tsx` (глобальный fallback + организация), `$lang/route.tsx` (hreflang + org), `$lang/index.tsx` (WebSite), `tours.tsx`, `hiking.tsx`, `transfers.tsx`, `about.tsx`, `contact.tsx`, `faq.tsx`, `book.tsx`, `s.$slug.tsx` (детальная услуга с category-schema + Breadcrumbs).

### Этап 4. Структура контента (стр. 12–13 guidelines)
Для каждой страницы категории и hub-страниц (tours, hiking, transfers):
- Один **H1** ≤12 слов с core keyword + Enter {Category}.
- 4–7 **H2** (перевести существующие секции; добавить недостающие: "Sezonas piedāvājumi", "Praktiskā informācija").
- 5–10 **H3** для конкретных объектов/услуг.
- **Ievadteksts** 70–100 слов с core keyword в первом предложении (заменить/расширить в i18n).
- **CTA-блок** в конце: "Apskatīt Enter {Category}" → ссылка на entergauja.lv.
- **FAQ** 3–5 вопросов в конце (у нас уже есть страница FAQ — вынести в компонент FAQBlock + добавить `FAQPage` schema).

### Этап 5. Cross-linking & Backlink block (стр. 14, 29)
- Компонент `<EnterGaujaBacklinkBlock category="nature" />` для внутренностей страниц (готовый HTML-паттерн из guidelines стр. 29).
- В карточках услуг добавить nearby-cross-links: Nature → Eat&Drink/Relax/Action; History → Culture; и т.п. (у Wanderlust нет Eat&Drink — ссылаемся на entergauja.lv/enter-eat-drink/).
- В `Footer` добавить блок "Enter Gauja kopienas partneris" со ссылкой на 4 категории.

### Этап 6. Технический SEO
- `public/robots.txt`: с `Sitemap:` и `Allow: /*` (проверить, есть ли).
- `src/routes/api/public/sitemap[.]xml.ts` — server route, генерит XML из услуг Supabase (все языки, priority 0.8, changefreq monthly, `<xhtml:link rel="alternate" hreflang="...">` per URL).
- `<link rel="canonical">` на всех страницах через `buildPageHead`.
- Проверить/добавить `loading="lazy"` и `<img>` `alt` по шаблону во всех карточках (компоненты `ServiceCard`, `Hero`, галереи).
- Установить/подтвердить WebP/AVIF конверсию (изображения из Supabase Storage — включить трансформацию через `?format=webp&quality=80`).
- Core Web Vitals: проверить LCP (Hero image `preload as="image"`), CLS (задать `width/height` картинкам, aspect-ratio).

### Этап 7. Alt-тексты и имена файлов
- Пройтись по компонентам, использующим `<img>` без `alt` или с общим alt: `Hero`, `ServiceCard`, `FeaturedServices`, `EnterGaujaTiles`, `AboutPreview`, детальная страница услуги.
- Внедрить хелпер `serviceImageAlt(service)` → `"{title} — {location} (Enter {Category})"`.
- Для новых загрузок в БД — не переименовываем сохранённые файлы, но alt даём по шаблону.

### Этап 8. Обновление i18n-текстов
- Перевести/переписать ievadtekst (70–100 слов) и H1/H2/H3 для tours, hiking, transfers, index (hero), about — во всех трёх языках, с core keyword по таблицам guidelines (стр. 26/33/40/48).
- Добавить ключи `entergauja.*` в LV/EN/ES (labels категорий, CTA "Apskatīt Enter Nature", подписи badge).

### Этап 9. Валидация
- `bun run build` + `tsgo` — типы.
- Playwright: скриншот главной + `/lv/tours?category=nature` + `/en/hiking`: проверить badge, H1, breadcrumb, ссылки на entergauja.lv.
- В консоли DevTools проверить `<script type="application/ld+json">` (Rich Results Test-ready).
- `curl -s http://localhost:8080/sitemap.xml | head` — проверить sitemap.

---

## Файлы, которые появятся / изменятся

Новые:
- `src/lib/enter-gauja.ts` — маппинг категорий, цвета, URL.
- `src/lib/seo.ts` — фабрики meta + JSON-LD.
- `src/components/entergauja/EnterGaujaBadge.tsx` (переписать текущий) — sticky-badge по правилам.
- `src/components/entergauja/EnterGaujaBacklinkBlock.tsx` — блок стр. 29.
- `src/components/common/FaqBlock.tsx` + FAQ schema.
- `src/routes/api/public/sitemap[.]xml.ts` — sitemap.
- `public/robots.txt` (или обновить существующий).

Изменяемые:
- `src/routes/__root.tsx`, `src/routes/$lang/route.tsx` — глобальный head + hreflang.
- Все route-страницы `$lang/*` — добавить `head()` через `buildPageHead`.
- `src/styles.css` — токены Enter Gauja.
- `src/i18n/{lv,en,es}.json` — новые ключи, обновлённые тексты.
- `src/components/layout/Footer.tsx` — 4 категорийные ссылки на entergauja.lv.
- `src/components/services/ServiceCard.tsx` — alt-хелпер, цвет-акцент по категории, ссылка "Apskatīt Enter {Cat}".
- Существующий `EnterGaujaBadge` / `EnterGaujaTiles` — сверить с правилами.

Что НЕ трогаем: бизнес-логику Supabase, бронирование, схемы БД, аутентификацию.

---

## Открытые вопросы (нужно решить до реализации)

1. **Языки**: guidelines требуют `lv/en/ru`, сайт сейчас `lv/en/es`. Оставляем `es`, добавляем `ru`, убираем `es`, или делаем hreflang только для `lv/en`?
2. **Шрифт DIN Pro** — платный. Использовать бесплатный близнец (**Barlow Condensed 700** или **Oswald**) только для плашки категории?
3. **Enter Action** — сейчас у Wanderlust нет rafting/zip-line услуг. Оставляем категорию "спящей" (без страницы) или маппим сюда `transfers` как compromise? Рекомендую первое.
4. **Sitemap** — генерить динамически из Supabase (server route) или статически при билде? Предлагаю server route для актуальности.
5. **OG-обложки** — генерить одну общую hero-картинку на категорию (4 файла в `src/assets/og-{category}.jpg`) или per-service? Начнём с per-category.

После ответов на 1–5 приступаем к реализации Этапов 1→9 последовательно, каждый этап — отдельный коммит через мои сообщения.
