"use client";

import { RescheduleFlow } from "@/components/booking/reschedule-flow";

export default function ReagendarPage({ params }: { params: { token: string } }) {
  return <RescheduleFlow token={params.token} />;
}
