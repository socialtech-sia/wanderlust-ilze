import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { errorJson, json, preflight } from "@/lib/http";
import { loadEmailSettings, pickAdminRecipient } from "@/lib/email/contacts";
import {
  asLang,
  bookingAdminEmail,
  bookingCustomerEmail,
  type BookingEmailData,
} from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/resend";

const Body = z.object({ booking_id: z.string().uuid() });

export const Route = createFileRoute("/api/public/booking-notification")({
  server: {
    handlers: {
      OPTIONS: () => preflight(),
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return errorJson("invalid_input", "booking_id is required", 400);

        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.NOTIFICATION_FROM_EMAIL;
        const siteUrl = new URL(request.url).origin;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Never trust the client payload: re-read the booking server-side.
        const { data: booking, error } = await supabaseAdmin
          .from("bookings")
          .select("*")
          .eq("id", parsed.data.booking_id)
          .maybeSingle();
        if (error || !booking) return errorJson("not_found", "Booking not found", 404);

        const { data: service } = await supabaseAdmin
          .from("services")
          .select("title_lv, title_en, title_es, price_from_eur")
          .eq("id", booking.service_id)
          .maybeSingle();

        const lang = asLang(booking.customer_language);
        const titleLv = service?.title_lv ?? "—";
        const localized =
          lang === "en" ? service?.title_en : lang === "es" ? service?.title_es : service?.title_lv;

        const data: BookingEmailData = {
          id: booking.id,
          reference_code: booking.reference_code,
          requested_date: booking.requested_date,
          requested_time: booking.requested_time,
          persons_count: booking.persons_count,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          customer_phone: booking.customer_phone,
          customer_country: booking.customer_country,
          customer_language: booking.customer_language,
          notes: booking.notes,
          created_at: booking.created_at,
          serviceTitleLv: titleLv,
          serviceTitle: localized ?? titleLv,
          priceFrom: service?.price_from_eur ?? null,
        };

        const problems: string[] = [];
        if (!apiKey) problems.push("RESEND_API_KEY missing");
        if (!from) problems.push("NOTIFICATION_FROM_EMAIL missing");

        if (apiKey && from) {
          // Адрес администратора: поле site_settings.booking_notification_email,
          // и только если оно пусто — ADMIN_NOTIFICATION_EMAIL из окружения.
          const emailSettings = await loadEmailSettings(supabaseAdmin, siteUrl);
          const contacts = emailSettings.contacts;
          const adminTo = pickAdminRecipient(emailSettings);

          // Куда именно ушло письмо — видно в `docker logs wanderlust-web`.
          // Без этой строки «уведомление не пришло» невозможно отличить от
          // «ушло не на тот адрес», а адрес теперь берётся из админки.
          console.info(
            "[booking-notification] admin ->",
            adminTo || "—",
            emailSettings.notificationEmail ? "(site_settings)" : "(env)",
          );

          if (adminTo) {
            const mail = bookingAdminEmail(data, siteUrl);
            const res = await sendEmail({
              apiKey,
              from,
              to: adminTo,
              replyTo: data.customer_email,
              ...mail,
            });
            if (!res.ok) problems.push(`admin: ${res.error ?? "unknown"}`);
          } else {
            problems.push(
              "нет адреса администратора: пусты и site_settings.booking_notification_email, и ADMIN_NOTIFICATION_EMAIL",
            );
          }

          const mail = bookingCustomerEmail(data, lang, contacts);
          const res = await sendEmail({
            apiKey,
            from,
            to: data.customer_email,
            replyTo: contacts.email,
            ...mail,
          });
          if (!res.ok) problems.push(`customer: ${res.error ?? "unknown"}`);
        }

        const notificationError = problems.length ? problems.join(" | ") : null;
        if (notificationError) console.error("[booking-notification]", notificationError);

        await supabaseAdmin
          .from("bookings")
          .update({
            notification_sent_at: notificationError ? null : new Date().toISOString(),
            notification_error: notificationError,
          })
          .eq("id", booking.id);

        // A failed email must never look like a failed booking.
        return json({ ok: true, notified: !notificationError });
      },
    },
  },
});
