import { formatDayLong, formatTime, firstName } from "@/lib/format";
import type { Appointment, Client, DemoState, MessageKind, Reminder } from "@/types";

/**
 * WhatsApp SIMULADO: nunca se envía nada. Se arma el texto, se guarda en
 * `reminders` y se muestra en pantalla para que la persona lo copie y lo pegue a mano.
 */

export function bookingLinkUrl(slug: string): string {
  const origin = typeof window === "undefined" ? "https://tijereta.app" : window.location.origin;
  return `${origin}/reservar/${slug}`;
}

export function manageUrl(token: string): string {
  const origin = typeof window === "undefined" ? "https://tijereta.app" : window.location.origin;
  return `${origin}/turno/${token}`;
}

export function messageFor(
  kind: MessageKind,
  ctx: {
    salonName: string;
    slug: string;
    client?: Client;
    appointment?: Appointment;
    slotLabel?: string;
    delayMinutes?: number;
  },
): string {
  const hello = ctx.client ? `¡Hola ${firstName(ctx.client.name)}!` : "¡Hola!";
  switch (kind) {
    case "booking_link":
      return `${hello} Podés reservar tu turno en ${ctx.salonName} cuando quieras, sin registrarte: ${bookingLinkUrl(ctx.slug)}`;
    case "offer_slot":
      return `${hello} Se nos liberó un horario${ctx.slotLabel ? `: ${ctx.slotLabel}` : ""}. ¿Lo querés? Si te sirve, respondé "sí" y te lo dejamos reservado.`;
    case "late_notice":
      return `${hello} Te aviso que estamos con una demora de ${ctx.delayMinutes ?? 15} minutos. Perdón por el cambio, te esperamos con tu turno de ${ctx.appointment ? formatTime(ctx.appointment.startsAt) : "hoy"}.`;
    case "confirm":
      return `${hello} Tu turno en ${ctx.salonName} quedó confirmado para el ${ctx.appointment ? `${formatDayLong(ctx.appointment.startsAt)} a las ${formatTime(ctx.appointment.startsAt)}` : "día acordado"}. Si necesitás cambiarlo: ${ctx.appointment ? manageUrl(ctx.appointment.manageToken) : ""}`;
    case "reschedule":
      return `${hello} Tu turno se reprogramó para el ${ctx.appointment ? `${formatDayLong(ctx.appointment.startsAt)} a las ${formatTime(ctx.appointment.startsAt)}` : "nuevo horario"}. ¡Te esperamos!`;
  }
}

export function buildReminder(
  state: DemoState,
  kind: MessageKind,
  appointment: Appointment | null,
  client: Client,
  slotLabel?: string,
): Reminder {
  return {
    id: `rem-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    salonId: state.salon.id,
    appointmentId: appointment?.id ?? null,
    kind,
    toPhone: client.phone,
    createdAt: new Date().toISOString(),
    message: messageFor(kind, {
      salonName: state.salon.name,
      slug: state.salon.slug,
      client,
      appointment: appointment ?? undefined,
      slotLabel,
      delayMinutes: appointment?.delayMinutes,
    }),
  };
}
