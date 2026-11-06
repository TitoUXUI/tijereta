import type { DemoState, Service, ServiceVariant } from "@/types";

export type MarginLevel = "healthy" | "low" | "loss";

export interface MarginRow {
  id: string;
  serviceId: string;
  name: string;
  variantName: string | null;
  price: number;
  suppliesCost: number;
  commissionCost: number;
  margin: number;
  marginPercent: number;
  level: MarginLevel;
}

export const HEALTHY_MARGIN_PERCENT = 40;

export function marginLevel(margin: number, percent: number): MarginLevel {
  if (margin < 0) return "loss";
  return percent >= HEALTHY_MARGIN_PERCENT ? "healthy" : "low";
}

export const MARGIN_LABEL: Record<MarginLevel, string> = {
  healthy: "Margen sano",
  low: "Margen bajo",
  loss: "Perdés plata",
};

function suppliesCostOf(state: DemoState, service: Service, multiplier: number): number {
  return (
    state.serviceProducts
      .filter((sp) => sp.serviceId === service.id)
      .reduce((sum, sp) => {
        const product = state.products.find((p) => p.id === sp.productId);
        return sum + (product ? product.unitCost * sp.quantity : 0);
      }, 0) * multiplier
  );
}

export function averageCommissionPercent(state: DemoState): number {
  const active = state.professionals.filter((p) => p.active);
  if (active.length === 0) return 0;
  return active.reduce((s, p) => s + p.commissionPercent, 0) / active.length;
}

function buildRow(
  state: DemoState,
  service: Service,
  variant: ServiceVariant | null,
): MarginRow {
  const price = service.price + (variant?.extraPrice ?? 0);
  const suppliesCost = Math.round(
    suppliesCostOf(state, service, variant?.supplyMultiplier ?? 1),
  );
  const commissionCost = Math.round((price * averageCommissionPercent(state)) / 100);
  const margin = price - suppliesCost - commissionCost;
  const marginPercent = price === 0 ? 0 : Math.round((margin / price) * 100);
  return {
    id: variant ? variant.id : service.id,
    serviceId: service.id,
    name: service.name,
    variantName: variant?.name ?? null,
    price,
    suppliesCost,
    commissionCost,
    margin,
    marginPercent,
    level: marginLevel(margin, marginPercent),
  };
}

/** Una fila por servicio y una por cada variante */
export function marginRows(state: DemoState): MarginRow[] {
  const rows: MarginRow[] = [];
  for (const service of state.services) {
    rows.push(buildRow(state, service, null));
    for (const variant of state.variants.filter((v) => v.serviceId === service.id)) {
      rows.push(buildRow(state, service, variant));
    }
  }
  return rows;
}
