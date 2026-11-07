"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { Wordmark } from "@/components/layout/wordmark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-4">
      <Wordmark className="text-brand" />
      <EmptyState
        illustration="pagina-no-encontrada"
        icon={SearchX}
        title="No encontramos esta página"
        text="Puede que el link esté incompleto o que la página ya no exista."
        action={<Button asChild className="h-14 text-base font-semibold"><Link href="/">Ir al inicio</Link></Button>}
      />
    </main>
  );
}
