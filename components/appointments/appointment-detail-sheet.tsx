"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { PreparedMessageSheet } from "@/components/appointments/prepared-message-dialog";
import { ServiceCombinePicker } from "@/components/appointments/service-combine-picker";
import { StatusBadge } from "@/components/appointments/status-badge";
import { ChannelTag } from "@/components/appointments/channel-tag";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatARS, formatDayLong, formatTime } from "@/lib/format";
import { appointmentTotal, itemsOf, serviceNames } from "@/lib/scheduling";
import { useDemo } from "@/lib/store/demo-store";
import type { AppointmentStatus, Reminder, ServiceSelection } from "@/types";

interface AppointmentDetailSheetProps {
  appointmentId: string | null;
  onClose: () => void;
  /** La profesional puede sumar un servicio hecho en el momento */
  allowAddService?: boolean;
}

const NEXT_STATUS: Partial<Record<AppointmentStatus, { to: AppointmentStatus; label: string }>> = {
  pending: { to: "confirmed", label: "Confirmar" },
  confirmed: { to: "arrived", label: "Llegó" },
  arrived: { to: "done", label: "Terminado" },
};

export function AppointmentDetailSheet({ appointmentId, onClose, allowAddService = false }: AppointmentDetailSheetProps) {
  const { state, setStatus, cancelAppointment, prepareMessage, addServiceToAppointment } = useDemo();
  const [messages, setMessages] = useState<Reminder[]>([]);
  const [adding, setAdding] = useState(false);
  const [extra, setExtra] = useState<ServiceSelection[]>([]);

  const appointment = state.appointments.find((a) => a.id === appointmentId);
  const client = state.clients.find((c) => c.id === appointment?.clientId);
  const pro = state.professionals.find((p) => p.id === appointment?.professionalId);
  const open = Boolean(appointment);

  function close() {
    setAdding(false);
    setExtra([]);
    onClose();
  }

  if (!appointment || !client) {
    return <Sheet open={false} onOpenChange={() => undefined}><SheetContent side="bottom" /></Sheet>;
  }

  const next = NEXT_STATUS[appointment.status];
  const items = itemsOf(state, appointment.id);

  return (
    <>
      <Sheet open={open && messages.length === 0} onOpenChange={(o) => !o && close()}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-sheet md:mx-auto md:max-w-xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-bold">{client.name}</SheetTitle>
            <SheetDescription>
              {formatDayLong(appointment.startsAt)} · {formatTime(appointment.startsAt)} a {formatTime(appointment.endsAt)} · con {pro?.name}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={appointment.status} />
            <ChannelTag channel={appointment.channel} />
            <span className="text-sm text-muted-foreground">{client.phone}</span>
          </div>

          <ul className="mt-4 divide-y divide-border rounded-card border border-subtle bg-surface">
            {items.map((item) => (
              <li key={item.id} className="flex min-h-touch items-center justify-between gap-3 px-3 py-2 text-sm">
                <span>
                  {serviceNames({ ...state, items: [item] }, appointment.id)}
                  {item.addedBy === "staff" ? <span className="ml-2 text-xs text-muted-foreground">sumado en el momento</span> : null}
                </span>
                <span className="font-medium">{formatARS(item.price)}</span>
              </li>
            ))}
            <li className="flex min-h-touch items-center justify-between px-3 py-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatARS(appointmentTotal(state, appointment.id))}</span>
            </li>
          </ul>
          {appointment.depositPaid > 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Seña simulada recibida: {formatARS(appointment.depositPaid)}</p>
          ) : null}

          {allowAddService ? (
            <div className="mt-4">
              {adding ? (
                <div className="flex flex-col gap-3">
                  <ServiceCombinePicker services={state.services} variants={state.variants} value={extra} onChange={setExtra} />
                  <Button
                    type="button"
                    className="h-12"
                    disabled={extra.length === 0}
                    onClick={() => {
                      extra.forEach((sel) => addServiceToAppointment(appointment.id, sel));
                      toast.success("Servicio sumado al turno");
                      setExtra([]);
                      setAdding(false);
                    }}
                  >
                    Sumar al turno
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="secondary" className="min-h-12 w-full gap-2" onClick={() => setAdding(true)}>
                  <Plus className="size-4" aria-hidden />
                  Sumar un servicio
                </Button>
              )}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-2">
            {next ? (
              <Button type="button" className="h-14 w-full text-base font-semibold" onClick={() => { setStatus(appointment.id, next.to); toast.success(`${client.name}: ${next.label.toLowerCase()}`); }}>
                {next.label}
              </Button>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" className="min-h-12 gap-2" onClick={() => {
                const r = prepareMessage("confirm", client.id, appointment.id);
                if (r) setMessages([r]);
              }}>
                <MessageCircle className="size-4" aria-hidden />
                Mensaje
              </Button>
              <Button asChild variant="secondary" className="min-h-12 gap-2">
                <Link href={`/turno/${appointment.manageToken}`}>
                  <ExternalLink className="size-4" aria-hidden />
                  Vista del cliente
                </Link>
              </Button>
            </div>
            {appointment.status === "confirmed" || appointment.status === "pending" ? (
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="ghost" className="min-h-12" onClick={() => { setStatus(appointment.id, "no_show"); close(); }}>No vino</Button>
                <Button type="button" variant="ghost" className="min-h-12 text-danger-fg" onClick={() => { cancelAppointment(appointment.id); toast("Turno cancelado. El horario quedó libre."); close(); }}>Cancelar turno</Button>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
      <PreparedMessageSheet reminders={messages} title="Mensaje preparado" onClose={() => setMessages([])} />
    </>
  );
}
