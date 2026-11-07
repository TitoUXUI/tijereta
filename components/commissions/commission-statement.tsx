"use client";

import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { formatARS, formatDayLong } from "@/lib/format";
import type { DemoState } from "@/types";

/** Comisiones con el detalle por ítem, nunca un total sin desglose */
export function CommissionStatement({ state, professionalId, onBack }: { state: DemoState; professionalId: string; onBack?: () => void }) {
  const pro = state.professionals.find((p) => p.id === professionalId);
  if (!pro) return null;

  const lines = state.appointments
    .filter((a) => a.professionalId === professionalId && a.status === "done")
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .flatMap((a) =>
      state.items
        .filter((i) => i.appointmentId === a.id)
        .map((item) => {
          const service = state.services.find((s) => s.id === item.serviceId);
          const variant = state.variants.find((v) => v.id === item.variantId);
          return {
            id: item.id,
            date: a.startsAt,
            client: state.clients.find((c) => c.id === a.clientId)?.name ?? "Cliente",
            label: `${service?.name ?? "Servicio"}${variant ? ` (${variant.name.toLowerCase()})` : ""}`,
            price: item.price,
            amount: Math.round((item.price * pro.commissionPercent) / 100),
          };
        }),
    );

  const total = lines.reduce((s, l) => s + l.amount, 0);

  if (lines.length === 0) {
    return (
      <EmptyState
        illustration="monedas"
        icon={Wallet}
        title="Todavía no hay comisiones"
        text="Cuando termines tu primer servicio, vas a ver el detalle de lo que te corresponde, servicio por servicio."
        secondary={onBack ? <Button type="button" variant="ghost" className="h-12" onClick={onBack}>Volver a mi agenda</Button> : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card bg-brand p-4 text-brand-foreground">
        <p className="text-sm text-brand-accent">Tus comisiones ({pro.commissionPercent}%)</p>
        <p className="font-display text-[32px] font-black leading-10">{formatARS(total)}</p>
        <p className="text-sm">{lines.length} {lines.length === 1 ? "servicio hecho" : "servicios hechos"}</p>
      </div>
      <ul className="divide-y divide-border rounded-card border border-subtle bg-surface">
        {lines.map((l) => (
          <li key={l.id} className="flex min-h-touch items-center justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-base font-medium">{l.label} · {l.client}</p>
              <p className="text-xs text-muted-foreground">{formatDayLong(l.date)} · {formatARS(l.price)} × {pro.commissionPercent}%</p>
            </div>
            <span className="shrink-0 text-base font-semibold">{formatARS(l.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
