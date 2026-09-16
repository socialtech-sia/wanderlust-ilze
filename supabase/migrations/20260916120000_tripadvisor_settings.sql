-- Блок TripAdvisor в секции «Par mani».
--
-- Профиля на TripAdvisor у клиента пока нет, поэтому ссылка приезжает не из
-- кода, а из настроек: появится — клиент впишет её через админку, и блок
-- включится сам, без правки исходников и пересборки образа.
--
-- Пустой tripadvisor_url — это выключенное состояние. Компонент при пустой
-- строке не рендерит вообще ничего: заглушкам и неактивным кнопкам на живом
-- сайте делать нечего.
--
-- description заполнен намеренно: /admin/settings рисует настройки обобщённо
-- и показывает описание под именем ключа — без него клиент увидел бы только
-- голое `tripadvisor_rating`. По алфавиту эти три ключа встают сразу за
-- social_facebook / social_instagram, то есть ровно там, где их ждут.

insert into public.site_settings (key, value, description) values
  (
    'tripadvisor_url',
    '""'::jsonb,
    'Saite uz TripAdvisor profilu. Kamēr lauks ir tukšs, TripAdvisor bloks vietnē netiek rādīts vispār.'
  ),
  (
    'tripadvisor_rating',
    '5.0'::jsonb,
    'Vērtējums no 0 līdz 5, skaitlis (piemēram 4.5). Rāda zvaigznītes blakus saitei.'
  ),
  (
    'tripadvisor_review_count',
    '0'::jsonb,
    'Atsauksmju skaits, vesels skaitlis. Ja 0 — skaits netiek rādīts, bloks paliek redzams.'
  )
on conflict (key) do nothing;
