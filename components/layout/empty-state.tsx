"use client";

import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Nombres de los archivos en public/illustrations/ (ver el README de esa carpeta) */
export type IllustrationName =
  | "calendario-vacio"
  | "dia-libre"
  | "esperando"
  | "agenda-llena"
  | "precios"
  | "datos"
  | "monedas"
  | "mensajes"
  | "pagina-no-encontrada"
  | "turno-perdido"
  | "error-conexion"
  | "pago-exitoso"
  | "reloj"
  | "tarjeta-rechazada"
  | "caja-vacia"
  | "listo";

interface EmptyStateProps {
  icon: LucideIcon;
  text: string;
  title?: string;
  /** Botón principal */
  action?: ReactNode;
  /** Acción secundaria, debajo del botón principal */
  secondary?: ReactNode;
  /** Ilustración: si el archivo no está, se muestra el ícono */
  illustration?: IllustrationName;
  /** Versión chica, para estados dentro de una pantalla (no la pantalla entera) */
  compact?: boolean;
  className?: string;
}

/** Ilustración (o ícono) + título + una línea de texto + botón principal y acción secundaria */
export function EmptyState({ icon: Icon, text, title, action, secondary, illustration, compact = false, className }: EmptyStateProps) {
  const [missing, setMissing] = useState(false);
  const showIllustration = Boolean(illustration) && !missing;

  return (
    <div className={cn("mx-auto flex w-full max-w-md flex-col items-center gap-4 text-center", compact ? "py-4" : "py-8", className)}>
      {showIllustration ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/illustrations/${illustration}.png`}
          alt=""
          aria-hidden
          onError={() => setMissing(true)}
          className={cn("h-auto w-auto max-w-full object-contain", compact ? "max-h-32" : "max-h-48")}
        />
      ) : (
        <span className={cn("flex items-center justify-center rounded-full bg-accent text-accent-foreground", compact ? "size-14" : "size-20")}>
          <Icon className={compact ? "size-6" : "size-8"} aria-hidden />
        </span>
      )}
      {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}
      <p className="text-base text-muted-foreground">{text}</p>
      {action || secondary ? (
        <div className="flex w-full flex-col gap-2">
          {action}
          {secondary}
        </div>
      ) : null}
    </div>
  );
}
