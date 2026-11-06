"use client";

import { useMemo, useState } from "react";
import { Hourglass, MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { PreparedMessageSheet } from "@/components/appointments/prepared-message-dialog";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DayStrip } from "@/components/booking/slot-picker";
import { formatDayLong, toISO } from "@/lib/format";
import { freeSlots, totalsFor, upcomingDays } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import type { DemoState, Reminder, WaitlistEntry } from "@/types";

function matchesFor(state: DemoState, entry: WaitlistEntry) {
  const service = state.services.find((s) => s.id === entry.serviceId);
  if (!service) return [];
  const { durationMin } = totalsFor([{ serviceId: service.id, variantId: null }], state.services, state.variants);
  return state.professionals
    .filter((p) => p.active)
    .flatMap((p) =>
      freeSlots(state, p.id, entry.preferredDay, durationMin)
        .filter((hhmm) => hhmm >= entry.preferredFrom && hhmm <= entry.preferredTo)
        .map((hhmm) => ({ professionalId: p.id, professionalName: p.name, hhmm })),
    )
    .sort((a, b) => a.hhmm.localeCompare(b.hhmm));
}

const STATUS_LABEL: Record<WaitlistEntry["status"], string> = {
  waiting: "Esperando",
  offered: "Horario ofrecido",
  booked: "Reservado",
  expired: "Vencido",
};

export function WaitlistPanel() {
  const { state, offerSlot, bookFromWaitlist, addToWaitlist } = useDemo();
  const [messages, setMessages] = useState<Reminder[]>([]);
  const [adding, setAdding] = useState(false);
  const days = useMemo(() => upcomingDays(7), []);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState(state.services[0]?.id ?? "");
  const [day, setDay] = useState(days[0]);
  const [from, setFrom] = useState("14:00");
  const [to, setTo] = useState("19:00");
  const [error, setError] = useState("");

  const active = state.waitlist.filter((w) => w.status === "waiting" || w.status === "offered");
  const done = state.waitlist.filter((w) => w.status === "booked");

  function submit() {
    if (!name.trim() || phone.replace(/\D/g, "").length < 8) {
      setError("Completá el nombre y un teléfono válido.");
      return;
    }
    addToWaitlist({ clientName: name, clientPhone: phone, serviceId, preferredDay: day, preferredFrom: from, preferredTo: to });
    toast.success(`${name.trim()} quedó en la lista de espera`);
    setName("");
    setPhone("");
    setError("");
    setAdding(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <Button type="button" className="h-14 w-full gap-2 text-base font-semibold" onClick={() => setAdding(true)}>
        <Plus className="size-5" aria-hidden />Sumar a la espera
      </Button>

      {active.length === 0 ? (
        <EmptyState icon={Hourglass} text="Nadie espera un horario. Cuando alguien quiera un día lleno, sumalo acá." />
      ) : (
        <ul className="flex flex-col gap-3">
          {active.map((entry) => {
            const client = state.clients.find((c) => c.id === entry.clientId);
            const service = state.services.find((s) => s.id === entry.serviceId);
            const matches = matchesFor(state, entry);
            const best = matches[0];
            return (
              <li key={entry.id} className="rounded-card border border-subtle bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{client?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service?.name} · {formatDayLong(toISO(entry.preferredDay, "12:00"))} · entre {entry.preferredFrom} y {entry.preferredTo}
                    </p>
                  </div>
                  <span className={cn("rounded-tag px-2 py-1 text-xs font-medium", entry.status === "offered" ? "bg-info-bg text-info-fg" : "bg-warning-bg text-warning-fg")}>
                    {STATUS_LABEL[entry.status]}
                  </span>
                </div>
                {best ? (
                  <div className="mt-3 rounded-control bg-success-bg p-3 text-sm text-success-fg">
                    Hay un hueco: <span className="font-semibold">{best.hhmm}</span> con {best.professionalName}
                    {matches.length > 1 ? ` (y ${matches.length - 1} más)` : ""}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Todavía no hay un hueco en esa franja. Si alguien cancela, aparece acá.</p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" className="min-h-12 gap-2" disabled={!best} onClick={() => {
                    if (!best) return;
                    const r = offerSlot(entry.id, `${formatDayLong(toISO(entry.preferredDay, best.hhmm))}, ${best.hhmm} hs con ${best.professionalName}`);
                    if (r) setMessages([r]);
                  }}>
                    <MessageCircle className="size-4" aria-hidden />Ofrecer
                  </Button>
                  <Button type="button" className="min-h-12" disabled={!best} onClick={() => {
                    if (!best) return;
                    bookFromWaitlist(entry.id, best.professionalId, toISO(entry.preferredDay, best.hhmm));
                    toast.success(`Turno cargado para ${client?.name} a las ${best.hhmm}`);
                  }}>
                    Reservar este hueco
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {done.length > 0 ? (
        <p className="text-sm text-muted-foreground">{done.length} {done.length === 1 ? "persona ya consiguió" : "personas ya consiguieron"} su horario desde la espera.</p>
      ) : null}

      <PreparedMessageSheet reminders={messages} title="Mensaje para ofrecer el horario" onClose={() => setMessages([])} />

      <Sheet open={adding} onOpenChange={setAdding}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-sheet md:mx-auto md:max-w-xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-bold">Sumar a la espera</SheetTitle>
            <SheetDescription>Si se libera un horario en esa franja, te lo marcamos para ofrecérselo.</SheetDescription>
          </SheetHeader>
          <form className="mt-4 flex flex-col gap-4" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wl-name">Nombre</Label>
              <Input id="wl-name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wl-phone">Teléfono</Label>
              <div className="flex gap-2">
                <span className="flex h-12 shrink-0 items-center whitespace-nowrap rounded-control border border-input bg-sunken px-3 text-muted-foreground">+54 9</span>
                <Input id="wl-phone" inputMode="tel" placeholder="11 5555 0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Servicio</p>
              <div role="group" aria-label="Servicio" className="flex flex-wrap gap-2">
                {state.services.map((s) => (
                  <button key={s.id} type="button" aria-pressed={s.id === serviceId} onClick={() => setServiceId(s.id)}
                    className={cn("min-h-touch rounded-full border px-4 text-sm font-medium transition-colors duration-base ease-out", s.id === serviceId ? "border-transparent bg-brand text-brand-foreground" : "border-input bg-surface")}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <DayStrip days={days} day={day} onDayChange={setDay} />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="wl-from">Desde</Label>
                <Input id="wl-from" type="time" value={from} onChange={(e) => setFrom(e.target.value)} className="h-12" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="wl-to">Hasta</Label>
                <Input id="wl-to" type="time" value={to} onChange={(e) => setTo(e.target.value)} className="h-12" />
              </div>
            </div>
            {error ? <p className="text-sm text-danger-fg">{error}</p> : null}
            <Button type="submit" className="h-14 text-base font-semibold">Sumar a la espera</Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

