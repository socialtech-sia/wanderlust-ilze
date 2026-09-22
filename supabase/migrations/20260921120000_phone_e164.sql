-- Телефон в формате E.164 на стороне сервера.
--
-- Клиентская проверка (src/lib/phone.ts) отсеивает опечатки, но ничего не
-- гарантирует: и create_booking, и contact_messages доступны анонимному ключу
-- напрямую через PostgREST. Поэтому правило дублируется здесь — это и есть
-- «валидация на сервере» из договорного пункта.
--
-- Формат: «+», затем от 7 до 15 цифр, первая не ноль. Это дословно E.164;
-- максимум в 15 цифр задан самим стандартом, минимум взят по самым коротким
-- реальным планам нумерации.
--
-- Ограничения объявлены NOT VALID СОЗНАТЕЛЬНО. В таблицах уже лежат брони
-- клиента с номерами старого вида, и цель правки — новые записи, а не
-- переписывание чужих данных. NOT VALID проверяет всё, что приходит дальше,
-- и не трогает то, что записано раньше.

BEGIN;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_customer_phone_e164;
-- У брони номер обязателен, поэтому NULL здесь НЕ разрешён, в отличие от
-- формы контактов. Это важно не ради строгости: политика bookings_public_insert
-- позволяет анонимному ключу вставлять брони напрямую, минуя create_booking.
-- Проверка в функции такую вставку не увидела бы, ограничение таблицы — видит.
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_customer_phone_e164
  CHECK (customer_phone ~ '^\+[1-9][0-9]{6,14}$')
  NOT VALID;

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_phone_e164;
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_phone_e164
  CHECK (phone IS NULL OR phone ~ '^\+[1-9][0-9]{6,14}$')
  NOT VALID;

-- create_booking: телефон становится обязательным.
--
-- Обязателен именно в брони, а не в форме контактов: бронь подтверждается
-- звонком, и заявка без номера стоит клиенту письма и суток ожидания.
--
-- Текст исключения ('Invalid phone') разбирает src/lib/booking-errors.ts и
-- показывает посетителю сообщение на языке страницы. Менять формулировку
-- здесь, не поправив тот файл, — значит вернуть английский текст из базы на
-- латышскую страницу.
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
  v_phone text;
BEGIN
  IF p_customer_name IS NULL OR length(btrim(p_customer_name)) < 2 OR length(p_customer_name) > 120 THEN
    RAISE EXCEPTION 'Invalid name' USING ERRCODE = 'check_violation';
  END IF;
  IF p_customer_email IS NULL OR p_customer_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = 'check_violation';
  END IF;

  v_phone := btrim(coalesce(p_customer_phone, ''));
  IF v_phone = '' OR v_phone !~ '^\+[1-9][0-9]{6,14}$' THEN
    RAISE EXCEPTION 'Invalid phone' USING ERRCODE = 'check_violation';
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
    v_phone,
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

REVOKE ALL ON FUNCTION public.create_booking(uuid, jsonb, date, time, int, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking(uuid, jsonb, date, time, int, text, text, text, text, text, text) TO anon, authenticated, service_role;

COMMIT;
