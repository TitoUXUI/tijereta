"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { SplitLayout } from "@/components/layout/split-layout";
import { Banner, BannerDescription, BannerTitle } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatARS, formatDuration } from "@/lib/format";
import { useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import type { SalonType } from "@/types";

type Step = "type" | "name" | "services" | "team";
const STEPS: Step[] = ["type", "name", "services", "team"];

const TYPES: Array<{ value: SalonType; label: string; hint: string }> = [
  { value: "peluqueria", label: "Peluquería", hint: "Corte, color, tratamientos" },
  { value: "barberia", label: "Barbería", hint: "Corte, barba, combos" },
  { value: "mixto", label: "Mixto", hint: "Un poco de todo" },
];

const CATALOG = [
  { name: "Corte", baseDurationMin: 45, price: 18000 },
  { name: "Barba", baseDurationMin: 30, price: 9000 },
  { name: "Color", baseDurationMin: 90, price: 38000 },
  { name: "Brushing", baseDurationMin: 30, price: 12000 },
  { name: "Tratamiento", baseDurationMin: 45, price: 20000 },
];

const TITLE: Record<Step, string> = {
  type: "¿Qué tipo de salón es?",
  name: "¿Cómo se llama?",
  services: "¿Qué servicios hacés?",
  team: "¿Quiénes atienden?",
};

const SUBTITLE: Partial<Record<Step, string>> = {
  services: "Ajustá el precio y la duración de cada uno",
  team: "Sumá a tu equipo y cuánto cobra cada uno",
};

interface ServiceDraft {
  key: string;
  name: string;
  minutes: string;
  price: string;
  on: boolean;
  custom: boolean;
}

interface MemberDraft {
  name: string;
  commission: string;
}

const digits = (v: string) => v.replace(/\D/g, "");

function defaultsFor(type: SalonType): ServiceDraft[] {
  const preset = type === "barberia" ? ["Corte", "Barba"] : ["Corte"];
  return CATALOG.map((c) => ({
    key: c.name,
    name: c.name,
    minutes: String(c.baseDurationMin),
    price: String(c.price),
    on: preset.includes(c.name),
    custom: false,
  }));
}

export function OnboardingFlow() {
  const { completeOnboarding } = useDemo();
  const router = useRouter();
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<SalonType>("peluqueria");
  const [name, setName] = useState("");
  const [services, setServices] = useState<ServiceDraft[]>(() => defaultsFor("peluqueria"));
  const [team, setTeam] = useState<MemberDraft[]>([{ name: "", commission: "40" }]);
  const [error, setError] = useState("");

  const index = STEPS.indexOf(step);
  const patchService = (key: string, patch: Partial<ServiceDraft>) =>
    setServices((cur) => cur.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  function next() {
    setError("");
    if (step === "type") {
      setServices(defaultsFor(type));
      setStep("name");
    } else if (step === "name") {
      if (!name.trim()) return setError("Escribí el nombre de tu salón.");
      setStep("services");
    } else if (step === "services") {
      const chosen = services.filter((s) => s.on);
      if (chosen.length === 0) return setError("Elegí al menos un servicio.");
      if (chosen.some((s) => !s.name.trim())) return setError("Poné nombre a cada servicio.");
      if (chosen.some((s) => !Number(s.price) || Number(s.price) <= 0)) return setError("Revisá los precios: tienen que ser mayores a cero.");
      setStep("team");
    } else {
      const members = team
        .map((m) => ({ name: m.name.trim(), commissionPercent: Math.min(100, Number(m.commission) || 0) }))
        .filter((m) => m.name);
      if (members.length === 0) return setError("Sumá al menos una persona.");
      completeOnboarding({
        name: name.trim(),
        type,
        services: services
          .filter((s) => s.on)
          .map((s) => ({ name: s.name.trim(), baseDurationMin: Number(s.minutes) || 30, price: Number(s.price) })),
        team: members,
      });
      router.push("/hoy");
    }
  }

  return (
    <SplitLayout
      eyebrow={`Paso ${index + 1} de ${STEPS.length}`}
      title={TITLE[step]}
      subtitle={SUBTITLE[step]}
    >
      <div className="flex flex-col gap-5">
        {index > 0 ? (
          <button type="button" onClick={() => setStep(STEPS[index - 1])} className="flex min-h-touch items-center gap-1 self-start text-sm font-medium text-link">
            <ArrowLeft className="size-4" aria-hidden />Volver
          </button>
        ) : null}

        {step === "type" ? (
          <div role="group" aria-label="Tipo de salón" className="flex flex-col gap-2">
            {TYPES.map((t) => (
              <button key={t.value} type="button" aria-pressed={type === t.value} onClick={() => setType(t.value)}
                className={cn("min-h-16 rounded-card border p-4 text-left transition-colors duration-base ease-out", type === t.value ? "border-accent-border bg-accent" : "border-subtle bg-surface")}>
                <span className="block text-base font-semibold">{t.label}</span>
                <span className="block text-sm text-muted-foreground">{t.hint}</span>
              </button>
            ))}
          </div>
        ) : null}

        {step === "name" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="ob-name" className="text-sm font-medium">Nombre del salón</Label>
            <Input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" placeholder="Ej: Estudio Lupe" aria-invalid={Boolean(error)} />
            <p className="text-sm text-muted-foreground">Tu link va a ser tijereta.app/reservar/{name.trim() ? name.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "tu-salon"}</p>
          </div>
        ) : null}

        {step === "services" ? (
          <>
            <ul className="divide-y divide-border">
              {services.map((s) => (
                <li key={s.key} className="flex items-center gap-3 py-3">
                  <Checkbox checked={s.on} onCheckedChange={(v) => patchService(s.key, { on: v })} aria-label={`Incluir ${s.name || "servicio"}`} />
                  <div className="min-w-0 flex-1">
                    {s.custom ? (
                      <Input aria-label="Nombre del servicio" value={s.name} onChange={(e) => patchService(s.key, { name: e.target.value })} className="h-11" placeholder="Nombre" />
                    ) : (
                      <>
                        <p className="truncate text-base font-semibold">{s.name}</p>
                        <p className="text-sm text-muted-foreground">{formatDuration(Number(s.minutes) || 0)}</p>
                      </>
                    )}
                  </div>
                  <Input aria-label={`Minutos de ${s.name || "servicio"}`} inputMode="numeric" value={s.minutes} onChange={(e) => patchService(s.key, { minutes: digits(e.target.value) })} className="h-11 w-16 text-right" />
                  <Input aria-label={`Precio de ${s.name || "servicio"}`} inputMode="numeric" value={s.price} onChange={(e) => patchService(s.key, { price: digits(e.target.value) })} className="h-11 w-24 text-right" />
                </li>
              ))}
            </ul>
            <p className="text-xs text-tertiary">Minutos y precio en pesos. Podés cambiar todo después, en Servicios y precios.</p>
            <Button type="button" variant="ghost" className="h-12 self-start" leadingIcon={Plus}
              onClick={() => setServices((cur) => [...cur, { key: `custom-${cur.length}-${Date.now()}`, name: "", minutes: "45", price: "", on: true, custom: true }])}>
              Agregar otro servicio
            </Button>
            {services.some((s) => s.on && Number(s.price) > 0) ? (
              <p className="text-sm text-muted-foreground">
                {services.filter((s) => s.on).length} {services.filter((s) => s.on).length === 1 ? "servicio" : "servicios"} · el más caro: {formatARS(Math.max(...services.filter((s) => s.on).map((s) => Number(s.price) || 0)))}
              </p>
            ) : null}
          </>
        ) : null}

        {step === "team" ? (
          <>
            <ul className="divide-y divide-border">
              {team.map((member, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <Input aria-label={`Persona ${i + 1}`} value={member.name} onChange={(e) => setTeam(team.map((t, n) => (n === i ? { ...t, name: e.target.value } : t)))} className="h-11 flex-1" placeholder="Nombre" />
                  <div className="flex items-center gap-1">
                    <Input aria-label={`Comisión de ${member.name || `la persona ${i + 1}`}`} inputMode="numeric" value={member.commission} onChange={(e) => setTeam(team.map((t, n) => (n === i ? { ...t, commission: digits(e.target.value).slice(0, 3) } : t)))} className="h-11 w-16 text-right" />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  {team.length > 1 ? (
                    <Button type="button" variant="ghost" size="icon" className="size-11" aria-label="Quitar persona" onClick={() => setTeam(team.filter((_, n) => n !== i))}>
                      <X className="size-5" aria-hidden />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
            <Button type="button" variant="ghost" className="h-12 self-start" leadingIcon={Plus} onClick={() => setTeam([...team, { name: "", commission: "40" }])}>
              Sumar a otra persona
            </Button>
            <Banner status="info" contrast="high">
              <BannerTitle>Para qué sirve</BannerTitle>
              <BannerDescription>Con la comisión calculamos cuánto te queda en cada servicio.</BannerDescription>
            </Banner>
          </>
        ) : null}

        {error ? <p className="text-sm text-danger-fg">{error}</p> : null}
        <Button type="button" className="h-14 text-base font-semibold" onClick={next}>
          {step === "team" ? "Crear mi agenda" : "Seguir"}
        </Button>
      </div>
    </SplitLayout>
  );
}
