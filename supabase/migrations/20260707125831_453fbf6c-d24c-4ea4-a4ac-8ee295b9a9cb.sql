
-- Tighten chat insert policies (was WITH CHECK (true))
DROP POLICY "chatconv_public_insert" ON public.chat_conversations;
CREATE POLICY "chatconv_public_insert" ON public.chat_conversations FOR INSERT
  WITH CHECK (session_id IS NOT NULL AND length(session_id) BETWEEN 1 AND 128);

DROP POLICY "chatmsg_public_insert" ON public.chat_messages;
CREATE POLICY "chatmsg_public_insert" ON public.chat_messages FOR INSERT
  WITH CHECK (conversation_id IS NOT NULL AND role IN ('user','assistant') AND length(content) BETWEEN 1 AND 8000);

-- Restrict has_role EXECUTE: only server_role / postgres call it directly;
-- RLS policies still evaluate it because policy expressions run under the row-owner context.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
