"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { ChannelTag } from "@/components/appointments/channel-tag";
import { StatusBadge } from "@/components/appointments/status-badge";
import { formatARS, formatTime, addMinutes } from "@/lib/format";
import { appointmentTotal, serviceNames } from "@/lib/scheduling";
import { cn } from "@/lib/utils";
import type { Appointment, DemoState } from "@/types";

interface AppointmentCardProps {
  state: DemoState;
  appointment: Appointment;
  showProfessional?: boolean;
  showPrice?: boolean;
  onSelect?: (appointment: Appointment) => void;
}

export function AppointmentCard({
  state,
  appointment,
  showProfessional = true,
  showPrice = true,
  onSelect,
}: AppointmentCardProps) {
  const client = state.clients.find((c) => c.id === appointment.clientId);
  const pro = state.professionals.find((p) => p.id === appointment.professionalId);
  const delayed = appointment.delayMinutes > 0;
  const start = delayed ? addMinutes(appointment.startsAt, appointment.delayMinutes) : appointment.startsAt;

  const body = (
    <>
      <div className="flex w-14 shrink-0 flex-col">
        <span className={cn("text-base font-bold", delayed && "text-warning-fg")}>{formatTime(start)}</span>
        {delayed ? (
          <span className="text-xs text-muted-foreground line-through">{formatTime(appointment.startsAt)}</span>
        ) : (
          <span className="text-xs text-muted-foreground">{formatTime(appointment.endsAt)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold">{client?.name ?? "Cliente"}</p>
        <p className="truncate text-sm text-muted-foreground">{serviceNames(state, appointment.id)}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <ChannelTag channel={appointment.channel} />
          {showProfessional && pro ? (
            <span className="text-xs text-muted-foreground">con {pro.name}</span>
          ) : null}
          {delayed ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-fg">
              <Clock className="size-3.5" aria-hidden />+{appointment.delayMinutes} min
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusBadge status={appointment.status} />
        {showPrice ? (
          <span className="text-sm font-medium">{formatARS(appointmentTotal(state, appointment.id))}</span>
        ) : null}
      </div>
    </>
  );

  const classes =
    "flex min-h-touch w-full items-start gap-3 rounded-card border border-subtle bg-surface p-3 text-left transition-colors duration-base ease-out hover:bg-sunken";

  if (onSelect) {
    return (
      <button type="button" className={classes} onClick={() => onSelect(appointment)}>
        {body}
      </button>
    );
  }
  return (
    <Link href={`/turno/${appointment.manageToken}`} className={classes}>
      {body}
    </Link>
  );
}
