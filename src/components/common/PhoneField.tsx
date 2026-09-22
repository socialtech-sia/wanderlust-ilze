import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown, Phone } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/language";
import {
  DIAL_CODES,
  countryName,
  dialForIso2,
  flagForIso2,
  splitFullNumber,
  type PhoneErrorCode,
  type PhoneParts,
} from "@/lib/phone";

/**
 * Поле телефона: код страны из списка + номер отдельно.
 *
 * Почему список, а не одно поле с «введите с кодом страны»: просьбу в
 * подсказке посетители не выполняют. Клиент получал номера вида «29299354»
 * и не мог перезвонить иностранцу — и наоборот, не мог понять, латвийский
 * ли это номер. Выбор из списка не даёт отправить номер без кода вовсе.
 *
 * Список ищется по названию страны на языке интерфейса, по коду ISO и по
 * самому телефонному коду: «Latvija», «LV» и «371» ведут в одно место.
 */
export function PhoneField({
  lang,
  value,
  onChange,
  error,
  required,
  accent,
  id = "phone",
  className,
}: {
  lang: Lang;
  value: PhoneParts;
  onChange: (next: PhoneParts) => void;
  /** Код ошибки; текст берётся из i18n, то есть на языке интерфейса. */
  error?: PhoneErrorCode | null;
  required?: boolean;
  accent?: string;
  id?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const numberRef = useRef<HTMLInputElement>(null);

  // Названия стран на текущем языке считаются один раз: Intl.DisplayNames на
  // каждый символ поиска и на каждую из ~230 строк заметно дороже.
  const countries = useMemo(
    () =>
      DIAL_CODES.map(([iso2, dial]) => ({
        iso2,
        dial,
        flag: flagForIso2(iso2),
        name: countryName(iso2, lang),
      })).sort((a, b) => a.name.localeCompare(b.name, lang)),
    [lang],
  );

  const current = countries.find((c) => c.iso2 === value.iso2) ?? countries[0];
  const errorId = `${id}-error`;

  /** Вставленный целиком номер с кодом страны сам переезжает в селектор. */
  function handleNumber(raw: string) {
    const parsed = splitFullNumber(raw);
    if (parsed) onChange(parsed);
    else onChange({ ...value, national: raw });
  }

  return (
    <div className={className}>
      <div
        className={cn(
          "flex items-center gap-1 rounded-md border bg-background transition-colors focus-within:border-foreground",
          error ? "border-destructive" : "border-border",
        )}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              data-testid={`${id}-country`}
              aria-expanded={open}
              aria-label={t("phone.country_code")}
              className="flex shrink-0 items-center gap-1.5 rounded-l-md py-3 pl-4 pr-2 text-sm outline-none hover:bg-paper-alt/60 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden className="text-base leading-none">
                {current.flag}
              </span>
              <span className="tabular-nums">+{current.dial}</span>
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(20rem,calc(100vw-2rem))] p-0">
            <Command
              filter={(itemValue, search) =>
                itemValue.toLowerCase().includes(search.toLowerCase().trim()) ? 1 : 0
              }
            >
              <CommandInput placeholder={t("phone.search_country")} />
              <CommandList>
                <CommandEmpty>{t("phone.no_country")}</CommandEmpty>
                <CommandGroup>
                  {countries.map((c) => (
                    <CommandItem
                      // Значение для поиска: название, код страны и телефонный код.
                      key={`${c.iso2}-${c.dial}`}
                      value={`${c.name} ${c.iso2} +${c.dial} ${c.dial}`}
                      onSelect={() => {
                        onChange({ ...value, iso2: c.iso2 });
                        setOpen(false);
                        numberRef.current?.focus();
                      }}
                    >
                      <span aria-hidden className="mr-2 text-base leading-none">
                        {c.flag}
                      </span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="ml-2 tabular-nums text-muted-foreground">+{c.dial}</span>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          c.iso2 === current.iso2 ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
        <Phone className="h-4 w-4 shrink-0" style={accent ? { color: accent } : undefined} aria-hidden />

        <input
          ref={numberRef}
          id={id}
          data-testid={`${id}-number`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder={`${t("phone.number")}${required ? " *" : ""}`}
          value={value.national}
          onChange={(e) => handleNumber(e.target.value)}
          className="w-full min-w-0 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-ink-soft"
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive">
          {t(`phone.err_${error}`)}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-ink-muted">
          {t("phone.hint", { dial: `+${dialForIso2(value.iso2)}` })}
        </p>
      )}
    </div>
  );
}
