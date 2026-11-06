"use client";

import { ManageAppointment } from "@/components/booking/manage-appointment";

export default function TurnoPage({ params }: { params: { token: string } }) {
  return <ManageAppointment token={params.token} />;
}
