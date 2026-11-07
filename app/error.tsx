"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { Wordmark } from "@/components/layout/wordmark";
import { Button } from "@/components/ui/button";

/** Si algo falla al cargar, la persona ve qué hacer y que sus datos están a salvo */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-4">
      <Wordmark className="text-brand" />
      <EmptyState
        illustration="error-conexion"
        icon={WifiOff}
        title="No pudimos cargar esta pantalla"
        text="Revisá tu conexión y probá de nuevo. Tus turnos están a salvo."
        action={<Button type="button" className="h-14 text-base font-semibold" onClick={reset}>Reintentar</Button>}
        secondary={<Button asChild variant="ghost" className="h-12"><Link href="/inicio">Ir al inicio</Link></Button>}
      />
    </main>
  );
}
