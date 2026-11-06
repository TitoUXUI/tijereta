import { addMinutes, dayKey, formatTime } from "@/lib/format";
import { SLOT_STEP_MIN, freeSlots, isFree, itemsOf, upcomingDays } from "@/lib/scheduling";
import type { DemoState, WaitlistEntry } from "@/types";

export const OFFER_MINUTES = 15;

export interface FreeSlot {
  startsAt: string;
  professionalId: string;
  durationMin: number;
  /** "cancelled": se liberó un turno. "open": hueco que ya estaba libre. */
  reason: "cancelled" | "open";
}

/** Primer horario libre para ofrecer: un turno cancelado que sigue libre, o el primer hueco */
export function nextFreeSlot(state: DemoState, now: Date = new Date()): FreeSlot | null {
  const freed = state.appointments
    .filter((a) => a.status === "cancelled" && new Date(a.startsAt) > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .find((a) => {
      const duration = (new Date(a.endsAt).getTime() - new Date(a.startsAt).getTime()) / 60_000;
      return isFree(state, a.professionalId, a.startsAt, duration);
    });
  if (freed) {
    const duration = (new Date(freed.endsAt).getTime() - new Date(freed.startsAt).getTime()) / 60_000;
    const alreadyOffered = state.waitlist.some(
      (w) => w.status === "booked" && w.offer?.startsAt === freed.startsAt && w.offer.professionalId === freed.professionalId,
    );
    if (!alreadyOffered) {
      return { startsAt: freed.startsAt, professionalId: freed.professionalId, durationMin: duration, reason: "cancelled" };
    }
  }
  const days = upcomingDays(2, now);
  for (const day of days) {
    for (const pro of state.professionals.filter((p) => p.active)) {
      const slots = freeSlots(state, pro.id, day, SLOT_STEP_MIN * 2, undefined, now);
      if (slots[0]) {
        const [h, m] = slots[0].split(":").map(Number);
        const d = new Date(`${day}T00:00:00`);
        d.setHours(h, m, 0, 0);
        return { startsAt: d.toISOString(), professionalId: pro.id, durationMin: SLOT_STEP_MIN * 2, reason: "open" };
      }
    }
  }
  return null;
}

export function entryDurationMin(state: DemoState, entry: WaitlistEntry): number {
  const service = state.services.find((s) => s.id === entry.serviceId);
  return service?.baseDurationMin ?? 30;
}

/** ¿El horario libre le sirve a esta persona? Mismo día, dentro de su franja y que entre el servicio */
export function fitsSlot(state: DemoState, entry: WaitlistEntry, slot: FreeSlot): boolean {
  if (entry.preferredDay !== dayKey(slot.startsAt)) return false;
  const hhmm = formatTime(slot.startsAt);
  if (hhmm < entry.preferredFrom || hhmm > entry.preferredTo) return false;
  return entryDurationMin(state, entry) <= slot.durationMin;
}

/** La fila: en espera, ordenada (las que coinciden con el horario primero, después por orden de llegada) */
export function queueFor(state: DemoState, slot: FreeSlot | null): Array<{ entry: WaitlistEntry; fits: boolean }> {
  const waiting = state.waitlist.filter((w) => w.status === "waiting");
  const rows = waiting.map((entry) => ({ entry, fits: slot ? fitsSlot(state, entry, slot) : false }));
  return [...rows.filter((r) => r.fits), ...rows.filter((r) => !r.fits)];
}

export type OfferState = "pending" | "expired";

export function offerState(entry: WaitlistEntry, now: Date): OfferState {
  if (!entry.offer) return "expired";
  return new Date(entry.offer.expiresAt).getTime() > now.getTime() ? "pending" : "expired";
}

export function minutesLeft(entry: WaitlistEntry, now: Date): number {
  if (!entry.offer) return 0;
  // `now` se refresca cada tanto: nunca contar desde antes de que se hizo la oferta
  const from = Math.max(now.getTime(), new Date(entry.offer.offeredAt).getTime());
  return Math.max(0, Math.ceil((new Date(entry.offer.expiresAt).getTime() - from) / 60_000));
}

export function newOffer(slot: Pick<FreeSlot, "startsAt" | "professionalId">, now: Date = new Date()) {
  return {
    startsAt: slot.startsAt,
    professionalId: slot.professionalId,
    offeredAt: now.toISOString(),
    expiresAt: addMinutes(now.toISOString(), OFFER_MINUTES),
  };
}

export function totalItemsDuration(state: DemoState, appointmentId: string): number {
  return itemsOf(state, appointmentId).reduce((s, i) => s + i.durationMin, 0);
}
