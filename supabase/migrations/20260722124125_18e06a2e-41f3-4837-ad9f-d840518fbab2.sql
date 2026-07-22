
-- 1) Move has_role to a private schema so it is not exposed via PostgREST API
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Recreate all policies to reference private.has_role
DROP POLICY IF EXISTS profile_admin_write ON public.profile;
CREATE POLICY profile_admin_write ON public.profile FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS media_admin_write ON public.media;
CREATE POLICY media_admin_write ON public.media FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS services_admin_read_all ON public.services;
CREATE POLICY services_admin_read_all ON public.services FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS services_admin_write ON public.services;
CREATE POLICY services_admin_write ON public.services FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS bookings_admin_all ON public.bookings;
CREATE POLICY bookings_admin_all ON public.bookings FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS faq_admin_write ON public.faq;
CREATE POLICY faq_admin_write ON public.faq FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS blog_admin_all ON public.blog_posts;
CREATE POLICY blog_admin_all ON public.blog_posts FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS contact_admin_all ON public.contact_messages;
CREATE POLICY contact_admin_all ON public.contact_messages FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS chatconv_admin_all ON public.chat_conversations;
CREATE POLICY chatconv_admin_all ON public.chat_conversations FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS chatmsg_admin_read ON public.chat_messages;
CREATE POLICY chatmsg_admin_read ON public.chat_messages FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS settings_admin_write ON public.site_settings;
CREATE POLICY settings_admin_write ON public.site_settings FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS egc_admin_write ON public.enter_gauja_categories;
CREATE POLICY egc_admin_write ON public.enter_gauja_categories FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- Now drop the exposed public.has_role
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 2) Bookings: rate-limit + duplicate prevention via trigger
CREATE OR REPLACE FUNCTION public.enforce_booking_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  recent_count int;
  dup_count int;
BEGIN
  -- Prevent identical duplicate bookings (same email + service + date + time) within 24h
  SELECT count(*) INTO dup_count
  FROM public.bookings
  WHERE lower(customer_email) = lower(NEW.customer_email)
    AND service_id IS NOT DISTINCT FROM NEW.service_id
    AND requested_date = NEW.requested_date
    AND requested_time IS NOT DISTINCT FROM NEW.requested_time
    AND created_at > now() - interval '24 hours';
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'Duplicate booking already submitted for this service and time'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Rate limit: max 5 bookings per email per rolling 24h window
  SELECT count(*) INTO recent_count
  FROM public.bookings
  WHERE lower(customer_email) = lower(NEW.customer_email)
    AND created_at > now() - interval '24 hours';
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many booking requests from this email in the last 24 hours'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_enforce_limits ON public.bookings;
CREATE TRIGGER bookings_enforce_limits
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_limits();

-- Require service_id to bind the booking to a real service
ALTER TABLE public.bookings
  ALTER COLUMN service_id SET NOT NULL;

-- 3) chat_conversations: explicit no-modify for public
DROP POLICY IF EXISTS chatconv_no_public_update ON public.chat_conversations;
CREATE POLICY chatconv_no_public_update ON public.chat_conversations
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS chatconv_no_public_delete ON public.chat_conversations;
CREATE POLICY chatconv_no_public_delete ON public.chat_conversations
  AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- 4) chat_messages: require session_id proof matching the parent conversation
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS session_id text;

DROP POLICY IF EXISTS chatmsg_public_insert ON public.chat_messages;
CREATE POLICY chatmsg_public_insert ON public.chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IS NOT NULL
    AND role = ANY (ARRAY['user'::text, 'assistant'::text])
    AND length(content) BETWEEN 1 AND 8000
    AND session_id IS NOT NULL
    AND length(session_id) BETWEEN 1 AND 128
    AND EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = conversation_id
        AND c.session_id = chat_messages.session_id
    )
  );
