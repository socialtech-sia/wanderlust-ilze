-- Локализованные строки главной страницы и подвала.
--
-- Приложение читает ПЛОСКИЕ ключи с языковым суффиксом:
--   src/components/home/Hero.tsx  — hero_headline_<lang>, hero_subline_<lang>
--   src/components/layout/Footer.tsx — footer_text_<lang>
--
-- В миграциях их не было: в Lovable эти девять строк завели через дашборд,
-- а в SQL попали только их предшественники — hero_headline, hero_subline и
-- footer_text с JSON-объектом внутри. Те три ключа не читает никто.
--
-- Без этих строк главная показывает вместо заголовка запасную строку из
-- i18n, а подвал — пустоту. Значения взяты из рабочей базы Lovable
-- 2026-09-16, до её удаления.

insert into public.site_settings (key, value, description) values
  ($json$footer_text_lv$json$, $json$"Wanderlust.lv — Ilze Gulbe, sertificēta gide Gaujas reģionā."$json$::jsonb, null),
  ($json$footer_text_en$json$, $json$"Wanderlust.lv — Ilze Gulbe, certified guide in the Gauja region."$json$::jsonb, null),
  ($json$footer_text_es$json$, $json$"Wanderlust.lv — Ilze Gulbe, guía certificada de la región del Gauja."$json$::jsonb, null),
  ($json$hero_headline_lv$json$, $json$"Atklāj Gaujas ieleju kopā ar sertificētu gidi"$json$::jsonb, null),
  ($json$hero_headline_en$json$, $json$"Discover the Gauja Valley with a certified local guide"$json$::jsonb, null),
  ($json$hero_headline_es$json$, $json$"Descubre el valle del Gauja con una guía local certificada"$json$::jsonb, null),
  ($json$hero_subline_lv$json$, $json$"Ekskursijas, pārgājieni un privātie transferi Siguldā, Cēsīs, Līgatnē un Gaujas Nacionālajā parkā."$json$::jsonb, null),
  ($json$hero_subline_en$json$, $json$"Guided tours, hikes and private transfers in Sigulda, Cēsis, Līgatne and Gauja National Park."$json$::jsonb, null),
  ($json$hero_subline_es$json$, $json$"Excursiones, senderismo y traslados privados en Sigulda, Cēsis, Līgatne y el Parque Nacional Gauja."$json$::jsonb, null)
on conflict (key) do update set value = excluded.value;
