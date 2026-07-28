import { useTranslation } from "react-i18next";
import { Globe, Mail, MessageSquare, Phone, User } from "lucide-react";
import type { Service } from "@/hooks/use-services";
import type { Lang } from "@/lib/language";
import { BookingSummary } from "./BookingSummary";

type ContactPatch = {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  notes?: string;
};

export function StepContact({
  service,
  lang,
  name,
  email,
  phone,
  country,
  notes,
  accent,
  onChange,
}: {
  service: Service | null;
  lang: Lang;
  name: string;
  email: string;
  phone: string;
  country: string;
  notes: string;
  accent: string;
  onChange: (patch: ContactPatch) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="animate-fade-in space-y-6">
      {service && <BookingSummary service={service} lang={lang} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <IconField icon={<User className="h-4 w-4" />} accent={accent}>
          <input
            required
            type="text"
            placeholder={`${t("booking.name")} *`}
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={inputCls}
          />
        </IconField>
        <IconField icon={<Mail className="h-4 w-4" />} accent={accent}>
          <input
            required
            type="email"
            placeholder={`${t("booking.email")} *`}
            value={email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={inputCls}
          />
        </IconField>
        <IconField icon={<Phone className="h-4 w-4" />} accent={accent}>
          <input
            type="tel"
            placeholder={t("booking.phone")}
            value={phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className={inputCls}
          />
        </IconField>
        <IconField icon={<Globe className="h-4 w-4" />} accent={accent}>
          <input
            type="text"
            placeholder={t("booking.country")}
            value={country}
            onChange={(e) => onChange({ country: e.target.value })}
            className={inputCls}
          />
        </IconField>
        <div className="sm:col-span-2">
          <IconField icon={<MessageSquare className="h-4 w-4" />} accent={accent} align="start">
            <textarea
              value={notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder={t("booking.notes_placeholder")}
              rows={4}
              className={inputCls}
            />
          </IconField>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-transparent px-2 py-3 text-sm outline-none placeholder:text-ink-soft";

function IconField({
  icon,
  children,
  accent,
  align = "center",
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  accent: string;
  align?: "start" | "center";
}) {
  return (
    <div
      className={`flex ${align === "start" ? "items-start pt-3" : "items-center"} gap-2 rounded-[3px] border border-border bg-background px-4 transition-colors focus-within:border-foreground`}
    >
      <span style={{ color: accent }} className={align === "start" ? "mt-0.5" : ""}>
        {icon}
      </span>
      {children}
    </div>
  );
}
