/**
 * Почему письмо о брони не ушло — словами, понятными не-технику.
 *
 * В админке раньше показывалась строка notification_error как есть:
 * «RESEND_API_KEY missing | NOTIFICATION_FROM_EMAIL missing». Для клиента
 * это выглядит поломкой сайта, хотя бронь сохранена и ничего не потеряно.
 *
 * Сырой текст ошибки не показывается нигде в интерфейсе. Он остаётся в базе
 * и в `docker logs wanderlust-web` — то есть там, где им может
 * воспользоваться тот, кто чинит, а не тот, кто принимает брони.
 *
 * Все тексты на латышском: админкой пользуется только клиент.
 */

export interface NotificationProblem {
  /** Короткая подпись бейджа. */
  label: string;
  /** Подсказка при наведении: что произошло и что с этим делать. */
  hint: string;
}

const BADGE = "E-pasts nav nosūtīts";

const SAVED = "Rezervācija ir saglabāta — nekas nav pazaudēts.";

/**
 * Разбор идёт по подстрокам, которые складывает booking-notification.ts.
 * Там же и менять, если формулировки в обработчике изменятся.
 */
export function describeNotificationError(raw: string | null): NotificationProblem | null {
  if (!raw || !raw.trim()) return null;

  if (/RESEND_API_KEY missing|NOTIFICATION_FROM_EMAIL missing/.test(raw)) {
    return {
      label: BADGE,
      hint: `${SAVED} Automātiskā e-pasta sūtīšana vēl nav ieslēgta, tāpēc paziņojums netika nosūtīts. Sazinieties ar klientu pa e-pastu vai tālruni, kas redzams zemāk.`,
    };
  }

  if (/адреса администратора|ADMIN_NOTIFICATION_EMAIL/.test(raw)) {
    return {
      label: BADGE,
      hint: `${SAVED} Nav norādīta adrese, uz kuru sūtīt paziņojumus. Ievadiet to sadaļā «Iestatījumi» laukā «Rezervāciju paziņojumu e-pasts».`,
    };
  }

  if (/Resend \d{3}/.test(raw)) {
    return {
      label: BADGE,
      hint: `${SAVED} E-pasta serviss atteicās nosūtīt vēstuli. Sazinieties ar klientu pa e-pastu vai tālruni un pastāstiet par to izstrādātājam.`,
    };
  }

  return {
    label: BADGE,
    hint: `${SAVED} Paziņojuma vēstuli nosūtīt neizdevās. Sazinieties ar klientu pa e-pastu vai tālruni, kas redzams zemāk.`,
  };
}
