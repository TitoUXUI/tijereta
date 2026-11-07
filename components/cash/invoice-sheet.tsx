"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/layout/responsive-sheet";
import { Banner, BannerDescription, BannerTitle } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsItem } from "@/components/ui/tabs";
import { formatARS } from "@/lib/format";
import { ARCA_DEMO_NOTICE, ARCA_DEMO_TITLE } from "@/lib/mocks/arca";
import { appointmentTotal, serviceNames } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";
import type { InvoiceType, Payment } from "@/types";

const TYPES: InvoiceType[] = ["A", "B", "C"];

interface InvoiceSheetProps {
  payment: Payment | null;
  onClose: () => void;
}

/** Emitir una factura SIMULADA: nunca se conecta con ARCA */
export function InvoiceSheet({ payment, onClose }: InvoiceSheetProps) {
  const { state, issueInvoice } = useDemo();
  const router = useRouter();
  const [type, setType] = useState(2);
  const [customer, setCustomer] = useState("Consumidor final");
  const [doc, setDoc] = useState("");

  useEffect(() => {
    if (payment) {
      setType(2);
      setCustomer("Consumidor final");
      setDoc("");
    }
  }, [payment]);

  if (!payment) return <ResponsiveSheet open={false} onOpenChange={() => undefined} title=""><span /></ResponsiveSheet>;
  const appointment = state.appointments.find((a) => a.id === payment.appointmentId);
  const total = appointment ? appointmentTotal(state, appointment.id) : payment.amount;

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title="Emitir factura" description={`${appointment ? serviceNames(state, appointment.id) : ""} · ${formatARS(total)}`}>
      <div className="flex flex-col gap-4">
        <Banner status="warning" contrast="high">
          <BannerTitle>Modo demo</BannerTitle>
          <BannerDescription>Este comprobante es de prueba: no se conecta con ARCA ni tiene validez fiscal.</BannerDescription>
        </Banner>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Tipo de comprobante</p>
          <Tabs selectedIndex={type} onSelect={setType} aria-label="Tipo de comprobante">
            {TYPES.map((t, i) => (
              <TabsItem key={t} index={i} label={`Factura ${t}`} />
            ))}
          </Tabs>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="inv-customer" className="text-sm font-medium">Cliente</Label>
          <Input id="inv-customer" value={customer} onChange={(e) => setCustomer(e.target.value)} className="h-12" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="inv-doc" className="text-sm font-medium">DNI o CUIT (opcional)</Label>
          <Input id="inv-doc" inputMode="numeric" value={doc} onChange={(e) => setDoc(e.target.value.replace(/\D/g, ""))} className="h-12" />
        </div>
        <Button
          type="button"
          className="h-14 text-base font-semibold"
          onClick={() => {
            const invoice = issueInvoice(payment.id, { type: TYPES[type], customerName: customer, customerDoc: doc });
            if (!invoice) return;
            toast.success(`${ARCA_DEMO_TITLE} emitido: Factura ${invoice.type} ${invoice.pointOfSale}-${invoice.number}`);
            onClose();
            router.push(`/caja/comprobante/${invoice.id}`);
          }}
        >
          Emitir comprobante (demo)
        </Button>
        <p className="text-center text-xs text-muted-foreground">{ARCA_DEMO_NOTICE}</p>
      </div>
    </ResponsiveSheet>
  );
}
