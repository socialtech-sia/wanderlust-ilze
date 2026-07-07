
-- ============================================================
-- Wanderlust.lv — Initial schema, RLS, grants
-- ============================================================

-- Enums
CREATE TYPE public.service_type AS ENUM ('excursion', 'hiking', 'transfer');
CREATE TYPE public.service_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.enter_gauja_category AS ENUM ('action', 'nature', 'history', 'culture');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'declined', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.booking_language AS ENUM ('lv', 'en', 'es');

-- User roles (security)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============================================================
-- profile (single row)
-- ============================================================
CREATE TABLE public.profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role_lv TEXT, role_en TEXT, role_es TEXT,
  bio_lv TEXT, bio_en TEXT, bio_es TEXT,
  short_bio_lv TEXT, short_bio_en TEXT, short_bio_es TEXT,
  avatar_storage_path TEXT,
  hero_image_storage_path TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  languages_spoken TEXT[] DEFAULT ARRAY['lv','en','ru','es'],
  certifications JSONB DEFAULT '[]'::jsonb,
  years_of_experience INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile TO authenticated;
GRANT ALL ON public.profile TO service_role;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_public_read" ON public.profile FOR SELECT USING (true);
CREATE POLICY "profile_admin_write" ON public.profile FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_profile_updated BEFORE UPDATE ON public.profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- media
-- ============================================================
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'public-media',
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  file_size_bytes BIGINT,
  alt_lv TEXT, alt_en TEXT, alt_es TEXT,
  caption_lv TEXT, caption_en TEXT, caption_es TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_public_read" ON public.media FOR SELECT USING (true);
CREATE POLICY "media_admin_write" ON public.media FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- services
-- ============================================================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type service_type NOT NULL,
  slug_lv TEXT UNIQUE,
  slug_en TEXT UNIQUE,
  slug_es TEXT UNIQUE,
  title_lv TEXT NOT NULL,
  title_en TEXT,
  title_es TEXT,
  short_description_lv TEXT,
  short_description_en TEXT,
  short_description_es TEXT,
  description_lv TEXT,
  description_en TEXT,
  description_es TEXT,
  duration_minutes INTEGER,
  price_from_eur NUMERIC(10,2),
  price_per_person BOOLEAN DEFAULT false,
  max_persons INTEGER,
  min_persons INTEGER DEFAULT 1,
  enter_gauja_categories enter_gauja_category[] DEFAULT '{}',
  difficulty service_difficulty,
  location_name TEXT,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  transfer_from TEXT,
  transfer_to TEXT,
  vehicle_info TEXT,
  hero_image_storage_path TEXT,
  gallery_image_ids UUID[] DEFAULT '{}',
  meta_title_lv TEXT, meta_title_en TEXT, meta_title_es TEXT,
  meta_description_lv TEXT, meta_description_en TEXT, meta_description_es TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX services_type_active_idx ON public.services(type, is_active);
CREATE INDEX services_slug_lv_idx ON public.services(slug_lv);
CREATE INDEX services_slug_en_idx ON public.services(slug_en);
CREATE INDEX services_slug_es_idx ON public.services(slug_es);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "services_admin_read_all" ON public.services FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "services_admin_write" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- bookings
-- ============================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT UNIQUE NOT NULL DEFAULT 'WND-' || upper(substring(gen_random_uuid()::text, 1, 6)),
  service_id UUID REFERENCES public.services(id),
  service_snapshot JSONB,
  requested_date DATE NOT NULL,
  requested_time TIME,
  persons_count INTEGER NOT NULL DEFAULT 1,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_country TEXT,
  customer_language booking_language DEFAULT 'en',
  notes TEXT,
  status booking_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  quoted_price_eur NUMERIC(10,2),
  final_price_eur NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);
CREATE INDEX bookings_status_idx ON public.bookings(status);
CREATE INDEX bookings_date_idx ON public.bookings(requested_date);
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_public_insert" ON public.bookings FOR INSERT WITH CHECK (
  status = 'pending' AND admin_notes IS NULL AND final_price_eur IS NULL AND confirmed_at IS NULL AND cancelled_at IS NULL
);
CREATE POLICY "bookings_admin_all" ON public.bookings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- faq
-- ============================================================
CREATE TABLE public.faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_lv TEXT NOT NULL, question_en TEXT, question_es TEXT,
  answer_lv TEXT NOT NULL, answer_en TEXT, answer_es TEXT,
  category TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faq TO authenticated;
GRANT ALL ON public.faq TO service_role;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faq_public_read" ON public.faq FOR SELECT USING (is_active = true);
CREATE POLICY "faq_admin_write" ON public.faq FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- blog_posts
-- ============================================================
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug_lv TEXT UNIQUE, slug_en TEXT UNIQUE, slug_es TEXT UNIQUE,
  title_lv TEXT, title_en TEXT, title_es TEXT,
  excerpt_lv TEXT, excerpt_en TEXT, excerpt_es TEXT,
  content_lv TEXT, content_en TEXT, content_es TEXT,
  featured_image_id UUID REFERENCES public.media(id),
  tags TEXT[] DEFAULT '{}',
  meta_title_lv TEXT, meta_title_en TEXT, meta_title_es TEXT,
  meta_description_lv TEXT, meta_description_en TEXT, meta_description_es TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_public_read" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "blog_admin_all" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_blog_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- contact_messages
-- ============================================================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  language TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_public_insert" ON public.contact_messages FOR INSERT WITH CHECK (status = 'new');
CREATE POLICY "contact_admin_all" ON public.contact_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- chat_conversations + chat_messages
-- ============================================================
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  visitor_email TEXT,
  visitor_name TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX chat_conv_session_idx ON public.chat_conversations(session_id);
GRANT INSERT ON public.chat_conversations TO anon, authenticated;
GRANT SELECT, UPDATE ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chatconv_public_insert" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "chatconv_admin_all" ON public.chat_conversations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_conversation_idx ON public.chat_messages(conversation_id, created_at);
GRANT INSERT ON public.chat_messages TO anon, authenticated;
GRANT SELECT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chatmsg_public_insert" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "chatmsg_admin_read" ON public.chat_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- site_settings
-- ============================================================
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- enter_gauja_categories (reference)
-- ============================================================
CREATE TABLE public.enter_gauja_categories (
  key enter_gauja_category PRIMARY KEY,
  name_lv TEXT, name_en TEXT, name_es TEXT,
  description_lv TEXT, description_en TEXT, description_es TEXT,
  icon_name TEXT,
  color_hex TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.enter_gauja_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.enter_gauja_categories TO authenticated;
GRANT ALL ON public.enter_gauja_categories TO service_role;
ALTER TABLE public.enter_gauja_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "egc_public_read" ON public.enter_gauja_categories FOR SELECT USING (true);
CREATE POLICY "egc_admin_write" ON public.enter_gauja_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
