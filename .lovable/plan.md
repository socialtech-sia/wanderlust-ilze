# План: Cookie Policy, Terms of Service и Cookie Consent

## 1. Новые страницы (routes)

**`src/routes/cookie-policy.tsx`** — `/cookie-policy`
- head() с уникальными title/description/og
- Секции: что такое cookies, какие мы используем (strictly necessary, analytics, marketing), сроки хранения, управление в браузере, ссылка на consent-настройки (кнопка "Изменить согласие")
- Реквизиты social.tech SIA внизу

**`src/routes/terms-of-service.tsx`** — `/terms-of-service`
- head() с уникальными meta
- Секции: определения, услуги, права/обязанности пользователя, интеллектуальная собственность, ограничение ответственности, изменения, применимое право (Латвия), контакты social.tech SIA
- Дата последнего обновления

Обе страницы используют существующий design system (Montserrat, cyan #00BFFF, дизайн из Hero/Header), контейнер `container-editorial`, тёмная тема как на главной.

## 2. Cookie Consent баннер

**`src/components/cookie/CookieConsent.tsx`**
- Фиксированная плашка снизу (glass-эффект в стиле Header)
- Появляется если в `localStorage` нет `cookie-consent` (проверка в `useEffect`, чтобы избежать SSR mismatch — см. tanstack-execution-model)
- Кнопки: "Принять все", "Только необходимые", "Настроить"
- Модалка "Настроить" (shadcn Dialog) с тумблерами: Necessary (disabled, всегда on), Analytics, Marketing
- Ссылки на `/cookie-policy` и `/terms-of-service`

**`src/lib/cookie-consent.ts`**
- Типы: `ConsentState = { necessary: true; analytics: boolean; marketing: boolean; timestamp: number }`
- `getConsent()`, `setConsent()`, `clearConsent()` — обёртки над localStorage
- Кастомное событие `cookie-consent-change` для реакции других частей приложения

**`src/hooks/use-cookie-consent.ts`**
- Хук возвращает `{ consent, isLoaded, accept, reject, updatePartial, reopen }`
- Слушает событие изменения

## 3. Интеграция

- Монтировать `<CookieConsent />` в `src/routes/__root.tsx` после `<Outlet />` (клиентский рендер через `useHydrated`)
- В футере (если есть общий footer — иначе в `__root.tsx` минимальный) добавить ссылки: Cookie Policy, Terms of Service, а также Privacy Policy если уже существует
- Кнопка "Изменить cookie-настройки" на `/cookie-policy` вызывает `reopen()` из хука

## 4. Что НЕ меняем
- Header, Hero, существующие маршруты, стили glass-эффекта
- Никакой backend/DB работы — согласие только в localStorage

## Технические детали
- Всё на клиенте, никаких server functions
- SSR-safe: чтение localStorage только в `useEffect`
- Тексты: English (workspace rule для внутренних дашбордов) — **уточните, если нужны LV/RU для клиентского сайта**

## Открытый вопрос
Язык страниц и баннера: EN, LV или RU? В прошлых сообщениях вы писали по-русски, но workspace default = EN для internal / LV для client-facing. Скажите какой — иначе сделаю **EN + возможность лёгкого перевода** (тексты вынесу в константы).
