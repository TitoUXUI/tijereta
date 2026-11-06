"use client";

import { useEffect, useState } from "react";

/** Hora actual, refrescada cada `everyMs` (para cuentas regresivas como el vencimiento de una oferta) */
export function useNow(everyMs = 30_000): Date {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), everyMs);
    return () => window.clearInterval(id);
  }, [everyMs]);
  return now;
}
