"use client";

import { HeroBand } from "@/components/layout/hero-band";
import { WaitlistPanel } from "@/components/waitlist/waitlist-panel";

export default function EsperaPage() {
  return (
    <>
      <HeroBand tone="accent" eyebrow="Lista de espera" title="Recuperá los huecos">
        <p className="text-base">Cuando se libera un horario, ofrecéselo a quien lo estaba esperando.</p>
      </HeroBand>
      <div className="px-4 py-6 md:px-8">
        <WaitlistPanel />
      </div>
    </>
  );
}
