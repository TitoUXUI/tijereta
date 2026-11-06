"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/layout/responsive-sheet";
import { MarginBar } from "@/components/margin/margin-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatARS, formatDuration } from "@/lib/format";
import { MARGIN_LABEL, averageCommissionPercent, marginAt, suppliesCostOf } from "@/lib/margin";
import { DURATION_OPTIONS_MIN, MIN_DURATION_FOR_DEPOSIT_MIN, variantsOf } from "@/lib/services";
import { useDemo } from "@/lib/store/demo-store";
import type { MarginLevel } from "@/lib/margin";
import type { Service } from "@/types";

interface VariantDraft {
  id?: string;
  name: string;
  extraDurationMin: string;
  extraPrice: string;
}

interface ServiceFormSheetProps {
  open: boolean;
  /** null = servicio nuevo */
  service: Service | null;
  onClose: () => void;
}

const LEVEL_COLOR: Record<MarginLevel, "crystal" | "accent" | "port"> = { healthy: "crystal", low: "accent", loss: "port" };
const DEPOSIT_OPTIONS = [20, 30, 50];

const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function ServiceFormSheet({ open, service, onClose }: ServiceFormSheetProps) {
  const { state, saveService } = useDemo();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("45");
  const [price, setPrice] = useState("");
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [deposit, setDeposit] = useState(false);
  const [depositPercent, setDepositPercent] = useState(30);
  const [supplies, setSupplies] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (service) {
      const own = variantsOf(state, service.id);
      setName(service.name);
      setDuration(String(service.baseDurationMin));
      setPrice(String(service.price));
      setHasVariants(own.length > 0);
      setVariants(own.map((v) => ({ id: v.id, name: v.name, extraDurationMin: String(v.extraDurationMin), extraPrice: String(v.extraPrice) })));
      setDeposit(service.requiresDeposit);
      setDepositPercent(service.depositPercent || 30);
      setSupplies(String(Math.round(suppliesCostOf(state, service, 1))));
    } else {
      setName("");
      setDuration("45");
      setPrice("");
      setHasVariants(false);
      setVariants([]);
      setDeposit(false);
      setDepositPercent(30);
      setSupplies("");
    }
    setErrors({});
    // Solo al abrir: no pisar lo que la persona está escribiendo cuando cambian los datos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, service]);

  const durationMin = Number(duration);
  const canDeposit = durationMin >= MIN_DURATION_FOR_DEPOSIT_MIN;
  const priceNumber = Number(price);
  const suppliesNumber = supplies === "" ? null : Number(supplies);
  const commission = averageCommissionPercent(state);
  const live = useMemo(
    () => (priceNumber > 0 && suppliesNumber !== null ? marginAt({ suppliesCost: suppliesNumber }, priceNumber, commission) : null),
    [priceNumber, suppliesNumber, commission],
  );
  const durationOptions = useMemo(
    () => Array.from(new Set<number>([...DURATION_OPTIONS_MIN, durationMin])).sort((a, b) => a - b),
    [durationMin],
  );

  function submit() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Escribí el nombre del servicio.";
    if (!priceNumber || priceNumber <= 0) next.price = "Escribí un precio mayor a cero.";
    if (hasVariants && variants.some((v) => !v.name.trim())) next.variants = "Poné nombre a cada variante.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const saved = saveService({
      id: service?.id,
      name,
      baseDurationMin: durationMin,
      price: priceNumber,
      requiresDeposit: deposit && canDeposit,
      depositPercent,
      variants: hasVariants
        ? variants.map((v) => ({ id: v.id, name: v.name, extraDurationMin: Number(v.extraDurationMin) || 0, extraPrice: Number(v.extraPrice) || 0 }))
        : [],
      suppliesCost: suppliesNumber,
    });
    toast.success(service ? `${saved.name}: cambios guardados` : `${saved.name} ya está en tus servicios`);
    onClose();
  }

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={service ? "Editar servicio" : "Nuevo servicio"}
      description="Lo que cargues acá aparece en la agenda, en tu link de reserva y en el margen."
    >
      <form className="flex flex-col gap-4 pb-2" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sv-name" className="text-sm font-medium">Nombre</Label>
          <Input id="sv-name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" placeholder="Ej: Corte + barba" aria-invalid={Boolean(errors.name)} />
          {errors.name ? <p className="text-sm text-danger-fg">{errors.name}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Duración</span>
            <Select value={duration} onValueChange={(v) => { setDuration(v); if (Number(v) < MIN_DURATION_FOR_DEPOSIT_MIN) setDeposit(false); }}>
              <SelectTrigger className="h-12 w-full" placeholder="Duración" />
              <SelectContent>
                {durationOptions.map((d, i) => (
                  <SelectItem key={d} index={i} value={String(d)}>{formatDuration(d)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sv-price" className="text-sm font-medium">Precio (ARS)</Label>
            <Input id="sv-price" inputMode="numeric" value={price} onChange={(e) => setPrice(onlyDigits(e.target.value))} className="h-12" aria-invalid={Boolean(errors.price)} />
          </div>
        </div>
        {errors.price ? <p className="-mt-2 text-sm text-danger-fg">{errors.price}</p> : null}

        <div className="flex flex-col gap-2">
          <Switch label="Cambia según el largo" checked={hasVariants} onToggle={() => {
            const on = !hasVariants;
            setHasVariants(on);
            if (on && variants.length === 0) setVariants([{ name: "Pelo largo", extraDurationMin: "15", extraPrice: "5000" }]);
          }} />
          <p className="text-sm text-muted-foreground">Pelo largo, por ejemplo, suma tiempo y precio.</p>
          {hasVariants ? (
            <div className="flex flex-col gap-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_72px_96px_44px] items-center gap-2">
                  <Input aria-label="Nombre de la variante" value={v.name} onChange={(e) => setVariants(variants.map((x, n) => (n === i ? { ...x, name: e.target.value } : x)))} className="h-11" />
                  <Input aria-label="Minutos extra" inputMode="numeric" value={v.extraDurationMin} onChange={(e) => setVariants(variants.map((x, n) => (n === i ? { ...x, extraDurationMin: onlyDigits(e.target.value) } : x)))} className="h-11" placeholder="+min" />
                  <Input aria-label="Precio extra" inputMode="numeric" value={v.extraPrice} onChange={(e) => setVariants(variants.map((x, n) => (n === i ? { ...x, extraPrice: onlyDigits(e.target.value) } : x)))} className="h-11" placeholder="+$" />
                  <Button type="button" variant="ghost" size="icon" className="size-11" aria-label="Quitar variante" onClick={() => setVariants(variants.filter((_, n) => n !== i))}>
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
              ))}
              {errors.variants ? <p className="text-sm text-danger-fg">{errors.variants}</p> : null}
              <Button type="button" variant="ghost" className="h-11 self-start" leadingIcon={Plus} onClick={() => setVariants([...variants, { name: "", extraDurationMin: "0", extraPrice: "0" }])}>
                Agregar otra variante
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Switch label="Pedir seña" checked={deposit && canDeposit} disabled={!canDeposit} onToggle={() => setDeposit(!deposit)} />
          <p className="text-sm text-muted-foreground">
            {canDeposit ? "La seña se descuenta del total el día del turno." : "Solo para servicios largos (desde 1 h 30 min)."}
          </p>
          {deposit && canDeposit ? (
            <div role="group" aria-label="Porcentaje de seña" className="flex gap-2">
              {DEPOSIT_OPTIONS.map((p) => (
                <Button key={p} type="button" variant={p === depositPercent ? "primary" : "secondary"} className="h-11" onClick={() => setDepositPercent(p)}>
                  {p}%
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="sv-supplies" className="text-sm font-medium">Costo de insumos por servicio (opcional)</Label>
          <Input id="sv-supplies" inputMode="numeric" value={supplies} onChange={(e) => setSupplies(onlyDigits(e.target.value))} className="h-12" placeholder="Si no lo sabés, dejalo vacío" />
        </div>

        {live ? (
          <div className="rounded-card bg-sunken p-4" aria-live="polite">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Así te queda</p>
                <p className="text-xl font-semibold">{formatARS(live.margin)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[28px] font-bold leading-8">{live.marginPercent}%</span>
                <Badge variant="dot" color={LEVEL_COLOR[live.level]}>{MARGIN_LABEL[live.level]}</Badge>
              </div>
            </div>
            <div className="mt-3"><MarginBar percent={live.marginPercent} level={live.level} label={`Margen: ${live.marginPercent}%`} /></div>
            <p className="mt-2 text-xs text-muted-foreground">Insumos {formatARS(live.suppliesCost)} · comisión {formatARS(live.commissionCost)}</p>
          </div>
        ) : null}

        <Button type="submit" className="h-14 text-base font-semibold">Guardar servicio</Button>
      </form>
    </ResponsiveSheet>
  );
}
