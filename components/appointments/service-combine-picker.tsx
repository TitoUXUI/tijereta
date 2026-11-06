"use client";

import { Check, Plus } from "lucide-react";
import { formatARS, formatDuration } from "@/lib/format";
import { totalsFor } from "@/lib/scheduling";
import { cn } from "@/lib/utils";
import type { Service, ServiceSelection, ServiceVariant } from "@/types";

interface ServiceCombinePickerProps {
  services: Service[];
  variants: ServiceVariant[];
  value: ServiceSelection[];
  onChange: (value: ServiceSelection[]) => void;
}

/** Servicios combinados (corte + barba) con variante de duración (pelo largo) */
export function ServiceCombinePicker({ services, variants, value, onChange }: ServiceCombinePickerProps) {
  function toggle(service: Service) {
    const selected = value.some((v) => v.serviceId === service.id);
    if (selected) {
      onChange(value.filter((v) => v.serviceId !== service.id));
    } else {
      onChange([...value, { serviceId: service.id, variantId: null }]);
    }
  }

  function setVariant(serviceId: string, variantId: string | null) {
    onChange(value.map((v) => (v.serviceId === serviceId ? { ...v, variantId } : v)));
  }

  const totals = totalsFor(value, services, variants);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {services.map((service) => {
          const sel = value.find((v) => v.serviceId === service.id);
          const own = variants.filter((v) => v.serviceId === service.id);
          return (
            <li
              key={service.id}
              className={cn(
                "rounded-card border-[1.5px] bg-surface transition-colors duration-base ease-out",
                sel ? "border-accent-border bg-accent" : "border-subtle",
              )}
            >
              <button
                type="button"
                aria-pressed={Boolean(sel)}
                onClick={() => toggle(service)}
                className="flex min-h-14 w-full items-center gap-3 p-3 text-left"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border",
                    sel ? "border-transparent bg-primary text-primary-foreground" : "border-input",
                  )}
                >
                  {sel ? <Check className="size-4" aria-hidden /> : <Plus className="size-4 text-tertiary" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold">{service.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {formatDuration(service.baseDurationMin)}
                    {service.requiresDeposit ? ` · seña ${service.depositPercent}%` : ""}
                  </span>
                </span>
                <span className="text-base font-medium">{formatARS(service.price)}</span>
              </button>
              {sel && own.length > 0 ? (
                <div className="flex flex-wrap gap-2 px-3 pb-3" role="group" aria-label={`Variante de ${service.name}`}>
                  {[null, ...own].map((variant) => {
                    const active = (sel.variantId ?? null) === (variant?.id ?? null);
                    return (
                      <button
                        key={variant?.id ?? "base"}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setVariant(service.id, variant?.id ?? null)}
                        className={cn(
                          "min-h-touch rounded-full border px-4 text-sm font-medium transition-colors duration-base ease-out",
                          active
                            ? "border-transparent bg-brand text-brand-foreground"
                            : "border-input bg-surface text-foreground",
                        )}
                      >
                        {variant ? `${variant.name} +${variant.extraDurationMin} min` : "Largo normal"}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {value.length > 0 ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {formatDuration(totals.durationMin)} · <span className="font-semibold text-foreground">{formatARS(totals.price)}</span>
        </p>
      ) : null}
    </div>
  );
}
