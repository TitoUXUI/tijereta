import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";
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

const PREVIEW = [
  { time: "17:30", end: "18:45", name: "Lucía Fernández", service: "Corte + barba · 1 h 15 min", status: "Llegó" },
  { time: "18:45", end: "20:45", name: "Mica Torres", service: "Color completo · 2 h", status: "Confirmado" },
  { time: "15:30", end: "17:30", name: "Julia Paz", service: "Color + tratamiento · 2 h", status: "Por confirmar" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen pb-10">
      <div className="hidden items-center justify-between bg-surface px-10 py-5 lg:flex xl:px-20">
        <Wordmark className="text-brand" />
        <div className="flex gap-3">
          <Button asChild variant="secondary" className="h-11 px-5">
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
          <Button asChild className="h-11 px-5">
            <Link href="/registro">Probar gratis</Link>
          </Button>
        </div>
      </div>

      <header className="rounded-b-sheet bg-brand px-4 pb-8 pt-6 text-brand-foreground lg:px-10 lg:pb-24 lg:pt-16 xl:px-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-16">
          <div>
            <p className="text-sm font-medium text-brand-accent lg:hidden">Tijereta</p>
            <h1 className="mt-1 font-display text-[32px] font-black leading-10 lg:text-[56px] lg:leading-[1.05]">
              Una sola agenda para todo el equipo
            </h1>
            <p className="mt-3 text-lg lg:mt-5 lg:text-xl">Cargá el turno una vez. Los del link y los del chat viven juntos.</p>
            <div className="mt-8 hidden gap-3 lg:flex">
              <Button asChild className="h-14 px-8 text-base font-semibold">
                <Link href="/registro">Probar gratis</Link>
              </Button>
              <Button asChild variant="secondary" className="h-14 px-8 text-base font-semibold">
                <Link href="/inicio">Ver la demo sin registrarme</Link>
              </Button>
            </div>
          </div>

          <div className="hidden rounded-card bg-surface p-6 text-foreground shadow-md lg:block" aria-hidden>
            <p className="text-lg font-semibold">Hoy · sábado 14</p>
            <ul className="mt-3 divide-y divide-border">
              {PREVIEW.map((p) => (
                <li key={p.name} className="flex items-start gap-4 py-4">
                  <div className="w-14 shrink-0">
                    <p className="text-base font-bold">{p.time}</p>
                    <p className="text-xs text-muted-foreground">{p.end}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.service}</p>
                  </div>
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">{p.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 lg:gap-16 lg:px-10 lg:py-16 xl:px-0">
        <div className="flex flex-col gap-3 lg:hidden">
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

        <section aria-labelledby="lp-features" className="flex flex-col gap-3 lg:gap-8">
          <h2 id="lp-features" className="text-xl font-semibold lg:text-[28px] lg:leading-8 lg:font-bold">Lo que te resuelve</h2>
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-10">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="flex flex-col gap-2 rounded-card border border-subtle bg-surface p-5 lg:rounded-none lg:border-x-0 lg:border-b-0 lg:border-t-2 lg:border-border lg:bg-transparent lg:px-0"
              >
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="text-base text-muted-foreground lg:text-lg">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="lp-pricing" className="flex flex-col gap-3">
          <h2 id="lp-pricing" className="text-xl font-semibold lg:text-[28px] lg:leading-8 lg:font-bold">Precio fijo en pesos</h2>
          <p className="text-base text-muted-foreground lg:text-lg">
            Sin comisiones por cliente. Precios de ejemplo para este prototipo.
          </p>
          <div className="mt-2 grid gap-3 md:grid-cols-2 lg:gap-6">
            {PLANS.map((p) => (
              <article
                key={p.name}
                className={
                  p.accent
                    ? "flex flex-col gap-2 rounded-card border border-accent-border bg-accent p-5 lg:p-8"
                    : "flex flex-col gap-2 rounded-card border border-subtle bg-surface p-5 lg:p-8"
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

        <section className="flex flex-col gap-3 rounded-sheet bg-highlight p-6 text-highlight-foreground lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:p-8">
          <div>
            <h2 className="text-xl font-semibold lg:text-2xl lg:font-bold">Armá tu agenda en 4 pasos</h2>
            <p className="mt-1 text-base lg:text-lg">
              Tipo de salón, nombre, servicios y equipo. En unos minutos ya tenés tu link para pegar en el chat.
            </p>
          </div>
          <Button asChild className="h-14 shrink-0 text-base font-semibold lg:px-8">
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
