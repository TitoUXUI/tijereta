import { addMinutes, dayKey, toISO } from "@/lib/format";
import type {
  Appointment,
  AppointmentItem,
  AppointmentStatus,
  Channel,
  Client,
  CreatedBy,
  DemoState,
  Professional,
  Service,
  ServiceVariant,
} from "@/types";

/** Sube cuando cambia la forma de los datos de ejemplo, para descartar lo guardado en el navegador */
export const SEED_VERSION = "v2";

const SALON_ID = "salon-lupe";

export const PROFESSIONAL_IDS = {
  lupe: "pro-lupe",
  vane: "pro-vane",
  mauro: "pro-mauro",
} as const;

const professionals: Professional[] = [
  { id: PROFESSIONAL_IDS.lupe, salonId: SALON_ID, name: "Lupe", commissionPercent: 35, active: true, colorIndex: 1 },
  { id: PROFESSIONAL_IDS.vane, salonId: SALON_ID, name: "Vanesa", commissionPercent: 45, active: true, colorIndex: 2 },
  { id: PROFESSIONAL_IDS.mauro, salonId: SALON_ID, name: "Mauro", commissionPercent: 50, active: true, colorIndex: 3 },
];

const services: Service[] = [
  { id: "svc-corte", salonId: SALON_ID, name: "Corte", baseDurationMin: 45, price: 18000, requiresDeposit: false, depositPercent: 0, canCombine: true },
  { id: "svc-barba", salonId: SALON_ID, name: "Barba", baseDurationMin: 30, price: 9000, requiresDeposit: false, depositPercent: 0, canCombine: true },
  { id: "svc-color", salonId: SALON_ID, name: "Color", baseDurationMin: 90, price: 38000, requiresDeposit: true, depositPercent: 30, canCombine: true },
  { id: "svc-trat", salonId: SALON_ID, name: "Tratamiento", baseDurationMin: 45, price: 20000, requiresDeposit: false, depositPercent: 0, canCombine: true },
  { id: "svc-brush", salonId: SALON_ID, name: "Brushing", baseDurationMin: 30, price: 12000, requiresDeposit: false, depositPercent: 0, canCombine: true },
];

const variants: ServiceVariant[] = [
  { id: "var-corte-largo", serviceId: "svc-corte", name: "Pelo largo", extraDurationMin: 15, extraPrice: 5000, supplyMultiplier: 1.5 },
  { id: "var-color-largo", serviceId: "svc-color", name: "Pelo largo", extraDurationMin: 30, extraPrice: 15000, supplyMultiplier: 2 },
  { id: "var-brush-largo", serviceId: "svc-brush", name: "Pelo largo", extraDurationMin: 15, extraPrice: 4000, supplyMultiplier: 1.5 },
];

const clientNames: Array<[string, string]> = [
  ["Clara Benítez", "5555 0101"],
  ["Tomás Ferreyra", "5555 0102"],
  ["Julieta Rossi", "5555 0103"],
  ["Nahuel Sosa", "5555 0104"],
  ["Agustina Paz", "5555 0105"],
  ["Facundo Ledesma", "5555 0106"],
  ["Milagros Duarte", "5555 0107"],
  ["Bruno Acosta", "5555 0108"],
  ["Sofía Giménez", "5555 0109"],
  ["Ramiro Ibarra", "5555 0110"],
];

type Line = [serviceId: string, variantId: string | null];

interface AppointmentSeed {
  status?: AppointmentStatus;
  day: number;
  at: string;
  pro: string;
  client: number;
  lines: Line[];
  channel: Channel;
  by: CreatedBy;
}

const plan: AppointmentSeed[] = [
  // Hoy
  { day: 0, at: "09:00", pro: PROFESSIONAL_IDS.mauro, client: 3, lines: [["svc-corte", null], ["svc-barba", null]], channel: "whatsapp", by: "staff" },
  { day: 0, at: "10:00", pro: PROFESSIONAL_IDS.vane, client: 2, lines: [["svc-color", "var-color-largo"]], channel: "link", by: "client" },
  { day: 0, at: "10:30", pro: PROFESSIONAL_IDS.lupe, client: 4, lines: [["svc-corte", "var-corte-largo"]], channel: "instagram", by: "staff" },
  { day: 0, at: "11:30", pro: PROFESSIONAL_IDS.mauro, client: 5, lines: [["svc-corte", null]], channel: "link", by: "client" },
  { day: 0, at: "12:30", pro: PROFESSIONAL_IDS.lupe, client: 6, lines: [["svc-trat", null], ["svc-brush", null]], channel: "phone", by: "staff" },
  { day: 0, at: "14:00", pro: PROFESSIONAL_IDS.vane, client: 0, lines: [["svc-corte", null], ["svc-brush", null]], channel: "link", by: "client" },
  { day: 0, at: "15:00", pro: PROFESSIONAL_IDS.mauro, client: 7, lines: [["svc-barba", null]], channel: "walk_in", by: "staff" },
  { day: 0, at: "16:00", pro: PROFESSIONAL_IDS.lupe, client: 8, lines: [["svc-color", null]], channel: "whatsapp", by: "staff" },
  { day: 0, at: "17:00", pro: PROFESSIONAL_IDS.vane, client: 9, lines: [["svc-trat", null]], channel: "link", by: "client" },
  // Se canceló un turno de la tarde: queda un horario libre para ofrecer desde la espera
  { day: 0, at: "18:00", pro: PROFESSIONAL_IDS.lupe, client: 2, lines: [["svc-corte", null]], channel: "whatsapp", by: "staff", status: "cancelled" },
  // Mañana y pasado
  { day: 1, at: "10:00", pro: PROFESSIONAL_IDS.vane, client: 4, lines: [["svc-color", null]], channel: "link", by: "client" },
  { day: 1, at: "11:00", pro: PROFESSIONAL_IDS.mauro, client: 1, lines: [["svc-corte", null], ["svc-barba", null]], channel: "whatsapp", by: "staff" },
  { day: 1, at: "15:30", pro: PROFESSIONAL_IDS.lupe, client: 2, lines: [["svc-corte", null]], channel: "link", by: "client" },
  { day: 2, at: "12:00", pro: PROFESSIONAL_IDS.mauro, client: 3, lines: [["svc-barba", null]], channel: "instagram", by: "staff" },
  // Días anteriores (para comisiones)
  { day: -1, at: "10:00", pro: PROFESSIONAL_IDS.vane, client: 6, lines: [["svc-color", null]], channel: "link", by: "client" },
  { day: -1, at: "11:30", pro: PROFESSIONAL_IDS.mauro, client: 7, lines: [["svc-corte", null], ["svc-barba", null]], channel: "whatsapp", by: "staff" },
  { day: -1, at: "16:00", pro: PROFESSIONAL_IDS.lupe, client: 0, lines: [["svc-trat", null]], channel: "phone", by: "staff" },
  { day: -2, at: "10:30", pro: PROFESSIONAL_IDS.mauro, client: 5, lines: [["svc-corte", null]], channel: "walk_in", by: "staff" },
  { day: -2, at: "15:00", pro: PROFESSIONAL_IDS.vane, client: 9, lines: [["svc-brush", "var-brush-largo"], ["svc-corte", null]], channel: "link", by: "client" },
  { day: -3, at: "12:00", pro: PROFESSIONAL_IDS.lupe, client: 1, lines: [["svc-corte", null]], channel: "instagram", by: "staff" },
];

function dayAt(now: Date, offset: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  return dayKey(d);
}

export function buildSeed(now: Date = new Date()): DemoState {
  const clients: Client[] = clientNames.map(([name, phone], i) => ({
    id: `cli-${i}`,
    salonId: SALON_ID,
    name,
    phone: `+54 9 11 ${phone}`,
    notes: "",
  }));

  const appointments: Appointment[] = [];
  const items: AppointmentItem[] = [];

  plan.forEach((p, idx) => {
    const id = `apt-${idx}`;
    const startsAt = toISO(dayAt(now, p.day), p.at);
    const lineItems: AppointmentItem[] = p.lines.map(([serviceId, variantId], n) => {
      const service = services.find((s) => s.id === serviceId);
      const variant = variants.find((v) => v.id === variantId);
      if (!service) throw new Error(`Servicio inexistente: ${serviceId}`);
      return {
        id: `${id}-item-${n}`,
        appointmentId: id,
        serviceId,
        variantId,
        durationMin: service.baseDurationMin + (variant?.extraDurationMin ?? 0),
        price: service.price + (variant?.extraPrice ?? 0),
        addedBy: "booking" as const,
      };
    });
    const duration = lineItems.reduce((s, i) => s + i.durationMin, 0);
    const endsAt = addMinutes(startsAt, duration);

    let status: AppointmentStatus;
    if (p.status) status = p.status;
    else if (new Date(endsAt) <= now) status = "done";
    else if (new Date(startsAt) <= now) status = "arrived";
    else status = p.by === "client" && idx % 2 === 0 ? "pending" : "confirmed";

    const requiresDeposit = lineItems.some(
      (i) => services.find((s) => s.id === i.serviceId)?.requiresDeposit,
    );
    appointments.push({
      id,
      salonId: SALON_ID,
      clientId: clients[p.client].id,
      professionalId: p.pro,
      startsAt,
      endsAt,
      status,
      channel: p.channel,
      createdBy: p.by,
      delayMinutes: 0,
      manageToken: `demo-${idx}`,
      depositPaid: requiresDeposit && p.by === "client" ? 12000 : 0,
    });
    items.push(...lineItems);
  });

  return {
    seedDay: `${dayKey(now)}-${SEED_VERSION}`,
    role: "owner",
    currentProfessionalId: PROFESSIONAL_IDS.vane,
    onboarded: true,
    salon: {
      id: SALON_ID,
      name: "Estudio Lupe",
      slug: "estudio-lupe",
      type: "mixto",
      plan: "free",
      cancelHoursBefore: 24,
      openHour: 9,
      closeHour: 20,
    },
    professionals,
    services,
    variants,
    products: [
      { id: "prod-tintura", salonId: SALON_ID, name: "Tintura (tubo)", unitCost: 12000, stock: 8, minStock: 3 },
      { id: "prod-oxidante", salonId: SALON_ID, name: "Oxidante", unitCost: 4000, stock: 10, minStock: 3 },
      { id: "prod-mascarilla", salonId: SALON_ID, name: "Mascarilla", unitCost: 3500, stock: 5, minStock: 2 },
      { id: "prod-shampoo", salonId: SALON_ID, name: "Shampoo (por uso)", unitCost: 600, stock: 40, minStock: 10 },
      { id: "prod-cera", salonId: SALON_ID, name: "Cera y aceite de barba", unitCost: 300, stock: 30, minStock: 8 },
    ],
    serviceProducts: [
      { serviceId: "svc-corte", productId: "prod-shampoo", quantity: 1 },
      { serviceId: "svc-barba", productId: "prod-cera", quantity: 1 },
      { serviceId: "svc-color", productId: "prod-tintura", quantity: 1 },
      { serviceId: "svc-color", productId: "prod-oxidante", quantity: 1 },
      { serviceId: "svc-trat", productId: "prod-mascarilla", quantity: 1 },
      { serviceId: "svc-trat", productId: "prod-shampoo", quantity: 1 },
      { serviceId: "svc-brush", productId: "prod-shampoo", quantity: 1 },
    ],
    clients,
    appointments,
    items,
    waitlist: [
      { id: "wl-1", salonId: SALON_ID, clientId: "cli-1", serviceId: "svc-corte", preferredDay: dayAt(now, 0), preferredFrom: "17:00", preferredTo: "19:30", status: "waiting", offer: null, createdAt: dayAt(now, -2) },
      { id: "wl-2", salonId: SALON_ID, clientId: "cli-9", serviceId: "svc-barba", preferredDay: dayAt(now, 0), preferredFrom: "14:00", preferredTo: "20:00", status: "waiting", offer: null, createdAt: dayAt(now, -1) },
      { id: "wl-0", salonId: SALON_ID, clientId: "cli-0", serviceId: "svc-color", preferredDay: dayAt(now, 1), preferredFrom: "14:00", preferredTo: "19:00", status: "waiting", offer: null, createdAt: dayAt(now, 0) },
    ],
    reminders: [],
    payments: [],
  };
}
