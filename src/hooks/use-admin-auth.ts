import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminAuthState {
  loading: boolean;
  email: string | null;
  userId: string | null;
  isAdmin: boolean;
}

/** True when the signed-in user has an `admin` row in `user_roles` (RLS: self-read only). */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    loading: true,
    email: null,
    userId: null,
    isAdmin: false,
  });

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        if (active) setState({ loading: false, email: null, userId: null, isAdmin: false });
        return;
      }
      const isAdmin = await checkIsAdmin(user.id);
      if (active) {
        setState({ loading: false, email: user.email ?? null, userId: user.id, isAdmin });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return state;
}

export async function adminSignOut(): Promise<void> {
  await supabase.auth.signOut();
}
