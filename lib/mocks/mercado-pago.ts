/**
 * Mercado Pago SIMULADO: no hay conexión con Mercado Pago ni se cobra nada.
 * La pantalla de pago es ficticia y el resultado lo elige quien prueba la demo.
 */
export type PaymentOutcome = "approved" | "pending" | "rejected";

export interface SimulatedPayment {
  status: PaymentOutcome;
  reference: string;
  method: string;
}

export const PAYMENT_METHODS = [
  { id: "balance", label: "Dinero en cuenta", detail: "Saldo de prueba" },
  { id: "credit", label: "Tarjeta de crédito", detail: "•••• 4242" },
  { id: "debit", label: "Tarjeta de débito", detail: "•••• 1111" },
  { id: "transfer", label: "Transferencia", detail: "CBU de prueba" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export function simulateDepositPayment(outcome: PaymentOutcome, methodId: PaymentMethodId): Promise<SimulatedPayment> {
  const method = PAYMENT_METHODS.find((m) => m.id === methodId)?.label ?? "Mercado Pago";
  return new Promise((resolve) => {
    window.setTimeout(
      () =>
        resolve({
          status: outcome,
          reference: `DEMO-${Math.round(Math.random() * 1e8)}`,
          method: `${method} (prueba)`,
        }),
      900,
    );
  });
}
