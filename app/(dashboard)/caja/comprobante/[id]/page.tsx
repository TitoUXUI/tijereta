"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Download, FileX2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { Banner, BannerDescription, BannerTitle } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { formatARS, formatDayLong } from "@/lib/format";
import { ARCA_DEMO_NOTICE } from "@/lib/mocks/arca";
import { serviceNames } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";

export default function ComprobantePage({ params }: { params: { id: string } }) {
  const { state } = useDemo();
  const invoice = state.invoices.find((i) => i.id === params.id);

  if (!invoice) {
    return (
      <div className="p-4 pt-12 md:px-10">
        <EmptyState
          icon={FileX2}
          title="No encontramos este comprobante"
          text="Puede que se haya reiniciado la demo. Volvé a la caja para emitir uno nuevo."
          action={<Button asChild className="h-14 text-base font-semibold"><Link href="/caja">Volver a la caja</Link></Button>}
        />
      </div>
    );
  }

  const detail = serviceNames(state, invoice.appointmentId);
  const rows: Array<[string, string]> = [
    ["Receptor", invoice.customerName + (invoice.customerDoc ? ` · ${invoice.customerDoc}` : "")],
    ["Fecha", formatDayLong(invoice.createdAt)],
    ["Detalle", detail],
    ["Total", formatARS(invoice.total)],
    ["CAE (ficticio)", invoice.cae],
    ["Vto. del CAE", formatDayLong(invoice.caeExpiresAt)],
  ];
  const title = `Factura ${invoice.type} · ${invoice.pointOfSale}-${invoice.number}`;

  async function copy() {
    const text = [`${title} (COMPROBANTE DE PRUEBA, sin validez fiscal)`, ...rows.map(([a, b]) => `${a}: ${b}`)].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado. Pegalo en el chat.");
    } catch {
      toast.error("No pudimos copiar. Seleccioná el texto y copialo a mano.");
    }
  }

  return (
    <>
      <HeroBand tone="brand" eyebrow="Comprobante emitido" title={title} />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 md:px-0 md:py-8">
        <Link href="/caja" className="flex min-h-touch items-center gap-1 self-start text-sm font-medium text-link">
          <ArrowLeft className="size-4" aria-hidden />Volver a la caja
        </Link>
        <Banner status="error" contrast="high">
          <BannerTitle>COMPROBANTE DE PRUEBA</BannerTitle>
          <BannerDescription>{ARCA_DEMO_NOTICE}</BannerDescription>
        </Banner>
        <dl className="divide-y divide-border rounded-card border border-subtle bg-surface px-4">
          {rows.map(([a, b]) => (
            <div key={a} className="flex items-start justify-between gap-4 py-3 text-sm">
              <dt className="w-28 shrink-0 text-muted-foreground">{a}</dt>
              <dd className="text-right font-semibold">{b}</dd>
            </div>
          ))}
        </dl>
        <Button type="button" className="h-14 text-base font-semibold" leadingIcon={Copy} onClick={copy}>Copiar para el chat</Button>
        <Button type="button" variant="secondary" className="h-12" leadingIcon={Download} onClick={() => toast("Modo demo: no se genera ningún archivo")}>
          Descargar PDF (demo)
        </Button>
      </div>
    </>
  );
}
