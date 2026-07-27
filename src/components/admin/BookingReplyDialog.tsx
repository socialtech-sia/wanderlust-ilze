import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { sendBookingReply } from "@/lib/admin-email.functions";
import {
  asLang,
  bookingReplyEmail,
  type BookingEmailData,
  type ReplyTemplate,
} from "@/lib/email/templates";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Booking = Tables<"bookings">;

const TEMPLATE_LABEL: Record<ReplyTemplate, string> = {
  confirmed: "Apstiprinājums",
  declined: "Noraidījums",
  custom: "Brīvs teksts",
};

function snapshotTitle(booking: Booking): string {
  const snap = booking.service_snapshot as { title?: string } | null;
  return snap?.title ?? "—";
}

export function BookingReplyDialog({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<ReplyTemplate>("confirmed");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [whatToBring, setWhatToBring] = useState("");
  const [price, setPrice] = useState(
    booking.quoted_price_eur ? `${booking.quoted_price_eur} EUR` : "",
  );
  const [alternativeDate, setAlternativeDate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);

  const send = useServerFn(sendBookingReply);

  const preview = useMemo(() => {
    const title = snapshotTitle(booking);
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
      serviceTitleLv: title,
      serviceTitle: title,
      priceFrom: null,
    };
    return bookingReplyEmail(
      {
        template,
        lang: asLang(booking.customer_language),
        booking: data,
        meetingPoint: meetingPoint || undefined,
        whatToBring: whatToBring || undefined,
        price: price || undefined,
        alternativeDate: alternativeDate || undefined,
        customMessage: customMessage || undefined,
      },
      { email: "", phone: "", siteUrl: "" },
    );
  }, [booking, template, meetingPoint, whatToBring, price, alternativeDate, customMessage]);

  async function submit() {
    setSending(true);
    try {
      await send({
        data: {
          booking_id: booking.id,
          template,
          meeting_point: meetingPoint || undefined,
          what_to_bring: whatToBring || undefined,
          price: price || undefined,
          alternative_date: alternativeDate || undefined,
          custom_message: customMessage || undefined,
          site_url: window.location.origin,
        },
      });
      toast.success("E-pasts nosūtīts klientam");
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  const canSend = template !== "custom" || customMessage.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="mr-2 h-4 w-4" />
          Atbildēt klientam
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Atbilde · {booking.reference_code} ·{" "}
            {(booking.customer_language ?? "lv").toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Veidne</Label>
            <Select value={template} onValueChange={(v) => setTemplate(v as ReplyTemplate)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TEMPLATE_LABEL) as ReplyTemplate[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {TEMPLATE_LABEL[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {template === "confirmed" ? (
            <>
              <div className="grid gap-1.5">
                <Label>Tikšanās vieta</Label>
                <Textarea
                  rows={2}
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  placeholder="Piem., Siguldas stacija, pie galvenās ieejas"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Ko ņemt līdzi</Label>
                <Textarea
                  rows={2}
                  value={whatToBring}
                  onChange={(e) => setWhatToBring(e.target.value)}
                  placeholder="Ērti apavi, ūdens, lietusmētelis"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Cena</Label>
                <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="120 EUR" />
              </div>
            </>
          ) : null}

          {template === "declined" ? (
            <div className="grid gap-1.5">
              <Label>Alternatīvs datums (nav obligāts)</Label>
              <Input
                value={alternativeDate}
                onChange={(e) => setAlternativeDate(e.target.value)}
                placeholder="2026-08-14, 10:00"
              />
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <Label>{template === "custom" ? "Ziņas teksts" : "Papildu teksts (nav obligāts)"}</Label>
            <Textarea
              rows={5}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-3">
            <p className="mb-2 text-xs text-muted-foreground">
              Priekšskatījums · <span className="font-medium">{preview.subject}</span>
            </p>
            <iframe
              title="E-pasta priekšskatījums"
              srcDoc={preview.html}
              className="h-80 w-full rounded-xl border border-border bg-white"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Atcelt
            </Button>
            <Button disabled={sending || !canSend} onClick={submit}>
              {sending ? "Sūta…" : "Nosūtīt"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
