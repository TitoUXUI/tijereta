import { addMinutes, dayKey, toISO } from "@/lib/format";
import type {
  Appointment,
  AppointmentItem,
  DemoState,
  Professional,
  Service,
  ServiceSelection,
  ServiceVariant,
} from "@/types";

export const SLOT_STEP_MIN = 30;

const ACTIVE_STATUSES: ReadonlyArray<Appointment["status"]> = [
  "pending",
  "confirmed",
  "arrived",
  "done",
];

export interface SelectionTotals {
  durationMin: number;
  price: number;
  depositAmount: number;
}

export function totalsFor(
  selections: ServiceSelection[],
  services: Service[],
  variants: ServiceVariant[],
): SelectionTotals {
  let durationMin = 0;
  let price = 0;
  let depositAmount = 0;
  for (const sel of selections) {
    const service = services.find((s) => s.id === sel.serviceId);
    if (!service) continue;
    const variant = variants.find((v) => v.id === sel.variantId);
    const linePrice = service.price + (variant?.extraPrice ?? 0);
    durationMin += service.baseDurationMin + (variant?.extraDurationMin ?? 0);
    price += linePrice;
    if (service.requiresDeposit) {
      depositAmount += Math.round((linePrice * service.depositPercent) / 100);
    }
  }
  return { durationMin, price, depositAmount };
}

export function itemsOf(state: DemoState, appointmentId: string): AppointmentItem[] {
  return state.items.filter((i) => i.appointmentId === appointmentId);
}

export function appointmentTotal(state: DemoState, appointmentId: string): number {
  return itemsOf(state, appointmentId).reduce((sum, i) => sum + i.price, 0);
}

export function serviceNames(state: DemoState, appointmentId: string): string {
  return itemsOf(state, appointmentId)
    .map((i) => {
      const service = state.services.find((s) => s.id === i.serviceId);
      const variant = state.variants.find((v) => v.id === i.variantId);
      if (!service) return "";
      return variant ? `${service.name} (${variant.name.toLowerCase()})` : service.name;
    })
    .filter(Boolean)
    .join(" + ");
}

/** El turno ocupa su hueco hasta que termina, más la demora acumulada */
function busyRange(a: Appointment): [number, number] {
  const start = new Date(a.startsAt).getTime();
  const end = new Date(addMinutes(a.endsAt, a.delayMinutes)).getTime();
  return [start, end];
}

export function isFree(
  state: DemoState,
  professionalId: string,
  startIso: string,
  durationMin: number,
  ignoreAppointmentId?: string,
): boolean {
  const start = new Date(startIso).getTime();
  const end = start + durationMin * 60_000;
  return !state.appointments.some((a) => {
    if (a.professionalId !== professionalId) return false;
    if (a.id === ignoreAppointmentId) return false;
    if (!ACTIVE_STATUSES.includes(a.status)) return false;
    const [bs, be] = busyRange(a);
    return start < be && end > bs;
  });
}

/** Horarios libres ("HH:MM") de un profesional en un día para una duración dada */
export function freeSlots(
  state: DemoState,
  professionalId: string,
  day: string,
  durationMin: number,
  ignoreAppointmentId?: string,
  now: Date = new Date(),
): string[] {
  const { openHour, closeHour } = state.salon;
  const slots: string[] = [];
  const closeAt = new Date(toISO(day, `${String(closeHour).padStart(2, "0")}:00`)).getTime();
  for (let min = openHour * 60; min < closeHour * 60; min += SLOT_STEP_MIN) {
    const hhmm = `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
    const iso = toISO(day, hhmm);
    const start = new Date(iso).getTime();
    if (start < now.getTime()) continue;
    if (start + durationMin * 60_000 > closeAt) continue;
    if (isFree(state, professionalId, iso, durationMin, ignoreAppointmentId)) {
      slots.push(hhmm);
    }
  }
  return slots;
}

/** Hay tantos huecos como horarios libres: sirve para elegir "cualquier profesional" */
export function firstAvailableProfessional(
  state: DemoState,
  day: string,
  hhmm: string,
  durationMin: number,
  ignoreAppointmentId?: string,
): Professional | undefined {
  const iso = toISO(day, hhmm);
  return state.professionals.find(
    (p) => p.active && isFree(state, p.id, iso, durationMin, ignoreAppointmentId),
  );
}

export function slotsForAny(
  state: DemoState,
  day: string,
  durationMin: number,
  ignoreAppointmentId?: string,
): string[] {
  const all = new Set<string>();
  for (const p of state.professionals.filter((x) => x.active)) {
    for (const s of freeSlots(state, p.id, day, durationMin, ignoreAppointmentId)) {
      all.add(s);
    }
  }
  return Array.from(all).sort();
}

export function upcomingDays(count: number, from: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    return dayKey(d);
  });
}

/** Huecos libres de hoy de un profesional, en bloques contiguos de al menos `minMin` */
export function openGaps(
  state: DemoState,
  professionalId: string,
  day: string,
  minMin: number,
): Array<{ from: string; to: string }> {
  const slots = freeSlots(state, professionalId, day, SLOT_STEP_MIN);
  const gaps: Array<{ from: string; to: string }> = [];
  let runStart: string | null = null;
  let prevMin = -1;
  const toMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
  const fmt = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const close = () => {
    if (runStart !== null && prevMin + SLOT_STEP_MIN - toMin(runStart) >= minMin) {
      gaps.push({ from: runStart, to: fmt(prevMin + SLOT_STEP_MIN) });
    }
  };
  for (const s of slots) {
    const m = toMin(s);
    if (runStart === null || m !== prevMin + SLOT_STEP_MIN) {
      close();
      runStart = s;
    }
    prevMin = m;
  }
  close();
  return gaps;
}
