import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Compass, Image as ImageIcon, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/_gate/")({
  component: AdminDashboard,
});

interface Stats {
  services: number;
  pendingBookings: number;
  media: number;
  newMessages: number;
}

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async (): Promise<Stats> => {
      const [services, bookings, media, messages] = await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("media").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      return {
        services: services.count ?? 0,
        pendingBookings: bookings.count ?? 0,
        media: media.count ?? 0,
        newMessages: messages.count ?? 0,
      };
    },
  });

  const cards = [
    { to: "/admin/services", label: "Pakalpojumi", value: data?.services ?? "—", icon: Compass },
    { to: "/admin/bookings", label: "Jaunas rezervācijas", value: data?.pendingBookings ?? "—", icon: CalendarCheck },
    { to: "/admin/media", label: "Mediji", value: data?.media ?? "—", icon: ImageIcon },
    { to: "/admin/messages", label: "Jauni ziņojumi", value: data?.newMessages ?? "—", icon: Mail },
  ];

  return (
    <>
      <AdminPageHeader title="Pārskats" description="Wanderlust.lv satura pārvaldība" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <card.icon className="h-5 w-5 text-primary" />
            <p className="mt-4 font-display text-3xl text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
