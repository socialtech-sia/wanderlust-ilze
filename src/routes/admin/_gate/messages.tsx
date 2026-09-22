import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/_gate/messages")({
  component: AdminMessages,
});

type Message = Tables<"contact_messages">;

function AdminMessages() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", "messages"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <AdminPageHeader title="Ziņojumi" description="Kontaktformas pieprasījumi" />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sūtītājs</TableHead>
              <TableHead>Temats</TableHead>
              <TableHead>Ziņojums</TableHead>
              <TableHead>Statuss</TableHead>
              <TableHead className="text-right">Darbības</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Ielādē…
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nav ziņojumu
                </TableCell>
              </TableRow>
            ) : null}
            {items.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <span className="font-medium">{m.name}</span>
                  <span className="block text-xs text-muted-foreground">{m.email}</span>
                  {/* Телефон теперь собирается и формой контактов, и в E.164 —
                      значит, по нему можно просто позвонить из админки. */}
                  {m.phone ? (
                    <a
                      href={`tel:${m.phone}`}
                      className="block text-xs text-muted-foreground hover:text-foreground"
                    >
                      {m.phone}
                    </a>
                  ) : null}
                </TableCell>
                <TableCell>{m.subject ?? "—"}</TableCell>
                <TableCell className="max-w-md whitespace-pre-wrap text-sm">{m.message}</TableCell>
                <TableCell>
                  <Badge variant={m.status === "new" ? "default" : "secondary"}>{m.status}</Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${m.email}`}>Atbildēt</a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatus.mutate({ id: m.id, status: m.status === "new" ? "handled" : "new" })}
                  >
                    {m.status === "new" ? "Atzīmēt kā apstrādātu" : "Atzīmēt kā jaunu"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
