"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Link2, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import { Wordmark } from "@/components/layout/wordmark";
import { Button } from "@/components/ui/button";
import { homeFor } from "@/components/layout/app-nav";
import { useDemo } from "@/lib/store/demo-store";
import type { Role } from "@/types";

interface Entry {
  title: string;
  text: string;
  icon: LucideIcon;
  action: string;
}

const ENTRIES: Record<string, Entry> = {
  owner: { title: "Soy la dueña", text: "Hoy, agenda del equipo, lista de espera y margen por servicio.", icon: UserRound, action: "Entrar al salón" },
  client: { title: "Soy cliente", text: "Reservá un turno desde el link, sin cuenta ni app.", icon: Link2, action: "Abrir el link de reserva" },
  manage: { title: "Quiero cambiar mi turno", text: "Reprogramá o cancelá con el link de tu turno.", icon: CalendarClock, action: "Ver mi turno" },
  onboarding: { title: "Armar mi salón", text: "Cuatro pasos cortos y tu agenda queda lista.", icon: Sparkles, action: "Empezar" },
};

export default function InicioPage() {
  const { state, setRole, resetDemo } = useDemo();
  const router = useRouter();
  const upcoming = state.appointments
    .filter((a) => a.createdBy === "client" && new Date(a.startsAt) > new Date() && (a.status === "confirmed" || a.status === "pending"))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

  function go(role: Role) {
    setRole(role);
    router.push(homeFor(role));
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl">
      <header className="rounded-b-sheet bg-brand px-4 pb-8 pt-6 text-brand-foreground md:px-8">
        <Wordmark className="text-brand-foreground" />
        <h1 className="mt-6 font-display text-[40px] font-black leading-[48px]">Una sola agenda para todo el equipo</h1>
        <p className="mt-3 text-lg text-brand-foreground">Cargá el turno una vez. Los del link y los del chat viven juntos.</p>
        <p className="mt-4 inline-block rounded-tag bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">Prototipo de portfolio · integraciones simuladas</p>
      </header>

      <div className="grid gap-3 px-4 py-6 md:grid-cols-2 md:px-8">
        {(Object.entries(ENTRIES) as Array<[string, Entry]>).map(([key, e]) => (
          <section key={key} className="flex flex-col gap-3 rounded-card border border-subtle bg-surface p-4">
            <e.icon className="size-6 text-link" aria-hidden />
            <div>
              <h2 className="text-xl font-semibold">{e.title}</h2>
              <p className="text-sm text-muted-foreground">{e.text}</p>
            </div>
            {key === "owner" ? (
              <Button type="button" className="mt-auto min-h-12" onClick={() => go("owner")}>{e.action}</Button>
            ) : key === "client" ? (
              <Button asChild className="mt-auto min-h-12"><Link href={`/reservar/${state.salon.slug}`}>{e.action}</Link></Button>
            ) : key === "manage" ? (
              <Button asChild className="mt-auto min-h-12" disabled={!upcoming}>
                <Link href={upcoming ? `/turno/${upcoming.manageToken}` : "#"}>{e.action}</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="mt-auto min-h-12"><Link href="/onboarding">{e.action}</Link></Button>
            )}
          </section>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 px-4 pb-10 text-sm text-muted-foreground md:px-8">
        <Button type="button" variant="ghost" className="min-h-touch" onClick={() => go("receptionist")}>Entrar como recepcionista</Button>
        <Button type="button" variant="ghost" className="min-h-touch" onClick={() => go("professional")}>Entrar como profesional</Button>
        <Button type="button" variant="ghost" className="min-h-touch" onClick={() => { resetDemo(); }}>Reiniciar datos de ejemplo</Button>
      </div>
    </main>
  );
}
