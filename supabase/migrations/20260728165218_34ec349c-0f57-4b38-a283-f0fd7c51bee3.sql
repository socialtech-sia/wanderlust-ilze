CREATE OR REPLACE FUNCTION public.create_booking(
  p_service_id uuid,
  p_service_snapshot jsonb,
  p_requested_date date,
  p_requested_time time,
  p_persons_count int,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_customer_country text,
  p_customer_language text,
  p_notes text
)
RETURNS TABLE (id uuid, reference_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ref text;
  v_lang text;
BEGIN
  IF p_customer_name IS NULL OR length(btrim(p_customer_name)) < 2 OR length(p_customer_name) > 120 THEN
    RAISE EXCEPTION 'Invalid name' USING ERRCODE = 'check_violation';
  END IF;
  IF p_customer_email IS NULL OR p_customer_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = 'check_violation';
  END IF;
  IF p_requested_date IS NULL OR p_requested_date < current_date THEN
    RAISE EXCEPTION 'Invalid date' USING ERRCODE = 'check_violation';
  END IF;
  IF p_persons_count IS NULL OR p_persons_count < 1 OR p_persons_count > 50 THEN
    RAISE EXCEPTION 'Invalid group size' USING ERRCODE = 'check_violation';
  END IF;
  IF p_notes IS NOT NULL AND length(p_notes) > 2000 THEN
    RAISE EXCEPTION 'Notes too long' USING ERRCODE = 'check_violation';
  END IF;

  v_lang := lower(coalesce(nullif(btrim(coalesce(p_customer_language, '')), ''), 'lv'));
  IF v_lang NOT IN ('lv', 'en', 'es') THEN
    v_lang := 'lv';
  END IF;

  INSERT INTO public.bookings (
    service_id, service_snapshot, requested_date, requested_time, persons_count,
    customer_name, customer_email, customer_phone, customer_country, customer_language,
    notes, status
  ) VALUES (
    p_service_id, p_service_snapshot, p_requested_date, p_requested_time, p_persons_count,
    btrim(p_customer_name), lower(btrim(p_customer_email)),
    nullif(btrim(coalesce(p_customer_phone,'')),''),
    nullif(btrim(coalesce(p_customer_country,'')),''),
    v_lang::booking_language,
    nullif(btrim(coalesce(p_notes,'')),''),
    'pending'
  )
  RETURNING bookings.id, bookings.reference_code INTO v_id, v_ref;

  id := v_id;
  reference_code := v_ref;
  RETURN NEXT;
END;
$$;