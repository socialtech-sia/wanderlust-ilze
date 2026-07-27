import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/_gate/faq")({
  component: AdminFaq,
});

type Faq = Tables<"faq">;

function AdminFaq() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "faq"],
    queryFn: async (): Promise<Faq[]> => {
      const { data, error } = await supabase.from("faq").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Faq> }) => {
      const { error } = await supabase.from("faq").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", "faq"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("faq").insert({
        question_lv: `Jauns jautājums ${Date.now()}`,
        answer_lv: "",
        sort_order: (items.at(-1)?.sort_order ?? 0) + 1,
        is_active: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Jautājums pievienots");
      void queryClient.invalidateQueries({ queryKey: ["admin", "faq"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dzēsts");
      void queryClient.invalidateQueries({ queryKey: ["admin", "faq"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <AdminPageHeader
        title="Biežāk uzdotie jautājumi"
        description="Izmaiņas tiek saglabātas, atstājot lauku"
        actions={
          <Button onClick={() => create.mutate()}>
            <Plus className="mr-2 h-4 w-4" />
            Pievienot
          </Button>
        }
      />

      {isLoading ? <p className="text-sm text-muted-foreground">Ielādē…</p> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Kārtība</Label>
                <Input
                  type="number"
                  className="w-20"
                  defaultValue={item.sort_order}
                  onBlur={(e) => save.mutate({ id: item.id, patch: { sort_order: Number(e.target.value) } })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Kategorija</Label>
                <Input
                  className="w-40"
                  defaultValue={item.category ?? ""}
                  onBlur={(e) => save.mutate({ id: item.id, patch: { category: e.target.value || null } })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.is_active}
                  onCheckedChange={(checked) => save.mutate({ id: item.id, patch: { is_active: checked } })}
                />
                <Label className="text-xs text-muted-foreground">Publicēts</Label>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="ml-auto"
                onClick={() => remove.mutate(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {(["lv", "en", "es"] as const).map((lang) => (
                <div key={lang} className="space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">{lang}</p>
                  <Input
                    defaultValue={(item[`question_${lang}`] as string | null) ?? ""}
                    placeholder="Jautājums"
                    onBlur={(e) =>
                      save.mutate({ id: item.id, patch: { [`question_${lang}`]: e.target.value } as Partial<Faq> })
                    }
                  />
                  <Textarea
                    rows={4}
                    defaultValue={(item[`answer_${lang}`] as string | null) ?? ""}
                    placeholder="Atbilde"
                    onBlur={(e) =>
                      save.mutate({ id: item.id, patch: { [`answer_${lang}`]: e.target.value } as Partial<Faq> })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
