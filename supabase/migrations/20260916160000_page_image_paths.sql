-- Пути к картинкам страниц в бакете public-media.
--
-- Стоковые фотографии с Unsplash зашиты в компоненты, и заменить их сейчас
-- можно только правкой кода и пересборкой образа. Эти ключи снимают такую
-- зависимость: пока значение пусто, показывается стоковая картинка; как только
-- клиент загрузит свою через админку и впишет путь — показывается своя.
--
-- Значения по умолчанию пустые намеренно: решение по фотографиям за клиентом,
-- и до него сайт должен выглядеть как сейчас.
--
-- Путь — это то, что возвращает загрузчик медиа, например
-- services/gauja-rudeni.webp. Абсолютный URL тоже принимается: getPublicUrl
-- пропускает его без изменений.

insert into public.site_settings (key, value, description) values
  ('home_hero_storage_path',       '""'::jsonb, 'Galvenā attēla ceļš baketā public-media (sākumlapas hero). Tukšs — rāda noklusējuma attēlu.'),
  ('tours_hero_storage_path',      '""'::jsonb, 'Ekskursiju saraksta lapas galvenā attēla ceļš. Tukšs — noklusējums.'),
  ('hiking_hero_storage_path',     '""'::jsonb, 'Pārgājienu saraksta lapas galvenā attēla ceļš. Tukšs — noklusējums.'),
  ('transfers_hero_storage_path',  '""'::jsonb, 'Transfēru saraksta lapas galvenā attēla ceļš. Tukšs — noklusējums.'),
  ('about_hero_storage_path',      '""'::jsonb, 'Lapas "Par mani" galvenā attēla ceļš. Tukšs — noklusējums.'),
  ('tile_excursion_storage_path',  '""'::jsonb, 'Sākumlapas kategoriju flīzes attēls: ekskursijas. Tukšs — noklusējums.'),
  ('tile_hiking_storage_path',     '""'::jsonb, 'Sākumlapas kategoriju flīzes attēls: pārgājieni. Tukšs — noklusējums.'),
  ('tile_transfer_storage_path',   '""'::jsonb, 'Sākumlapas kategoriju flīzes attēls: transfēri. Tukšs — noklusējums.')
on conflict (key) do nothing;
