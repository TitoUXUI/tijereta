"use client";

import { useEffect, useState } from "react";

/** true cuando la pantalla cumple la consulta (ej. "(min-width: 768px)"); false en el primer render */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}
