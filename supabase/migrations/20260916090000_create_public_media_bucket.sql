-- Bucket `public-media`.
--
-- Политики RLS на storage.objects для этого бакета заведены ещё в
-- 20260727115813, а вот самой строки в storage.buckets в миграциях не было
-- никогда: на Lovable бакет создавали руками через дашборд. При накатывании
-- схемы с нуля получались политики, ссылающиеся на несуществующий бакет,
-- и первая же загрузка файла в админке падала.
--
-- Параметры — те, что стояли в Lovable и на которые рассчитывает
-- src/lib/storage.ts: публичное чтение, 10 МБ на файл, белый список типов.
-- svg в списке потому, что processImage() пропускает его без конвертации;
-- всё остальное админка приводит к webp перед загрузкой.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-media',
  'public-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
