"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { HeroBand } from "@/components/layout/hero-band";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemo } from "@/lib/store/demo-store";

type Mode = "registro" | "login";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Registro y login simulados: no se crea ninguna cuenta ni se guarda el email */
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { setRole } = useDemo();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSignup = mode === "registro";

  function finish() {
    if (isSignup) {
      router.push("/onboarding");
    } else {
      setRole("owner");
      router.push("/hoy");
    }
  }

  function submit() {
    const next: Record<string, string> = {};
    if (!EMAIL.test(email.trim())) next.email = "Revisá tu email: parece que falta algo.";
    if (isSignup && phone.replace(/\D/g, "").length < 8) next.phone = "Revisá tu teléfono: faltan números.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    toast.success(isSignup ? "Listo, armemos tu salón" : "Bienvenida de vuelta");
    finish();
  }

  function social(provider: string) {
    toast(`Modo demo: ${provider} está simulado`);
    finish();
  }

  return (
    <main className="mx-auto min-h-screen max-w-md">
      <HeroBand
        tone="accent"
        title={isSignup ? "Creá tu agenda" : "Entrá a tu agenda"}
        eyebrow={isSignup ? "Gratis, sin tarjeta" : "Tijereta"}
      />
      <form
        noValidate
        className="flex flex-col gap-4 px-4 py-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="auth-email" className="text-sm font-medium">Tu email</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p className="text-sm text-danger-fg">{errors.email}</p> : null}
        </div>

        {isSignup ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="auth-phone" className="text-sm font-medium">Tu teléfono</Label>
            <div className="flex gap-2">
              <span className="flex h-12 shrink-0 items-center whitespace-nowrap rounded-control border border-input bg-sunken px-3 text-base text-muted-foreground">
                +54 9
              </span>
              <Input
                id="auth-phone"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="11 5555 0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12"
                aria-invalid={Boolean(errors.phone)}
              />
            </div>
            {errors.phone ? (
              <p className="text-sm text-danger-fg">{errors.phone}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Para avisarte de los turnos que llegan por el link</p>
            )}
          </div>
        ) : null}

        <Button type="submit" className="h-14 text-base font-semibold">
          {isSignup ? "Seguir con email" : "Entrar con email"}
        </Button>

        <p className="text-center text-sm text-tertiary">o</p>
        <Button type="button" variant="outline" className="h-14 text-base font-semibold" onClick={() => social("Google")}>
          Seguir con Google
        </Button>
        <Button type="button" variant="outline" className="h-14 text-base font-semibold" onClick={() => social("Apple")}>
          Seguir con Apple
        </Button>

        <div className="flex gap-3 rounded-card border border-info-border bg-info-bg p-3 text-info-fg">
          <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">Modo demo</p>
            <p>No se crea ninguna cuenta ni se guarda tu email. {isSignup ? "Seguís directo al armado de tu salón." : "Entrás directo al salón de ejemplo."}</p>
          </div>
        </div>

        <Button asChild variant="ghost" className="min-h-touch text-link">
          <Link href={isSignup ? "/login" : "/registro"}>
            {isSignup ? "¿Ya tenés cuenta? Iniciá sesión" : "¿Todavía no tenés cuenta? Creala gratis"}
          </Link>
        </Button>
      </form>
    </main>
  );
}
