"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/layout/responsive-sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsItem } from "@/components/ui/tabs";
import { formatARS } from "@/lib/format";
import { appointmentTotal } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";
import type { Appointment, Payment } from "@/types";

const METHODS = ["Efectivo", "Mercado Pago (prueba)", "Débito"] as const;

interface ChargeSheetProps {
  appointment: Appointment | null;
  onClose: () => void;
  /** Se llama con el cobro registrado y si se pidió factura */
  onCharged: (payment: Payment, wantsInvoice: boolean) => void;
}

/** Cobrar un turno: total, seña ya recibida, a cobrar ahora y medio de pago */
export function ChargeSheet({ appointment, onClose, onCharged }: ChargeSheetProps) {
  const { state, chargeAppointment } = useDemo();
  const [method, setMethod] = useState<number>(0);
  const [invoice, setInvoice] = useState(false);

  useEffect(() => {
    if (appointment) {
      setMethod(0);
      setInvoice(false);
    }
  }, [appointment]);

  if (!appointment) return <ResponsiveSheet open={false} onOpenChange={() => undefined} title=""><span /></ResponsiveSheet>;

  const client = state.clients.find((c) => c.id === appointment.clientId);
  const total = appointmentTotal(state, appointment.id);
  const due = Math.max(0, total - appointment.depositPaid);

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={`Cobrar a ${client?.name ?? "la persona"}`}>
      <div className="flex flex-col gap-4">
        <ul className="divide-y divide-border">
          <li className="flex items-center justify-between py-3 text-base">
            <span className="text-muted-foreground">Total del turno</span>
            <span className="font-semibold">{formatARS(total)}</span>
          </li>
          {appointment.depositPaid > 0 ? (
            <li className="flex items-center justify-between py-3 text-base">
              <span className="text-muted-foreground">Seña recibida (simulada)</span>
              <span className="font-semibold">− {formatARS(appointment.depositPaid)}</span>
            </li>
          ) : null}
          <li className="flex items-center justify-between py-3 text-base">
            <span className="font-semibold">A cobrar ahora</span>
            <span className="text-xl font-semibold">{formatARS(due)}</span>
          </li>
        </ul>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Medio de pago</p>
          <Tabs selectedIndex={method} onSelect={setMethod} aria-label="Medio de pago">
            <TabsItem index={0} label="Efectivo" />
            <TabsItem index={1} label="Mercado Pago" />
            <TabsItem index={2} label="Débito" />
          </Tabs>
        </div>

        <div className="flex flex-col gap-1">
          <Switch label="Emitir factura" checked={invoice} onToggle={() => setInvoice(!invoice)} />
          <p className="text-sm text-muted-foreground">Comprobante de prueba, sin validez fiscal.</p>
        </div>

        <Button
          type="button"
          className="h-14 text-base font-semibold"
          onClick={() => {
            const payment = chargeAppointment(appointment.id, METHODS[method], due);
            toast.success(`Cobro registrado: ${formatARS(due)}`);
            onCharged(payment, invoice);
          }}
        >
          Registrar cobro
        </Button>
      </div>
    </ResponsiveSheet>
  );
}
