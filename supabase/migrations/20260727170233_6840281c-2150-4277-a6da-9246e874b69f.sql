ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS notification_error text;

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS notification_error text;

INSERT INTO public.site_settings (key, value, description) VALUES
  ('chatbot_enabled', 'true'::jsonb, 'AI čatbota ieslēgšana/izslēgšana publiskajā vietnē'),
  ('chatbot_greeting_lv', '"Sveiki! Es palīdzēšu izvēlēties ekskursiju, pārgājienu vai transfēru Gaujas nacionālajā parkā."'::jsonb, 'Čatbota sveiciens (LV)'),
  ('chatbot_greeting_en', '"Hi! I can help you choose a tour, hike or transfer in the Gauja National Park."'::jsonb, 'Chatbot greeting (EN)'),
  ('chatbot_greeting_es', '"¡Hola! Te ayudo a elegir una excursión, ruta o traslado en el Parque Nacional Gauja."'::jsonb, 'Saludo del chatbot (ES)')
ON CONFLICT (key) DO NOTHING;