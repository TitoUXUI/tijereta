"use client";

import { useMemo, useState } from "react";
import { Hourglass, MessageCircle, Plus, RotateCcw, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { PreparedMessageSheet } from "@/components/appointments/prepared-message-dialog";
import { DayStrip } from "@/components/booking/slot-picker";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Banner, BannerDescription, BannerTitle } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsItem } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNow } from "@/hooks/use-now";
import { dayLabel, firstName, formatDuration, formatTime, initials, toISO } from "@/lib/format";
import { upcomingDays } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";
import { minutesLeft, nextFreeSlot, offerState, queueFor, type FreeSlot } from "@/lib/waitlist";
import { cn } from "@/lib/utils";
import type { DemoState, Reminder, WaitlistEntry } from "@/types";

function slotLabel(state: DemoState, slot: FreeSlot, now: Date): string {
  const pro = state.professionals.find((p) => p.id === slot.professionalId);
  return `${dayLabel(slot.startsAt, now)}, ${formatTime(slot.startsAt)} hs con ${pro?.name ?? ""}`;
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cat-3 text-sm font-semibold text-cat-fg" aria-hidden>
      {initials(name)}
    </span>
  );
}

export function WaitlistPanel() {
  const { state, offerSlot, undoOffer, renewOffer, skipOffer, expireOfferNow, bookFromWaitlist, addToWaitlist } = useDemo();
  const now = useNow(15_000);
  const slot = useMemo(() => nextFreeSlot(state, now), [state, now]);
  const [tab, setTab] = useState(0);
  const [messages, setMessages] = useState<Reminder[]>([]);
  const [adding, setAdding] = useState(false);

  const queue = useMemo(() => queueFor(state, slot), [state, slot]);
  const offered = state.waitlist.filter((w) => w.status === "offered");
  const clientOf = (e: WaitlistEntry) => state.clients.find((c) => c.id === e.clientId);
  const serviceOf = (e: WaitlistEntry) => state.services.find((s) => s.id === e.serviceId);
  const proName = (id: string | undefined) => state.professionals.find((p) => p.id === id)?.name ?? "";

  function offer(entry: WaitlistEntry) {
    if (!slot) return;
    const reminder = offerSlot(entry.id, slot, slotLabel(state, slot, now));
    const client = clientOf(entry);
    if (reminder) setMessages([reminder]);
    setTab(1);
    toast(`Oferta enviada a ${client?.name ?? "la persona"}`, {
      action: { label: "Deshacer", onClick: () => { undoOffer(entry.id); setTab(0); toast("Oferta deshecha: vuelve a esperar donde estaba"); } },
      duration: 8000,
    });
  }

  function book(entry: WaitlistEntry) {
    if (!entry.offer) return;
    bookFromWaitlist(entry.id, entry.offer.professionalId, entry.offer.startsAt);
    toast.success(`Turno cargado para ${clientOf(entry)?.name} a las ${formatTime(entry.offer.startsAt)}`);
  }

  // Alta a la espera
  const days = useMemo(() => upcomingDays(7), []);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState(state.services[0]?.id ?? "");
  const [day, setDay] = useState(days[0]);
  const [from, setFrom] = useState("14:00");
  const [to, setTo] = useState("19:00");
  const [error, setError] = useState("");

  function submit() {
    if (!name.trim() || phone.replace(/\D/g, "").length < 8) {
      setError("Completá el nombre y un teléfono válido.");
      return;
    }
    addToWaitlist({ clientName: name, clientPhone: phone, serviceId, preferredDay: day, preferredFrom: from, preferredTo: to });
    toast.success(`${name.trim()} quedó en la lista de espera`);
    setName(""); setPhone(""); setError(""); setAdding(false);
  }

  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:content-start lg:gap-x-10">
      {/* El horario libre manda: de acá sale a quién ofrecerle */}
      {slot ? (
        <section aria-label="Horario libre" className="rounded-card bg-sunken p-4 lg:col-start-1 lg:row-start-1 lg:p-6">
          <p className="text-sm font-medium text-muted-foreground">
            {slot.reason === "cancelled" ? "Se liberó un horario" : "Horario libre"}
          </p>
          <p className="font-display text-[28px] font-black leading-8">
            {dayLabel(slot.startsAt, now)} · {formatTime(slot.startsAt)}
          </p>
          <p className="text-base text-muted-foreground">
            {proName(slot.professionalId)} · hasta {formatDuration(slot.durationMin)}
          </p>
        </section>
      ) : (
        <div className="lg:col-start-1 lg:row-start-1">
          <EmptyState icon={Hourglass} text="No hay horarios libres para ofrecer por ahora." />
        </div>
      )}

      <div className="flex flex-col gap-5 lg:col-start-2 lg:row-span-3 lg:row-start-1">
      <Tabs selectedIndex={tab} onSelect={setTab} aria-label="Lista de espera" className="lg:w-72">
        <TabsItem index={0} label="En espera" />
        <TabsItem index={1} label="Ofrecidos" />
      </Tabs>
      <p className="-mt-2 text-sm text-muted-foreground" aria-live="polite">
        {tab === 0
          ? `${queue.length} ${queue.length === 1 ? "persona en la fila" : "personas en la fila"}`
          : `${offered.length} ${offered.length === 1 ? "oferta en curso" : "ofertas en curso"}`}
      </p>

      {tab === 0 ? (
        queue.length === 0 ? (
          <EmptyState icon={Hourglass} text="Nadie espera un horario. Cuando alguien quiera un día lleno, sumalo acá." />
        ) : (
          <>
            <ul className="divide-y divide-border">
              {queue.map(({ entry, fits }, i) => {
                const client = clientOf(entry);
                const service = serviceOf(entry);
                const first = i === 0 && fits;
                return (
                  <li key={entry.id} className="flex items-center gap-3 py-3">
                    <Avatar name={client?.name ?? "?"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold">{client?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {i + 1}.º en la fila · {dayLabel(toISO(entry.preferredDay, "12:00"), now).toLowerCase()} de {entry.preferredFrom} a {entry.preferredTo} · {service?.name}
                      </p>
                      {!fits && slot ? <p className="text-xs text-tertiary">No coincide con este horario</p> : null}
                    </div>
                    <Button
                      type="button"
                      variant={first ? "primary" : "secondary"}
                      className="h-11"
                      disabled={!slot}
                      onClick={() => offer(entry)}
                    >
                      Ofrecer
                    </Button>
                  </li>
                );
              })}
            </ul>
          </>
        )
      ) : offered.length === 0 ? (
        <EmptyState icon={MessageCircle} text="Todavía no ofreciste ningún horario." />
      ) : (
        <ul className="flex flex-col gap-4">
          {offered.map((entry) => {
            const client = clientOf(entry);
            const expired = offerState(entry, now) === "expired";
            const next = queueFor(state, slot).find((q) => q.entry.id !== entry.id)?.entry;
            return (
              <li key={entry.id} className="flex flex-col gap-3">
                {expired ? (
                  <Banner status="warning" contrast="high">
                    <BannerTitle>{firstName(client?.name ?? "La persona")} no respondió</BannerTitle>
                    <BannerDescription>Pasaron 15 minutos y el horario de las {entry.offer ? formatTime(entry.offer.startsAt) : ""} sigue libre.</BannerDescription>
                  </Banner>
                ) : null}
                <div className="flex items-center gap-3">
                  <Avatar name={client?.name ?? "?"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold">{client?.name}</p>
                    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="dot" color={expired ? "port" : "accent"}>{expired ? "Sin respuesta" : "Oferta enviada"}</Badge>
                      {!expired ? `vence en ${minutesLeft(entry, now)} min` : null}
                    </p>
                  </div>
                  {!expired ? (
                    <Button type="button" className="h-11" onClick={() => book(entry)}>Reservar</Button>
                  ) : null}
                </div>

                {expired ? (
                  <div className="flex flex-col gap-2">
                    {next && slot ? (
                      <Button type="button" className="h-12" onClick={() => { skipOffer(entry.id); offer(next); }}>
                        Ofrecerle a {firstName(clientOf(next)?.name ?? "la siguiente persona")}
                      </Button>
                    ) : null}
                    <Button type="button" variant="secondary" className="h-12" leadingIcon={RotateCcw} onClick={() => { renewOffer(entry.id); toast("Le volviste a ofrecer el horario"); }}>
                      Volver a ofrecérselo a {firstName(client?.name ?? "")}
                    </Button>
                    <Button type="button" variant="ghost" className="h-12" onClick={() => { skipOffer(entry.id); setTab(0); toast("Listo: el horario queda libre y la persona vuelve al final de la fila"); }}>
                      Dejar el horario libre
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="ghost" className="h-11" leadingIcon={Undo2} onClick={() => { undoOffer(entry.id); setTab(0); toast("Oferta deshecha"); }}>
                      Deshacer
                    </Button>
                    <Button type="button" variant="ghost" className="h-11 text-xs text-muted-foreground" onClick={() => expireOfferNow(entry.id)}>
                      Solo demo: que pasen 15 min
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      </div>

      {tab === 0 && queue.length > 0 ? (
        <p className="text-sm text-muted-foreground lg:col-start-1 lg:row-start-2">
          Ofrecele el horario a quien va primero. Si no responde en 15 minutos, pasás a la siguiente persona.
        </p>
      ) : null}

      <Button type="button" variant="secondary" className="h-12 lg:col-start-1 lg:row-start-3" leadingIcon={Plus} onClick={() => setAdding(true)}>
        Sumar a la espera
      </Button>

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
                    className={cn("min-h-touch rounded-control border px-4 text-sm font-medium transition-colors duration-base ease-out", s.id === serviceId ? "border-transparent bg-brand text-brand-foreground" : "border-input bg-surface")}>
                    {s.name} · {s.baseDurationMin} min
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
