/**
 * Mercado Pago SIMULADO: no hay conexión con Mercado Pago ni se cobra nada.
 * La pantalla de pago es ficticia y siempre aprueba.
 */
export interface SimulatedPayment {
  approved: true;
  reference: string;
  method: string;
}

export function simulateDepositPayment(): Promise<SimulatedPayment> {
  return new Promise((resolve) => {
    window.setTimeout(
      () =>
        resolve({
          approved: true,
          reference: `DEMO-${Math.round(Math.random() * 1e8)}`,
          method: "Mercado Pago (demo)",
        }),
      900,
    );
  });
}
