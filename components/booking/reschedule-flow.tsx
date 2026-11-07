"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Loader2, SearchX } from "lucide-react";
import { toast } from "sonner";
import { PolicyNotice } from "@/components/booking/policy-notice";
import { SlotPicker } from "@/components/booking/slot-picker";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { Button } from "@/components/ui/button";
import { formatDayLong, formatTime, toISO } from "@/lib/format";
import { freeSlots, itemsOf, serviceNames, upcomingDays } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";

export function RescheduleFlow({ token }: { token: string }) {
  const { state, ready, rescheduleAppointment } = useDemo();
  const router = useRouter();
  const days = useMemo(() => upcomingDays(10), []);
  const [day, setDay] = useState(days[0]);
  const [slot, setSlot] = useState<string | null>(null);

  const appointment = state.appointments.find((a) => a.manageToken === token);
  const durationMin = appointment ? itemsOf(state, appointment.id).reduce((s, i) => s + i.durationMin, 0) : 0;
  const slots = useMemo(
    () => (appointment ? freeSlots(state, appointment.professionalId, day, durationMin, appointment.id) : []),
    [state, appointment, day, durationMin],
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Cargando" />
      </div>
    );
  }
  if (!appointment) {
    return (
      <div className="mx-auto max-w-md p-4 pt-16">
        <EmptyState icon={SearchX} text="No encontramos este turno. Revisá que el link esté completo." />
      </div>
    );
  }

  const pro = state.professionals.find((p) => p.id === appointment.professionalId);

  return (
    <main className="min-h-screen">
      <HeroBand tone="highlight" contained eyebrow={state.salon.name} title="Elegí un nuevo horario" />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 md:py-10">
        <Link href={`/turno/${token}`} className="flex min-h-touch items-center gap-1 self-start text-sm font-medium text-link">
          <ArrowLeft className="size-4" aria-hidden />Volver a mi turno
        </Link>
        <p className="rounded-card bg-sunken p-3 text-sm">
          Ahora: <span className="font-semibold">{formatDayLong(appointment.startsAt)}, {formatTime(appointment.startsAt)} hs</span> con {pro?.name} · {serviceNames(state, appointment.id)}
        </p>
        <SlotPicker days={days} day={day} onDayChange={(d) => { setDay(d); setSlot(null); }} slots={slots} slot={slot} onSlotChange={setSlot} />
        <PolicyNotice cancelHoursBefore={state.salon.cancelHoursBefore} />
        <Button type="button" className="h-14 text-base font-semibold" disabled={!slot} onClick={() => {
          if (!slot) return;
          rescheduleAppointment(appointment.id, toISO(day, slot), appointment.professionalId);
          toast.success(`Listo, tu turno pasó al ${formatDayLong(toISO(day, slot))} a las ${slot}`);
          router.push(`/turno/${token}`);
        }}>
          Confirmar nuevo horario
        </Button>
      </div>
    </main>
  );
}
