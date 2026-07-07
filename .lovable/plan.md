# Редизайн экрана резервации

Полная переработка `src/routes/$lang/book.tsx` — новый UX-flow с выбором типа услуги на первом шаге, обновлённый UI с живыми иконками, иллюстративной графикой и мягкой анимацией в существующей editorial-стилистике сайта.

## Новый flow (5 шагов вместо 4)

```
[1] Тип услуги  →  [2] Конкретная услуга  →  [3] Когда  →  [4] Контакты  →  [5] Подтверждение
```

1. **Тип услуги** — 3 крупные карточки-плитки: Excursion / Hiking / Transfer. Каждая с SVG-иллюстрацией (тропа, компас, микроавтобус в стиле Enter Gauja pictograms), названием, короткой подписью ("N услуг доступно"), hover-подъёмом. Если пользователь пришёл с `?service=…`, шаг пропускается автоматически (тип выводится из выбранной услуги).
2. **Конкретная услуга** — фильтрованный список только выбранного типа. Карточки крупнее текущих: миниатюра/иконка, название, длительность, «от €X», короткое описание. Кнопка «← Изменить тип» в шапке шага.
3. **Когда** — дата, время, персоны (как сейчас), но:
   - grid time-слотов с сегментацией «Утро / День / Вечер»,
   - persons — крупный степпер с иконками фигурок,
   - inline-сводка выбранной услуги сверху (мини-карточка).
4. **Контакты** — та же форма, но с иконками в полях (User, Mail, Phone, Globe, MessageSquare), floating-labels, аккуратной группировкой.
5. **Подтверждение** — двухколоночный layout: слева иллюстрация/иконка выбранного типа + summary-карточка, справа терms + submit. Итоговая цена подсвечена.

## UI / визуальные приёмы

- Прогресс-бар шагов: 5 сегментов, активный сегмент заполняется moss-deep с плавной анимацией; название текущего шага крупно под баром.
- Плитки типа — квадратные SVG-иллюстрации (пиктограммы в духе Enter Gauja: линия+точки), фон `bg-paper-alt`, активная — moss-deep border + subtle inner shadow.
- Микро-анимации через существующие `animate-fade-in` / `hover-scale` из tailwind config; переход между шагами — `fade-in` + slide (10px).
- Фоновая декоративная графика: тонкий SVG-контур (волны/горы) внизу карточки, как ribbon в EG-компонентах.
- Все кнопки — уже унифицированный `Button` (pill), без изменений системы.
- Категорийные цвета: excursion=terracotta, hiking=moss-deep, transfer=lake-blue (используем существующие токены). Активная плитка и иконки полей подкрашиваются в цвет выбранного типа.

## Технические изменения

**Файлы:**
- `src/routes/$lang/book.tsx` — переписан: добавлен `Step = 1..5`, новое состояние `serviceType`, шаги вынесены в подкомпоненты.
- `src/components/booking/StepType.tsx` — новый: 3 плитки категорий.
- `src/components/booking/StepService.tsx` — новый: список услуг выбранного типа.
- `src/components/booking/StepWhen.tsx`, `StepContact.tsx`, `StepReview.tsx` — вынесены из `book.tsx`, доработан UI.
- `src/components/booking/BookingStepper.tsx` — новый прогресс-компонент (5 шагов).
- `src/components/booking/ServiceTypeIcon.tsx` — новый: inline-SVG для excursion/hiking/transfer (в стиле EnterGauja pictograms).
- `src/components/booking/BookingSummary.tsx` — мини-карточка выбранной услуги (используется на шагах 3–5).
- `src/i18n/{en,lv,es}.json` — добавить ключи `booking.step_type`, `booking.type_*`, `booking.morning/afternoon/evening`, подписи описаний категорий.

**Логика:**
- `serviceType: 'excursion' | 'hiking' | 'transfer' | null` в state.
- При preselected сервисе: `serviceType` выставляется из `preselected.type`, стартовый шаг = 3.
- `canNext`: step 1 → `serviceType != null`; step 2 → `serviceId != null`; step 3 → date + persons; step 4 → name + email; step 5 → terms.
- Кнопка «Изменить тип» на шаге 2 сбрасывает `serviceId` и возвращает к шагу 1.
- Submit-логика (insert в `bookings`, редирект на confirmed) не меняется.

**Не трогаем:** таблицу `bookings`, `book.confirmed.$ref.tsx`, систему кнопок, header/footer, роутинг.
