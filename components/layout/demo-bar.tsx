"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { homeFor } from "@/components/layout/app-nav";
import { useDemo } from "@/lib/store/demo-store";
import type { Role } from "@/types";
import { toast } from "sonner";

const ROLES: Array<{ role: Role; label: string }> = [
  { role: "owner", label: "Dueña" },
  { role: "receptionist", label: "Recepción" },
  { role: "professional", label: "Profesional" },
];

/** Barra de demo: cambia el rol para ver qué ve cada persona del equipo */
export function DemoBar() {
  const { state, setRole, resetDemo } = useDemo();
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-subtle bg-sunken px-4 py-2 md:px-8">
      <span className="text-xs font-medium text-muted-foreground">Modo demo · Viendo como</span>
      <div role="group" aria-label="Rol" className="flex gap-1">
        {ROLES.map(({ role, label }) => (
          <button
            key={role}
            type="button"
            aria-pressed={state.role === role}
            onClick={() => {
              setRole(role);
              router.push(homeFor(role));
            }}
            className={cn(
              "min-h-9 rounded-full px-3 text-xs font-medium transition-colors duration-base ease-out",
              state.role === role
                ? "bg-brand text-brand-foreground"
                : "bg-surface text-muted-foreground hover:bg-subtle",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <Button leadingIcon={RotateCcw}
        type="button"
        variant="ghost"
        size="sm"
        className="ml-auto min-h-9 gap-1 text-xs"
        onClick={() => {
          resetDemo();
          router.push("/hoy");
          toast.success("Datos de ejemplo restaurados");
        }}
      >
        Reiniciar demo
      </Button>
    </div>
  );
}
