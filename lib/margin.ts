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

export function suppliesCostOf(state: DemoState, service: Service, multiplier: number): number {
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

export const TARGET_MARGIN_PERCENT = HEALTHY_MARGIN_PERCENT;

/** Margen que queda con un precio nuevo, con los mismos insumos y la misma comisión */
export function marginAt(row: Pick<MarginRow, "suppliesCost">, newPrice: number, commissionPercent: number) {
  const commissionCost = Math.round((newPrice * commissionPercent) / 100);
  const margin = newPrice - row.suppliesCost - commissionCost;
  const marginPercent = newPrice === 0 ? 0 : Math.round((margin / newPrice) * 100);
  return { price: newPrice, suppliesCost: row.suppliesCost, commissionCost, margin, marginPercent, level: marginLevel(margin, marginPercent) };
}

/** Precio que deja el margen objetivo, redondeado hacia arriba a $500. Null si no hay precio posible. */
export function suggestedPrice(row: MarginRow, commissionPercent: number, target = TARGET_MARGIN_PERCENT): number | null {
  const denominator = 1 - target / 100 - commissionPercent / 100;
  if (denominator <= 0.05) return null;
  const raw = row.suppliesCost / denominator;
  return Math.ceil(raw / 500) * 500;
}

/** Máximo que se le sugiere subir un precio de una sola vez (+40%) */
export const MAX_SUGGESTED_RISE = 1.4;

export interface PriceSuggestion {
  price: number;
  targetPercent: number;
}

/** El mejor margen alcanzable subiendo hasta un 40% el precio: prueba 40, 30, 20 y 10 */
export function bestSuggestion(row: MarginRow, commissionPercent: number): PriceSuggestion | null {
  for (const target of [40, 30, 20, 10]) {
    const price = suggestedPrice(row, commissionPercent, target);
    if (price !== null && price <= row.price * MAX_SUGGESTED_RISE && price > row.price) {
      return { price, targetPercent: target };
    }
  }
  return null;
}
