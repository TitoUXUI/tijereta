"use client";

import { Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bookingLinkUrl, messageFor } from "@/lib/mocks/whatsapp";
import type { Salon } from "@/types";

/** El link se pega a mano en el chat: acá se copia el mensaje preparado, no se envía nada */
export function ShareBookingLink({ salon }: { salon: Salon }) {
  const url = bookingLinkUrl(salon.slug);

  async function copy(text: string, done: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(done);
    } catch {
      toast.error("No pudimos copiar. Seleccioná el texto y copialo a mano.");
    }
  }

  return (
    <section
      aria-label="Tu link de reserva"
      className="rounded-card border border-subtle bg-surface p-4"
    >
      <div className="flex items-center gap-2">
        <Link2 className="size-5 text-link" aria-hidden />
        <h2 className="text-base font-semibold">Tu link de reserva</h2>
      </div>
      <p className="mt-1 break-all text-sm text-muted-foreground">{url}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button leadingIcon={Copy}
          type="button"
          className="min-h-12 flex-1 gap-2"
          onClick={() =>
            copy(
              messageFor("booking_link", { salonName: salon.name, slug: salon.slug }),
              "Mensaje copiado. Pegalo en el chat.",
            )
          }
        >
          Copiar mensaje para el chat
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-12 flex-1"
          onClick={() => copy(url, "Link copiado")}
        >
          Solo el link
        </Button>
      </div>
    </section>
  );
}

/** El mismo botón de "Copiar mensaje para el chat", suelto (estados vacíos) */
export function CopyBookingMessageButton({ salon, className }: { salon: Salon; className?: string }) {
  return (
    <Button
      type="button"
      className={className ?? "h-14 text-base font-semibold"}
      leadingIcon={Copy}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(messageFor("booking_link", { salonName: salon.name, slug: salon.slug }));
          toast.success("Mensaje copiado. Pegalo en el chat.");
        } catch {
          toast.error("No pudimos copiar. Seleccioná el texto y copialo a mano.");
        }
      }}
    >
      Compartir mi link en el chat
    </Button>
  );
}
