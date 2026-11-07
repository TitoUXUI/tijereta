"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Lock, Percent, Plus, Tags } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { ServiceFormSheet } from "@/components/services/service-form-sheet";
import { Button } from "@/components/ui/button";
import { formatARS, formatDuration } from "@/lib/format";
import { serviceMeta, variantsOf } from "@/lib/services";
import { useDemo } from "@/lib/store/demo-store";
import type { Service } from "@/types";

const EXAMPLE_SERVICES = [
  { name: "Corte", baseDurationMin: 45, price: 18000 },
  { name: "Barba", baseDurationMin: 30, price: 9000 },
  { name: "Color", baseDurationMin: 90, price: 38000 },
];

export default function ServiciosPage() {
  const { state, saveService } = useDemo();
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  if (state.role !== "owner") {
    return (
      <div className="p-4 pt-12 md:px-8">
        <EmptyState icon={Lock} text="Los precios de los servicios los edita solo la dueña del salón." />
      </div>
    );
  }

  const withVariants = state.services.filter((s) => variantsOf(state, s.id).length > 0).length;

  function addExamples() {
    for (const e of EXAMPLE_SERVICES) {
      saveService({ ...e, requiresDeposit: false, depositPercent: 0, variants: [], suppliesCost: null });
    }
    toast.success("Sumamos tres servicios de ejemplo: ajustá los precios cuando quieras");
  }

  return (
    <>
      <HeroBand
        tone="brand"
        eyebrow="Catálogo"
        title="Servicios y precios"
        actions={
          <div className="hidden gap-3 [--tint-hover:var(--color-bg-surface)] [--tint:var(--color-bg-sunken)] md:flex">
            <Button asChild variant="secondary" className="h-14 px-6" leadingIcon={Percent}>
              <Link href="/servicios/ajustar">Ajustar todos los precios</Link>
            </Button>
            <Button type="button" className="h-14 px-8 text-base font-semibold" leadingIcon={Plus} onClick={() => setCreating(true)}>
              Agregar servicio
            </Button>
          </div>
        }
      >
        <p className="text-base md:text-lg">
          {state.services.length} {state.services.length === 1 ? "servicio" : "servicios"}
          {withVariants > 0 ? ` · ${withVariants} con variantes` : ""}
        </p>
      </HeroBand>

      <div className="flex flex-col gap-3 px-4 py-6 md:px-10 md:py-8">
        <div className="flex flex-col gap-3 md:hidden">
          <Button type="button" className="h-14 text-base font-semibold" leadingIcon={Plus} onClick={() => setCreating(true)}>
            Agregar servicio
          </Button>
          <Button asChild variant="secondary" className="h-12" leadingIcon={Percent}>
            <Link href="/servicios/ajustar">Ajustar todos los precios</Link>
          </Button>
        </div>

        <div className="hidden grid-cols-[minmax(0,1fr)_110px_90px_240px_110px_20px] gap-6 border-b border-subtle px-0 pb-2 text-sm font-medium text-muted-foreground lg:grid" aria-hidden>
          <span>Servicio</span><span>Duración</span><span>Seña</span><span>Variantes</span><span className="text-right">Precio</span><span />
        </div>

        {state.services.length === 0 ? (
          <EmptyState
            illustration="precios"
            icon={Tags}
            title="Cargá tus servicios"
            text="Sin servicios, tus clientes no pueden reservar. Podés empezar con los más comunes y ajustar los precios."
            action={
              <Button type="button" className="h-14 text-base font-semibold" leadingIcon={Plus} onClick={() => setCreating(true)}>
                Agregar servicio
              </Button>
            }
            secondary={
              <Button type="button" variant="ghost" className="h-12" onClick={addExamples}>
                Usar servicios de ejemplo
              </Button>
            }
          />
        ) : null}

        <ul className="mt-2 divide-y divide-border lg:mt-0">
          {state.services.map((service) => (
            <li key={service.id}>
              <button
                type="button"
                onClick={() => setEditing(service)}
                className="flex min-h-touch w-full items-center gap-3 py-4 text-left transition-colors duration-base ease-out hover:bg-hover lg:grid lg:grid-cols-[minmax(0,1fr)_110px_90px_240px_110px_20px] lg:gap-6"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xl font-semibold">{service.name}</span>
                  <span className="block text-sm text-muted-foreground lg:hidden">{serviceMeta(state, service)}</span>
                </span>
                <span className="hidden text-base lg:block">{formatDuration(service.baseDurationMin)}</span>
                <span className="hidden text-base lg:block">{service.requiresDeposit ? `${service.depositPercent}%` : "—"}</span>
                <span className="hidden text-base lg:block">
                  {variantsOf(state, service.id).map((v) => `${v.name} +${v.extraDurationMin} min`).join(" · ") || "—"}
                </span>
                <span className="text-base font-semibold lg:text-right">{formatARS(service.price)}</span>
                <ChevronRight className="size-5 text-tertiary" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ServiceFormSheet open={creating || editing !== null} service={editing} onClose={() => { setCreating(false); setEditing(null); }} />
    </>
  );
}
