import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { errorJson, json, preflight } from "@/lib/http";
import { loadContacts } from "@/lib/email/contacts";
import {
  asLang,
  contactAdminEmail,
  contactCustomerEmail,
  type ContactEmailData,
} from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/resend";

const Body = z.object({ message_id: z.string().uuid() });

export const Route = createFileRoute("/api/public/contact-notification")({
  server: {
    handlers: {
      OPTIONS: () => preflight(),
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return errorJson("invalid_input", "message_id is required", 400);

        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.NOTIFICATION_FROM_EMAIL;
        const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL;
        const siteUrl = new URL(request.url).origin;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row, error } = await supabaseAdmin
          .from("contact_messages")
          .select("*")
          .eq("id", parsed.data.message_id)
          .maybeSingle();
        if (error || !row) return errorJson("not_found", "Message not found", 404);

        const data: ContactEmailData = {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          subject: row.subject,
          message: row.message,
          language: row.language,
          created_at: row.created_at,
        };

        const problems: string[] = [];
        if (!apiKey) problems.push("RESEND_API_KEY missing");
        if (!from) problems.push("NOTIFICATION_FROM_EMAIL missing");

        if (apiKey && from) {
          const contacts = await loadContacts(supabaseAdmin, siteUrl);

          if (adminTo) {
            const mail = contactAdminEmail(data, siteUrl);
            const res = await sendEmail({ apiKey, from, to: adminTo, replyTo: data.email, ...mail });
            if (!res.ok) problems.push(`admin: ${res.error ?? "unknown"}`);
          } else {
            problems.push("ADMIN_NOTIFICATION_EMAIL missing");
          }

          const mail = contactCustomerEmail(data, asLang(data.language), contacts);
          const res = await sendEmail({
            apiKey,
            from,
            to: data.email,
            replyTo: contacts.email,
            ...mail,
          });
          if (!res.ok) problems.push(`customer: ${res.error ?? "unknown"}`);
        }

        const notificationError = problems.length ? problems.join(" | ") : null;
        if (notificationError) console.error("[contact-notification]", notificationError);

        await supabaseAdmin
          .from("contact_messages")
          .update({
            notification_sent_at: notificationError ? null : new Date().toISOString(),
            notification_error: notificationError,
          })
          .eq("id", row.id);

        return json({ ok: true, notified: !notificationError });
      },
    },
  },
});
