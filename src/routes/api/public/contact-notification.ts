import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { errorJson, json, preflight } from "@/lib/http";
import { loadEmailSettings, pickAdminRecipient } from "@/lib/email/contacts";
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
          // Тот же адрес, что и у броней: одно поле в админке на оба
          // уведомления — два разных завели бы ровно ту путаницу, из-за
          // которой контакты уже разъезжались.
          const emailSettings = await loadEmailSettings(supabaseAdmin, siteUrl);
          const contacts = emailSettings.contacts;
          const adminTo = pickAdminRecipient(emailSettings);

          // Куда именно ушло письмо — видно в `docker logs wanderlust-web`.
          // Без этой строки «уведомление не пришло» невозможно отличить от
          // «ушло не на тот адрес», а адрес теперь берётся из админки.
          console.info(
            "[contact-notification] admin ->",
            adminTo || "—",
            emailSettings.notificationEmail ? "(site_settings)" : "(env)",
          );

          if (adminTo) {
            const mail = contactAdminEmail(data, siteUrl);
            const res = await sendEmail({ apiKey, from, to: adminTo, replyTo: data.email, ...mail });
            if (!res.ok) problems.push(`admin: ${res.error ?? "unknown"}`);
          } else {
            problems.push(
              "нет адреса администратора: пусты и site_settings.booking_notification_email, и ADMIN_NOTIFICATION_EMAIL",
            );
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
