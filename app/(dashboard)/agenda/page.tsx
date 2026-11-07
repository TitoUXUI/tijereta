"use client";

import { DelayBanner } from "@/components/appointments/delay-banner";
import { NewAppointmentButton } from "@/components/appointments/new-appointment-button";
import { ShareBookingLink } from "@/components/appointments/share-booking-link";
import { TeamAgenda } from "@/components/appointments/team-agenda";
import { HeroBand } from "@/components/layout/hero-band";
import { useDemo } from "@/lib/store/demo-store";

export default function AgendaPage() {
  const { state } = useDemo();
  return (
    <>
      <HeroBand
        tone="brand"
        eyebrow={state.salon.name}
        title="Agenda del equipo"
        actions={<NewAppointmentButton className="h-14 w-full gap-2 text-base font-semibold md:w-auto md:px-8" />}
      >
        <p className="text-base md:text-lg">Los turnos del link y los del chat viven acá, en una sola agenda.</p>
      </HeroBand>
      <div className="flex flex-col gap-6 px-4 py-6 md:px-10 md:py-8">
        <DelayBanner />
        <TeamAgenda />
        <ShareBookingLink salon={state.salon} />
      </div>
    </>
  );
}
