"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickBookingSheet } from "@/components/appointments/quick-booking-sheet";

interface NewAppointmentButtonProps {
  label?: string;
  className?: string;
}

export function NewAppointmentButton({ label = "Nuevo turno", className }: NewAppointmentButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" className={className ?? "h-14 w-full gap-2 text-base font-semibold"} onClick={() => setOpen(true)}>
        <Plus className="size-5" aria-hidden />
        {label}
      </Button>
      <QuickBookingSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
