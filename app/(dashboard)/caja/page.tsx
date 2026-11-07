"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, Wallet } from "lucide-react";
import { ChargeSheet } from "@/components/cash/charge-sheet";
import { InvoiceSheet } from "@/components/cash/invoice-sheet";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dayKey, formatARS, formatDayLong } from "@/lib/format";
import { appointmentTotal, serviceNames } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";
import type { Appointment, Payment } from "@/types";

export default function CajaPage() {
  const { state } = useDemo();
  const [charging, setCharging] = useState<Appointment | null>(null);
  const [invoicing, setInvoicing] = useState<Payment | null>(null);

  if (state.role === "professional") {
    return (
      <div className="p-4 pt-12 md:px-10">
        <EmptyState icon={Lock} text="La caja la ven la dueña y la recepción." />
      </div>
    );
  }

  const today = dayKey(new Date());
  const rows = state.appointments
    .filter(
      (a) =>
        dayKey(a.startsAt) === today &&
        (a.status === "done" || a.status === "arrived" || state.payments.some((p) => p.appointmentId === a.id)),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const paymentOf = (a: Appointment) => state.payments.find((p) => p.appointmentId === a.id && p.kind === "full");
  const invoiceOf = (a: Appointment) => state.invoices.find((i) => i.appointmentId === a.id);
  const todayPayments = state.payments.filter((p) => rows.some((r) => r.id === p.appointmentId));
  const sum = (pred: (p: Payment) => boolean) => todayPayments.filter(pred).reduce((s, p) => s + p.amount, 0);
  const total = sum(() => true);
  const cash = sum((p) => p.method === "Efectivo");
  const mp = sum((p) => p.method.startsWith("Mercado Pago"));

  return (
    <>
      <HeroBand tone="brand" eyebrow="Caja y cobros" title="Caja de hoy">
        <p className="text-base md:text-lg">{formatDayLong(new Date().toISOString())}</p>
      </HeroBand>

      <div className="flex flex-col gap-6 px-4 py-6 md:px-10 md:py-8">
        {rows.length === 0 ? (
          <EmptyState
            illustration="caja-vacia"
            icon={Wallet}
            title="Tu caja está lista"
            text="Cada turno que termines se suma acá y ves el total del día sin hacer cuentas."
            action={<Button asChild className="h-14 text-base font-semibold"><Link href="/hoy">Ver los turnos de hoy</Link></Button>}
          />
        ) : (
          <>
            <dl className="grid grid-cols-3 gap-3 rounded-card bg-sunken p-4 md:max-w-xl">
              {[["Cobrado", total], ["Efectivo", cash], ["Mercado Pago", mp]].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-base font-semibold">{formatARS(Number(value))}</dd>
                </div>
              ))}
            </dl>

            <section aria-labelledby="caja-cobros" className="flex flex-col gap-1">
              <h2 id="caja-cobros" className="text-xl font-semibold">Cobros de hoy</h2>
              <ul className="divide-y divide-border">
                {rows.map((a) => {
                  const client = state.clients.find((c) => c.id === a.clientId);
                  const payment = paymentOf(a);
                  const invoice = invoiceOf(a);
                  return (
                    <li key={a.id} className="flex items-center gap-3 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold">{client?.name}</p>
                        <p className="text-sm text-muted-foreground">{serviceNames(state, a.id)} · {formatARS(appointmentTotal(state, a.id))}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge variant="dot" color={payment ? "crystal" : "gray"}>{payment ? `Cobrado · ${payment.method}` : "Por cobrar"}</Badge>
                          {payment ? (
                            <Badge variant="dot" color={invoice ? "crystal" : "accent"}>
                              {invoice ? `Factura ${invoice.type} ${invoice.pointOfSale}-${invoice.number}` : "Sin facturar"}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      {!payment ? (
                        <Button type="button" variant="secondary" className="h-11" onClick={() => setCharging(a)}>Cobrar</Button>
                      ) : invoice ? (
                        <Button asChild variant="ghost" className="h-11"><Link href={`/caja/comprobante/${invoice.id}`}>Ver</Link></Button>
                      ) : (
                        <Button type="button" variant="secondary" className="h-11" onClick={() => setInvoicing(payment)}>Facturar</Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </div>

      <ChargeSheet
        appointment={charging}
        onClose={() => setCharging(null)}
        onCharged={(payment, wantsInvoice) => {
          setCharging(null);
          if (wantsInvoice) setInvoicing(payment);
        }}
      />
      <InvoiceSheet payment={invoicing} onClose={() => setInvoicing(null)} />
    </>
  );
}
