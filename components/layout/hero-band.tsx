import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HeroTone = "brand" | "accent" | "highlight";

interface HeroBandProps {
  tone: HeroTone;
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
}

const TONE: Record<HeroTone, string> = {
  brand: "bg-brand text-brand-foreground",
  accent: "bg-primary text-primary-foreground",
  highlight: "bg-highlight text-highlight-foreground",
};

/** Banda de color de ancho completo que abre cada pantalla principal */
export function HeroBand({ tone, title, eyebrow, children, className }: HeroBandProps) {
  return (
    <header className={cn("rounded-b-sheet px-4 pb-6 pt-6 md:px-8", TONE[tone], className)}>
      {eyebrow ? (
        <p className={cn("text-sm font-medium", tone === "brand" ? "text-brand-accent" : "opacity-80")}>
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-1 font-display text-[32px] font-black leading-10">{title}</h1>
      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  );
}
