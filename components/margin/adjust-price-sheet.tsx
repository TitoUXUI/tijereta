"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/layout/responsive-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatARS } from "@/lib/format";
import { MARGIN_LABEL, bestSuggestion, marginAt, type MarginLevel, type MarginRow } from "@/lib/margin";
import { useDemo } from "@/lib/store/demo-store";
import { MarginBar } from "@/components/margin/margin-bar";

const LEVEL_COLOR: Record<MarginLevel, "crystal" | "accent" | "port"> = {
  healthy: "crystal",
  low: "accent",
  loss: "port",
};

interface AdjustPriceSheetProps {
  row: MarginRow | null;
  commissionPercent: number;
  onClose: () => void;
}

/** Cambiar el precio de un servicio viendo cuánto te queda en el momento */
export function AdjustPriceSheet({ row, commissionPercent, onClose }: AdjustPriceSheetProps) {
  const { updateServicePrice } = useDemo();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (row) {
      setValue(String(row.price));
      setError("");
    }
  }, [row]);

  const parsed = Number(value.replace(/\D/g, ""));
  const result = row && parsed > 0 ? marginAt(row, parsed, commissionPercent) : null;
  const suggestion = row ? bestSuggestion(row, commissionPercent) : null;
  const name = row ? (row.variantName ? `${row.name} · ${row.variantName.toLowerCase()}` : row.name) : "";

  function save() {
    if (!row) return;
    if (!parsed || parsed <= 0) {
      setError("Escribí un precio mayor a cero.");
      return;
    }
    const previous = row.price;
    const variantId = row.variantName ? row.id : null;
    updateServicePrice(row.serviceId, variantId, parsed);
    toast.success(`${name}: ahora ${formatARS(parsed)}`, {
      action: { label: "Deshacer", onClick: () => { updateServicePrice(row.serviceId, variantId, previous); toast("Volvió a " + formatARS(previous)); } },
      duration: 8000,
    });
    onClose();
  }

  return (
    <ResponsiveSheet
      open={row !== null}
      onOpenChange={(o) => !o && onClose()}
      title="Ajustar precio"
      description={row ? `Hoy ${name} lo cobrás ${formatARS(row.price)} y te cuesta ${formatARS(row.suppliesCost + row.commissionCost)} entre insumos y comisión.` : undefined}
    >
      {row ? (
        <form className="flex flex-col gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save(); }}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="adj-price" className="text-sm font-medium">Nuevo precio</Label>
            <div className="flex gap-2">
              <span className="flex h-12 shrink-0 items-center rounded-control border border-input bg-sunken px-3 text-base text-muted-foreground">ARS</span>
              <Input id="adj-price" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))} className="h-12" aria-invalid={Boolean(error)} />
            </div>
            {error ? <p className="text-sm text-danger-fg">{error}</p> : null}
          </div>

          <div role="group" aria-label="Atajos" className="flex flex-wrap gap-2">
            {[10, 20].map((p) => (
              <Button key={p} type="button" variant="secondary" className="h-11" onClick={() => setValue(String(Math.ceil((row.price * (1 + p / 100)) / 500) * 500))}>
                +{p}%
              </Button>
            ))}
            {suggestion ? (
              <Button type="button" variant="secondary" className="h-11" onClick={() => setValue(String(suggestion.price))}>
                {suggestion.targetPercent >= 40 ? "Margen sano" : `Margen ${suggestion.targetPercent}%`} · {formatARS(suggestion.price)}
              </Button>
            ) : null}
          </div>

          {result ? (
            <div className="rounded-card bg-sunken p-4" aria-live="polite">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Así te queda</p>
                  <p className="text-xl font-semibold">{formatARS(result.margin)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[28px] font-bold leading-8">{result.marginPercent}%</span>
                  <Badge variant="dot" color={LEVEL_COLOR[result.level]}>{MARGIN_LABEL[result.level]}</Badge>
                </div>
              </div>
              <div className="mt-3">
                <MarginBar percent={result.marginPercent} level={result.level} label={`Margen: ${result.marginPercent}%`} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Precio {formatARS(result.price)} · insumos {formatARS(result.suppliesCost)} · comisión {formatARS(result.commissionCost)}
              </p>
            </div>
          ) : null}

          <Button type="submit" className="h-14 text-base font-semibold">Guardar precio</Button>
          <Button type="button" variant="ghost" className="h-12" onClick={onClose}>Cancelar</Button>
        </form>
      ) : null}
    </ResponsiveSheet>
  );
}
