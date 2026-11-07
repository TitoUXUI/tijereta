"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { BulkAdjust } from "@/components/services/bulk-adjust";
import { useDemo } from "@/lib/store/demo-store";

export default function AjustarPreciosPage() {
  const { state } = useDemo();

  if (state.role !== "owner") {
    return (
      <div className="p-4 pt-12 md:px-10">
        <EmptyState icon={Lock} text="Los precios los ajusta solo la dueña del salón." />
      </div>
    );
  }

  return (
    <>
      <HeroBand tone="brand" eyebrow="Servicios y precios" title="Ajustar precios">
        <p className="text-base">Elegí cuánto subir y a qué servicios.</p>
      </HeroBand>
      <div className="flex flex-col gap-4 px-4 py-6 md:px-10 md:py-8">
        <Link href="/servicios" className="flex min-h-touch items-center gap-1 self-start text-sm font-medium text-link">
          <ArrowLeft className="size-4" aria-hidden />Volver a servicios
        </Link>
        <div className="w-full max-w-2xl"><BulkAdjust /></div>
      </div>
    </>
  );
}
