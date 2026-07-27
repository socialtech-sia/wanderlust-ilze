GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM anon, public;

ALTER POLICY services_admin_read_all ON public.services TO authenticated;
ALTER POLICY services_admin_write ON public.services TO authenticated;
ALTER POLICY faq_admin_write ON public.faq TO authenticated;
ALTER POLICY profile_admin_write ON public.profile TO authenticated;
ALTER POLICY media_admin_write ON public.media TO authenticated;
ALTER POLICY settings_admin_write ON public.site_settings TO authenticated;
ALTER POLICY egc_admin_write ON public.enter_gauja_categories TO authenticated;
ALTER POLICY blog_admin_all ON public.blog_posts TO authenticated;
ALTER POLICY bookings_admin_all ON public.bookings TO authenticated;
ALTER POLICY contact_admin_all ON public.contact_messages TO authenticated;
ALTER POLICY chatconv_admin_all ON public.chat_conversations TO authenticated;
ALTER POLICY chatmsg_admin_read ON public.chat_messages TO authenticated;