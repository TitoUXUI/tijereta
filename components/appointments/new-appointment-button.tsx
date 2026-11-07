"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickBookingSheet } from "@/components/appointments/quick-booking-sheet";

interface NewAppointmentButtonProps {
  label?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}

export function NewAppointmentButton({ label = "Nuevo turno", className, variant = "primary" }: NewAppointmentButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant={variant} className={className ?? "h-14 w-full gap-2 text-base font-semibold"} onClick={() => setOpen(true)} leadingIcon={Plus}>
        {label}
      </Button>
      <QuickBookingSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
