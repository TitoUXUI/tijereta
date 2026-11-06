"use client";

import { Loader2 } from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { DemoBar } from "@/components/layout/demo-bar";
import { useDemo } from "@/lib/store/demo-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state, ready } = useDemo();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-label="Cargando" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-60">
      <AppNav role={state.role} />
      <DemoBar />
      <main className="mx-auto w-full max-w-5xl">{children}</main>
    </div>
  );
}
