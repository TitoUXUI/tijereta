export type SalonType = "peluqueria" | "barberia" | "mixto";
export type Plan = "free" | "pro";
export type Role = "owner" | "manager" | "receptionist" | "professional";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "arrived"
  | "done"
  | "cancelled"
  | "rescheduled"
  | "no_show";

export type Channel = "link" | "whatsapp" | "instagram" | "phone" | "walk_in";
export type CreatedBy = "client" | "staff";
export type WaitlistStatus = "waiting" | "offered" | "booked" | "expired";
export type MessageKind =
  | "booking_link"
  | "offer_slot"
  | "confirm"
  | "late_notice"
  | "reschedule";
export type ReminderKind = "h24" | "h2" | "confirmation";
export type PaymentKind = "deposit" | "full" | "product";

export interface Salon {
  id: string;
  name: string;
  slug: string;
  type: SalonType;
  plan: Plan;
  cancelHoursBefore: number;
  openHour: number;
  closeHour: number;
}

export interface Professional {
  id: string;
  salonId: string;
  name: string;
  commissionPercent: number;
  active: boolean;
  /** Índice 1..6 de la tinta de agenda (token cat) */
  colorIndex: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  baseDurationMin: number;
  price: number;
  requiresDeposit: boolean;
  depositPercent: number;
  canCombine: boolean;
}

export interface ServiceVariant {
  id: string;
  serviceId: string;
  name: string;
  extraDurationMin: number;
  extraPrice: number;
  /** Multiplicador de insumos para el cálculo de margen (pelo largo gasta más) */
  supplyMultiplier: number;
}

export interface Product {
  id: string;
  salonId: string;
  name: string;
  unitCost: number;
  stock: number;
  minStock: number;
}

export interface ServiceProduct {
  serviceId: string;
  productId: string;
  quantity: number;
}

export interface Client {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  notes: string;
}

export interface Appointment {
  id: string;
  salonId: string;
  clientId: string;
  professionalId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  channel: Channel;
  createdBy: CreatedBy;
  delayMinutes: number;
  manageToken: string;
  depositPaid: number;
}

export interface AppointmentItem {
  id: string;
  appointmentId: string;
  serviceId: string;
  variantId: string | null;
  durationMin: number;
  price: number;
  addedBy: "booking" | "staff";
}

export interface WaitlistEntry {
  id: string;
  salonId: string;
  clientId: string;
  serviceId: string;
  preferredDay: string;
  preferredFrom: string;
  preferredTo: string;
  status: WaitlistStatus;
}

export interface Reminder {
  id: string;
  salonId: string;
  appointmentId: string | null;
  kind: ReminderKind | MessageKind;
  message: string;
  toPhone: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  salonId: string;
  appointmentId: string;
  amount: number;
  kind: PaymentKind;
  method: string;
  simulated: true;
}

/** Línea elegida en una reserva o alta rápida */
export interface ServiceSelection {
  serviceId: string;
  variantId: string | null;
}

export interface DemoState {
  seedDay: string;
  role: Role;
  currentProfessionalId: string;
  onboarded: boolean;
  salon: Salon;
  professionals: Professional[];
  services: Service[];
  variants: ServiceVariant[];
  products: Product[];
  serviceProducts: ServiceProduct[];
  clients: Client[];
  appointments: Appointment[];
  items: AppointmentItem[];
  waitlist: WaitlistEntry[];
  reminders: Reminder[];
  payments: Payment[];
}
