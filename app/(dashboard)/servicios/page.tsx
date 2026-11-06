"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Lock, Percent, Plus } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { ServiceFormSheet } from "@/components/services/service-form-sheet";
import { Button } from "@/components/ui/button";
import { formatARS } from "@/lib/format";
import { serviceMeta, variantsOf } from "@/lib/services";
import { useDemo } from "@/lib/store/demo-store";
import type { Service } from "@/types";

export default function ServiciosPage() {
  const { state } = useDemo();
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

  return (
    <>
      <HeroBand tone="brand" eyebrow="Catálogo" title="Servicios y precios">
        <p className="text-base">
          {state.services.length} {state.services.length === 1 ? "servicio" : "servicios"}
          {withVariants > 0 ? ` · ${withVariants} con variantes` : ""}
        </p>
      </HeroBand>

      <div className="flex flex-col gap-3 px-4 py-6 md:px-8">
        <Button type="button" className="h-14 text-base font-semibold" leadingIcon={Plus} onClick={() => setCreating(true)}>
          Agregar servicio
        </Button>
        <Button asChild variant="secondary" className="h-12" leadingIcon={Percent}>
          <Link href="/servicios/ajustar">Ajustar todos los precios</Link>
        </Button>

        <ul className="mt-2 divide-y divide-border">
          {state.services.map((service) => (
            <li key={service.id}>
              <button
                type="button"
                onClick={() => setEditing(service)}
                className="flex min-h-touch w-full items-center gap-3 py-4 text-left transition-colors duration-base ease-out hover:bg-hover"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xl font-semibold">{service.name}</span>
                  <span className="block text-sm text-muted-foreground">{serviceMeta(state, service)}</span>
                </span>
                <span className="text-base font-semibold">{formatARS(service.price)}</span>
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
