-- Public read-only content tables (RLS policies already restrict rows)
GRANT SELECT ON public.services TO anon, authenticated;
GRANT SELECT ON public.faq TO anon, authenticated;
GRANT SELECT ON public.profile TO anon, authenticated;
GRANT SELECT ON public.media TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.enter_gauja_categories TO anon, authenticated;
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT SELECT ON public.testimonials TO anon, authenticated;

-- Public submission tables
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT INSERT, SELECT ON public.chat_conversations TO anon, authenticated;
GRANT INSERT ON public.chat_messages TO anon, authenticated;

-- Admin-facing writes go through the same Data API as the signed-in admin user
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faq TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.enter_gauja_categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT UPDATE, DELETE ON public.chat_conversations TO authenticated;
GRANT SELECT ON public.chat_messages TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

GRANT ALL ON public.services, public.faq, public.profile, public.media,
  public.site_settings, public.enter_gauja_categories, public.blog_posts,
  public.testimonials, public.bookings, public.contact_messages,
  public.chat_conversations, public.chat_messages, public.user_roles
  TO service_role;