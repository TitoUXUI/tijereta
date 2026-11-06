"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Banner, BannerDescription, BannerTitle } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsItem } from "@/components/ui/tabs";
import { formatARS } from "@/lib/format";
import { averageCommissionPercent, marginAt, marginRows } from "@/lib/margin";
import { adjustedPrice, type AdjustDirection } from "@/lib/services";
import { useDemo } from "@/lib/store/demo-store";

const PRESETS = [5, 10, 12, 15];

/** Sticky: pegado arriba de la barra inferior en el celular y al borde en escritorio */
const FOOTER =
  "sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] -mx-4 flex flex-col gap-2 border-t border-subtle bg-surface px-4 py-3 md:bottom-0 md:-mx-8 md:px-8";

export function BulkAdjust() {
  const { state, adjustPrices, restoreCatalog } = useDemo();
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "review">("setup");
  const [direction, setDirection] = useState<AdjustDirection>("up");
  const [percent, setPercent] = useState("12");
  const [round, setRound] = useState(true);
  const [selected, setSelected] = useState<string[]>(() => state.services.map((s) => s.id));
  const [error, setError] = useState("");

  const percentNumber = Number(percent);
  const commission = averageCommissionPercent(state);
  const baseRows = useMemo(() => marginRows(state).filter((r) => r.variantName === null), [state]);
  const example = state.services.find((s) => selected.includes(s.id)) ?? state.services[0];

  const preview = useMemo(
    () =>
      state.services
        .filter((s) => selected.includes(s.id))
        .map((s) => {
          const row = baseRows.find((r) => r.serviceId === s.id);
          const after = adjustedPrice(s.price, percentNumber || 0, direction, round);
          const before = row ? row.marginPercent : null;
          const next = row ? marginAt(row, after, commission).marginPercent : null;
          return { service: s, after, before, next };
        }),
    [state.services, selected, baseRows, percentNumber, direction, round, commission],
  );

  function toggle(id: string) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function review() {
    if (!percentNumber || percentNumber <= 0 || percentNumber > 100) return setError("Escribí un porcentaje entre 1 y 100.");
    if (selected.length === 0) return setError("Elegí al menos un servicio.");
    setError("");
    setStep("review");
  }

  function apply() {
    const before = adjustPrices(selected, percentNumber, direction, round);
    toast.success(`Precios ${direction === "up" ? "subidos" : "bajados"} ${percentNumber}% en ${selected.length} ${selected.length === 1 ? "servicio" : "servicios"}`, {
      action: { label: "Deshacer", onClick: () => { restoreCatalog(before); toast("Volvieron los precios anteriores"); } },
      duration: 10000,
    });
    router.push("/servicios");
  }

  if (step === "review") {
    return (
      <div className="flex flex-col gap-4">
        <Banner status="info" contrast="high">
          <BannerTitle>Todavía no se aplicó nada</BannerTitle>
          <BannerDescription>Mirá cómo quedan los precios. Después podés deshacerlo.</BannerDescription>
        </Banner>
        <ul className="divide-y divide-border">
          {preview.map(({ service, after, before, next }) => (
            <li key={service.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">{service.name}</p>
                {before !== null && next !== null ? (
                  <p className="text-sm text-muted-foreground">margen {before}% → {next}%</p>
                ) : null}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-base font-semibold">{formatARS(after)}</span>
                <span className="text-sm text-tertiary line-through">{formatARS(service.price)}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className={FOOTER}>
          <Button type="button" className="h-14 text-base font-semibold" onClick={apply}>
            Aplicar a {selected.length} {selected.length === 1 ? "servicio" : "servicios"}
          </Button>
          <Button type="button" variant="ghost" className="h-11" onClick={() => setStep("setup")}>Volver</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Tabs selectedIndex={direction === "up" ? 0 : 1} onSelect={(i) => setDirection(i === 0 ? "up" : "down")} aria-label="Subir o bajar">
        <TabsItem index={0} label="Subir" />
        <TabsItem index={1} label="Bajar" />
      </Tabs>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bulk-percent" className="text-sm font-medium">Porcentaje</Label>
        <div className="flex items-center gap-2">
          <Input id="bulk-percent" inputMode="numeric" value={percent} onChange={(e) => setPercent(e.target.value.replace(/\D/g, ""))} className="h-12" aria-invalid={Boolean(error)} />
          <span className="text-base text-muted-foreground">%</span>
        </div>
        <div role="group" aria-label="Atajos" className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button key={p} type="button" variant={Number(percent) === p ? "primary" : "secondary"} className="h-11" onClick={() => setPercent(String(p))}>
              {direction === "up" ? "+" : "−"}{p}%
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Switch label="Redondear a $500" checked={round} onToggle={() => setRound(!round)} />
        {example ? (
          <p className="text-sm text-muted-foreground">
            {example.name}: {formatARS(example.price)} pasa a {formatARS(adjustedPrice(example.price, percentNumber || 0, direction, round))}
          </p>
        ) : null}
      </div>

      <section aria-labelledby="bulk-which" className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 id="bulk-which" className="text-xl font-semibold">Se aplica a</h2>
          <Button type="button" variant="ghost" className="h-11" onClick={() => setSelected(selected.length === state.services.length ? [] : state.services.map((s) => s.id))}>
            {selected.length === state.services.length ? "Ninguno" : "Todos"}
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {state.services.map((s) => (
            <li key={s.id}>
              <label className="flex min-h-touch cursor-pointer items-center gap-3 py-2">
                <Checkbox checked={selected.includes(s.id)} onCheckedChange={() => toggle(s.id)} aria-label={s.name} />
                <span className="flex-1 text-base">{s.name}</span>
                <span className="text-base text-muted-foreground">{formatARS(s.price)}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {error ? <p className="text-sm text-danger-fg">{error}</p> : null}
      <div className={FOOTER}>
        <Button type="button" className="h-14 text-base font-semibold" onClick={review}>Ver cómo queda</Button>
      </div>
    </div>
  );
}
