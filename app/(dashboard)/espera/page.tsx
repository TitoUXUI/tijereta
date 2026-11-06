"use client";

import { HeroBand } from "@/components/layout/hero-band";
import { WaitlistPanel } from "@/components/waitlist/waitlist-panel";
import { useDemo } from "@/lib/store/demo-store";

export default function EsperaPage() {
  const { state } = useDemo();
  const waiting = state.waitlist.filter((w) => w.status === "waiting").length;
  return (
    <>
      <HeroBand tone="accent" title="Lista de espera">
        <p className="text-base">
          {waiting === 0
            ? "Nadie espera un horario por ahora."
            : `${waiting} ${waiting === 1 ? "persona espera" : "personas esperan"} un horario. Ofrecéselo a quien va primero.`}
        </p>
      </HeroBand>
      <div className="px-4 py-6 md:px-8">
        <WaitlistPanel />
      </div>
    </>
  );
}
