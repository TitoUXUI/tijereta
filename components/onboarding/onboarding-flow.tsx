"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus, Scissors, X } from "lucide-react";
import { Wordmark } from "@/components/layout/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { formatDuration } from "@/lib/format";
import { DURATION_OPTIONS_MIN } from "@/lib/services";
import { useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import type { SalonType } from "@/types";

type Step = "salon" | "services" | "team";
const STEPS: Step[] = ["salon", "services", "team"];

const TYPES: Array<{ value: SalonType; label: string }> = [
  { value: "peluqueria", label: "Peluquería" },
  { value: "barberia", label: "Barbería" },
  { value: "mixto", label: "Mixto" },
];

/** Solo nombres: el tiempo y el precio los carga cada salón, no vienen puestos */
const SUGGESTED = ["Corte", "Barba", "Color", "Brushing", "Tratamiento"];

const PROGRESS: Record<Step, string> = { salon: "w-1/3", services: "w-2/3", team: "w-full" };

const TITLE: Record<Step, string> = {
  salon: "Contanos de tu salón",
  services: "¿Qué servicios hacés?",
  team: "¿Quién atiende?",
};

const MESSAGE: Record<Step, string> = {
  salon: "¡Hola! En 3 pasos cortos armamos tu agenda. Empecemos por lo básico.",
  services: "Tocá los que ofrecés y después le ponés tiempo y precio a cada uno.",
  team: "Con la comisión calculamos cuánto te queda por cada servicio.",
};

interface ServiceDraft {
  key: string;
  name: string;
  minutes: string;
  price: string;
  custom: boolean;
}

interface MemberDraft {
  name: string;
  commission: string;
}

const digits = (v: string) => v.replace(/\D/g, "");
const slugOf = (v: string) =>
  v.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function chipClass(on: boolean) {
  return cn(
    "min-h-11 rounded-control border px-4 text-sm font-medium transition-colors duration-base ease-out",
    on ? "border-accent-border bg-accent text-accent-foreground" : "border-control bg-surface text-foreground",
  );
}

export function OnboardingFlow() {
  const { completeOnboarding } = useDemo();
  const router = useRouter();
  const [step, setStep] = useState<Step>("salon");
  const [name, setName] = useState("");
  const [type, setType] = useState<SalonType | null>(null);
  const [services, setServices] = useState<ServiceDraft[]>([]);
  const [team, setTeam] = useState<MemberDraft[]>([{ name: "", commission: "" }]);

  const index = STEPS.indexOf(step);
  const patchService = (key: string, patch: Partial<ServiceDraft>) =>
    setServices((cur) => cur.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  const toggleSuggested = (label: string) =>
    setServices((cur) =>
      cur.some((s) => s.key === label)
        ? cur.filter((s) => s.key !== label)
        : [...cur, { key: label, name: label, minutes: "", price: "", custom: false }],
    );

  const incomplete = useMemo(
    () => services.filter((s) => !s.name.trim() || !Number(s.minutes) || !Number(s.price)),
    [services],
  );

  const hint = useMemo(() => {
    if (step !== "services" || services.length === 0) return "";
    if (incomplete.length === 0) return "";
    const names = incomplete.map((s) => s.name.trim() || "el servicio nuevo");
    return `Falta el tiempo y el precio de ${names.join(", ")}.`;
  }, [step, services.length, incomplete]);

  const valid =
    step === "salon"
      ? name.trim().length > 0 && type !== null
      : step === "services"
        ? services.length > 0 && incomplete.length === 0
        : team.some((m) => m.name.trim());

  function next() {
    if (!valid) return;
    if (step === "salon") return setStep("services");
    if (step === "services") return setStep("team");
    completeOnboarding({
      name: name.trim(),
      type: type ?? "mixto",
      services: services.map((s) => ({ name: s.name.trim(), baseDurationMin: Number(s.minutes), price: Number(s.price) })),
      team: team
        .filter((m) => m.name.trim())
        .map((m) => ({ name: m.name.trim(), commissionPercent: Math.min(100, Number(m.commission) || 0) })),
    });
    router.push("/hoy");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col">
      <Wordmark className="hidden px-6 pt-8 text-brand md:block" />
      <div className="flex flex-1 flex-col gap-5 px-6 pb-4 pt-6">
        <h1 className="text-[28px] font-bold leading-8">{TITLE[step]}</h1>

        <div className="flex items-start gap-3 rounded-sheet border border-subtle bg-surface p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Scissors className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Tijereta</p>
            <p className="text-base">{MESSAGE[step]}</p>
          </div>
        </div>

        {step === "salon" ? (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-name" className="text-sm font-medium">Nombre del salón</Label>
              <Input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" placeholder="Ej: Estudio Lupe" />
              <p className="text-xs text-muted-foreground">Tu link va a ser tijereta.app/reservar/{slugOf(name) || "tu-salon"}</p>
            </div>
            <div role="group" aria-label="Tipo de salón" className="flex flex-col gap-2">
              <p className="text-sm font-medium">¿Qué tipo de salón es?</p>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button key={t.value} type="button" aria-pressed={type === t.value} onClick={() => setType(t.value)} className={chipClass(type === t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {step === "services" ? (
          <>
            <div role="group" aria-label="Servicios" className="flex flex-wrap gap-2">
              {SUGGESTED.map((label) => (
                <button key={label} type="button" aria-pressed={services.some((s) => s.key === label)} onClick={() => toggleSuggested(label)} className={chipClass(services.some((s) => s.key === label))}>
                  {label}
                </button>
              ))}
              <button
                type="button"
                className={chipClass(false)}
                onClick={() => setServices((cur) => [...cur, { key: `custom-${Date.now()}`, name: "", minutes: "", price: "", custom: true }])}
              >
                <Plus className="mr-1 inline size-4" aria-hidden />Otro
              </button>
            </div>

            {services.map((s) => (
              <section key={s.key} aria-label={s.name || "Servicio nuevo"} className="flex flex-col gap-3 rounded-card border border-subtle bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  {s.custom ? (
                    <Input aria-label="Nombre del servicio" value={s.name} onChange={(e) => patchService(s.key, { name: e.target.value })} className="h-11" placeholder="Nombre del servicio" />
                  ) : (
                    <p className="text-base font-bold">{s.name}</p>
                  )}
                  <button type="button" onClick={() => setServices((cur) => cur.filter((x) => x.key !== s.key))} className="flex min-h-11 shrink-0 items-center gap-1 px-1 text-sm font-medium text-link">
                    <X className="size-4" aria-hidden />Quitar
                  </button>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  <div className="flex min-w-0 flex-col gap-2">
                    <Label className="text-sm font-medium">Duración</Label>
                    <Select value={s.minutes} onValueChange={(v) => patchService(s.key, { minutes: v })}>
                      <SelectTrigger className="h-12 w-full min-w-0" placeholder="Elegí" />
                      <SelectContent>
                        {DURATION_OPTIONS_MIN.map((d, i) => (
                          <SelectItem key={d} index={i} value={String(d)}>{formatDuration(d)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`price-${s.key}`} className="text-sm font-medium">Precio</Label>
                    <Input id={`price-${s.key}`} inputMode="numeric" value={s.price} onChange={(e) => patchService(s.key, { price: digits(e.target.value) })} className="h-12" placeholder="$ 0" />
                  </div>
                </div>
              </section>
            ))}
            {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
          </>
        ) : null}

        {step === "team" ? (
          <>
            {team.map((member, i) => (
              <section key={i} aria-label={`Persona ${i + 1}`} className="flex flex-col gap-3 rounded-card border border-subtle bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold">Persona {i + 1}</p>
                  {team.length > 1 ? (
                    <button type="button" onClick={() => setTeam(team.filter((_, n) => n !== i))} className="flex min-h-11 items-center gap-1 px-1 text-sm font-medium text-link">
                      <X className="size-4" aria-hidden />Quitar
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`member-${i}`} className="text-sm font-medium">Nombre</Label>
                    <Input id={`member-${i}`} value={member.name} onChange={(e) => setTeam(team.map((t, n) => (n === i ? { ...t, name: e.target.value } : t)))} className="h-12" placeholder="Nombre" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`commission-${i}`} className="text-sm font-medium">Comisión %</Label>
                    <Input id={`commission-${i}`} inputMode="numeric" value={member.commission} onChange={(e) => setTeam(team.map((t, n) => (n === i ? { ...t, commission: digits(e.target.value).slice(0, 3) } : t)))} className="h-12" placeholder="0" />
                  </div>
                </div>
              </section>
            ))}
            <Button type="button" variant="ghost" className="h-12 self-start" leadingIcon={Plus} onClick={() => setTeam([...team, { name: "", commission: "" }])}>
              Sumar a otra persona
            </Button>
            <p className="text-sm text-muted-foreground">Si trabajás solo o sola, poné tu nombre y dejá la comisión vacía.</p>
          </>
        ) : null}
      </div>

      <div className="sticky bottom-0 bg-background">
        <div role="progressbar" aria-label="Avance del alta" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={index + 1} className="h-1 w-full bg-sunken">
          <div className={cn("h-full bg-primary transition-[width] duration-base ease-out", PROGRESS[step])} />
        </div>
        <div className="flex items-center gap-3 px-6 pb-6 pt-4">
          {index > 0 ? (
            <Button type="button" variant="ghost" className="h-14" onClick={() => setStep(STEPS[index - 1])}>Atrás</Button>
          ) : null}
          <Button type="button" className="h-14 flex-1 text-base font-semibold" disabled={!valid} onClick={next}>
            {step === "team" ? "Crear mi agenda" : "Seguir"}
          </Button>
        </div>
      </div>
    </main>
  );
}
