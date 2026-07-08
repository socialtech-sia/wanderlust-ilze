# Enter Gauja: официальный brand kit

Заменяю нынешние самодельные SVG-компоненты Enter Gauja на официальные ассеты и палитру из загруженного kit'а, чтобы всё соответствовало Vadlīnijas 2025.

## 1. Ассеты (lovable-assets)

Загружаю из `/mnt/user-uploads/.../assets/` через `lovable-assets create`, JSON-указатели кладу в `src/assets/entergauja/`:
- `entergauja_logo.png`
- 5 бэйджей (используем как preview/fallback): `badge_action|nature|history|culture|getaround.png`
- 5 mountain-блоков: `block_action|nature|history|culture|getaround_mountain.png`
- 5 символов: `symbol_action_lightning|nature_deer|history_tower|culture_star|getaround_horse.png`
- Пины: `pin_nature_oak_tent|history|culture|festival|winter|relax.png`, `pins_action_all5|getaround.png`

## 2. `src/lib/enter-gauja.ts` — палитра и категории

- Добавить пятую категорию **`getaround`** ("Gauja Get-around", slug `gauja-get-around`, base `#6987B6`, symbol `horse`, schema `TravelAction`).
- Привести plate-цвета к гайдам (не hover):
  - nature `#4F6F19` (было `#679A40`)
  - history `#D1701A` (было `#E38F25`)
  - culture `#51869D` — ок
  - action `#F05366` (было `#E94F64`)
  - hover/active по единому EG olive `#A9AD00`
- `defaultCategoryForType`: `transfer → getaround`, `excursion → history` (или culture), `hiking → nature`; homepage default экспорт `EG_HOMEPAGE_DEFAULT = action` (по грантовой категории).
- Экспорт трёх карт: `EG_LOGO_ASSET`, `EG_BLOCK_ASSET[key]`, `EG_SYMBOL_ASSET[key]`, `EG_BADGE_ASSET[key]`, `EG_PIN_ASSET[key]` — импортируют `.asset.json`.

## 3. Компоненты

### `EnterGaujaLogo.tsx`
- Удалить inline SVG-подделку. Экспортировать `<img>` с официальным `entergauja_logo.png` (`.asset.json`), без rounded углов, с обязательным clear-space (обёртка `p-[25%]` при использовании внутри блоков).

### `EnterGaujaPartnerBadge.tsx` (sticky right)
- Разметка канона:
  ```
  <a class="fixed right-0 top-[120px] w-[132px] shadow-md">
    <img src={logo} class="block w-full" />
    <span class="flex h-[30px] items-center justify-center bg-[--eg]"
          style={{fontFamily: "'DIN Pro','Barlow Semi Condensed','Archivo',sans-serif"}}>
      Enter Action
    </span>
  </a>
  ```
- Прямоугольная plate (без `rounded-*`), белый DIN Pro Bold 14px, letter-spacing .02em.
- Мобильный variant: bottom-90, w-96, plate h-6/11px.
- Пропс `category` определяет цвет и URL.

### `EnterGaujaCategoryIcon.tsx`
- Убрать inline SVG (тропа/микроавтобус). Отдаём `<img>` с `symbol_<key>.png` из `EG_SYMBOL_ASSET`, размер через className. Держим API совместимым с текущими вызовами.

### `EnterGaujaRibbon.tsx`
- Удалить (заменяется официальным `block_<cat>_mountain.png`). Оставить компонент как реэкспорт этого изображения, чтобы не ломать импорты.

### `EnterGaujaBacklinkBlock.tsx` (Sadarbība ar Enter Gauja)
- Пересобрать по канону: белый фон, слева `block_<cat>_mountain.png`, справа официальный интро-текст (LV verbatim per category, из §4 гайдов), кнопка «APSKATĪT Enter <Cat>» в цвете категории, hover `#A9AD00`.
- Официальный логотип фиксируется в верхнем/нижнем крае блока (мы кладём в bottom-right).
- Кнопка использует наш общий `<Button asChild>` с inline `backgroundColor` + hover через CSS-переменную (класс `hover:bg-[#A9AD00]!` — inline через `onMouseEnter`/`onMouseLeave` не понадобится, сделаем через утилиту стилей).
- LV-тексты хардкодим (гайдлайны требуют verbatim); en/es оставляем текущий короткий summary.

### `EnterGaujaBadge.tsx` (home) и `EnterGaujaTiles.tsx`
- Badge на homepage: показывает partner-block для **Enter Action** (домашняя категория по гранту).
- Tiles: 4 плитки по категориям — используют `symbol_<key>.png`, plate-цвет, ведут на entergauja.lv/<slug>/.

## 4. Шрифт «DIN Pro»

- Без загрузки шрифта: используем fallback стек `'DIN Pro','Barlow Semi Condensed','Archivo',sans-serif` там, где нужен plate. Barlow уже подключён (кит показал использование `Barlow Condensed`). Добавляю утилити-класс `.font-eg-plate` в `src/styles.css`.

## 5. Не трогаем

- Общий `<Button>` (кроме использования `asChild`), sitemap/robots, роутинг, booking-flow, header/footer каркас.

## Файлы

**Создать:** `src/assets/entergauja/*.png.asset.json` (≈15 файлов через CLI).
**Изменить:** `src/lib/enter-gauja.ts`, `src/components/entergauja/EnterGaujaLogo.tsx`, `EnterGaujaPartnerBadge.tsx`, `EnterGaujaCategoryIcon.tsx`, `EnterGaujaRibbon.tsx`, `EnterGaujaBacklinkBlock.tsx`, `src/components/home/EnterGaujaBadge.tsx`, `EnterGaujaTiles.tsx`, `src/styles.css` (+`.font-eg-plate`).
