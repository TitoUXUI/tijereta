"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Star } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ReviewPromptProps {
  salonName: string;
  bookingHref: string;
}

const LABELS = ["Mala", "Regular", "Bien", "Muy buena", "Excelente"] as const;

/** Reseña simulada: no se guarda en ningún servidor. */
export function ReviewPrompt({ salonName, bookingHref }: ReviewPromptProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [skipped, setSkipped] = useState(false);

  if (sent) {
    return (
      <EmptyState
        illustration="pago-exitoso"
        icon={Check}
        title="¡Gracias por tu reseña!"
        text={`Le va a llegar a ${salonName}. Cuando quieras, reservá tu próximo turno.`}
        action={<Button asChild className="h-14 text-base font-semibold"><Link href={bookingHref}>Reservar otro turno</Link></Button>}
      />
    );
  }

  if (skipped) {
    return (
      <EmptyState
        illustration="listo"
        icon={Check}
        title="Tu turno ya pasó"
        text="¡Gracias por venir! Cuando quieras, reservá el próximo."
        action={<Button asChild className="h-14 text-base font-semibold"><Link href={bookingHref}>Reservar otro turno</Link></Button>}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <EmptyState
        illustration="listo"
        icon={Check}
        title="¿Cómo te fue?"
        text={`Gracias por venir a ${salonName}. Tu reseña ayuda al equipo a mejorar y a otras personas a elegir.`}
      />
      <div role="radiogroup" aria-label="Calificación" className="flex gap-2">
        {LABELS.map((label, i) => {
          const value = i + 1;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} de 5: ${label}`}
              onClick={() => setRating(value)}
              className="flex size-11 items-center justify-center rounded-control transition-transform duration-base ease-out active:scale-95"
            >
              <Star className={cn("size-9 text-muted-foreground", value <= rating && "fill-current text-warning-solid")} aria-hidden />
            </button>
          );
        })}
      </div>
      {rating > 0 ? <p className="text-sm font-medium">{LABELS[rating - 1]}</p> : null}
      {rating > 0 ? (
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Contanos qué te gustó o qué podemos mejorar (opcional)"
          aria-label="Comentario"
          className="w-full"
        />
      ) : null}
      <Button
        type="button"
        className="h-14 w-full text-base font-semibold"
        disabled={rating === 0}
        onClick={() => {
          setSent(true);
          toast.success("¡Gracias! Tu reseña quedó enviada (demo).");
        }}
      >
        Dejar mi reseña
      </Button>
      <Button type="button" variant="ghost" className="h-11" onClick={() => setSkipped(true)}>Ahora no</Button>
    </div>
  );
}
