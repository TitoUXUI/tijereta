import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";

const LABEL: Record<AppointmentStatus, string> = {
  pending: "Por confirmar",
  confirmed: "Confirmado",
  arrived: "Llegó",
  done: "Listo",
  cancelled: "Cancelado",
  rescheduled: "Reprogramado",
  no_show: "No vino",
};

const TONE: Record<AppointmentStatus, string> = {
  pending: "bg-warning-bg text-warning-fg border-warning-border",
  confirmed: "bg-success-bg text-success-fg border-success-border",
  arrived: "bg-info-bg text-info-fg border-info-border",
  done: "bg-sunken text-muted-foreground border-subtle",
  cancelled: "bg-danger-bg text-danger-fg border-danger-border",
  rescheduled: "bg-info-bg text-info-fg border-info-border",
  no_show: "bg-danger-bg text-danger-fg border-danger-border",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant="dot" className={cn("font-medium", TONE[status])}>
      {LABEL[status]}
    </Badge>
  );
}
