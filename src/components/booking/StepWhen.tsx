import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, es, lv } from "date-fns/locale";
import { CalendarDays, Clock, Minus, Plus, Users } from "lucide-react";
import type { Service } from "@/hooks/use-services";
import type { Lang } from "@/lib/language";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BookingSummary } from "./BookingSummary";

const LOCALES = { en: enUS, es, lv } as const;

const SLOT_GROUPS = [
  { key: "morning", slots: gen(8, 12) },
  { key: "afternoon", slots: gen(12, 17) },
  { key: "evening", slots: gen(17, 20.5) },
] as const;

function gen(from: number, to: number) {
  const out: string[] = [];
  for (let t = from; t < to; t += 0.5) {
    const h = Math.floor(t);
    const m = t % 1 === 0 ? "00" : "30";
    out.push(`${String(h).padStart(2, "0")}:${m}`);
  }
  return out;
}

export function StepWhen({
  service,
  lang,
  date,
  time,
  persons,
  accent,
  onChange,
}: {
  service: Service | null;
  lang: Lang;
  date: string;
  time: string;
  persons: number;
  accent: string;
  onChange: (patch: { date?: string; time?: string; persons?: number }) => void;
}) {
  const { t } = useTranslation();
  const locale = LOCALES[lang];
  const selectedDate = date ? new Date(date) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="animate-fade-in space-y-6">
      {service && <BookingSummary service={service} lang={lang} />}

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <CalendarDays className="h-4 w-4" style={{ color: accent }} /> {t("booking.date")}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left text-sm outline-none transition-colors hover:border-ink-soft focus:border-foreground",
                !selectedDate && "text-ink-soft",
              )}
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-ink-muted" />
                {selectedDate ? format(selectedDate, "PPP", { locale }) : t("booking.pick_date")}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="pointer-events-auto w-auto rounded-2xl border-border bg-popover p-0 shadow-editorial"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => onChange({ date: d ? format(d, "yyyy-MM-dd") : "" })}
              disabled={{ before: today }}
              locale={locale}
              weekStartsOn={1}
              showOutsideDays
              captionLayout="dropdown"
              initialFocus
              className="pointer-events-auto p-4 [--cell-size:2.25rem]"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Clock className="h-4 w-4" style={{ color: accent }} /> {t("booking.time")}
        </label>
        <div className="space-y-4">
          {SLOT_GROUPS.map((g) => (
            <div key={g.key}>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                {t(`booking.${g.key}`)}
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {g.slots.map((slot) => {
                  const active = time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => onChange({ time: slot })}
                      className={cn(
                        "rounded-full border px-2 py-1.5 text-sm font-medium transition-all",
                        active
                          ? "border-transparent text-paper shadow-sm"
                          : "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-ink-soft",
                      )}
                      style={active ? { backgroundColor: accent } : undefined}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Users className="h-4 w-4" style={{ color: accent }} /> {t("booking.persons")}
        </label>
        <div className="inline-flex items-center gap-4 rounded-full border border-border bg-background px-2 py-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange({ persons: Math.max(1, persons - 1) })}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[2rem] text-center font-display text-2xl leading-none">{persons}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange({ persons: persons + 1 })}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
