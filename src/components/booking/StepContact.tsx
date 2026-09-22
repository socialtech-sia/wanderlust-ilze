import { useTranslation } from "react-i18next";
import { Globe, Mail, MessageSquare, User } from "lucide-react";
import type { Service } from "@/hooks/use-services";
import type { Lang } from "@/lib/language";
import { PhoneField } from "@/components/common/PhoneField";
import type { PhoneErrorCode, PhoneParts } from "@/lib/phone";
import { BookingSummary } from "./BookingSummary";

type ContactPatch = {
  name?: string;
  email?: string;
  phone?: PhoneParts;
  country?: string;
  notes?: string;
};

export function StepContact({
  service,
  lang,
  name,
  email,
  phone,
  phoneError,
  country,
  notes,
  accent,
  onChange,
}: {
  service: Service | null;
  lang: Lang;
  name: string;
  email: string;
  phone: PhoneParts;
  phoneError: PhoneErrorCode | null;
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
            data-testid="booking-name"
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
            data-testid="booking-email"
            placeholder={`${t("booking.email")} *`}
            value={email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={inputCls}
          />
        </IconField>
        {/* Телефон обязателен: без него клиент не может перезвонить, а именно
            звонком и подтверждается бронь. Код страны выбирается из списка,
            поэтому номер без кода отправить нельзя в принципе. */}
        <PhoneField
          lang={lang}
          value={phone}
          onChange={(next) => onChange({ phone: next })}
          error={phoneError}
          required
          accent={accent}
          id="booking-phone"
        />
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
      className={`flex ${align === "start" ? "items-start pt-3" : "items-center"} gap-2 rounded-md border border-border bg-background px-4 transition-colors focus-within:border-foreground`}
    >
      <span style={{ color: accent }} className={align === "start" ? "mt-0.5" : ""}>
        {icon}
      </span>
      {children}
    </div>
  );
}
