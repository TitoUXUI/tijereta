"use client";

import Link from "next/link";
import { Calculator, Lock } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { HeroBand } from "@/components/layout/hero-band";
import { ServiceMarginTable } from "@/components/margin/service-margin-table";
import { averageCommissionPercent, marginRows } from "@/lib/margin";
import { useDemo } from "@/lib/store/demo-store";

export default function MargenPage() {
  const { state } = useDemo();

  if (state.role !== "owner") {
    return (
      <div className="p-4 pt-12 md:px-10">
        <EmptyState icon={Lock} text="El margen y los costos los ve solo la dueña del salón." />
      </div>
    );
  }

  const rows = marginRows(state);
  const worst = rows.filter((r) => r.level === "loss");
  const withoutCosts = state.serviceProducts.length === 0;

  return (
    <>
      <HeroBand tone="brand" eyebrow="Costo y margen" title="¿Cuánto te queda?">
        <p className="text-base">
          {withoutCosts
            ? "Falta cargar los costos de insumos."
            : worst.length > 0
              ? `${worst.length === 1 ? "Un servicio te hace" : `${worst.length} servicios te hacen`} perder plata.`
              : "Ningún servicio te hace perder plata."}
        </p>
      </HeroBand>
      <div className="px-4 py-6 md:px-10 md:py-8">
        {withoutCosts ? (
          <EmptyState
            illustration="datos"
            icon={Calculator}
            title="Todavía no podemos calcular tu margen"
            text="Cargá el costo de insumos de tus servicios. Si no lo sabés, empezá por los que más hacés."
            action={
              <Button asChild className="h-14 text-base font-semibold">
                <Link href="/servicios">Cargar costos</Link>
              </Button>
            }
          />
        ) : (
          <ServiceMarginTable rows={rows} averageCommission={averageCommissionPercent(state)} />
        )}
      </div>
    </>
  );
}
