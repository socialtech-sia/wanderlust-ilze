-- Один источник контактов.
--
-- Что было. Телефон и почта лежали в двух местах сразу:
--   * site_settings.contact_phone / contact_whatsapp / contact_email —
--     это читает САЙТ (подвал, страница контактов, три юридические страницы,
--     письма, чат-бот). Здесь номер заказчика, +371 29299354;
--   * profile.phone / whatsapp / email — это показывала АДМИНКА на странице
--     профиля. Здесь остался placeholder из миграции синхронизации с Lovable
--     (20260916090200): +371 20000000 и ilze@wanderlust.lv.
--
-- Ни одна страница сайта колонки profile.* не читает — проверено по коду.
-- Поэтому клиент видел в админке один номер, на сайте другой, и правильным
-- оказывался тот, который в админке не показывался вовсе.
--
-- Что делаем. Правку внесли в код: поля контактов убраны со страницы профиля
-- (есть только в «Iestatījumi»), и админка их больше не пишет. Здесь —
-- вторая половина: выравниваем значения, которые уже лежат в базе, чтобы
-- в ней нигде не оставалось устаревшего номера. Колонки profile.* не
-- удаляются: на них ссылается сгенерированный типовой файл и старые дампы.
--
-- Источник правды — site_settings. Копируем из него, а не вписываем число
-- руками: так миграция останется верной, если номер к моменту наката уже
-- поменяли через админку.

update public.profile p
   set phone    = coalesce(nullif(s.contact_phone, ''), p.phone),
       whatsapp = coalesce(nullif(s.contact_whatsapp, ''), p.whatsapp),
       email    = coalesce(nullif(s.contact_email, ''), p.email)
  from (
    select
      max(value #>> '{}') filter (where key = 'contact_phone')    as contact_phone,
      max(value #>> '{}') filter (where key = 'contact_whatsapp') as contact_whatsapp,
      max(value #>> '{}') filter (where key = 'contact_email')    as contact_email
    from public.site_settings
    where key in ('contact_phone', 'contact_whatsapp', 'contact_email')
  ) s
 where true;
