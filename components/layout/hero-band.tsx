import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HeroTone = "brand" | "accent" | "highlight";

interface HeroBandProps {
  tone: HeroTone;
  title: string;
  eyebrow?: string;
  /** Subtítulo o texto de apoyo, debajo del título */
  children?: ReactNode;
  /** Acciones principales: debajo del texto en el celular, a la derecha en escritorio */
  actions?: ReactNode;
  /** Pantallas sin barra lateral (reserva pública): el contenido se centra con el mismo ancho que el cuerpo */
  contained?: boolean;
  className?: string;
}

const TONE: Record<HeroTone, string> = {
  brand: "bg-brand text-brand-foreground",
  accent: "bg-primary text-primary-foreground",
  highlight: "bg-highlight text-highlight-foreground",
};

/** Banda de color de ancho completo que abre cada pantalla principal */
export function HeroBand({ tone, title, eyebrow, children, actions, contained = false, className }: HeroBandProps) {
  return (
    <header
      className={cn(
        "rounded-b-sheet px-4 pb-6 pt-6 md:px-10 md:py-7",
        contained ? "md:rounded-b-sheet" : "md:rounded-b-none md:rounded-bl-sheet",
        TONE[tone],
        className,
      )}
    >
      <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8", contained && "mx-auto max-w-6xl")}>
        <div className="min-w-0">
          {eyebrow ? (
            <p className={cn("text-sm font-medium", tone === "brand" ? "text-brand-accent" : "opacity-80")}>{eyebrow}</p>
          ) : null}
          <h1 className="mt-1 font-display text-[32px] font-black leading-10">{title}</h1>
          {children ? <div className="mt-3 md:mt-1 md:text-lg">{children}</div> : null}
        </div>
        {actions ? <div className="flex flex-col gap-3 md:shrink-0 md:flex-row">{actions}</div> : null}
      </div>
    </header>
  );
}
