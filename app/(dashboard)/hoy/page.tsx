"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarX2, Hourglass } from "lucide-react";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { DelayBanner } from "@/components/appointments/delay-banner";
import { NewAppointmentButton } from "@/components/appointments/new-appointment-button";
import { ShareBookingLink } from "@/components/appointments/share-booking-link";
import { TeamAgenda } from "@/components/appointments/team-agenda";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { Button } from "@/components/ui/button";
import { Tabs, TabsItem } from "@/components/ui/tabs";
import { dayKey, formatDayLong } from "@/lib/format";
import { openGaps } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";

const VIEW_KEY = "tijereta-hoy-view";

export default function HoyPage() {
  const { state } = useDemo();
  const [view, setView] = useState(0);

  useEffect(() => {
    try {
      setView(window.localStorage.getItem(VIEW_KEY) === "timeline" ? 1 : 0);
    } catch {
      // Sin localStorage, arranca en lista.
    }
  }, []);

  function changeView(index: number) {
    setView(index);
    try {
      window.localStorage.setItem(VIEW_KEY, index === 1 ? "timeline" : "list");
    } catch {
      // Ignorado: la vista elegida solo es una comodidad.
    }
  }

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
      <HeroBand
        tone="brand"
        eyebrow={formatDayLong(new Date().toISOString())}
        title={state.salon.name}
        actions={<NewAppointmentButton className="h-14 w-full gap-2 text-base font-semibold md:w-auto md:px-8" />}
      >
        <p className="text-base md:text-lg">
          {todays.length === 0
            ? "Todavía no hay turnos para hoy."
            : `${remaining} ${remaining === 1 ? "turno por atender" : "turnos por atender"} de ${todays.length}${pendingCount ? ` · ${pendingCount} por confirmar` : ""}`}
        </p>
      </HeroBand>

      <div className="flex flex-col gap-6 px-4 py-6 md:px-10 md:py-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="hidden text-xl font-semibold lg:block">{view === 0 ? "Turnos de hoy" : "El día por profesional"}</h2>
          <Tabs selectedIndex={view} onSelect={changeView} aria-label="Cómo ver el día" className="w-full lg:w-72">
            <TabsItem index={0} label="Lista" />
            <TabsItem index={1} label="Línea de tiempo" />
          </Tabs>
        </div>

        {view === 0 ? (
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-x-10 lg:gap-y-6">
            <div className="lg:col-start-2 lg:row-start-1">
              <ShareBookingLink salon={state.salon} />
            </div>

            <section aria-labelledby="hoy-turnos" className="flex flex-col gap-3 lg:col-start-1 lg:row-span-3 lg:row-start-1">
              <h2 id="hoy-turnos" className="text-xl font-semibold lg:sr-only">Turnos de hoy</h2>
              {todays.length === 0 ? (
                <EmptyState icon={CalendarX2} text="Todavía no cargaste turnos. Compartí tu link y empezá a recibirlos." />
              ) : (
                <ul className="divide-y divide-border">
                  {todays.map((a) => (
                    <li key={a.id}>
                      <AppointmentCard state={state} appointment={a} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="hoy-huecos" className="flex flex-col gap-3 lg:col-start-2">
              <h2 id="hoy-huecos" className="text-xl font-semibold">Huecos libres de hoy</h2>
              {gaps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No quedan huecos de una hora o más.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {gaps.slice(0, 6).map((g) => (
                    <li key={`${g.pro}-${g.from}`} className="flex min-h-touch items-center justify-between rounded-control border border-dashed border-input p-3">
                      <span className="text-base font-medium">{g.from} a {g.to}</span>
                      <span className="text-sm text-muted-foreground">{g.pro}</span>
                    </li>
                  ))}
                </ul>
              )}
              {waitingCount > 0 ? (
                <Button asChild variant="secondary" className="h-12 justify-start" leadingIcon={Hourglass}>
                  <Link href="/espera">
                    Lista de espera · {waitingCount} {waitingCount === 1 ? "persona" : "personas"}
                  </Link>
                </Button>
              ) : null}
            </section>
          </div>
        ) : (
          <>
            <DelayBanner />
            <TeamAgenda fixedDay={today} />
          </>
        )}
      </div>
    </>
  );
}
