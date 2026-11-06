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
      <HeroBand tone="brand" eyebrow={state.salon.name} title="Agenda del equipo">
        <p className="text-base">Los turnos del link y los del chat viven acá, en una sola agenda.</p>
        <div className="mt-4 md:max-w-xs">
          <NewAppointmentButton />
        </div>
      </HeroBand>
      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <DelayBanner />
        <TeamAgenda />
        <ShareBookingLink salon={state.salon} />
      </div>
    </>
  );
}
