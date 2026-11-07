"use client";

import Link from "next/link";
import { Loader2, SearchX } from "lucide-react";
import { BookingFlow } from "@/components/booking/booking-flow";
import { EmptyState } from "@/components/layout/empty-state";
import { Wordmark } from "@/components/layout/wordmark";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/store/demo-store";

export default function ReservarPage({ params }: { params: { slug: string } }) {
  const { state, ready } = useDemo();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Cargando" />
      </div>
    );
  }

  if (params.slug !== state.salon.slug) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-4">
        <Wordmark className="text-brand" />
        <EmptyState
          illustration="pagina-no-encontrada"
          icon={SearchX}
          title="No encontramos este salón"
          text="Revisá que el link esté completo. Si te lo pasaron por el chat, pedí que te lo manden de nuevo."
          action={<Button asChild className="h-14 text-base font-semibold"><Link href="/">Ir al inicio</Link></Button>}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <BookingFlow />
    </main>
  );
}
