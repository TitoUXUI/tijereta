import Link from "next/link";
import { HeroBand } from "@/components/layout/hero-band";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    title: "Una agenda para todo el equipo",
    body: "Los turnos del link, de WhatsApp y de Instagram en un solo lugar. Sin cargarlos dos veces.",
  },
  {
    title: "Un link para pegar en el chat",
    body: "Tus clientes reservan, cancelan o reprograman sin cuenta ni app. Vos seguís hablando por el chat.",
  },
  {
    title: "Cuánto te queda por servicio",
    body: "Costo de insumos y comisión de cada servicio, para no trabajar a pérdida.",
  },
];

const PLANS = [
  {
    name: "Gratis",
    price: "ARS 0",
    per: "para trabajar solo/a",
    items: ["1 profesional", "Agenda y link de reserva", "Lista de espera"],
    accent: false,
  },
  {
    name: "Pro",
    price: "ARS 30.000",
    per: "por mes, para el equipo",
    items: ["Profesionales sin límite", "Margen por servicio y comisiones", "Mensajes preparados para el chat"],
    accent: true,
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl pb-10">
      <HeroBand tone="brand" eyebrow="Tijereta" title="Una sola agenda para todo el equipo">
        <p className="text-lg">Cargá el turno una vez. Los del link y los del chat viven juntos.</p>
      </HeroBand>

      <div className="flex flex-col gap-8 px-4 py-6 md:px-8">
        <div className="flex flex-col gap-3">
          <Button asChild className="h-14 text-base font-semibold">
            <Link href="/registro">Probar gratis</Link>
          </Button>
          <Button asChild variant="secondary" className="h-14 text-base font-semibold">
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
          <Button asChild variant="ghost" className="min-h-touch text-link">
            <Link href="/inicio">Ver la demo sin registrarme</Link>
          </Button>
        </div>

        <section aria-labelledby="lp-features" className="flex flex-col gap-3">
          <h2 id="lp-features" className="text-xl font-semibold">Lo que te resuelve</h2>
          {FEATURES.map((f) => (
            <article key={f.title} className="flex flex-col gap-2 rounded-card border border-subtle bg-surface p-5">
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-base text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </section>

        <section aria-labelledby="lp-pricing" className="flex flex-col gap-3">
          <h2 id="lp-pricing" className="text-xl font-semibold">Precio fijo en pesos</h2>
          <p className="text-base text-muted-foreground">
            Sin comisiones por cliente. Precios de ejemplo para este prototipo.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {PLANS.map((p) => (
              <article
                key={p.name}
                className={
                  p.accent
                    ? "flex flex-col gap-2 rounded-card border border-accent-border bg-accent p-5"
                    : "flex flex-col gap-2 rounded-card border border-subtle bg-surface p-5"
                }
              >
                <p className={p.accent ? "text-sm font-medium text-accent-foreground" : "text-sm font-medium text-muted-foreground"}>
                  {p.name}
                </p>
                <p className="text-[28px] font-bold leading-8">{p.price}</p>
                <p className="text-sm text-muted-foreground">{p.per}</p>
                <ul className="mt-2 flex flex-col gap-1 text-base">
                  {p.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-sheet bg-highlight p-6 text-highlight-foreground">
          <h2 className="text-xl font-semibold">Armá tu agenda en 4 pasos</h2>
          <p className="text-base">
            Tipo de salón, nombre, servicios y equipo. En unos minutos ya tenés tu link para pegar en el chat.
          </p>
          <Button asChild className="h-14 text-base font-semibold">
            <Link href="/registro">Crear mi agenda</Link>
          </Button>
        </section>

        <p className="text-xs text-tertiary">
          Prototipo de portfolio. WhatsApp, Mercado Pago y ARCA están simulados.
        </p>
      </div>
    </main>
  );
}
