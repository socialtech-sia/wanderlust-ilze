import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/_gate/blog/")({
  component: AdminBlog,
});

type Post = Tables<"blog_posts">;

function AdminBlog() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin", "blog"],
    queryFn: async (): Promise<Post[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Blogs"
        description="Raksti trīs valodās"
        actions={
          <Button asChild>
            <Link to="/admin/blog/$id" params={{ id: "new" }}>
              <Plus className="mr-2 h-4 w-4" />
              Jauns raksts
            </Link>
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Virsraksts</TableHead>
              <TableHead>Statuss</TableHead>
              <TableHead>Publicēts</TableHead>
              <TableHead className="text-right">Rediģēt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Ielādē…
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Vēl nav rakstu
                </TableCell>
              </TableRow>
            ) : null}
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <span className="font-medium">{p.title_lv ?? "(bez virsraksta)"}</span>
                  <span className="block font-mono text-xs text-muted-foreground">{p.slug_lv}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={p.status === "published" ? "secondary" : "outline"}>{p.status}</Badge>
                </TableCell>
                <TableCell>{p.published_at ? p.published_at.slice(0, 10) : "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/blog/$id" params={{ id: p.id }}>
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
