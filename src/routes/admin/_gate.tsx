import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/hooks/use-admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/_gate")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    const isAdmin = await checkIsAdmin(data.user.id);
    if (!isAdmin) throw redirect({ to: "/admin/login" });
    return { adminEmail: data.user.email ?? "" };
  },
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
});
