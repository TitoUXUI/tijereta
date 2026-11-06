"use client";

import { useMemo, useState } from "react";
import { QuickBookingSheet } from "@/components/appointments/quick-booking-sheet";
import { AppointmentDetailSheet } from "@/components/appointments/appointment-detail-sheet";
import { DayStrip } from "@/components/booking/slot-picker";
import { addMinutes, dayKey, formatTime } from "@/lib/format";
import { upcomingDays } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import type { Professional } from "@/types";

const ROW_MIN = 30;
const ROW_HEIGHT_CLASS = "grid-rows-[repeat(22,3rem)]";

const CAT_BG: Record<Professional["colorIndex"], string> = {
  1: "bg-cat-1",
  2: "bg-cat-2",
  3: "bg-cat-3",
  4: "bg-cat-4",
  5: "bg-cat-5",
  6: "bg-cat-6",
};

function minutesOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

interface TeamAgendaProps {
  /** Si se pasa, solo se muestra la agenda de esa profesional (P-20) */
  onlyProfessionalId?: string;
  allowAddService?: boolean;
}

/** Agenda única: una columna por profesional, bloques de color por turno */
export function TeamAgenda({ onlyProfessionalId, allowAddService = false }: TeamAgendaProps) {
  const { state } = useDemo();
  const days = useMemo(() => upcomingDays(7), []);
  const [day, setDay] = useState(days[0]);
  const [selected, setSelected] = useState<string | null>(null);
  const [quick, setQuick] = useState<{ professionalId: string; slot: string } | null>(null);

  const { openHour, closeHour } = state.salon;
  const rows = ((closeHour - openHour) * 60) / ROW_MIN;
  const pros = state.professionals.filter((p) => p.active && (!onlyProfessionalId || p.id === onlyProfessionalId));
  const hours = Array.from({ length: closeHour - openHour }, (_, i) => openHour + i);

  function rowOf(iso: string): number {
    return Math.floor((minutesOfDay(iso) - openHour * 60) / ROW_MIN) + 1;
  }

  return (
    <div className="flex flex-col gap-4">
      <DayStrip days={days} day={day} onDayChange={setDay} />
      <div className="overflow-x-auto rounded-card border border-subtle bg-surface">
        <div className="flex min-w-max">
          <div className="sticky left-0 z-20 w-12 shrink-0 bg-surface">
            <div className="h-10 border-b border-subtle" />
            <div className={cn("grid", ROW_HEIGHT_CLASS)}>
              {hours.map((h) => (
                <div key={h} className="row-span-2 -mt-2 pr-2 text-right text-xs text-muted-foreground">
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>
          {pros.map((pro) => {
            const appts = state.appointments.filter(
              (a) =>
                a.professionalId === pro.id &&
                dayKey(a.startsAt) === day &&
                a.status !== "cancelled" &&
                a.status !== "rescheduled",
            );
            return (
              <div key={pro.id} className="w-44 shrink-0 border-l border-subtle md:w-56 md:flex-1">
                <div className="flex h-10 items-center justify-center gap-2 border-b border-subtle text-sm font-semibold">
                  <span className={cn("size-3 rounded-full", CAT_BG[pro.colorIndex])} aria-hidden />
                  {pro.name}
                </div>
                <div className={cn("relative grid", ROW_HEIGHT_CLASS)}>
                  {Array.from({ length: rows }, (_, i) => {
                    const min = openHour * 60 + i * ROW_MIN;
                    const hhmm = `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
                    return (
                      <button
                        key={hhmm}
                        type="button"
                        aria-label={`Cargar turno con ${pro.name} a las ${hhmm}`}
                        onClick={() => setQuick({ professionalId: pro.id, slot: hhmm })}
                        className={cn(
                          "border-t border-subtle/60 text-xs text-transparent transition-colors duration-base ease-out hover:bg-accent hover:text-accent-foreground",
                          `row-start-${i + 1} row-end-${i + 2}`,
                        )}
                      >
                        +
                      </button>
                    );
                  })}
                  {appts.map((a) => {
                    const client = state.clients.find((c) => c.id === a.clientId);
                    const start = rowOf(a.startsAt);
                    const endIso = addMinutes(a.endsAt, a.delayMinutes);
                    const end = Math.min(rows + 1, Math.max(start + 1, Math.ceil((minutesOfDay(endIso) - openHour * 60) / ROW_MIN) + 1));
                    if (start < 1 || start > rows) return null;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelected(a.id)}
                        className={cn(
                          "z-10 m-0.5 overflow-hidden rounded-tag p-2 text-left text-cat-fg transition-opacity duration-base ease-out hover:opacity-90",
                          CAT_BG[pro.colorIndex],
                          a.status === "done" && "opacity-60",
                          a.status === "pending" && "border-2 border-dashed border-strong",
                          `row-start-${start} row-end-${end}`,
                        )}
                      >
                        <span className="block truncate text-sm font-bold">{client?.name}</span>
                        <span className="block text-xs">
                          {formatTime(a.startsAt)}
                          {a.delayMinutes > 0 ? ` · +${a.delayMinutes} min` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AppointmentDetailSheet appointmentId={selected} onClose={() => setSelected(null)} allowAddService={allowAddService} />
      <QuickBookingSheet
        open={quick !== null}
        onOpenChange={(o) => !o && setQuick(null)}
        initialProfessionalId={quick?.professionalId}
        initialDay={day}
        initialSlot={quick?.slot}
      />
    </div>
  );
}
