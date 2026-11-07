"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CalendarCheck, CalendarX2, Clock, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ServiceCombinePicker } from "@/components/appointments/service-combine-picker";
import { DepositNotice, PolicyNotice } from "@/components/booking/policy-notice";
import { SlotPicker } from "@/components/booking/slot-picker";
import { TotalBar } from "@/components/booking/total-bar";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { Tabs, TabsItem } from "@/components/ui/tabs";
import { Banner, BannerDescription, BannerTitle } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatARS, formatDayLong, formatDayShort, formatDuration, toISO } from "@/lib/format";
import { PAYMENT_METHODS, simulateDepositPayment, type PaymentMethodId, type PaymentOutcome } from "@/lib/mocks/mercado-pago";
import { firstAvailableProfessional, freeSlots, slotsForAny, totalsFor, upcomingDays } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import type { Appointment, ServiceSelection } from "@/types";

type Step = "services" | "when" | "pay" | "gateway" | "pending" | "rejected" | "done";
const ANY = "any";

export function BookingFlow() {
  const { state, createAppointment, setStatus, recordDeposit, addToWaitlist } = useDemo();
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
  const [method, setMethod] = useState<PaymentMethodId>("balance");
  const [outcome, setOutcome] = useState<PaymentOutcome>("approved");

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
      const payment = withDeposit ? await simulateDepositPayment(outcome, method) : null;
      if (payment?.status === "rejected") {
        // No se crea el turno: la persona puede probar de nuevo o con otro medio
        setStep("rejected");
        return;
      }
      const appointment = createAppointment({
        clientName: name,
        clientPhone: phone,
        professionalId: proId,
        startsAt: toISO(day, slot),
        selections,
        channel: "link",
        createdBy: "client",
      });
      setBooked(appointment);
      if (payment?.status === "pending") {
        // El lugar queda reservado como "por confirmar" hasta que se acredite el pago
        setStep("pending");
        return;
      }
      if (payment) recordDeposit(appointment.id, totals.depositAmount, payment.method);
      else setStatus(appointment.id, "confirmed");
      setStep("done");
    } finally {
      setPaying(false);
    }
  }

  /** Sin horarios ese día: anotarse en la lista de espera con los datos ya cargados */
  function joinWaitlist() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Escribí tu nombre.";
    if (phone.replace(/\D/g, "").length < 8) next.phone = "Revisá tu teléfono: faltan números.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const first = selections[0];
    if (!first) return;
    addToWaitlist({
      clientName: name,
      clientPhone: phone,
      serviceId: first.serviceId,
      preferredDay: day,
      preferredFrom: `${String(state.salon.openHour).padStart(2, "0")}:00`,
      preferredTo: `${String(state.salon.closeHour).padStart(2, "0")}:00`,
    });
    toast.success("Listo, te anotamos. Si se libera un lugar, el salón te avisa.");
  }

  const proName = (id: string | undefined) => state.professionals.find((p) => p.id === id)?.name;

  /** La acción principal del paso: va en la barra fija (celular) o en el resumen (escritorio) */
  const action =
    step === "services"
      ? { label: "Ver horarios", disabled: selections.length === 0, loading: false, run: () => setStep("when") }
      : step === "when"
        ? {
            label: hasDeposit ? "Seguir a la seña" : "Confirmar",
            disabled: paying,
            loading: paying,
            run: () => {
              if (!validateWhen()) return;
              if (hasDeposit) setStep("pay");
              else void confirm(false);
            },
          }
        : null;
  const lines = selections.flatMap((sel) => {
    const service = state.services.find((x) => x.id === sel.serviceId);
    const variant = state.variants.find((v) => v.id === sel.variantId);
    if (!service) return [];
    return [{ key: service.id, name: variant ? `${service.name} (${variant.name.toLowerCase()})` : service.name, price: service.price + (variant?.extraPrice ?? 0) }];
  });

  if (step === "done" && booked) {
    return (
      <>
        <HeroBand tone="highlight" contained eyebrow={state.salon.name} title="¡Listo, te esperamos!" />
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6 md:py-10">
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

  if (step === "gateway") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Pasarela de pago</h1>
          <span className="rounded-tag bg-warning-bg px-2 py-1 text-xs font-semibold text-warning-fg">SIMULADO</span>
        </div>
        <div>
          <p className="text-base text-muted-foreground">Vas a pagar a {state.salon.name}</p>
          <p className="font-display text-[32px] font-black leading-10">{formatARS(totals.depositAmount)}</p>
        </div>
        <section aria-labelledby="gw-methods" className="flex flex-col gap-1">
          <h2 id="gw-methods" className="text-xl font-semibold">Elegí cómo pagar</h2>
          <ul className="divide-y divide-border" role="radiogroup" aria-label="Medio de pago">
            {PAYMENT_METHODS.map((m) => (
              <li key={m.id}>
                <button type="button" role="radio" aria-checked={method === m.id} onClick={() => setMethod(m.id)} className="flex min-h-touch w-full items-center gap-3 py-3 text-left">
                  <span className={cn("flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px]", method === m.id ? "border-primary bg-primary" : "border-input")} aria-hidden>
                    {method === m.id ? <span className="size-2 rounded-full bg-primary-foreground" /> : null}
                  </span>
                  <span>
                    <span className="block text-base font-semibold">{m.label}</span>
                    <span className="block text-sm text-muted-foreground">{m.detail}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Resultado de la prueba</p>
          <Tabs selectedIndex={outcome === "approved" ? 0 : outcome === "pending" ? 1 : 2} onSelect={(i) => setOutcome(i === 0 ? "approved" : i === 1 ? "pending" : "rejected")} aria-label="Resultado de la prueba">
            <TabsItem index={0} label="Aprobado" />
            <TabsItem index={1} label="Pendiente" />
            <TabsItem index={2} label="Rechazado" />
          </Tabs>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <Button type="button" className="h-14 text-base font-semibold" loading={paying} disabled={paying} onClick={() => void confirm(true)}>
            {paying ? "Procesando…" : `Pagar ${formatARS(totals.depositAmount)}`}
          </Button>
          <Button type="button" variant="ghost" className="h-12" onClick={() => setStep("pay")}>Volver al salón</Button>
        </div>
      </main>
    );
  }

  if (step === "pending" && booked) {
    return (
      <>
        <HeroBand tone="highlight" contained eyebrow={state.salon.name} title="Estamos esperando el pago">
          <p className="text-base">Tu turno está reservado</p>
        </HeroBand>
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6 md:py-10">
          <Banner status="warning" contrast="high">
            <BannerTitle>Tu lugar está guardado 30 minutos</BannerTitle>
            <BannerDescription>Apenas se acredite el pago, confirmamos el turno. Si no se acredita, el horario se libera.</BannerDescription>
          </Banner>
          <EmptyState
            illustration="reloj"
            icon={Clock}
            compact
            title="Pago pendiente"
            text="Algunos medios tardan en acreditarse. No hace falta que pagues de nuevo."
            action={<Button asChild className="h-14 text-base font-semibold"><Link href={`/turno/${booked.manageToken}`}>Ver mi turno</Link></Button>}
            secondary={<Button type="button" variant="ghost" className="h-12" onClick={() => setStep("gateway")}>Probar con otro medio</Button>}
          />
        </div>
      </>
    );
  }

  if (step === "rejected") {
    return (
      <>
        <HeroBand tone="highlight" contained eyebrow={state.salon.name} title="No se pudo cobrar">
          <p className="text-base">Tu turno todavía no se perdió</p>
        </HeroBand>
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6 md:py-10">
          <Banner status="error" contrast="high">
            <BannerTitle>El pago no se procesó</BannerTitle>
            <BannerDescription>No te cobramos nada. Tenés 30 minutos para intentarlo de nuevo.</BannerDescription>
          </Banner>
          <EmptyState
            illustration="tarjeta-rechazada"
            icon={CreditCard}
            compact
            title="Probemos de nuevo"
            text="A veces es un tema de la tarjeta o del saldo. Podés usar otro medio."
            action={<Button type="button" className="h-14 text-base font-semibold" onClick={() => { setOutcome("approved"); setStep("gateway"); }}>Probar de nuevo</Button>}
            secondary={<Button type="button" variant="secondary" className="h-12" onClick={() => setStep("gateway")}>Elegir otro medio</Button>}
          />
          <Button type="button" variant="ghost" className="h-12" onClick={() => setStep("when")}>Hablar con el salón</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <HeroBand
        tone="highlight"
        contained
        eyebrow={state.salon.name}
        title={step === "services" ? "¿Qué te vas a hacer?" : step === "when" ? "¿Cuándo venís?" : "Pagá la seña"}
      >
        <p className="text-sm">Paso {step === "services" ? 1 : step === "when" ? 2 : 3} de {totalSteps}</p>
      </HeroBand>

      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-10 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12 lg:pb-12 lg:pt-8">
      <div className="flex min-w-0 flex-col gap-5">
        {step === "services" ? (
          <>
            <ServiceCombinePicker services={state.services} variants={state.variants} value={selections} showTotal={false} onChange={(v) => { setSelections(v); setSlot(null); }} />
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
          </>
        ) : null}

        {step === "when" ? (
          <>
            <button type="button" onClick={() => setStep("services")} className="flex min-h-touch items-center gap-1 self-start text-sm font-medium text-link">
              <ArrowLeft className="size-4" aria-hidden />Cambiar servicios
            </button>
            <SlotPicker
              days={days}
              day={day}
              onDayChange={(d) => { setDay(d); setSlot(null); }}
              slots={slots}
              slot={slot}
              onSlotChange={setSlot}
              emptySlot={
                <EmptyState
                  illustration="agenda-llena"
                  icon={CalendarX2}
                  compact
                  title="Ese día no quedan horarios"
                  text="Probá con otro día o anotate en la lista de espera: si se libera un lugar, el salón te avisa."
                  action={<Button type="button" className="h-12" onClick={joinWaitlist}>Anotarme en la lista de espera</Button>}
                  secondary={<Button type="button" variant="ghost" className="h-11" onClick={() => { const i = days.indexOf(day); setDay(days[Math.min(i + 1, days.length - 1)]); setSlot(null); }}>Elegir otro día</Button>}
                />
              }
            />
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

          </>
        ) : null}

        {step === "pay" ? (
          <>
            <button type="button" onClick={() => setStep("when")} className="flex min-h-touch items-center gap-1 self-start text-sm font-medium text-link">
              <ArrowLeft className="size-4" aria-hidden />Volver
            </button>
            <ul className="divide-y divide-border">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center justify-between gap-3 py-3 text-base">
                  <span className="text-muted-foreground">{l.name}</span>
                  <span className="font-semibold">{formatARS(l.price)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 py-3 text-base">
                <span className="text-muted-foreground">Seña · se paga ahora</span>
                <span className="font-semibold">{formatARS(totals.depositAmount)}</span>
              </li>
              <li className="flex items-center justify-between gap-3 py-3 text-base">
                <span className="text-muted-foreground">El resto, en el salón</span>
                <span className="font-semibold">{formatARS(totals.price - totals.depositAmount)}</span>
              </li>
            </ul>
            <Banner status="warning" contrast="high">
              <BannerTitle>Modo demo</BannerTitle>
              <BannerDescription>Vas a una pantalla de prueba de Mercado Pago. No se cobra nada ni se piden datos reales.</BannerDescription>
            </Banner>
            <PolicyNotice cancelHoursBefore={state.salon.cancelHoursBefore} />
            <Button type="button" className="h-14 text-base font-semibold" leadingIcon={ExternalLink} onClick={() => setStep("gateway")}>
              Ir a Mercado Pago
            </Button>
          </>
        ) : null}
      </div>

      <aside aria-label="Resumen de tu turno" className="hidden lg:sticky lg:top-8 lg:block">
        <div className="flex flex-col gap-4 rounded-card border border-subtle bg-surface p-6">
          <h2 className="text-xl font-semibold">Tu turno</h2>
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Elegí uno o más servicios para ver el total.</p>
          ) : (
            <ul className="divide-y divide-border">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center justify-between gap-3 py-2 text-base">
                  <span>{l.name}</span>
                  <span className="text-muted-foreground">{formatARS(l.price)}</span>
                </li>
              ))}
              {slot ? (
                <li className="flex items-center justify-between gap-3 py-2 text-base">
                  <span>{proName(professionalId === ANY ? firstAvailableProfessional(state, day, slot, totals.durationMin)?.id : professionalId) ?? "Cualquiera"}</span>
                  <span className="text-muted-foreground">{formatDayShort(new Date(`${day}T12:00:00`))} {day.slice(8)} · {slot}</span>
                </li>
              ) : null}
            </ul>
          )}
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-base font-semibold">{lines.length > 0 ? `Total · ${formatDuration(totals.durationMin)}` : "Total"}</span>
            <span className="text-xl font-semibold">{lines.length > 0 ? formatARS(totals.price) : "—"}</span>
          </div>
          {hasDeposit ? <DepositNotice amount={totals.depositAmount} /> : null}
          <PolicyNotice cancelHoursBefore={state.salon.cancelHoursBefore} />
          {action ? (
            <Button type="button" className="h-14 text-base font-semibold" loading={action.loading} disabled={action.disabled} onClick={action.run}>
              {action.label}
            </Button>
          ) : null}
        </div>
      </aside>

      {action ? (
        <div className="lg:hidden">
          <TotalBar detail={lines.length === 0 ? "Elegí un servicio" : step === "when" ? `Total · ${formatDuration(totals.durationMin)}` : formatDuration(totals.durationMin)} total={lines.length === 0 ? "—" : formatARS(totals.price)}>
            <Button type="button" className="h-12 px-6 text-base font-semibold" loading={action.loading} disabled={action.disabled} onClick={action.run}>
              {action.label}
            </Button>
          </TotalBar>
        </div>
      ) : null}
      </div>
    </>
  );
}
