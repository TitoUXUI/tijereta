import { Badge } from "@/components/ui/badge";
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

type StatusColor = "accent" | "crystal" | "gray" | "port";

const COLOR: Record<AppointmentStatus, StatusColor> = {
  pending: "accent",
  confirmed: "crystal",
  arrived: "crystal",
  done: "gray",
  cancelled: "port",
  rescheduled: "crystal",
  no_show: "port",
};

/** Punto de color más etiqueta: el color nunca va solo */
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant="dot" color={COLOR[status]}>
      {LABEL[status]}
    </Badge>
  );
}
