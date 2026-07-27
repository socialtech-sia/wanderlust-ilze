/** Plain, responsive (max 600px) email templates. No external images except the logo. */

export type EmailLang = "lv" | "en" | "es";

export interface EmailContacts {
  email: string;
  phone: string;
  siteUrl: string;
}

export interface BookingEmailData {
  id: string;
  reference_code: string;
  requested_date: string;
  requested_time: string | null;
  persons_count: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_country: string | null;
  customer_language: string | null;
  notes: string | null;
  created_at: string;
  serviceTitleLv: string;
  serviceTitle: string;
  priceFrom: number | null;
}

export interface ContactEmailData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  language: string | null;
  created_at: string;
}

export interface EmailBody {
  subject: string;
  html: string;
  text: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function asLang(value: unknown): EmailLang {
  return value === "en" || value === "es" ? value : "lv";
}

function nl2br(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function shell(title: string, inner: string, footer: string, siteUrl: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f6f5f1;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f1;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;border:1px solid #e6e3db;">
<tr><td style="padding:24px 28px 8px 28px;font-family:${FONT};">
  <a href="${siteUrl}" style="font-size:15px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#2f3a24;text-decoration:none;">Wanderlust.lv</a>
</td></tr>
<tr><td style="padding:8px 28px 24px 28px;font-family:${FONT};font-size:15px;line-height:1.6;color:#22251f;">
${inner}
</td></tr>
<tr><td style="padding:16px 28px 24px 28px;border-top:1px solid #eeece5;font-family:${FONT};font-size:12px;line-height:1.6;color:#77796f;">
${footer}
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px 6px 0;color:#77796f;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(
    label,
  )}</td><td style="padding:6px 0;font-size:14px;vertical-align:top;">${value}</td></tr>`;
}

function fmtTime(t: string | null): string {
  return t ? t.slice(0, 5) : "—";
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("lv-LV", { timeZone: "Europe/Riga" });
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#2f3a24;color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:999px;font-size:14px;">${escapeHtml(
    label,
  )}</a>`;
}

/* ---------------------------------------------------------------- bookings */

export function bookingAdminEmail(b: BookingEmailData, siteUrl: string): EmailBody {
  const adminUrl = `${siteUrl}/admin/bookings/${b.id}`;
  const table = `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
${row("Kods", `<strong>${escapeHtml(b.reference_code)}</strong>`)}
${row("Pakalpojums", escapeHtml(b.serviceTitleLv))}
${row("Datums", `${escapeHtml(b.requested_date)} ${escapeHtml(fmtTime(b.requested_time))}`)}
${row("Personas", String(b.persons_count))}
${row("Vārds", escapeHtml(b.customer_name))}
${row("E-pasts", `<a href="mailto:${escapeHtml(b.customer_email)}">${escapeHtml(b.customer_email)}</a>`)}
${row(
  "Tālrunis",
  b.customer_phone
    ? `<a href="tel:${escapeHtml(b.customer_phone)}">${escapeHtml(b.customer_phone)}</a>`
    : "—",
)}
${row("Valsts", escapeHtml(b.customer_country ?? "—"))}
${row("Valoda", escapeHtml((b.customer_language ?? "—").toUpperCase()))}
${row("Komentārs", b.notes ? nl2br(b.notes) : "—")}
${row("Pieteikts", escapeHtml(fmtDateTime(b.created_at)))}
</table>`;

  const inner = `<h1 style="margin:0 0 4px 0;font-size:20px;">Jauna rezervācija</h1>
<p style="margin:0 0 18px 0;color:#77796f;font-size:13px;">${escapeHtml(b.serviceTitleLv)}</p>
${table}
<p style="margin:24px 0 0 0;">${button(adminUrl, "Atvērt administrācijā")}</p>`;

  const text = [
    `Jauna rezervācija ${b.reference_code}`,
    `Pakalpojums: ${b.serviceTitleLv}`,
    `Datums: ${b.requested_date} ${fmtTime(b.requested_time)}`,
    `Personas: ${b.persons_count}`,
    `Vārds: ${b.customer_name}`,
    `E-pasts: ${b.customer_email}`,
    `Tālrunis: ${b.customer_phone ?? "—"}`,
    `Valsts: ${b.customer_country ?? "—"}`,
    `Valoda: ${(b.customer_language ?? "—").toUpperCase()}`,
    `Komentārs: ${b.notes ?? "—"}`,
    `Pieteikts: ${fmtDateTime(b.created_at)}`,
    adminUrl,
  ].join("\n");

  return {
    subject: `Jauna rezervācija ${b.reference_code} — ${b.serviceTitleLv}`,
    html: shell("Jauna rezervācija", inner, "Wanderlust.lv administrācija", siteUrl),
    text,
  };
}

const BOOKING_CUSTOMER = {
  lv: {
    subject: (c: string) => `Jūsu rezervācijas pieteikums saņemts — ${c}`,
    hi: (n: string) => `Sveiki, ${n}!`,
    lead:
      "Paldies! Esmu saņēmusi jūsu <strong>pieteikumu</strong>. Tas vēl nav apstiprināta rezervācija — es personīgi atbildēšu <strong>24 stundu laikā</strong> un apstiprināšu laiku.",
    summary: "Ko jūs pieprasījāt",
    labels: { svc: "Pakalpojums", date: "Datums", time: "Laiks", people: "Personas", code: "Kods" },
    save: "Lūdzu, saglabājiet šo kodu — tas noderēs sarakstē.",
    sign: "Ar sveicieniem,<br />Ilze Gulbe · sertificēta gide",
  },
  en: {
    subject: (c: string) => `We received your booking request — ${c}`,
    hi: (n: string) => `Hello ${n},`,
    lead:
      "Thank you! I have received your <strong>request</strong>. This is not a confirmed booking yet — I will reply personally <strong>within 24 hours</strong> and confirm the time.",
    summary: "What you requested",
    labels: { svc: "Service", date: "Date", time: "Time", people: "People", code: "Code" },
    save: "Please keep this reference code for our correspondence.",
    sign: "Warm regards,<br />Ilze Gulbe · certified guide",
  },
  es: {
    subject: (c: string) => `Hemos recibido tu solicitud de reserva — ${c}`,
    hi: (n: string) => `Hola ${n}:`,
    lead:
      "¡Gracias! He recibido tu <strong>solicitud</strong>. Todavía no es una reserva confirmada: te responderé personalmente <strong>en 24 horas</strong> y confirmaré la hora.",
    summary: "Lo que has solicitado",
    labels: { svc: "Servicio", date: "Fecha", time: "Hora", people: "Personas", code: "Código" },
    save: "Guarda este código de referencia para nuestra correspondencia.",
    sign: "Un cordial saludo,<br />Ilze Gulbe · guía certificada",
  },
} as const;

export function bookingCustomerEmail(
  b: BookingEmailData,
  lang: EmailLang,
  contacts: EmailContacts,
): EmailBody {
  const c = BOOKING_CUSTOMER[lang];
  const table = `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
${row(c.labels.code, `<strong>${escapeHtml(b.reference_code)}</strong>`)}
${row(c.labels.svc, escapeHtml(b.serviceTitle))}
${row(c.labels.date, escapeHtml(b.requested_date))}
${row(c.labels.time, escapeHtml(fmtTime(b.requested_time)))}
${row(c.labels.people, String(b.persons_count))}
</table>`;

  const inner = `<p style="margin:0 0 12px 0;">${escapeHtml(c.hi(b.customer_name))}</p>
<p style="margin:0 0 18px 0;">${c.lead}</p>
<p style="margin:0 0 8px 0;font-size:13px;color:#77796f;">${escapeHtml(c.summary)}</p>
${table}
<p style="margin:18px 0 0 0;font-size:13px;color:#77796f;">${escapeHtml(c.save)}</p>
<p style="margin:22px 0 0 0;">${c.sign}</p>`;

  const footer = `${escapeHtml(contacts.email)} · ${escapeHtml(contacts.phone)}<br />${escapeHtml(
    contacts.siteUrl,
  )}`;

  const text = [
    c.hi(b.customer_name),
    c.lead.replace(/<[^>]+>/g, ""),
    "",
    `${c.labels.code}: ${b.reference_code}`,
    `${c.labels.svc}: ${b.serviceTitle}`,
    `${c.labels.date}: ${b.requested_date} ${fmtTime(b.requested_time)}`,
    `${c.labels.people}: ${b.persons_count}`,
    "",
    c.save,
    "Ilze Gulbe",
    `${contacts.email} · ${contacts.phone}`,
  ].join("\n");

  return { subject: c.subject(b.reference_code), html: shell(c.subject(b.reference_code), inner, footer, contacts.siteUrl), text };
}

/* ---------------------------------------------------------------- contact */

export function contactAdminEmail(m: ContactEmailData, siteUrl: string): EmailBody {
  const mailto = `mailto:${m.email}?subject=${encodeURIComponent(
    `Re: ${m.subject ?? "Wanderlust.lv"}`,
  )}`;
  const inner = `<h1 style="margin:0 0 16px 0;font-size:20px;">Jauna ziņa no kontaktformas</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
${row("Vārds", escapeHtml(m.name))}
${row("E-pasts", `<a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a>`)}
${row("Tālrunis", m.phone ? `<a href="tel:${escapeHtml(m.phone)}">${escapeHtml(m.phone)}</a>` : "—")}
${row("Temats", escapeHtml(m.subject ?? "—"))}
${row("Valoda", escapeHtml((m.language ?? "—").toUpperCase()))}
${row("Saņemts", escapeHtml(fmtDateTime(m.created_at)))}
</table>
<div style="margin:18px 0 0 0;padding:14px 16px;background:#f6f5f1;border-radius:10px;">${nl2br(
    m.message,
  )}</div>
<p style="margin:24px 0 0 0;">${button(mailto, "Atbildēt")}</p>`;

  const text = [
    "Jauna ziņa no kontaktformas",
    `Vārds: ${m.name}`,
    `E-pasts: ${m.email}`,
    `Tālrunis: ${m.phone ?? "—"}`,
    `Temats: ${m.subject ?? "—"}`,
    "",
    m.message,
  ].join("\n");

  return {
    subject: `Jauna ziņa no ${m.name} — Wanderlust.lv`,
    html: shell("Jauna ziņa", inner, "Wanderlust.lv administrācija", siteUrl),
    text,
  };
}

const CONTACT_CUSTOMER = {
  lv: {
    subject: "Paldies par ziņu — Wanderlust.lv",
    hi: (n: string) => `Sveiki, ${n}!`,
    body:
      "Paldies, ka rakstījāt. Esmu saņēmusi jūsu ziņu un atbildēšu personīgi tuvāko 24 stundu laikā.",
    copy: "Jūsu ziņa",
    sign: "Ar sveicieniem,<br />Ilze Gulbe · sertificēta gide",
  },
  en: {
    subject: "Thanks for your message — Wanderlust.lv",
    hi: (n: string) => `Hello ${n},`,
    body: "Thank you for writing. I have received your message and will reply personally within 24 hours.",
    copy: "Your message",
    sign: "Warm regards,<br />Ilze Gulbe · certified guide",
  },
  es: {
    subject: "Gracias por tu mensaje — Wanderlust.lv",
    hi: (n: string) => `Hola ${n}:`,
    body: "Gracias por escribir. He recibido tu mensaje y te responderé personalmente en 24 horas.",
    copy: "Tu mensaje",
    sign: "Un cordial saludo,<br />Ilze Gulbe · guía certificada",
  },
} as const;

export function contactCustomerEmail(
  m: ContactEmailData,
  lang: EmailLang,
  contacts: EmailContacts,
): EmailBody {
  const c = CONTACT_CUSTOMER[lang];
  const inner = `<p style="margin:0 0 12px 0;">${escapeHtml(c.hi(m.name))}</p>
<p style="margin:0 0 18px 0;">${escapeHtml(c.body)}</p>
<p style="margin:0 0 6px 0;font-size:13px;color:#77796f;">${escapeHtml(c.copy)}</p>
<div style="padding:14px 16px;background:#f6f5f1;border-radius:10px;">${nl2br(m.message)}</div>
<p style="margin:22px 0 0 0;">${c.sign}</p>`;
  const footer = `${escapeHtml(contacts.email)} · ${escapeHtml(contacts.phone)}<br />${escapeHtml(
    contacts.siteUrl,
  )}`;
  const text = [c.hi(m.name), c.body, "", c.copy + ":", m.message, "", "Ilze Gulbe", contacts.email].join(
    "\n",
  );
  return { subject: c.subject, html: shell(c.subject, inner, footer, contacts.siteUrl), text };
}

/* ------------------------------------------------------------------ reply */

export type ReplyTemplate = "confirmed" | "declined" | "custom";

export interface ReplyInput {
  template: ReplyTemplate;
  lang: EmailLang;
  booking: BookingEmailData;
  meetingPoint?: string;
  whatToBring?: string;
  price?: string;
  alternativeDate?: string;
  customMessage?: string;
}

const REPLY = {
  lv: {
    confirmedSubject: (c: string) => `Rezervācija apstiprināta — ${c}`,
    declinedSubject: (c: string) => `Par jūsu pieteikumu — ${c}`,
    customSubject: (c: string) => `Wanderlust.lv — ${c}`,
    hi: (n: string) => `Sveiki, ${n}!`,
    confirmed: "Prieks apstiprināt jūsu rezervāciju. Zemāk visa praktiskā informācija.",
    declined:
      "Paldies par interesi. Diemžēl šoreiz nevaru uzņemt jūsu pieteikumu izvēlētajā laikā.",
    alt: "Piedāvātais alternatīvais laiks",
    labels: {
      svc: "Pakalpojums",
      date: "Datums",
      time: "Laiks",
      people: "Personas",
      code: "Kods",
      meet: "Tikšanās vieta",
      bring: "Ko ņemt līdzi",
      price: "Cena",
    },
    sign: "Ar sveicieniem,<br />Ilze Gulbe · sertificēta gide",
  },
  en: {
    confirmedSubject: (c: string) => `Booking confirmed — ${c}`,
    declinedSubject: (c: string) => `About your request — ${c}`,
    customSubject: (c: string) => `Wanderlust.lv — ${c}`,
    hi: (n: string) => `Hello ${n},`,
    confirmed: "I am happy to confirm your booking. All practical details are below.",
    declined: "Thank you for your interest. Unfortunately I cannot take your request at that time.",
    alt: "Suggested alternative date",
    labels: {
      svc: "Service",
      date: "Date",
      time: "Time",
      people: "People",
      code: "Code",
      meet: "Meeting point",
      bring: "What to bring",
      price: "Price",
    },
    sign: "Warm regards,<br />Ilze Gulbe · certified guide",
  },
  es: {
    confirmedSubject: (c: string) => `Reserva confirmada — ${c}`,
    declinedSubject: (c: string) => `Sobre tu solicitud — ${c}`,
    customSubject: (c: string) => `Wanderlust.lv — ${c}`,
    hi: (n: string) => `Hola ${n}:`,
    confirmed: "Me alegra confirmar tu reserva. Abajo tienes toda la información práctica.",
    declined: "Gracias por tu interés. Lamentablemente no puedo aceptar tu solicitud en esa fecha.",
    alt: "Fecha alternativa propuesta",
    labels: {
      svc: "Servicio",
      date: "Fecha",
      time: "Hora",
      people: "Personas",
      code: "Código",
      meet: "Punto de encuentro",
      bring: "Qué llevar",
      price: "Precio",
    },
    sign: "Un cordial saludo,<br />Ilze Gulbe · guía certificada",
  },
} as const;

export function bookingReplyEmail(input: ReplyInput, contacts: EmailContacts): EmailBody {
  const c = REPLY[input.lang];
  const b = input.booking;
  const lines: string[] = [];
  let subject: string;
  let intro: string;

  if (input.template === "confirmed") {
    subject = c.confirmedSubject(b.reference_code);
    intro = c.confirmed;
    lines.push(
      row(c.labels.code, `<strong>${escapeHtml(b.reference_code)}</strong>`),
      row(c.labels.svc, escapeHtml(b.serviceTitle)),
      row(c.labels.date, escapeHtml(b.requested_date)),
      row(c.labels.time, escapeHtml(fmtTime(b.requested_time))),
      row(c.labels.people, String(b.persons_count)),
    );
    if (input.meetingPoint) lines.push(row(c.labels.meet, nl2br(input.meetingPoint)));
    if (input.whatToBring) lines.push(row(c.labels.bring, nl2br(input.whatToBring)));
    if (input.price) lines.push(row(c.labels.price, escapeHtml(input.price)));
  } else if (input.template === "declined") {
    subject = c.declinedSubject(b.reference_code);
    intro = c.declined;
    lines.push(row(c.labels.code, escapeHtml(b.reference_code)), row(c.labels.svc, escapeHtml(b.serviceTitle)));
    if (input.alternativeDate) lines.push(row(c.alt, escapeHtml(input.alternativeDate)));
  } else {
    subject = c.customSubject(b.reference_code);
    intro = "";
  }

  const table = lines.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">${lines.join("")}</table>`
    : "";

  const custom = input.customMessage
    ? `<div style="margin:18px 0 0 0;">${nl2br(input.customMessage)}</div>`
    : "";

  const inner = `<p style="margin:0 0 12px 0;">${escapeHtml(c.hi(b.customer_name))}</p>
${intro ? `<p style="margin:0 0 18px 0;">${escapeHtml(intro)}</p>` : ""}
${table}
${custom}
<p style="margin:22px 0 0 0;">${c.sign}</p>`;

  const footer = `${escapeHtml(contacts.email)} · ${escapeHtml(contacts.phone)}<br />${escapeHtml(
    contacts.siteUrl,
  )}`;

  const text = [
    c.hi(b.customer_name),
    intro,
    `${c.labels.code}: ${b.reference_code}`,
    `${c.labels.svc}: ${b.serviceTitle}`,
    input.template === "confirmed" ? `${c.labels.date}: ${b.requested_date} ${fmtTime(b.requested_time)}` : "",
    input.meetingPoint ? `${c.labels.meet}: ${input.meetingPoint}` : "",
    input.whatToBring ? `${c.labels.bring}: ${input.whatToBring}` : "",
    input.price ? `${c.labels.price}: ${input.price}` : "",
    input.alternativeDate ? `${c.alt}: ${input.alternativeDate}` : "",
    input.customMessage ?? "",
    "",
    "Ilze Gulbe",
    `${contacts.email} · ${contacts.phone}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html: shell(subject, inner, footer, contacts.siteUrl), text };
}
