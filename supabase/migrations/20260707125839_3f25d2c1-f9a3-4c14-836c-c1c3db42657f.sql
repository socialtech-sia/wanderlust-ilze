
-- Revert: RLS policies invoke has_role() as the calling role, so authenticated needs EXECUTE.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
