"use client";

import Link from "next/link";
import { CalendarX2, Hourglass } from "lucide-react";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { NewAppointmentButton } from "@/components/appointments/new-appointment-button";
import { ShareBookingLink } from "@/components/appointments/share-booking-link";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { Button } from "@/components/ui/button";
import { dayKey, formatDayLong } from "@/lib/format";
import { openGaps } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";

export default function HoyPage() {
  const { state } = useDemo();
  const today = dayKey(new Date());
  const todays = state.appointments
    .filter((a) => dayKey(a.startsAt) === today && a.status !== "cancelled" && a.status !== "rescheduled")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const pendingCount = todays.filter((a) => a.status === "pending").length;
  const remaining = todays.filter((a) => a.status !== "done" && a.status !== "no_show").length;
  const gaps = state.professionals
    .filter((p) => p.active)
    .flatMap((p) => openGaps(state, p.id, today, 60).map((g) => ({ ...g, pro: p.name })));
  const waitingCount = state.waitlist.filter((w) => w.status === "waiting").length;

  return (
    <>
      <HeroBand tone="brand" eyebrow={formatDayLong(new Date().toISOString())} title={state.salon.name}>
        <p className="text-base">
          {todays.length === 0
            ? "Todavía no hay turnos para hoy."
            : `${remaining} ${remaining === 1 ? "turno por atender" : "turnos por atender"} de ${todays.length}${pendingCount ? ` · ${pendingCount} por confirmar` : ""}`}
        </p>
        <div className="mt-4 md:max-w-xs">
          <NewAppointmentButton />
        </div>
      </HeroBand>

      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <ShareBookingLink salon={state.salon} />

        <section aria-labelledby="hoy-turnos" className="flex flex-col gap-3">
          <h2 id="hoy-turnos" className="text-xl font-semibold">Turnos de hoy</h2>
          {todays.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              text="Todavía no cargaste turnos. Compartí tu link y empezá a recibirlos."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {todays.map((a) => (
                <li key={a.id}>
                  <AppointmentCard state={state} appointment={a} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="hoy-huecos" className="flex flex-col gap-3">
          <h2 id="hoy-huecos" className="text-xl font-semibold">Huecos libres de hoy</h2>
          {gaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quedan huecos de una hora o más.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {gaps.slice(0, 6).map((g) => (
                <li key={`${g.pro}-${g.from}`} className="flex min-h-touch items-center justify-between rounded-card border border-subtle bg-surface p-3">
                  <span className="text-base font-medium">{g.from} a {g.to}</span>
                  <span className="text-sm text-muted-foreground">{g.pro}</span>
                </li>
              ))}
            </ul>
          )}
          {waitingCount > 0 ? (
            <Button asChild variant="secondary" className="min-h-12 justify-start gap-2">
              <Link href="/espera">
                <Hourglass className="size-4" aria-hidden />
                {waitingCount} {waitingCount === 1 ? "persona espera" : "personas esperan"} un horario: ofrecerles un hueco
              </Link>
            </Button>
          ) : null}
        </section>
      </div>
    </>
  );
}
