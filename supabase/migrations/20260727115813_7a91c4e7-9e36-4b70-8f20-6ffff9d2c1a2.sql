DROP POLICY IF EXISTS "public_media_read" ON storage.objects;
CREATE POLICY "public_media_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-media');

DROP POLICY IF EXISTS "public_media_admin_insert" ON storage.objects;
CREATE POLICY "public_media_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'public-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "public_media_admin_update" ON storage.objects;
CREATE POLICY "public_media_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'public-media' AND private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'public-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "public_media_admin_delete" ON storage.objects;
CREATE POLICY "public_media_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'public-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER TYPE public.enter_gauja_category ADD VALUE IF NOT EXISTS 'getaround';