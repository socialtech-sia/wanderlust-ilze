import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administratora pieteikšanās — Wanderlust.lv" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError || !data.user) {
      setError("Nepareizs e-pasts vai parole");
      setBusy(false);
      return;
    }
    const isAdmin = await checkIsAdmin(data.user.id);
    if (!isAdmin) {
      await supabase.auth.signOut();
      setError("Šim kontam nav administratora tiesību");
      setBusy(false);
      return;
    }
    await navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="admin-scope flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[3px] border border-border bg-card p-6">
        <h1 className="font-display text-2xl text-foreground">Wanderlust.lv</h1>
        <p className="mt-1 text-sm text-muted-foreground">Satura pārvaldības sistēma</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-pasts</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Parole</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Notiek pieteikšanās…" : "Pieteikties"}
          </Button>
        </form>
      </div>
    </div>
  );
}
