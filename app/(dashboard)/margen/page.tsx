"use client";

import { Lock } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { ServiceMarginTable } from "@/components/margin/service-margin-table";
import { averageCommissionPercent, marginRows } from "@/lib/margin";
import { useDemo } from "@/lib/store/demo-store";

export default function MargenPage() {
  const { state } = useDemo();

  if (state.role !== "owner") {
    return (
      <div className="p-4 pt-12 md:px-8">
        <EmptyState icon={Lock} text="El margen y los costos los ve solo la dueña del salón." />
      </div>
    );
  }

  const rows = marginRows(state);
  const worst = rows.filter((r) => r.level === "loss");

  return (
    <>
      <HeroBand tone="brand" eyebrow="Costo y margen" title="¿Cuánto te queda?">
        <p className="text-base">
          {worst.length > 0
            ? `${worst.length === 1 ? "Un servicio te hace" : `${worst.length} servicios te hacen`} perder plata.`
            : "Ningún servicio te hace perder plata."}
        </p>
      </HeroBand>
      <div className="px-4 py-6 md:px-8">
        <ServiceMarginTable rows={rows} averageCommission={averageCommissionPercent(state)} />
      </div>
    </>
  );
}
