"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatDayShort } from "@/lib/format";

interface SlotPickerProps {
  days: string[];
  day: string;
  onDayChange: (day: string) => void;
  slots: string[];
  slot: string | null;
  onSlotChange: (slot: string) => void;
  emptyHint?: string;
  /** Reemplaza el aviso simple cuando no hay horarios (ej. estado vacío con acciones) */
  emptySlot?: ReactNode;
}

function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

interface DayStripProps {
  days: string[];
  day: string;
  onDayChange: (day: string) => void;
}

export function DayStrip({ days, day, onDayChange }: DayStripProps) {
  return (
    <div role="group" aria-label="Día" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {days.map((d) => {
        const date = parseDay(d);
        const active = d === day;
        return (
          <button
            key={d}
            type="button"
            aria-pressed={active}
            onClick={() => onDayChange(d)}
            className={cn(
              "flex min-h-16 min-w-14 shrink-0 flex-col items-center justify-center rounded-card border text-sm transition-colors duration-base ease-out",
              active
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-subtle bg-surface text-foreground",
            )}
          >
            <span className="text-xs capitalize">{formatDayShort(date)}</span>
            <span className="text-lg font-bold">{date.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Tira de días + horarios libres */
export function SlotPicker({ days, day, onDayChange, slots, slot, onSlotChange, emptyHint, emptySlot }: SlotPickerProps) {
  return (
    <div className="flex flex-col gap-4">
      <DayStrip days={days} day={day} onDayChange={onDayChange} />
      {slots.length === 0 && emptySlot ? (
        emptySlot
      ) : slots.length === 0 ? (
        <p className="rounded-card bg-sunken p-4 text-sm text-muted-foreground">
          {emptyHint ?? "No quedan horarios libres este día. Probá con otro día."}
        </p>
      ) : (
        <div role="group" aria-label="Horario" className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {slots.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === slot}
              onClick={() => onSlotChange(s)}
              className={cn(
                "min-h-12 rounded-control border text-base font-medium transition-colors duration-base ease-out",
                s === slot
                  ? "border-transparent bg-brand text-brand-foreground"
                  : "border-input bg-surface text-foreground hover:bg-sunken",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
