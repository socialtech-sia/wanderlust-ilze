import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Send, X, CalendarCheck } from "lucide-react";
import type { Lang } from "@/lib/language";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  lang: Lang;
  greeting: string;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SESSION_KEY = "wl_chat_session";
const HISTORY_KEY = "wl_chat_history";

function getSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

export function ChatPanel({ lang, greeting, onClose }: ChatPanelProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = useMemo(
    () => [t("chat.s1"), t("chat.s2"), t("chat.s3")],
    [t],
  );

  useEffect(() => {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    if (raw) {
      try {
        setMessages(JSON.parse(raw) as ChatMessage[]);
      } catch {
        setMessages([]);
      }
    }
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || sending || locked) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: clean }]);
    setSending(true);
    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: getSessionId(), message: clean, language: lang }),
      });
      const data = (await res.json()) as { reply?: string; message?: string };
      if (!res.ok) {
        if (res.status === 429) setLocked(true);
        setError(data.message ?? t("chat.error"));
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "" }]);
    } catch {
      setError(t("chat.error"));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end md:inset-auto md:bottom-24 md:right-6">
      <button
        type="button"
        aria-label={t("chat.close")}
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px] md:hidden"
      />
      <div
        role="dialog"
        aria-label={t("chat.title")}
        className="relative flex h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border/60 bg-card shadow-editorial md:h-[560px] md:w-[380px] md:rounded-xl"
      >
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div>
            <p className="font-display text-base leading-tight">{t("chat.title")}</p>
            <p className="text-[11px] text-ink-muted">{t("chat.subtitle")}</p>
          </div>
          <button
            type="button"
            aria-label={t("chat.close")}
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <Bubble role="assistant">{greeting}</Bubble>
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>
              {m.content}
            </Bubble>
          ))}
          {sending ? (
            <div className="flex gap-1 px-1 text-ink-muted" aria-live="polite">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
            </div>
          ) : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          {messages.length === 0 && !sending ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <footer className="border-t border-border/60 p-3">
          <Button asChild variant="ghost" size="sm" className="mb-2 w-full justify-center">
            <Link to="/$lang/book" params={{ lang }} search={{ service: undefined }} onClick={onClose}>
              <CalendarCheck className="h-4 w-4" /> {t("chat.book_cta")}
            </Link>
          </Button>
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              disabled={locked}
              placeholder={locked ? t("chat.rate_limited") : t("chat.placeholder")}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              className="max-h-28 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground disabled:opacity-60"
            />
            <Button type="submit" size="icon" disabled={sending || locked || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </footer>
      </div>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-md bg-foreground text-background"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{children}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-a:text-moss-deep">
            <ReactMarkdown>{children}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
