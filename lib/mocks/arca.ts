/**
 * ARCA SIMULADO: no hay conexión con ARCA (ex AFIP). El CAE se inventa y el comprobante
 * no tiene ninguna validez fiscal. Mostrar siempre el aviso de modo demo.
 */
export const ARCA_DEMO_TITLE = "Comprobante de prueba";
export const ARCA_DEMO_NOTICE = "Sin validez fiscal. El CAE es ficticio y no está registrado en ARCA.";
export const POINT_OF_SALE = "0001";

export function fakeCae(): string {
  let out = "";
  for (let i = 0; i < 14; i += 1) out += String(Math.floor(Math.random() * 10));
  return out;
}

export function invoiceNumber(sequence: number): string {
  return String(sequence).padStart(8, "0");
}

export function caeExpiry(from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 10);
  return d.toISOString();
}
