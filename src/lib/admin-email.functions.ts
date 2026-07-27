import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { asLang, bookingReplyEmail, type BookingEmailData } from "@/lib/email/templates";
import { loadContacts } from "@/lib/email/contacts";
import { sendEmail } from "@/lib/email/resend";

const ReplyInputSchema = z.object({
  booking_id: z.string().uuid(),
  template: z.enum(["confirmed", "declined", "custom"]),
  meeting_point: z.string().max(2000).optional(),
  what_to_bring: z.string().max(2000).optional(),
  price: z.string().max(200).optional(),
  alternative_date: z.string().max(200).optional(),
  custom_message: z.string().max(5000).optional(),
  site_url: z.string().url(),
});

export type SendBookingReplyInput = z.infer<typeof ReplyInputSchema>;

export const sendBookingReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReplyInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");
    if (!roles || roles.length === 0) throw new Error("Forbidden");

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", data.booking_id)
      .maybeSingle();
    if (error || !booking) throw new Error("Booking not found");

    const { data: service } = await supabase
      .from("services")
      .select("title_lv, title_en, title_es, price_from_eur")
      .eq("id", booking.service_id)
      .maybeSingle();

    const lang = asLang(booking.customer_language);
    const titleLv = service?.title_lv ?? "—";
    const localized =
      lang === "en" ? service?.title_en : lang === "es" ? service?.title_es : service?.title_lv;

    const emailData: BookingEmailData = {
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

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.NOTIFICATION_FROM_EMAIL;
    if (!apiKey || !from) throw new Error("E-pasta sūtīšana nav konfigurēta (RESEND_API_KEY / NOTIFICATION_FROM_EMAIL)");

    const contacts = await loadContacts(supabase, data.site_url);
    const mail = bookingReplyEmail(
      {
        template: data.template,
        lang,
        booking: emailData,
        meetingPoint: data.meeting_point,
        whatToBring: data.what_to_bring,
        price: data.price,
        alternativeDate: data.alternative_date,
        customMessage: data.custom_message,
      },
      contacts,
    );

    const res = await sendEmail({
      apiKey,
      from,
      to: booking.customer_email,
      replyTo: contacts.email,
      ...mail,
    });
    if (!res.ok) throw new Error(res.error ?? "Neizdevās nosūtīt e-pastu");

    const stamp = `[${new Date().toISOString()}] Nosūtīts e-pasts (${data.template}): ${mail.subject}`;
    const notes = booking.admin_notes ? `${booking.admin_notes}\n${stamp}` : stamp;
    await supabase.from("bookings").update({ admin_notes: notes }).eq("id", booking.id);

    return { ok: true, subject: mail.subject };
  });
