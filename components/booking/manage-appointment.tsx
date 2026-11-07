"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, CalendarX2, Loader2, SearchX } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/appointments/status-badge";
import { DepositNotice, PolicyNotice } from "@/components/booking/policy-notice";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatARS, formatDayLong, formatDuration, formatTime } from "@/lib/format";
import { appointmentTotal, itemsOf, serviceNames } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";

export function ManageAppointment({ token }: { token: string }) {
  const { state, ready, cancelAppointment } = useDemo();
  const [confirming, setConfirming] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Cargando" />
      </div>
    );
  }

  const appointment = state.appointments.find((a) => a.manageToken === token);
  if (!appointment) {
    return (
      <div className="mx-auto max-w-md p-4 pt-16">
        <EmptyState icon={SearchX} text="No encontramos este turno. Revisá que el link esté completo." />
      </div>
    );
  }

  const pro = state.professionals.find((p) => p.id === appointment.professionalId);
  const client = state.clients.find((c) => c.id === appointment.clientId);
  const durationMin = itemsOf(state, appointment.id).reduce((s, i) => s + i.durationMin, 0);
  const closed = appointment.status === "cancelled" || appointment.status === "done" || appointment.status === "no_show";
  const hoursLeft = (new Date(appointment.startsAt).getTime() - Date.now()) / 3_600_000;
  const lateForFreeChange = hoursLeft < state.salon.cancelHoursBefore;

  return (
    <main className="min-h-screen">
      <HeroBand tone="highlight" contained eyebrow={state.salon.name} title={appointment.status === "cancelled" ? "Turno cancelado" : "Tu turno"} />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 md:py-10">
        <div className="rounded-card border border-subtle bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{formatDayLong(appointment.startsAt)}</p>
              <p className="text-2xl font-bold">{formatTime(appointment.startsAt)} hs</p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">A nombre de</dt><dd className="font-medium">{client?.name}</dd>
            <dt className="text-muted-foreground">Con</dt><dd className="font-medium">{pro?.name}</dd>
            <dt className="text-muted-foreground">Servicios</dt><dd className="font-medium">{serviceNames(state, appointment.id)}</dd>
            <dt className="text-muted-foreground">Duración</dt><dd className="font-medium">{formatDuration(durationMin)}</dd>
            <dt className="text-muted-foreground">Total</dt><dd className="font-medium">{formatARS(appointmentTotal(state, appointment.id))}</dd>
          </dl>
        </div>

        {appointment.depositPaid > 0 ? (
          <DepositNotice amount={appointment.depositPaid} />
        ) : null}
        <PolicyNotice cancelHoursBefore={state.salon.cancelHoursBefore} />

        {closed ? (
          <Button asChild className="h-14 text-base font-semibold">
            <Link href={`/reservar/${state.salon.slug}`}>Reservar otro turno</Link>
          </Button>
        ) : (
          <>
            {lateForFreeChange ? (
              <p className="text-sm text-muted-foreground">Falta poco para tu turno. Si necesitás cambiarlo, escribinos por el chat y lo vemos juntos.</p>
            ) : null}
            <div className="flex flex-col gap-3 md:flex-row md:[&>*]:flex-1">
              <Button asChild leadingIcon={CalendarClock} className="h-14 text-base font-semibold">
                            <Link href={`/turno/${token}/reagendar`}>Reprogramar</Link>
                          </Button>
                          <Button leadingIcon={CalendarX2} type="button" variant="secondary" className="h-12 gap-2" onClick={() => setConfirming(true)}>
                            Cancelar turno
                          </Button>
            </div>
          </>
        )}
      </div>

      <Sheet open={confirming} onOpenChange={setConfirming}>
        <SheetContent side="bottom" className="rounded-t-sheet md:mx-auto md:max-w-md">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl font-semibold">¿Querés cancelar tu turno?</SheetTitle>
            <SheetDescription>
              Sin problema, liberamos el horario para otra persona. Si preferís, podés reprogramarlo y elegir un día que te quede mejor.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="mt-4 flex-col gap-2 sm:flex-col">
            <Button asChild className="h-14 text-base font-semibold">
              <Link href={`/turno/${token}/reagendar`}>Mejor lo reprogramo</Link>
            </Button>
            <Button type="button" variant="secondary" className="h-12" onClick={() => { cancelAppointment(appointment.id); setConfirming(false); toast.success("Turno cancelado. ¡Gracias por avisar!"); }}>
              Sí, cancelar turno
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
}
