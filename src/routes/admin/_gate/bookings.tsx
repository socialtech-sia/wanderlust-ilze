import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BookingReplyDialog } from "@/components/admin/BookingReplyDialog";
import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/_gate/bookings")({
  component: AdminBookings,
});

type Booking = Tables<"bookings">;
type BookingStatus = Booking["status"];

const STATUSES: BookingStatus[] = ["pending", "confirmed", "declined", "completed", "cancelled", "no_show"];

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Gaida",
  confirmed: "Apstiprināta",
  declined: "Noraidīta",
  completed: "Pabeigta",
  cancelled: "Atcelta",
  no_show: "Neieradās",
};

const STATUS_VARIANT: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "default",
  confirmed: "secondary",
  declined: "destructive",
  completed: "secondary",
  cancelled: "outline",
  no_show: "outline",
};

function AdminBookings() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Realtime: refresh the list whenever a booking row changes.
  useEffect(() => {
    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Booking> }) => {
      const { error } = await supabase.from("bookings").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rezervācija atjaunināta");
      void queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  function setStatus(booking: Booking, status: BookingStatus) {
    const patch: Partial<Booking> = { status };
    if (status === "confirmed") patch.confirmed_at = new Date().toISOString();
    if (status === "cancelled" || status === "declined") patch.cancelled_at = new Date().toISOString();
    update.mutate({ id: booking.id, patch });
  }

  return (
    <>
      <AdminPageHeader
        title="Rezervācijas"
        description="Pieprasījumi atjaunojas reāllaikā"
        actions={
          <Select value={filter} onValueChange={(v) => setFilter(v as BookingStatus | "all")}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visi statusi</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kods</TableHead>
              <TableHead>Klients</TableHead>
              <TableHead>Datums</TableHead>
              <TableHead>Personas</TableHead>
              <TableHead>Statuss</TableHead>
              <TableHead className="text-right">Darbības</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Ielādē…
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nav rezervāciju
                </TableCell>
              </TableRow>
            ) : null}
            {rows.map((b) => (
              <>
                <TableRow key={b.id} className="cursor-pointer" onClick={() => setOpenId(openId === b.id ? null : b.id)}>
                  <TableCell className="font-mono text-xs">
                    {b.reference_code}
                    {b.notification_error ? (
                      <Badge
                        variant="destructive"
                        className="ml-2 gap-1"
                        title={b.notification_error}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        E-pasts
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{b.customer_name}</span>
                    <span className="block text-xs text-muted-foreground">{b.customer_email}</span>
                  </TableCell>
                  <TableCell>
                    {b.requested_date}
                    {b.requested_time ? ` ${b.requested_time.slice(0, 5)}` : ""}
                  </TableCell>
                  <TableCell>{b.persons_count}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Select value={b.status} onValueChange={(v) => setStatus(b, v as BookingStatus)}>
                      <SelectTrigger className="ml-auto w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                {openId === b.id ? (
                  <TableRow key={`${b.id}-details`}>
                    <TableCell colSpan={6} className="bg-muted/40">
                      <div className="grid gap-4 py-2 sm:grid-cols-2">
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Tālrunis: </span>{b.customer_phone ?? "—"}</p>
                          <p><span className="text-muted-foreground">Valsts: </span>{b.customer_country ?? "—"}</p>
                          <p><span className="text-muted-foreground">Valoda: </span>{b.customer_language ?? "—"}</p>
                          <p><span className="text-muted-foreground">Piezīmes: </span>{b.notes ?? "—"}</p>
                        </div>
                        <div className="space-y-2">
                          <Textarea
                            defaultValue={b.admin_notes ?? ""}
                            placeholder="Iekšējās piezīmes"
                            onBlur={(e) =>
                              e.target.value !== (b.admin_notes ?? "") &&
                              update.mutate({ id: b.id, patch: { admin_notes: e.target.value } })
                            }
                          />
                          <div className="flex flex-wrap gap-2">
                            <BookingReplyDialog booking={b} />
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`mailto:${b.customer_email}?subject=Wanderlust.lv ${b.reference_code}`}>
                                mailto
                              </a>
                            </Button>
                          </div>
                          {b.notification_error ? (
                            <p className="text-xs text-destructive">
                              Paziņojuma kļūda: {b.notification_error}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
