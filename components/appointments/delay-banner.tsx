"use client";

import { useState } from "react";
import { Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { PreparedMessageSheet } from "@/components/appointments/prepared-message-dialog";
import { Button } from "@/components/ui/button";
import { dayKey } from "@/lib/format";
import { useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/types";

const OPTIONS = [15, 30, 45];

/** Aviso de demora: corre los turnos que quedan y prepara el mensaje para cada cliente */
export function DelayBanner() {
  const { state, setDelay } = useDemo();
  const [professionalId, setProfessionalId] = useState(state.professionals[0]?.id ?? "");
  const [messages, setMessages] = useState<Reminder[]>([]);
  const today = dayKey(new Date());

  const delayedByPro = state.professionals
    .map((p) => ({
      pro: p,
      minutes: Math.max(
        0,
        ...state.appointments
          .filter((a) => a.professionalId === p.id && dayKey(a.startsAt) === today)
          .map((a) => a.delayMinutes),
      ),
    }))
    .filter((x) => x.minutes > 0);

  return (
    <section aria-label="Aviso de demora" className="flex flex-col gap-3">
      {delayedByPro.map(({ pro, minutes }) => (
        <div key={pro.id} role="status" className="flex flex-wrap items-center gap-3 rounded-card border border-warning-border bg-warning-bg p-3 text-warning-fg">
          <Clock className="size-5 shrink-0" aria-hidden />
          <p className="flex-1 text-sm font-medium">{pro.name} viene con {minutes} min de demora. Los turnos que quedan se corrieron.</p>
          <Button type="button" variant="secondary" size="sm" className="min-h-touch" onClick={() => { setDelay(pro.id, 0); toast.success("Demora quitada"); }}>
            Quitar demora
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2 rounded-card border border-subtle bg-surface p-3">
        <MessageCircle className="size-5 text-link" aria-hidden />
        <p className="text-sm font-medium">Avisar demora</p>
        <div role="group" aria-label="Profesional" className="flex gap-1">
          {state.professionals.filter((p) => p.active).map((p) => (
            <button key={p.id} type="button" aria-pressed={p.id === professionalId} onClick={() => setProfessionalId(p.id)}
              className={cn("min-h-touch rounded-full px-3 text-sm font-medium transition-colors duration-base ease-out", p.id === professionalId ? "bg-brand text-brand-foreground" : "bg-sunken text-muted-foreground")}>
              {p.name}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Minutos de demora" className="flex gap-1">
          {OPTIONS.map((m) => (
            <Button key={m} type="button" variant="secondary" size="sm" className="min-h-touch" onClick={() => {
              const created = setDelay(professionalId, m);
              if (created.length === 0) toast("No hay turnos pendientes de hoy para avisar.");
              else setMessages(created);
            }}>
              +{m} min
            </Button>
          ))}
        </div>
      </div>
      <PreparedMessageSheet reminders={messages} title="Avisos de demora preparados" onClose={() => setMessages([])} />
    </section>
  );
}
