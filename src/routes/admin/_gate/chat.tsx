import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_gate/chat")({
  component: AdminChat,
});

type Conversation = Tables<"chat_conversations">;
type Message = Tables<"chat_messages">;

function AdminChat() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["admin", "chat_conversations"],
    queryFn: async (): Promise<Conversation[]> => {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["admin", "chat_messages", activeId],
    enabled: !!activeId,
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", activeId as string)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalTokens = messages.reduce((sum, m) => sum + (m.tokens_used ?? 0), 0);

  return (
    <>
      <AdminPageHeader
        title="Čata sarunas"
        description="AI asistenta sarunu vēsture un patēriņš"
      />

      {isLoading ? <p className="text-sm text-muted-foreground">Ielādē…</p> : null}
      {!isLoading && conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">Vēl nav nevienas sarunas.</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors",
                activeId === c.id
                  ? "border-foreground bg-muted/60"
                  : "border-border bg-card hover:bg-muted/30",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {c.session_id.slice(0, 8)}…
                </span>
                <Badge variant="outline">{(c.language ?? "lv").toUpperCase()}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(c.last_message_at).toLocaleString("lv-LV", {
                  timeZone: "Europe/Riga",
                })}{" "}
                · {c.message_count} ziņas
              </p>
              {c.visitor_email ? (
                <p className="mt-1 truncate text-xs">{c.visitor_email}</p>
              ) : null}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          {!activeId ? (
            <p className="text-sm text-muted-foreground">Izvēlieties sarunu no saraksta.</p>
          ) : (
            <>
              <p className="mb-3 text-xs text-muted-foreground">
                Patērētie tokeni: <span className="font-medium">{totalTokens}</span>
              </p>
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="flex gap-2">
                    <div className="mt-0.5 text-muted-foreground">
                      {m.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <MessageCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {m.role === "user" ? "Apmeklētājs" : "Asistents"} ·{" "}
                        {new Date(m.created_at).toLocaleString("lv-LV", {
                          timeZone: "Europe/Riga",
                        })}
                      </p>
                      <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
