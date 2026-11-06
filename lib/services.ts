import type { DemoState, Service, ServiceVariant } from "@/types";

export const DURATION_OPTIONS_MIN = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240] as const;

/** La seña solo se ofrece en servicios largos (ver decisiones) */
export const MIN_DURATION_FOR_DEPOSIT_MIN = 90;

export type AdjustDirection = "up" | "down";

export function roundTo500(value: number): number {
  return Math.round(value / 500) * 500;
}

/** Precio nuevo tras subir o bajar un porcentaje, con redondeo opcional a $500 */
export function adjustedPrice(price: number, percent: number, direction: AdjustDirection, round: boolean): number {
  const factor = direction === "up" ? 1 + percent / 100 : 1 - percent / 100;
  const raw = price * factor;
  return Math.max(0, round ? roundTo500(raw) : Math.round(raw));
}

export interface CatalogSnapshot {
  services: Service[];
  variants: ServiceVariant[];
}

export function snapshotCatalog(state: DemoState): CatalogSnapshot {
  return { services: state.services, variants: state.variants };
}

export function variantsOf(state: DemoState, serviceId: string): ServiceVariant[] {
  return state.variants.filter((v) => v.serviceId === serviceId);
}

export function serviceMeta(state: DemoState, service: Service): string {
  const parts: string[] = [];
  const h = Math.floor(service.baseDurationMin / 60);
  const m = service.baseDurationMin % 60;
  parts.push(h === 0 ? `${m} min` : m === 0 ? `${h} h` : `${h} h ${m} min`);
  if (service.requiresDeposit) parts.push(`seña ${service.depositPercent}%`);
  const variants = variantsOf(state, service.id);
  if (variants.length > 0) parts.push(`variante: ${variants.map((v) => v.name.toLowerCase()).join(", ")}`);
  return parts.join(" · ");
}
