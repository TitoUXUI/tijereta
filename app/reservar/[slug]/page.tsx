"use client";

import { Loader2, SearchX } from "lucide-react";
import { BookingFlow } from "@/components/booking/booking-flow";
import { EmptyState } from "@/components/layout/empty-state";
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
      <div className="mx-auto max-w-md p-4 pt-16">
        <EmptyState icon={SearchX} text="No encontramos este salón. Revisá que el link esté completo." />
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md">
      <BookingFlow />
    </main>
  );
}
