"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { HeroBand } from "@/components/layout/hero-band";
import { Button } from "@/components/ui/button";
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

export function OnboardingFlow() {
  const { completeOnboarding } = useDemo();
  const router = useRouter();
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<SalonType>("peluqueria");
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>(["Corte"]);
  const [team, setTeam] = useState<string[]>([""]);
  const [error, setError] = useState("");

  const index = STEPS.indexOf(step);

  function next() {
    setError("");
    if (step === "type") {
      setPicked(type === "barberia" ? ["Corte", "Barba"] : ["Corte"]);
      setStep("name");
    } else if (step === "name") {
      if (!name.trim()) return setError("Escribí el nombre de tu salón.");
      setStep("services");
    } else if (step === "services") {
      if (picked.length === 0) return setError("Elegí al menos un servicio.");
      setStep("team");
    } else {
      const names = team.map((t) => t.trim()).filter(Boolean);
      if (names.length === 0) return setError("Sumá al menos una persona.");
      completeOnboarding({
        name: name.trim(),
        type,
        services: CATALOG.filter((c) => picked.includes(c.name)),
        team: names,
      });
      router.push("/hoy");
    }
  }

  return (
    <>
      <HeroBand tone="accent" eyebrow={`Paso ${index + 1} de ${STEPS.length}`} title={TITLE[step]} />
      <div className="flex flex-col gap-5 px-4 py-6">
        {index > 0 ? (
          <button type="button" onClick={() => setStep(STEPS[index - 1])} className="flex min-h-touch items-center gap-1 self-start text-sm font-medium text-link">
            <ArrowLeft className="size-4" aria-hidden />Volver
          </button>
        ) : null}

        {step === "type" ? (
          <div role="group" aria-label="Tipo de salón" className="flex flex-col gap-2">
            {TYPES.map((t) => (
              <button key={t.value} type="button" aria-pressed={type === t.value} onClick={() => setType(t.value)}
                className={cn("min-h-16 rounded-card border-[1.5px] p-4 text-left transition-colors duration-base ease-out", type === t.value ? "border-accent-border bg-accent" : "border-subtle bg-surface")}>
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
          <ul className="flex flex-col gap-2">
            {CATALOG.map((c) => {
              const on = picked.includes(c.name);
              return (
                <li key={c.name}>
                  <button type="button" aria-pressed={on} onClick={() => setPicked(on ? picked.filter((p) => p !== c.name) : [...picked, c.name])}
                    className={cn("flex min-h-16 w-full items-center justify-between rounded-card border-[1.5px] p-4 text-left transition-colors duration-base ease-out", on ? "border-accent-border bg-accent" : "border-subtle bg-surface")}>
                    <span>
                      <span className="block text-base font-semibold">{c.name}</span>
                      <span className="block text-sm text-muted-foreground">{formatDuration(c.baseDurationMin)}</span>
                    </span>
                    <span className="font-medium">{formatARS(c.price)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {step === "team" ? (
          <div className="flex flex-col gap-3">
            {team.map((member, i) => (
              <div key={i} className="flex gap-2">
                <Input aria-label={`Persona ${i + 1}`} value={member} onChange={(e) => setTeam(team.map((t, n) => (n === i ? e.target.value : t)))} className="h-12" placeholder="Nombre" />
                {team.length > 1 ? (
                  <Button type="button" variant="ghost" className="size-12 shrink-0 p-0" aria-label="Quitar persona" onClick={() => setTeam(team.filter((_, n) => n !== i))}>
                    <X className="size-5" aria-hidden />
                  </Button>
                ) : null}
              </div>
            ))}
            <Button type="button" variant="secondary" className="min-h-12 gap-2" onClick={() => setTeam([...team, ""])}>
              <Plus className="size-4" aria-hidden />Sumar a otra persona
            </Button>
          </div>
        ) : null}

        {error ? <p className="text-sm text-danger-fg">{error}</p> : null}
        <Button type="button" className="h-14 text-base font-semibold" onClick={next}>
          {step === "team" ? "Crear mi agenda" : "Seguir"}
        </Button>
      </div>
    </>
  );
}
