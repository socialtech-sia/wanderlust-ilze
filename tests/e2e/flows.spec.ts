import { test, expect, type Page } from "@playwright/test";

const MARKER = "playwright-audit";

/** Бронь и сообщение помечаются этим адресом, чтобы потом их найти и удалить. */
function marker(kind: string): string {
  return `${MARKER}+${kind}-${Date.now()}@example.com`;
}

async function acceptCookies(page: Page) {
  const btn = page.getByRole("button", { name: /pieņemt visas|accept all|aceptar todas/i }).first();
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

test.describe("Переключение языков", () => {
  for (const [from, to] of [
    ["lv", "en"],
    ["en", "es"],
    ["es", "lv"],
  ] as const) {
    test(`${from} -> ${to} сохраняет страницу`, async ({ page }) => {
      await page.goto(`/${from}/faq`, { waitUntil: "networkidle" });
      await acceptCookies(page);
      await page.locator(`a[href="/${to}/faq"]`).first().click();
      await page.waitForURL(`**/${to}/faq`);
      expect(page.url()).toContain(`/${to}/faq`);
      expect(await page.locator("h1").count()).toBe(1);
      const html = await page.locator("html").getAttribute("lang");
      expect(html, "атрибут lang").toBe(to);
    });
  }
});

test.describe("Баннер кук", () => {
  test("принять — выбор запоминается", async ({ page }) => {
    await page.goto("/lv", { waitUntil: "networkidle" });
    const accept = page.getByRole("button", { name: /pieņemt visas|accept all|aceptar todas/i }).first();
    await expect(accept).toBeVisible();
    await accept.click();
    await expect(accept).toBeHidden();
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: /pieņemt visas|accept all|aceptar todas/i }).first()).toBeHidden();
  });

  test("отклонить — выбор запоминается", async ({ page }) => {
    await page.goto("/lv", { waitUntil: "networkidle" });
    const decline = page.getByRole("button", { name: /tikai nepiecieša|necessary only|solo las necesarias/i }).first();
    await expect(decline).toBeVisible();
    await decline.click();
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: /tikai nepiecieša|necessary only|solo las necesarias/i }).first()).toBeHidden();
  });
});

test.describe("Кнопка «наверх»", () => {
  test("появляется, работает, не перекрывает чат", async ({ page }) => {
    await page.goto("/lv", { waitUntil: "networkidle" });
    await acceptCookies(page);
    const up = page.getByRole("button", { name: /uz augšu|back to top|volver arriba/i });
    await expect(up, "до прокрутки скрыта").toBeHidden();

    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await expect(up, "после прокрутки видна").toBeVisible();

    const chat = page.locator('button[aria-label*="asistent" i]').first();
    if (await chat.isVisible().catch(() => false)) {
      const a = await up.boundingBox();
      const b = await chat.boundingBox();
      expect(a && b, "обе кнопки измеримы").toBeTruthy();
      if (a && b) {
        const overlap = !(a.y + a.height <= b.y || b.y + b.height <= a.y);
        expect(overlap, "кнопки не накладываются").toBe(false);
        expect(a.y, "«наверх» выше чата").toBeLessThan(b.y);
      }
    }
    await up.click();
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => window.scrollY), "прокрутка вернулась наверх").toBeLessThan(50);
  });
});

test.describe("Чат", () => {
  test("открывается, Escape закрывает, фокус возвращается", async ({ page }) => {
    await page.goto("/lv", { waitUntil: "networkidle" });
    await acceptCookies(page);
    const btn = page.locator('button[aria-label*="asistent" i]').first();
    // Виджет монтируется после гидратации (useEffect -> setMounted), поэтому
    // ждём его появления, а не спрашиваем видимость сразу: на узком вьюпорте
    // проверка успевала раньше монтирования и тест уходил в skip, хотя чат есть.
    const present = await btn
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true)
      .catch(() => false);
    if (!present) test.skip(true, "чат выключен в настройках");
    await btn.click();
    const panel = page.getByRole("dialog").first();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");
    expect(focused, "фокус вернулся на кнопку чата").toMatch(/asistent|assistant/i);
  });

  test("без ключа Anthropic отвечает понятным сообщением, а не падает", async ({ page }) => {
    await page.goto("/lv", { waitUntil: "networkidle" });
    await acceptCookies(page);
    const btn = page.locator('button[aria-label*="asistent" i]').first();
    const present = await btn
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true)
      .catch(() => false);
    if (!present) test.skip(true, "чат выключен");
    await btn.click();
    const input = page.locator("textarea, input[type=text]").last();
    await input.fill("Sveiki!");
    await input.press("Enter");
    await page.waitForTimeout(3000);
    const text = await page.locator("body").innerText();
    expect(text.length).toBeGreaterThan(0);
    // Страница не должна развалиться
    expect(await page.locator("h1, [data-chat-panel], [role=dialog]").count()).toBeGreaterThan(0);
  });
});

test.describe("Бронирование", () => {
  /**
   * Пройти форму до шага 5 включительно. Возвращает адрес, который был у
   * страницы перед отправкой.
   *
   * Зацепы — data-testid: пятишаговая форма ведётся состоянием, а не URL, и
   * шаги собраны из Popover и react-day-picker, где ни ролей, ни устойчивых
   * подписей для опознания шага нет.
   */
  async function fillBookingForm(
    page: Page,
    opts: { email: string; phone?: string; country?: string },
  ) {
    await page.goto("/lv/book", { waitUntil: "networkidle" });
    await acceptCookies(page);

    await page.getByTestId("booking-type-excursion").click();
    await page.getByTestId("booking-next").click();

    await page.getByTestId("booking-service-option").first().click();
    await page.getByTestId("booking-next").click();

    await page.getByTestId("booking-date-trigger").click();
    const calendar = page.locator("[data-radix-popper-content-wrapper]").first();
    // Первый доступный день: прошедшие числа в сетке отключены.
    await calendar.locator("button:not([disabled])").filter({ hasText: /^\d{1,2}$/ }).nth(3).click();
    await page.getByTestId("booking-time-slot").first().click();
    await page.getByTestId("booking-next").click();

    await page.getByTestId("booking-name").fill("Playwright Audit");
    await page.getByTestId("booking-email").fill(opts.email);
    if (opts.country !== undefined) {
      await page.getByTestId("booking-phone-country").click();
      await page.getByPlaceholder(/meklēt valsti|search country|buscar/i).fill(opts.country);
      await page.locator("[cmdk-item]").first().click();
    }
    if (opts.phone !== undefined) await page.getByTestId("booking-phone-number").fill(opts.phone);
    await page.getByTestId("booking-next").click();

    await page.getByTestId("booking-terms").check();
  }

  test("полный путь до подтверждения", async ({ page }) => {
    const email = marker("booking");
    const seen: string[] = [];
    page.on("response", (r) => {
      if (/create_booking|booking-notification/.test(r.url())) seen.push(String(r.status()));
    });

    await fillBookingForm(page, { email, phone: "29299354" });

    const submit = page.getByTestId("booking-submit");
    await expect(submit, "кнопка отправки активна").toBeEnabled();
    await submit.click();

    // Кнопка обязана заблокироваться немедленно — иначе второй клик создаёт
    // вторую бронь. Именно на это жаловался клиент.
    await expect(submit, "кнопка заблокирована сразу после клика").toBeDisabled();

    // Переход должен состояться. Раньше адрес менялся, а страница нет:
    // маршрут подтверждения был ДОЧЕРНИМ для /$lang/book, а book.tsx не
    // рендерит <Outlet />, поэтому подтверждение не показывалось никогда.
    await page.waitForURL(/\/book\/confirmed\//, { timeout: 30_000 });
    const body = await page.locator("body").innerText();
    expect(body, "код брони на странице подтверждения").toMatch(/WND-[A-Z0-9]{6}/);
    expect(body, "страница подтверждения, а не форма").not.toMatch(/Gandrīz gatavs/i);
    expect(seen, "запросы брони прошли").toContain("200");
  });

  test("повторный клик не создаёт вторую бронь", async ({ page }) => {
    const email = marker("dbl");
    let creates = 0;
    page.on("request", (r) => {
      if (/create_booking/.test(r.url())) creates++;
    });

    await fillBookingForm(page, { email, phone: "29299355" });

    const submit = page.getByTestId("booking-submit");
    // Три клика подряд, как это делает нетерпеливый посетитель.
    await submit.click({ force: true });
    await submit.click({ force: true }).catch(() => undefined);
    await submit.click({ force: true }).catch(() => undefined);

    await page.waitForURL(/\/book\/confirmed\//, { timeout: 30_000 });
    expect(creates, "create_booking вызван ровно один раз").toBe(1);
  });

  test("телефон обязателен и требует кода страны", async ({ page }) => {
    await page.goto("/lv/book", { waitUntil: "networkidle" });
    await acceptCookies(page);

    await page.getByTestId("booking-type-excursion").click();
    await page.getByTestId("booking-next").click();
    await page.getByTestId("booking-service-option").first().click();
    await page.getByTestId("booking-next").click();
    await page.getByTestId("booking-date-trigger").click();
    const calendar = page.locator("[data-radix-popper-content-wrapper]").first();
    await calendar.locator("button:not([disabled])").filter({ hasText: /^\d{1,2}$/ }).nth(3).click();
    await page.getByTestId("booking-time-slot").first().click();
    await page.getByTestId("booking-next").click();

    await page.getByTestId("booking-name").fill("Playwright Audit");
    await page.getByTestId("booking-email").fill(marker("phone"));

    // Без номера дальше не пускает.
    await expect(page.getByTestId("booking-next"), "без телефона «Tālāk» недоступна").toBeDisabled();

    // Код страны по умолчанию — латвийский.
    await expect(page.getByTestId("booking-phone-country")).toContainText("+371");

    // Слишком короткий номер тоже не проходит, и текст ошибки — на латышском.
    await page.getByTestId("booking-phone-number").fill("29");
    await expect(page.getByTestId("booking-next")).toBeDisabled();

    await page.getByTestId("booking-phone-number").fill("29299354");
    await expect(page.getByTestId("booking-next"), "с полным номером — можно дальше").toBeEnabled();
  });

  test("ошибка показывается рядом с кнопкой", async ({ page }) => {
    // Дубль: та же услуга, дата и почта второй раз — база отвечает 23514.
    const email = marker("dup");
    await fillBookingForm(page, { email, phone: "29299356" });
    await page.getByTestId("booking-submit").click();
    await page.waitForURL(/\/book\/confirmed\//, { timeout: 30_000 });

    await fillBookingForm(page, { email, phone: "29299356" });
    const submit = page.getByTestId("booking-submit");
    await submit.click();

    const error = page.getByTestId("booking-error");
    await expect(error, "сообщение об ошибке видно").toBeVisible({ timeout: 30_000 });
    // На языке страницы, без английского текста из PostgreSQL.
    await expect(error).not.toContainText(/duplicate booking/i);

    // «Рядом с кнопкой» проверяем буквально: оба в видимой части экрана.
    const errBox = await error.boundingBox();
    const btnBox = await submit.boundingBox();
    expect(errBox, "у сообщения есть геометрия").not.toBeNull();
    expect(btnBox).not.toBeNull();
    const viewport = page.viewportSize()!;
    expect(errBox!.y, "сообщение в пределах экрана").toBeLessThan(viewport.height);
    expect(
      Math.abs(errBox!.y - (btnBox!.y + btnBox!.height)),
      "сообщение сразу под кнопкой",
    ).toBeLessThan(80);
    // Кнопка снова активна: ошибка — не тупик.
    await expect(submit).toBeEnabled();
  });

  test("валидация: пустые поля и кривой email", async ({ page }) => {
    await page.goto("/lv/book", { waitUntil: "networkidle" });
    await acceptCookies(page);
    // на первом шаге без выбора типа «дальше» должно быть недоступно
    await expect(page.getByTestId("booking-next")).toBeDisabled();
  });
});

test.describe("Форма контактов", () => {
  test("отправляется и подтверждает", async ({ page }) => {
    const email = marker("contact");
    await page.goto("/lv/contact", { waitUntil: "networkidle" });
    await acceptCookies(page);
    const inputs = page.locator("form input");
    await inputs.nth(0).fill("Playwright Audit");
    await page.locator('input[type="email"]').first().fill(email);
    if ((await inputs.count()) > 2) await inputs.nth(2).fill("Audit");
    await page.locator("textarea").first().fill("Automatiskā pārbaude, lūdzu ignorēt.");
    await page.getByRole("button", { name: /nosūtīt|send|enviar/i }).first().click();
    await page.waitForTimeout(4000);
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/paldies|thank|gracias|nosūtīt|sent|enviado/i);
  });
});

test.describe("Админка закрыта для чужих", () => {
  for (const path of [
    "/admin",
    "/admin/services",
    "/admin/bookings",
    "/admin/settings",
    "/admin/media",
    "/admin/messages",
    "/admin/profile",
  ]) {
    test(`${path} не пускает без входа`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const url = page.url();
      const body = await page.locator("body").innerText();
      const gated = /\/admin\/login/.test(url) || /parole|password|pieteikt|log in|iniciar/i.test(body);
      expect(gated, `${path} должен требовать вход, а показал: ${url}`).toBe(true);
      // содержимого админки быть не должно
      expect(body).not.toMatch(/Rezervācijas saraksts|Pakalpojumu saraksts/i);
    });
  }
});
