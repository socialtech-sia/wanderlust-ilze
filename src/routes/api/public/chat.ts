import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { errorJson, json, preflight } from "@/lib/http";
import { LANGUAGES, type Lang } from "@/lib/language";
import {
  DISABLED_MESSAGE,
  RATE_LIMIT_MESSAGE,
  buildSystemPrompt,
  type PromptContext,
  type PromptFaq,
  type PromptService,
} from "@/lib/chat/prompt";

const Body = z.object({
  session_id: z.string().min(1).max(128),
  message: z.string().min(1).max(2000),
  language: z.enum(LANGUAGES),
});

const CACHE_TTL_MS = 5 * 60 * 1000;
const contextCache = new Map<Lang, { at: number; ctx: PromptContext }>();

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
  error?: { message?: string };
}

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      OPTIONS: () => preflight(),
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return errorJson("invalid_input", "Invalid chat payload", 400);
        const { session_id, message, language } = parsed.data;

        const apiKey = process.env.ANTHROPIC_API_KEY;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Kill switch from site_settings
        const { data: enabledRow } = await supabaseAdmin
          .from("site_settings")
          .select("value")
          .eq("key", "chatbot_enabled")
          .maybeSingle();
        if (enabledRow && enabledRow.value === false) {
          return errorJson("chatbot_disabled", DISABLED_MESSAGE[language], 503);
        }
        if (!apiKey) {
          console.error("[chat] ANTHROPIC_API_KEY missing");
          return errorJson("not_configured", DISABLED_MESSAGE[language], 503);
        }

        // Rate limit: 20 user messages per session per hour
        const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count } = await supabaseAdmin
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("session_id", session_id)
          .eq("role", "user")
          .gte("created_at", since);
        if ((count ?? 0) >= 20) {
          return errorJson("rate_limited", RATE_LIMIT_MESSAGE[language], 429);
        }

        // Find or create conversation
        const { data: existing } = await supabaseAdmin
          .from("chat_conversations")
          .select("id, message_count")
          .eq("session_id", session_id)
          .maybeSingle();

        let conversationId = existing?.id ?? null;
        let messageCount = existing?.message_count ?? 0;
        if (!conversationId) {
          const { data: created, error: createErr } = await supabaseAdmin
            .from("chat_conversations")
            .insert({ session_id, language })
            .select("id, message_count")
            .single();
          if (createErr || !created) return errorJson("db_error", "Could not start conversation", 500);
          conversationId = created.id;
          messageCount = created.message_count;
        }

        let ctx = contextCache.get(language)?.ctx;
        const cachedAt = contextCache.get(language)?.at ?? 0;
        if (!ctx || Date.now() - cachedAt >= CACHE_TTL_MS) {
          const [servicesRes, faqRes, settingsRes] = await Promise.all([
            supabaseAdmin.from("services").select("*").eq("is_active", true),
            supabaseAdmin.from("faq").select("*").eq("is_active", true),
            supabaseAdmin.from("site_settings").select("key, value"),
          ]);
          ctx = buildContext(
            (servicesRes.data ?? []) as Record<string, unknown>[],
            (faqRes.data ?? []) as Record<string, unknown>[],
            (settingsRes.data ?? []) as Array<{ key: string; value: unknown }>,
            language,
          );
          contextCache.set(language, { at: Date.now(), ctx });
        }

        const { data: history } = await supabaseAdmin
          .from("chat_messages")
          .select("role, content")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(10);

        const priorTurns = (history ?? [])
          .slice()
          .reverse()
          .map((m) => ({
            role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: m.content,
          }));

        // The visitor message is always a plain user turn — never merged into the system prompt.
        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: buildSystemPrompt(ctx, language),
            messages: [...priorTurns, { role: "user", content: message }],
          }),
        });

        const payload = (await aiRes.json().catch(() => ({}))) as AnthropicResponse;
        if (!aiRes.ok) {
          console.error("[chat] anthropic", aiRes.status, payload.error?.message ?? "");
          return errorJson("upstream_error", DISABLED_MESSAGE[language], 502);
        }

        const reply =
          (payload.content ?? [])
            .filter((p) => p.type === "text" && p.text)
            .map((p) => p.text as string)
            .join("\n")
            .trim() || DISABLED_MESSAGE[language];

        const tokens =
          (payload.usage?.input_tokens ?? 0) + (payload.usage?.output_tokens ?? 0) || null;

        const nowIso = new Date().toISOString();
        await supabaseAdmin.from("chat_messages").insert([
          { conversation_id: conversationId, session_id, role: "user", content: message },
          {
            conversation_id: conversationId,
            session_id,
            role: "assistant",
            content: reply,
            tokens_used: tokens,
          },
        ]);
        await supabaseAdmin
          .from("chat_conversations")
          .update({ last_message_at: nowIso, message_count: messageCount + 2, language })
          .eq("id", conversationId);

        return json({ reply, conversation_id: conversationId });
      },
    },
  },
});

function buildContext(
  serviceRows: Record<string, unknown>[],
  faqRows: Record<string, unknown>[],
  settingRows: Array<{ key: string; value: unknown }>,
  lang: Lang,
): PromptContext {
  const pick = (row: Record<string, unknown>, base: string): string =>
    (row[`${base}_${lang}`] as string | null) ??
    (row[`${base}_en`] as string | null) ??
    (row[`${base}_lv`] as string | null) ??
    "";

  const services: PromptService[] = serviceRows.map((s) => ({
    title: pick(s, "title"),
    short: pick(s, "short_description"),
    duration_minutes: (s.duration_minutes as number | null) ?? null,
    price_from_eur: (s.price_from_eur as number | null) ?? null,
    price_per_person: (s.price_per_person as boolean | null) ?? null,
    type: String(s.type ?? ""),
    location_name: (s.location_name as string | null) ?? null,
    difficulty: (s.difficulty as string | null) ?? null,
    categories: ((s.enter_gauja_categories as string[] | null) ?? []).map(String),
    slug: pick(s, "slug"),
  }));

  const faq: PromptFaq[] = faqRows.map((f) => ({ q: pick(f, "question"), a: pick(f, "answer") }));

  let contactEmail = "";
  let contactPhone = "";
  for (const r of settingRows) {
    if (r.key === "contact_email" && typeof r.value === "string") contactEmail = r.value;
    if (r.key === "contact_phone" && typeof r.value === "string") contactPhone = r.value;
  }

  return { services, faq, contactEmail, contactPhone };
}
