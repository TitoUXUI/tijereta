"use client";

import { Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Reminder } from "@/types";

interface PreparedMessageSheetProps {
  reminders: Reminder[];
  title: string;
  onClose: () => void;
}

/** Muestra los mensajes preparados (WhatsApp simulado): se copian y se pegan a mano */
export function PreparedMessageSheet({ reminders, title, onClose }: PreparedMessageSheetProps) {
  return (
    <Sheet open={reminders.length > 0} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-sheet">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-semibold">{title}</SheetTitle>
          <SheetDescription>
            Modo demo: no se envió nada. Copiá el mensaje y pegalo en el chat.
          </SheetDescription>
        </SheetHeader>
        <ul className="mt-4 flex flex-col gap-3">
          {reminders.map((r) => (
            <li key={r.id} className="rounded-card border border-subtle bg-sunken p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="size-3.5" aria-hidden />
                Para {r.toPhone}
              </p>
              <p className="mt-1 text-sm">{r.message}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 min-h-touch gap-2"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(r.message);
                    toast.success("Mensaje copiado");
                  } catch {
                    toast.error("No pudimos copiar el mensaje");
                  }
                }}
              >
                <Copy className="size-4" aria-hidden />
                Copiar
              </Button>
            </li>
          ))}
        </ul>
        <SheetFooter className="mt-4">
          <Button type="button" className="min-h-12 w-full" onClick={onClose}>
            Listo
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
