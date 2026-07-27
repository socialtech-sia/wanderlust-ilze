import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/_gate/services/")({
  component: AdminServices,
});

type Service = Tables<"services">;
type ServiceType = Service["type"];

const TYPE_LABEL: Record<ServiceType, string> = {
  excursion: "Ekskursija",
  hiking: "Pārgājiens",
  transfer: "Transfērs",
};

function AdminServices() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<ServiceType | "all">("all");
  const [search, setSearch] = useState("");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase.from("services").select("*").order("type").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("services").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", "services"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = services.filter(
    (s) =>
      (type === "all" || s.type === type) &&
      (search === "" || s.title_lv.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <>
      <AdminPageHeader
        title="Pakalpojumi"
        description="Ekskursijas, pārgājieni un transfēri"
        actions={
          <Button asChild>
            <Link to="/admin/services/$id" params={{ id: "new" }}>
              <Plus className="mr-2 h-4 w-4" />
              Jauns
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Meklēt pēc nosaukuma…"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={type} onValueChange={(v) => setType(v as ServiceType | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Visi veidi</SelectItem>
            {(Object.keys(TYPE_LABEL) as ServiceType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nosaukums</TableHead>
              <TableHead>Veids</TableHead>
              <TableHead>Cena</TableHead>
              <TableHead>Kārtība</TableHead>
              <TableHead>Aktīvs</TableHead>
              <TableHead className="text-right">Rediģēt</TableHead>
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
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <span className="font-medium">{s.title_lv}</span>
                  <span className="block font-mono text-xs text-muted-foreground">{s.slug_lv}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{TYPE_LABEL[s.type]}</Badge>
                </TableCell>
                <TableCell>{s.price_from_eur ? `€${s.price_from_eur}` : "—"}</TableCell>
                <TableCell>{s.sort_order}</TableCell>
                <TableCell>
                  <Switch
                    checked={s.is_active}
                    onCheckedChange={(checked) => toggle.mutate({ id: s.id, is_active: checked })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/services/$id" params={{ id: s.id }}>
                      Atvērt
                    </Link>
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
