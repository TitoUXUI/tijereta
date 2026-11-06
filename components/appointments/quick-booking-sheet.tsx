"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { ServiceCombinePicker } from "@/components/appointments/service-combine-picker";
import { SlotPicker } from "@/components/booking/slot-picker";
import { dayKey, toISO } from "@/lib/format";
import { freeSlots, totalsFor, upcomingDays } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import type { Channel, ServiceSelection } from "@/types";

interface QuickBookingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProfessionalId?: string;
  initialDay?: string;
  initialSlot?: string;
}

const CHANNELS: Array<{ value: Channel; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "phone", label: "Teléfono" },
  { value: "walk_in", label: "En el local" },
];

/** Alta rápida de un turno que llegó por chat: pocos toques, misma agenda */
export function QuickBookingSheet({
  open,
  onOpenChange,
  initialProfessionalId,
  initialDay,
  initialSlot,
}: QuickBookingSheetProps) {
  const { state, createAppointment } = useDemo();
  const days = useMemo(() => upcomingDays(7), []);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selections, setSelections] = useState<ServiceSelection[]>([]);
  const [professionalId, setProfessionalId] = useState<string>("");
  const [day, setDay] = useState(days[0]);
  const [slot, setSlot] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setProfessionalId(initialProfessionalId ?? state.professionals[0]?.id ?? "");
    setDay(initialDay ?? dayKey(new Date()));
    setSlot(initialSlot ?? null);
    setErrors({});
  }, [open, initialProfessionalId, initialDay, initialSlot, state.professionals]);

  const totals = totalsFor(selections, state.services, state.variants);
  const slots = useMemo(
    () => (professionalId && totals.durationMin > 0 ? freeSlots(state, professionalId, day, totals.durationMin) : []),
    [state, professionalId, day, totals.durationMin],
  );

  function reset() {
    setName("");
    setPhone("");
    setSelections([]);
    setSlot(null);
    setChannel("whatsapp");
  }

  function submit() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Escribí el nombre de la persona.";
    if (phone.replace(/\D/g, "").length < 8) next.phone = "Revisá el teléfono: faltan números.";
    if (selections.length === 0) next.services = "Elegí al menos un servicio.";
    if (!slot) next.slot = "Elegí un horario libre.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !slot) return;

    createAppointment({
      clientName: name,
      clientPhone: phone,
      professionalId,
      startsAt: toISO(day, slot),
      selections,
      channel,
      createdBy: "staff",
    });
    toast.success(`Turno guardado para ${name.trim()} a las ${slot}`);
    reset();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-sheet md:mx-auto md:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold">Nuevo turno</SheetTitle>
          <SheetDescription>Cargalo acá y queda en la misma agenda que los del link.</SheetDescription>
        </SheetHeader>

        <form
          className="mt-4 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          noValidate
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="qb-name" className="text-sm font-medium">Nombre</Label>
            <Input id="qb-name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" autoComplete="off" aria-invalid={Boolean(errors.name)} />
            {errors.name ? <p className="text-sm text-danger-fg">{errors.name}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="qb-phone" className="text-sm font-medium">Teléfono</Label>
            <div className="flex gap-2">
              <span className="flex h-12 shrink-0 items-center whitespace-nowrap rounded-control border border-input bg-sunken px-3 text-base text-muted-foreground">+54 9</span>
              <Input id="qb-phone" inputMode="tel" placeholder="11 5555 0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12" aria-invalid={Boolean(errors.phone)} />
            </div>
            {errors.phone ? <p className="text-sm text-danger-fg">{errors.phone}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Servicios</p>
            <ServiceCombinePicker services={state.services} variants={state.variants} value={selections} onChange={(v) => { setSelections(v); setSlot(null); }} />
            {errors.services ? <p className="text-sm text-danger-fg">{errors.services}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Con quién</p>
            <div role="group" aria-label="Profesional" className="flex flex-wrap gap-2">
              {state.professionals.filter((p) => p.active).map((p) => (
                <button key={p.id} type="button" aria-pressed={p.id === professionalId} onClick={() => { setProfessionalId(p.id); setSlot(null); }}
                  className={cn("min-h-touch rounded-full border px-4 text-sm font-medium transition-colors duration-base ease-out", p.id === professionalId ? "border-transparent bg-brand text-brand-foreground" : "border-input bg-surface")}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Día y hora</p>
            {selections.length === 0 ? (
              <p className="rounded-card bg-sunken p-4 text-sm text-muted-foreground">Elegí los servicios para ver los horarios libres.</p>
            ) : (
              <SlotPicker days={days} day={day} onDayChange={(d) => { setDay(d); setSlot(null); }} slots={slots} slot={slot} onSlotChange={setSlot} />
            )}
            {errors.slot ? <p className="text-sm text-danger-fg">{errors.slot}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">¿Por dónde llegó?</p>
            <div role="group" aria-label="Canal" className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => (
                <button key={c.value} type="button" aria-pressed={c.value === channel} onClick={() => setChannel(c.value)}
                  className={cn("min-h-touch rounded-full border px-4 text-sm font-medium transition-colors duration-base ease-out", c.value === channel ? "border-transparent bg-brand text-brand-foreground" : "border-input bg-surface")}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="h-14 w-full text-base font-semibold">Guardar turno</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
