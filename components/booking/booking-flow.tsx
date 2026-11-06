"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { ServiceCombinePicker } from "@/components/appointments/service-combine-picker";
import { DemoNotice, DepositNotice, PolicyNotice } from "@/components/booking/policy-notice";
import { SlotPicker } from "@/components/booking/slot-picker";
import { HeroBand } from "@/components/layout/hero-band";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatARS, formatDayLong, formatDuration, toISO } from "@/lib/format";
import { simulateDepositPayment } from "@/lib/mocks/mercado-pago";
import { firstAvailableProfessional, freeSlots, slotsForAny, totalsFor, upcomingDays } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import type { Appointment, ServiceSelection } from "@/types";

type Step = "services" | "when" | "pay" | "done";
const ANY = "any";

export function BookingFlow() {
  const { state, createAppointment, setStatus, recordDeposit } = useDemo();
  const days = useMemo(() => upcomingDays(10), []);
  const [step, setStep] = useState<Step>("services");
  const [selections, setSelections] = useState<ServiceSelection[]>([]);
  const [professionalId, setProfessionalId] = useState<string>(ANY);
  const [day, setDay] = useState(days[0]);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paying, setPaying] = useState(false);
  const [booked, setBooked] = useState<Appointment | null>(null);

  const totals = totalsFor(selections, state.services, state.variants);
  const hasDeposit = totals.depositAmount > 0;
  const totalSteps = hasDeposit ? 3 : 2;
  const slots = useMemo(() => {
    if (totals.durationMin === 0) return [];
    return professionalId === ANY
      ? slotsForAny(state, day, totals.durationMin)
      : freeSlots(state, professionalId, day, totals.durationMin);
  }, [state, professionalId, day, totals.durationMin]);

  function validateWhen(): boolean {
    const next: Record<string, string> = {};
    if (!slot) next.slot = "Elegí un horario.";
    if (!name.trim()) next.name = "Escribí tu nombre.";
    if (phone.replace(/\D/g, "").length < 8) next.phone = "Revisá tu teléfono: faltan números.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function resolveProfessionalId(): string | null {
    if (!slot) return null;
    if (professionalId !== ANY) return professionalId;
    return firstAvailableProfessional(state, day, slot, totals.durationMin)?.id ?? null;
  }

  async function confirm(withDeposit: boolean) {
    const proId = resolveProfessionalId();
    if (!proId || !slot) {
      toast.error("Ese horario se ocupó. Elegí otro, por favor.");
      setStep("when");
      return;
    }
    setPaying(true);
    try {
      const payment = withDeposit ? await simulateDepositPayment() : null;
      const appointment = createAppointment({
        clientName: name,
        clientPhone: phone,
        professionalId: proId,
        startsAt: toISO(day, slot),
        selections,
        channel: "link",
        createdBy: "client",
      });
      if (payment) recordDeposit(appointment.id, totals.depositAmount, payment.method);
      else setStatus(appointment.id, "confirmed");
      setBooked(appointment);
      setStep("done");
    } finally {
      setPaying(false);
    }
  }

  const proName = (id: string | undefined) => state.professionals.find((p) => p.id === id)?.name;

  if (step === "done" && booked) {
    return (
      <>
        <HeroBand tone="highlight" eyebrow={state.salon.name} title="¡Listo, te esperamos!" />
        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="rounded-card border border-subtle bg-surface p-4">
            <p className="flex items-center gap-2 text-lg font-semibold"><CalendarCheck className="size-5 text-success-solid" aria-hidden />{formatDayLong(booked.startsAt)}</p>
            <p className="mt-1 text-base">{slot} hs · con {proName(booked.professionalId)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{formatDuration(totals.durationMin)} · {formatARS(totals.price)}</p>
            {hasDeposit ? <p className="mt-1 text-sm text-muted-foreground">Seña de {formatARS(totals.depositAmount)} recibida (simulada).</p> : null}
          </div>
          <PolicyNotice cancelHoursBefore={state.salon.cancelHoursBefore} />
          <Button asChild className="h-14 text-base font-semibold">
            <Link href={`/turno/${booked.manageToken}`}>Ver o cambiar mi turno</Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground">Guardá este link: es tu forma de cancelar o reprogramar, sin cuenta ni app.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <HeroBand
        tone="highlight"
        eyebrow={state.salon.name}
        title={step === "services" ? "¿Qué te vas a hacer?" : step === "when" ? "¿Cuándo venís?" : "Pagá la seña"}
      >
        <p className="text-sm">Paso {step === "services" ? 1 : step === "when" ? 2 : 3} de {totalSteps}</p>
      </HeroBand>

      <div className="flex flex-col gap-5 px-4 py-6">
        {step === "services" ? (
          <>
            <ServiceCombinePicker services={state.services} variants={state.variants} value={selections} onChange={(v) => { setSelections(v); setSlot(null); }} />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">¿Con quién?</p>
              <div role="group" aria-label="Profesional" className="flex flex-wrap gap-2">
                {[{ id: ANY, name: "Cualquiera" }, ...state.professionals.filter((p) => p.active)].map((p) => (
                  <button key={p.id} type="button" aria-pressed={professionalId === p.id} onClick={() => { setProfessionalId(p.id); setSlot(null); }}
                    className={cn("min-h-touch rounded-full border px-4 text-sm font-medium transition-colors duration-base ease-out", professionalId === p.id ? "border-transparent bg-brand text-brand-foreground" : "border-input bg-surface")}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <PolicyNotice cancelHoursBefore={state.salon.cancelHoursBefore} />
            <Button type="button" className="h-14 text-base font-semibold" disabled={selections.length === 0} onClick={() => setStep("when")}>
              Elegir día y hora
            </Button>
          </>
        ) : null}

        {step === "when" ? (
          <>
            <button type="button" onClick={() => setStep("services")} className="flex min-h-touch items-center gap-1 self-start text-sm font-medium text-link">
              <ArrowLeft className="size-4" aria-hidden />Cambiar servicios
            </button>
            <SlotPicker days={days} day={day} onDayChange={(d) => { setDay(d); setSlot(null); }} slots={slots} slot={slot} onSlotChange={setSlot} />
            {errors.slot ? <p className="text-sm text-danger-fg">{errors.slot}</p> : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="bk-name" className="text-sm font-medium">Tu nombre</Label>
              <Input id="bk-name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" autoComplete="name" aria-invalid={Boolean(errors.name)} />
              {errors.name ? <p className="text-sm text-danger-fg">{errors.name}</p> : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bk-phone" className="text-sm font-medium">Tu teléfono</Label>
              <div className="flex gap-2">
                <span className="flex h-12 shrink-0 items-center whitespace-nowrap rounded-control border border-input bg-sunken px-3 text-base text-muted-foreground">+54 9</span>
                <Input id="bk-phone" inputMode="tel" placeholder="11 5555 0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12" autoComplete="tel-national" aria-invalid={Boolean(errors.phone)} />
              </div>
              {errors.phone ? <p className="text-sm text-danger-fg">{errors.phone}</p> : null}
            </div>

            {hasDeposit ? <DepositNotice amount={totals.depositAmount} /> : null}
            <PolicyNotice cancelHoursBefore={state.salon.cancelHoursBefore} />
            <div className="rounded-card bg-sunken p-3 text-sm">
              <span className="font-semibold">{formatDuration(totals.durationMin)}</span> · {formatARS(totals.price)}
            </div>

            <Button loading={paying} type="button" className="h-14 text-base font-semibold" disabled={paying} onClick={() => {
              if (!validateWhen()) return;
              if (hasDeposit) setStep("pay");
              else void confirm(false);
            }}>
              {hasDeposit ? "Seguir a la seña" : "Confirmar turno"}
            </Button>
          </>
        ) : null}

        {step === "pay" ? (
          <>
            <button type="button" onClick={() => setStep("when")} className="flex min-h-touch items-center gap-1 self-start text-sm font-medium text-link">
              <ArrowLeft className="size-4" aria-hidden />Volver
            </button>
            <div className="rounded-card border border-subtle bg-surface p-4">
              <p className="text-sm text-muted-foreground">Seña a pagar</p>
              <p className="text-3xl font-bold">{formatARS(totals.depositAmount)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Del total de {formatARS(totals.price)}</p>
            </div>
            <DemoNotice>Esta pantalla simula Mercado Pago. No se cobra nada ni se piden datos de tarjeta.</DemoNotice>
            <Button loading={paying} type="button" className="h-14 text-base font-semibold" disabled={paying} onClick={() => void confirm(true)}>
              {paying ? "Procesando…" : "Pagar seña (simulado)"}
            </Button>
          </>
        ) : null}
      </div>
    </>
  );
}
