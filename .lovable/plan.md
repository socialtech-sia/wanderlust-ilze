# Единый компонент кнопки + рефактор CTA по сайту

Сейчас на сайте два набора кнопок: shadcn `<Button>` (по умолчанию `rounded-md`, h-9) и ~15 захардкоженных `<a class="rounded-full bg-primary px-6 py-3 …">` в Hero, Header, EnterGauja, contact, booking, cookie-consent. Форма/высоты/паддинги дублируются и слегка расходятся (`py-2` vs `py-2.5` vs `py-3`), состояний `active` нигде нет, focus-ring непоследовательный.

## Что меняем

### 1. Переписываем `src/components/ui/button.tsx`
- База: `rounded-full`, `font-medium`, `transition-all`, `focus-visible:ring-2 ring-ring/60 ring-offset-2 ring-offset-background`, `active:scale-[0.97]`, `disabled:opacity-50 disabled:pointer-events-none`.
- Размеры (единая высота/паддинги для всего сайта):
  - `sm` — `h-9 px-4 text-xs`
  - `md` (default) — `h-11 px-6 text-sm`
  - `lg` — `h-12 px-7 text-sm`
  - `xl` — `h-14 px-8 text-base` (hero-CTA)
  - `icon` — `h-10 w-10 p-0`
- Варианты:
  - `primary` (default) — `bg-moss-deep text-paper hover:bg-moss active:bg-moss-deep`
  - `secondary` — `bg-paper text-ink hover:bg-paper/90` (для тёмных фонов, Hero)
  - `outline` — `border border-border bg-transparent text-foreground hover:bg-accent`
  - `outline-light` — `border border-paper/40 text-paper hover:bg-paper/10` (тёмный фон)
  - `ghost` — `text-foreground hover:bg-accent`
  - `link` — `underline-offset-4 hover:underline text-primary`
  - `category` — принимает inline `style={{ backgroundColor }}`, base `text-white hover:-translate-y-0.5` (для Enter Gauja CTA с категорийным цветом)
- Экспортируется тот же `Button` + `buttonVariants` — существующий shadcn API сохраняется.

### 2. Рефакторим все CTA на `<Button asChild>` / `<Button>`
Файлы:
- `src/components/home/Hero.tsx` — 2 CTA → `variant="secondary" size="xl"` и `variant="outline-light" size="xl"`.
- `src/components/layout/Header.tsx` — «Rezervēt» (desktop + mobile) → `variant="primary" size="md"`.
- `src/routes/__root.tsx` — error-boundary кнопки → `Button asChild`.
- `src/routes/$lang/contact.tsx` — submit → `Button size="lg"`.
- `src/routes/$lang/s.$slug.tsx` — «Rezervēt šo» → `Button size="lg" className="w-full"`.
- `src/routes/$lang/book.tsx` — prev (`variant="outline"`), next/submit (`variant="primary"`), календарь nav (`variant="outline" size="icon"`).
- `src/routes/$lang/book.confirmed.$ref.tsx` — «Uz sākumu» → `Button asChild`.
- `src/components/cookie/CookieConsent.tsx` — «Pieņemt visas» → `primary md`, «Tikai nepieciešamās» → `outline md`, «Iestatījumi» → `ghost sm`, «Saglabāt» → `primary md`.
- `src/components/home/EnterGaujaBadge.tsx` — «Uzzināt» → `Button asChild variant="primary" size="md"`.
- `src/components/entergauja/EnterGaujaBacklinkBlock.tsx` — CTA → `Button asChild variant="category" size="md"` с inline `style={{ backgroundColor: color }}`.

### 3. Не трогаем
- `LanguageSwitcher` — это toggle-pill, не кнопка.
- Категорийные плашки Enter Gauja (тайлы) — это карточки-ссылки, не CTA.
- Иконки соцсетей в Footer — icon-круги, оставляем.
- Инпуты, tabs, dropdown, dialog — не кнопки.
- Партнёрская Enter Gauja строка в Footer.

### 4. Побочно — hydration mismatch
`entergauja.partner_body` рендерится сырым ключом на SSR из-за расхождения между default lang и `/lv`. Добавляем `defaultValue` во всех местах, где ключ выводится в основном потоке HTML (EnterGaujaBadge, EnterGaujaBacklinkBlock) — по паттерну, уже применённому в Footer. Это гарантированно снимает hydration warning без изменения i18n-инфраструктуры.

## Технические детали
- Никаких новых зависимостей.
- `buttonVariants` остаётся экспортируемым — сохраняется совместимость с любым внешним использованием.
- Все hover/active единообразны: `hover:brightness-110` не используем (ломает цвет на светлых фонах), вместо этого `hover:bg-{цвет}/90` + `hover:-translate-y-0.5` для акцентных CTA.
- `size="md"` становится дефолтом — старый дефолт shadcn (h-9) переезжает в `sm`, что может слегка повлиять на кнопки, не указавшие size явно. Проверю каждое использование `<Button>` в проекте и добавлю `size="sm"` там, где нужна прежняя высота (в основном toolbar/иконки внутри диалогов).
- Проверка `tsgo` после правок.

## Файлы

**Правки:** `src/components/ui/button.tsx`, `src/components/home/Hero.tsx`, `src/components/layout/Header.tsx`, `src/routes/__root.tsx`, `src/routes/$lang/contact.tsx`, `src/routes/$lang/s.$slug.tsx`, `src/routes/$lang/book.tsx`, `src/routes/$lang/book.confirmed.$ref.tsx`, `src/components/cookie/CookieConsent.tsx`, `src/components/home/EnterGaujaBadge.tsx`, `src/components/entergauja/EnterGaujaBacklinkBlock.tsx`.
