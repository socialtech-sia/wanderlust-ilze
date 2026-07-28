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

export const Route = createFileRoute("/admin/_gate/testimonials")({
  component: AdminTestimonials,
});

type Testimonial = Tables<"testimonials">;

function AdminTestimonials() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Testimonial> }) => {
      const { error } = await supabase.from("testimonials").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("testimonials").insert({
        author_name: "Jauns autors",
        rating: 5,
        is_active: false,
        sort_order: (items.at(-1)?.sort_order ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <AdminPageHeader
        title="Atsauksmes"
        description="Klientu atsauksmes trīs valodās"
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
          <div key={item.id} className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Input
                className="w-52"
                defaultValue={item.author_name}
                placeholder="Autors"
                onBlur={(e) => save.mutate({ id: item.id, patch: { author_name: e.target.value } })}
              />
              <Input
                className="w-32"
                defaultValue={item.author_country ?? ""}
                placeholder="Valsts"
                onBlur={(e) => save.mutate({ id: item.id, patch: { author_country: e.target.value || null } })}
              />
              <Input
                type="number"
                min={1}
                max={5}
                className="w-20"
                defaultValue={item.rating}
                onBlur={(e) => save.mutate({ id: item.id, patch: { rating: Number(e.target.value) } })}
              />
              <Input
                type="number"
                className="w-20"
                defaultValue={item.sort_order}
                onBlur={(e) => save.mutate({ id: item.id, patch: { sort_order: Number(e.target.value) } })}
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.is_active}
                  onCheckedChange={(checked) => save.mutate({ id: item.id, patch: { is_active: checked } })}
                />
                <Label className="text-xs text-muted-foreground">Publicēts</Label>
              </div>
              <Button variant="destructive" size="sm" className="ml-auto" onClick={() => remove.mutate(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {(["lv", "en", "es"] as const).map((lang) => (
                <div key={lang} className="space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">{lang}</p>
                  <Textarea
                    rows={4}
                    defaultValue={(item[`text_${lang}`] as string | null) ?? ""}
                    onBlur={(e) =>
                      save.mutate({ id: item.id, patch: { [`text_${lang}`]: e.target.value } as Partial<Testimonial> })
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
