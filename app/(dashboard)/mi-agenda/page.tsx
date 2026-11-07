"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { TeamAgenda } from "@/components/appointments/team-agenda";
import { CommissionStatement } from "@/components/commissions/commission-statement";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

type Tab = "agenda" | "comisiones";

export default function MiAgendaPage() {
  const { state, setCurrentProfessional } = useDemo();
  const [tab, setTab] = useState<Tab>("agenda");

  if (state.role !== "professional") {
    return (
      <div className="p-4 pt-12 md:px-10">
        <EmptyState icon={Lock} text="Esta pantalla es para el equipo. Cambiá a “Profesional” arriba para verla." />
      </div>
    );
  }

  const pro = state.professionals.find((p) => p.id === state.currentProfessionalId) ?? state.professionals[0];

  return (
    <>
      <HeroBand tone="accent" eyebrow={state.salon.name} title={`Hola, ${pro?.name ?? ""}`}>
        <div role="group" aria-label="Quién sos (demo)" className="flex flex-wrap gap-2">
          {state.professionals.map((p) => (
            <button key={p.id} type="button" aria-pressed={p.id === pro?.id} onClick={() => setCurrentProfessional(p.id)}
              className={cn("min-h-touch rounded-full px-4 text-sm font-medium transition-colors duration-base ease-out", p.id === pro?.id ? "bg-brand text-brand-foreground" : "bg-surface/60 text-primary-foreground")}>
              {p.name}
            </button>
          ))}
        </div>
      </HeroBand>

      <div className="flex flex-col gap-4 px-4 py-6 md:px-10 md:py-8">
        <div role="tablist" aria-label="Mi agenda" className="flex gap-2">
          {(["agenda", "comisiones"] as const).map((t) => (
            <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)}
              className={cn("min-h-touch flex-1 rounded-control px-4 text-sm font-semibold transition-colors duration-base ease-out", tab === t ? "bg-brand text-brand-foreground" : "bg-sunken text-muted-foreground")}>
              {t === "agenda" ? "Mi agenda" : "Mis comisiones"}
            </button>
          ))}
        </div>
        {pro ? (
          tab === "agenda" ? (
            <TeamAgenda onlyProfessionalId={pro.id} allowAddService />
          ) : (
            <CommissionStatement state={state} professionalId={pro.id} />
          )
        ) : null}
      </div>
    </>
  );
}
