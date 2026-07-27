CREATE UNIQUE INDEX IF NOT EXISTS services_slug_lv_key ON public.services (slug_lv) WHERE slug_lv IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS faq_question_lv_key ON public.faq (question_lv);
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_lv_key ON public.blog_posts (slug_lv) WHERE slug_lv IS NOT NULL;

-- Bootstrap the very first administrator.
-- Flow: the owner registers once at /admin/login, then the workspace owner runs
--   SELECT private.bootstrap_first_admin('ilze.gulbe@creatus.lv');
-- which inserts the matching row into public.user_roles. Callable by service_role only.
CREATE OR REPLACE FUNCTION private.bootstrap_first_admin(_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'No auth user with email %', _email;
  END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN _uid;
END;
$$;

REVOKE ALL ON FUNCTION private.bootstrap_first_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.bootstrap_first_admin(text) TO service_role;

-- Admin UI needs a role check callable by the signed-in user (RLS-safe wrapper).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT private.has_role(auth.uid(), 'admin'::public.app_role)
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;