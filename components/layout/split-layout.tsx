import type { ReactNode } from "react";
import { HeroBand, type HeroTone } from "@/components/layout/hero-band";
import { Wordmark } from "@/components/layout/wordmark";

interface SplitLayoutProps {
  tone?: HeroTone;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  children: ReactNode;
}

/**
 * Pantallas de entrada (registro, login, onboarding): en el celular, banda de color y formulario debajo;
 * en escritorio, la mitad de color a la izquierda y el formulario centrado a la derecha.
 */
export function SplitLayout({ tone = "accent", eyebrow, title, subtitle, bullets, children }: SplitLayoutProps) {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="lg:hidden">
        <HeroBand tone={tone} eyebrow={eyebrow} title={title}>
          {subtitle ? <p className="text-base">{subtitle}</p> : null}
        </HeroBand>
      </div>

      <aside className="hidden bg-primary px-16 py-12 text-primary-foreground lg:flex lg:flex-col">
        <Wordmark className="text-primary-foreground" />
        <div className="mt-auto flex flex-col gap-4">
          {eyebrow ? <p className="text-base font-medium">{eyebrow}</p> : null}
          <h1 className="font-display text-[48px] font-black leading-[1.05]">{title}</h1>
          {subtitle ? <p className="max-w-md text-lg">{subtitle}</p> : null}
          {bullets && bullets.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-2 text-base">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </aside>

      <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-4 px-4 py-6 lg:max-w-[440px] lg:px-0 lg:py-16">
        {children}
      </div>
    </main>
  );
}
