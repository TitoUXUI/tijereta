"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { addMinutes, dayKey, normalizePhone } from "@/lib/format";
import { buildReminder } from "@/lib/mocks/whatsapp";
import { newOffer, type FreeSlot } from "@/lib/waitlist";
import { POINT_OF_SALE, caeExpiry, fakeCae, invoiceNumber } from "@/lib/mocks/arca";
import { adjustedPrice, snapshotCatalog, type AdjustDirection, type CatalogSnapshot } from "@/lib/services";
import { SEED_VERSION, buildSeed } from "@/lib/seed";
import { totalsFor } from "@/lib/scheduling";
import type {
  Appointment,
  AppointmentItem,
  AppointmentStatus,
  Channel,
  Client,
  CreatedBy,
  DemoState,
  Invoice,
  InvoiceType,
  MessageKind,
  Payment,
  Professional,
  Reminder,
  Role,
  Salon,
  Service,
  ServiceSelection,
  WaitlistEntry,
} from "@/types";

/**
 * Capa de datos del prototipo. Guarda todo en el navegador (localStorage) con
 * la misma forma que las tablas de Supabase (`supabase/schema.sql`), así que
 * reemplazarla por consultas del servidor no cambia las pantallas.
 */

const STORAGE_KEY = "tijereta-demo-v1";

type Action =
  | { type: "replace"; state: DemoState }
  | { type: "patch"; patch: Partial<DemoState> }
  | { type: "addAppointment"; appointment: Appointment; items: AppointmentItem[]; client?: Client }
  | { type: "updateAppointment"; id: string; patch: Partial<Appointment> }
  | { type: "addItem"; item: AppointmentItem; appointmentId: string; endsAt: string }
  | { type: "addReminders"; reminders: Reminder[] }
  | { type: "addPayment"; payment: Payment }
  | { type: "addWaitlist"; entry: WaitlistEntry; client?: Client }
  | { type: "updateWaitlist"; id: string; status: WaitlistEntry["status"] }
  | { type: "patchWaitlist"; id: string; patch: Partial<WaitlistEntry> }
  | { type: "moveWaitlistToEnd"; id: string }
  | { type: "setServicePrice"; serviceId: string; variantId: string | null; price: number }
  | { type: "setDelay"; ids: string[]; minutes: number };

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "replace":
      return action.state;
    case "patch":
      return { ...state, ...action.patch };
    case "addAppointment":
      return {
        ...state,
        clients: action.client ? [...state.clients, action.client] : state.clients,
        appointments: [...state.appointments, action.appointment],
        items: [...state.items, ...action.items],
      };
    case "updateAppointment":
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.id ? { ...a, ...action.patch } : a,
        ),
      };
    case "addItem":
      return {
        ...state,
        items: [...state.items, action.item],
        appointments: state.appointments.map((a) =>
          a.id === action.appointmentId ? { ...a, endsAt: action.endsAt } : a,
        ),
      };
    case "addReminders":
      return { ...state, reminders: [...action.reminders, ...state.reminders] };
    case "addPayment":
      return { ...state, payments: [...state.payments, action.payment] };
    case "addWaitlist":
      return {
        ...state,
        clients: action.client ? [...state.clients, action.client] : state.clients,
        waitlist: [...state.waitlist, action.entry],
      };
    case "updateWaitlist":
      return {
        ...state,
        waitlist: state.waitlist.map((w) =>
          w.id === action.id ? { ...w, status: action.status } : w,
        ),
      };
    case "patchWaitlist":
      return {
        ...state,
        waitlist: state.waitlist.map((w) => (w.id === action.id ? { ...w, ...action.patch } : w)),
      };
    case "moveWaitlistToEnd": {
      const entry = state.waitlist.find((w) => w.id === action.id);
      if (!entry) return state;
      return { ...state, waitlist: [...state.waitlist.filter((w) => w.id !== action.id), entry] };
    }
    case "setServicePrice": {
      const service = state.services.find((x) => x.id === action.serviceId);
      if (!service) return state;
      if (action.variantId) {
        return {
          ...state,
          variants: state.variants.map((v) =>
            v.id === action.variantId ? { ...v, extraPrice: Math.max(0, action.price - service.price) } : v,
          ),
        };
      }
      return {
        ...state,
        services: state.services.map((x) => (x.id === action.serviceId ? { ...x, price: action.price } : x)),
      };
    }
    case "setDelay":
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          action.ids.includes(a.id) ? { ...a, delayMinutes: action.minutes } : a,
        ),
      };
  }
}

export interface NewAppointmentInput {
  clientName: string;
  clientPhone: string;
  professionalId: string;
  startsAt: string;
  selections: ServiceSelection[];
  channel: Channel;
  createdBy: CreatedBy;
  depositPaid?: number;
}

export interface OnboardingInput {
  name: string;
  type: Salon["type"];
  services: Array<Pick<Service, "name" | "baseDurationMin" | "price">>;
  team: Array<{ name: string; commissionPercent: number }>;
}

export interface ServiceFormInput {
  id?: string;
  name: string;
  baseDurationMin: number;
  price: number;
  requiresDeposit: boolean;
  depositPercent: number;
  variants: Array<{ id?: string; name: string; extraDurationMin: number; extraPrice: number }>;
  /** null = no tocar los insumos que ya tiene */
  suppliesCost: number | null;
}

interface DemoContextValue {
  state: DemoState;
  ready: boolean;
  setRole: (role: Role) => void;
  setCurrentProfessional: (id: string) => void;
  resetDemo: () => void;
  completeOnboarding: (input: OnboardingInput) => void;
  createAppointment: (input: NewAppointmentInput) => Appointment;
  setStatus: (id: string, status: AppointmentStatus) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, startsAt: string, professionalId: string) => void;
  setDelay: (professionalId: string, minutes: number) => Reminder[];
  addServiceToAppointment: (appointmentId: string, selection: ServiceSelection) => void;
  addToWaitlist: (input: {
    clientName: string;
    clientPhone: string;
    serviceId: string;
    preferredDay: string;
    preferredFrom: string;
    preferredTo: string;
  }) => void;
  /** Ofrece un horario libre a una persona de la espera, con vencimiento */
  offerSlot: (entryId: string, slot: FreeSlot, slotLabel: string) => Reminder | null;
  /** Deshace una oferta: la persona vuelve a esperar donde estaba */
  undoOffer: (entryId: string) => void;
  /** Vuelve a ofrecerle el mismo horario, con 15 minutos nuevos */
  renewOffer: (entryId: string) => void;
  /** Pasa a la persona al final de la fila (no respondió) */
  skipOffer: (entryId: string) => void;
  /** Solo para la demo: hace como que ya pasaron los 15 minutos */
  expireOfferNow: (entryId: string) => void;
  /** Crea o edita un servicio con sus variantes y, si se pasa, su costo de insumos */
  saveService: (input: ServiceFormInput) => Service;
  /** Sube o baja un porcentaje los servicios elegidos. Devuelve cómo estaba el catálogo, para deshacer. */
  adjustPrices: (serviceIds: string[], percent: number, direction: AdjustDirection, round: boolean) => CatalogSnapshot;
  restoreCatalog: (snapshot: CatalogSnapshot) => void;
  /** Registra el cobro de un turno (sin pasarela real) */
  chargeAppointment: (appointmentId: string, method: string, amount: number) => Payment;
  /** Emite un comprobante SIMULADO para un cobro */
  issueInvoice: (paymentId: string, input: { type: InvoiceType; customerName: string; customerDoc: string }) => Invoice | null;
  /** Cambia el precio de un servicio o de una variante */
  updateServicePrice: (serviceId: string, variantId: string | null, price: number) => void;
  bookFromWaitlist: (entryId: string, professionalId: string, startsAt: string) => Appointment | null;
  prepareMessage: (kind: MessageKind, clientId: string, appointmentId?: string, slotLabel?: string) => Reminder | null;
  recordDeposit: (appointmentId: string, amount: number, method: string) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

let counter = 0;
function uid(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => buildSeed());
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as DemoState;
        if (saved.seedDay === `${dayKey(new Date())}-${SEED_VERSION}`) {
          dispatch({ type: "replace", state: saved });
        }
      }
    } catch {
      // Sin localStorage el prototipo funciona igual, sin persistencia.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignorado: ver arriba.
    }
  }, [state, ready]);

  const setRole = useCallback((role: Role) => dispatch({ type: "patch", patch: { role } }), []);
  const setCurrentProfessional = useCallback(
    (id: string) => dispatch({ type: "patch", patch: { currentProfessionalId: id } }),
    [],
  );
  const resetDemo = useCallback(() => dispatch({ type: "replace", state: buildSeed() }), []);

  const completeOnboarding = useCallback((input: OnboardingInput) => {
    const base = buildSeed();
    const salonId = base.salon.id;
    const slug = input.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mi-salon";
    const professionals: Professional[] = input.team.map((member, i) => ({
      id: uid("pro"),
      salonId,
      name: member.name,
      commissionPercent: member.commissionPercent,
      active: true,
      colorIndex: ((i % 3) + 1) as Professional["colorIndex"],
    }));
    const services: Service[] = input.services.map((s) => ({
      id: uid("svc"),
      salonId,
      name: s.name,
      baseDurationMin: s.baseDurationMin,
      price: s.price,
      requiresDeposit: false,
      depositPercent: 0,
      canCombine: true,
    }));
    dispatch({
      type: "replace",
      state: {
        ...base,
        role: "owner",
        currentProfessionalId: professionals[0]?.id ?? base.currentProfessionalId,
        salon: { ...base.salon, name: input.name, slug, type: input.type },
        professionals,
        services,
        variants: [],
        products: [],
        serviceProducts: [],
        clients: [],
        appointments: [],
        items: [],
        waitlist: [],
        reminders: [],
        payments: [],
        invoices: [],
      },
    });
  }, []);

  const createAppointment = useCallback((input: NewAppointmentInput): Appointment => {
    const s = stateRef.current;
    const phone = normalizePhone(input.clientPhone);
    const existing = s.clients.find((c) => c.phone === phone);
    const client: Client = existing ?? {
      id: uid("cli"),
      salonId: s.salon.id,
      name: input.clientName.trim(),
      phone,
      notes: "",
    };
    const totals = totalsFor(input.selections, s.services, s.variants);
    const id = uid("apt");
    const items: AppointmentItem[] = input.selections.map((sel, n) => {
      const service = s.services.find((x) => x.id === sel.serviceId);
      const variant = s.variants.find((v) => v.id === sel.variantId);
      return {
        id: `${id}-item-${n}`,
        appointmentId: id,
        serviceId: sel.serviceId,
        variantId: sel.variantId,
        durationMin: (service?.baseDurationMin ?? 0) + (variant?.extraDurationMin ?? 0),
        price: (service?.price ?? 0) + (variant?.extraPrice ?? 0),
        addedBy: "booking",
      };
    });
    const appointment: Appointment = {
      id,
      salonId: s.salon.id,
      clientId: client.id,
      professionalId: input.professionalId,
      startsAt: input.startsAt,
      endsAt: addMinutes(input.startsAt, totals.durationMin),
      status: input.createdBy === "client" ? "pending" : "confirmed",
      channel: input.channel,
      createdBy: input.createdBy,
      delayMinutes: 0,
      manageToken: `t-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`,
      depositPaid: input.depositPaid ?? 0,
    };
    dispatch({ type: "addAppointment", appointment, items, client: existing ? undefined : client });
    const reminder = buildReminder(s, "confirm", appointment, client);
    dispatch({ type: "addReminders", reminders: [{ ...reminder, kind: "confirmation" }] });
    return appointment;
  }, []);

  const setStatus = useCallback(
    (id: string, status: AppointmentStatus) =>
      dispatch({ type: "updateAppointment", id, patch: { status } }),
    [],
  );

  const cancelAppointment = useCallback(
    (id: string) => dispatch({ type: "updateAppointment", id, patch: { status: "cancelled" } }),
    [],
  );

  const rescheduleAppointment = useCallback(
    (id: string, startsAt: string, professionalId: string) => {
      const s = stateRef.current;
      const apt = s.appointments.find((a) => a.id === id);
      if (!apt) return;
      const duration = (new Date(apt.endsAt).getTime() - new Date(apt.startsAt).getTime()) / 60_000;
      const updated: Appointment = {
        ...apt,
        startsAt,
        endsAt: addMinutes(startsAt, duration),
        professionalId,
        status: "confirmed",
        delayMinutes: 0,
      };
      dispatch({ type: "updateAppointment", id, patch: updated });
      const client = s.clients.find((c) => c.id === apt.clientId);
      if (client) {
        dispatch({
          type: "addReminders",
          reminders: [buildReminder(s, "reschedule", updated, client)],
        });
      }
    },
    [],
  );

  const setDelay = useCallback((professionalId: string, minutes: number): Reminder[] => {
    const s = stateRef.current;
    const now = Date.now();
    const affected = s.appointments.filter(
      (a) =>
        a.professionalId === professionalId &&
        dayKey(a.startsAt) === dayKey(new Date()) &&
        (a.status === "pending" || a.status === "confirmed") &&
        new Date(a.endsAt).getTime() > now,
    );
    dispatch({ type: "setDelay", ids: affected.map((a) => a.id), minutes });
    if (minutes === 0) return [];
    const reminders = affected.flatMap((a) => {
      const client = s.clients.find((c) => c.id === a.clientId);
      return client ? [buildReminder(s, "late_notice", { ...a, delayMinutes: minutes }, client)] : [];
    });
    dispatch({ type: "addReminders", reminders });
    return reminders;
  }, []);

  const addServiceToAppointment = useCallback(
    (appointmentId: string, selection: ServiceSelection) => {
      const s = stateRef.current;
      const apt = s.appointments.find((a) => a.id === appointmentId);
      const service = s.services.find((x) => x.id === selection.serviceId);
      const variant = s.variants.find((v) => v.id === selection.variantId);
      if (!apt || !service) return;
      const durationMin = service.baseDurationMin + (variant?.extraDurationMin ?? 0);
      dispatch({
        type: "addItem",
        appointmentId,
        endsAt: addMinutes(apt.endsAt, durationMin),
        item: {
          id: uid("item"),
          appointmentId,
          serviceId: service.id,
          variantId: selection.variantId,
          durationMin,
          price: service.price + (variant?.extraPrice ?? 0),
          addedBy: "staff",
        },
      });
    },
    [],
  );

  const addToWaitlist = useCallback<DemoContextValue["addToWaitlist"]>((input) => {
    const s = stateRef.current;
    const phone = normalizePhone(input.clientPhone);
    const existing = s.clients.find((c) => c.phone === phone);
    const client: Client = existing ?? {
      id: uid("cli"),
      salonId: s.salon.id,
      name: input.clientName.trim(),
      phone,
      notes: "",
    };
    dispatch({
      type: "addWaitlist",
      client: existing ? undefined : client,
      entry: {
        id: uid("wl"),
        salonId: s.salon.id,
        clientId: client.id,
        serviceId: input.serviceId,
        preferredDay: input.preferredDay,
        preferredFrom: input.preferredFrom,
        preferredTo: input.preferredTo,
        status: "waiting",
        offer: null,
        createdAt: new Date().toISOString(),
      },
    });
  }, []);

  const prepareMessage = useCallback<DemoContextValue["prepareMessage"]>(
    (kind, clientId, appointmentId, slotLabel) => {
      const s = stateRef.current;
      const client = s.clients.find((c) => c.id === clientId);
      if (!client) return null;
      const appointment = s.appointments.find((a) => a.id === appointmentId) ?? null;
      const reminder = buildReminder(s, kind, appointment, client, slotLabel);
      dispatch({ type: "addReminders", reminders: [reminder] });
      return reminder;
    },
    [],
  );

  const offerSlot = useCallback<DemoContextValue["offerSlot"]>(
    (entryId, slot, slotLabel) => {
      const entry = stateRef.current.waitlist.find((w) => w.id === entryId);
      if (!entry) return null;
      const reminder = prepareMessage("offer_slot", entry.clientId, undefined, slotLabel);
      dispatch({
        type: "patchWaitlist",
        id: entryId,
        patch: { status: "offered", offer: newOffer(slot) },
      });
      return reminder;
    },
    [prepareMessage],
  );

  const undoOffer = useCallback((entryId: string) => {
    dispatch({ type: "patchWaitlist", id: entryId, patch: { status: "waiting", offer: null } });
  }, []);

  const renewOffer = useCallback((entryId: string) => {
    const entry = stateRef.current.waitlist.find((w) => w.id === entryId);
    if (!entry?.offer) return;
    dispatch({ type: "patchWaitlist", id: entryId, patch: { status: "offered", offer: newOffer(entry.offer) } });
  }, []);

  const skipOffer = useCallback((entryId: string) => {
    dispatch({ type: "patchWaitlist", id: entryId, patch: { status: "waiting", offer: null } });
    dispatch({ type: "moveWaitlistToEnd", id: entryId });
  }, []);

  const expireOfferNow = useCallback((entryId: string) => {
    const entry = stateRef.current.waitlist.find((w) => w.id === entryId);
    if (!entry?.offer) return;
    dispatch({
      type: "patchWaitlist",
      id: entryId,
      patch: { offer: { ...entry.offer, expiresAt: new Date(Date.now() - 60_000).toISOString() } },
    });
  }, []);

  const chargeAppointment = useCallback((appointmentId: string, method: string, amount: number): Payment => {
    const st = stateRef.current;
    const payment: Payment = { id: uid("pay"), salonId: st.salon.id, appointmentId, amount, kind: "full", method, simulated: true };
    dispatch({ type: "addPayment", payment });
    dispatch({ type: "updateAppointment", id: appointmentId, patch: { status: "done" } });
    return payment;
  }, []);

  const issueInvoice = useCallback((paymentId: string, input: { type: InvoiceType; customerName: string; customerDoc: string }): Invoice | null => {
    const st = stateRef.current;
    const payment = st.payments.find((p) => p.id === paymentId);
    if (!payment) return null;
    const invoice: Invoice = {
      id: uid("inv"),
      salonId: st.salon.id,
      appointmentId: payment.appointmentId,
      paymentId,
      type: input.type,
      pointOfSale: POINT_OF_SALE,
      number: invoiceNumber(st.invoices.length + 12),
      cae: fakeCae(),
      caeExpiresAt: caeExpiry(),
      customerName: input.customerName.trim() || "Consumidor final",
      customerDoc: input.customerDoc.trim(),
      total: payment.amount + (st.appointments.find((a) => a.id === payment.appointmentId)?.depositPaid ?? 0),
      createdAt: new Date().toISOString(),
      simulated: true,
    };
    dispatch({ type: "patch", patch: { invoices: [...st.invoices, invoice] } });
    return invoice;
  }, []);

  const saveService = useCallback((input: ServiceFormInput): Service => {
    const st = stateRef.current;
    const id = input.id ?? uid("svc");
    const service: Service = {
      id,
      salonId: st.salon.id,
      name: input.name.trim(),
      baseDurationMin: input.baseDurationMin,
      price: input.price,
      requiresDeposit: input.requiresDeposit,
      depositPercent: input.requiresDeposit ? input.depositPercent : 0,
      canCombine: true,
    };
    const services = input.id ? st.services.map((x) => (x.id === id ? service : x)) : [...st.services, service];
    const previous = st.variants.filter((v) => v.serviceId === id);
    const variants = [
      ...st.variants.filter((v) => v.serviceId !== id),
      ...input.variants.map((v) => ({
        id: v.id ?? uid("var"),
        serviceId: id,
        name: v.name.trim(),
        extraDurationMin: v.extraDurationMin,
        extraPrice: v.extraPrice,
        supplyMultiplier: previous.find((p) => p.id === v.id)?.supplyMultiplier ?? 1.5,
      })),
    ];
    let products = st.products;
    let serviceProducts = st.serviceProducts;
    if (input.suppliesCost !== null) {
      const productId = `prod-sv-${id}`;
      products = [
        ...products.filter((p) => p.id !== productId),
        { id: productId, salonId: st.salon.id, name: `Insumos de ${service.name}`, unitCost: input.suppliesCost, stock: 0, minStock: 0 },
      ];
      serviceProducts = [
        ...serviceProducts.filter((sp) => sp.serviceId !== id),
        { serviceId: id, productId, quantity: 1 },
      ];
    }
    dispatch({ type: "patch", patch: { services, variants, products, serviceProducts } });
    return service;
  }, []);

  const adjustPrices = useCallback(
    (serviceIds: string[], percent: number, direction: AdjustDirection, round: boolean): CatalogSnapshot => {
      const st = stateRef.current;
      const before = snapshotCatalog(st);
      dispatch({
        type: "patch",
        patch: {
          services: st.services.map((x) =>
            serviceIds.includes(x.id) ? { ...x, price: adjustedPrice(x.price, percent, direction, round) } : x,
          ),
          variants: st.variants.map((v) =>
            serviceIds.includes(v.serviceId)
              ? { ...v, extraPrice: adjustedPrice(v.extraPrice, percent, direction, round) }
              : v,
          ),
        },
      });
      return before;
    },
    [],
  );

  const restoreCatalog = useCallback((snapshot: CatalogSnapshot) => {
    dispatch({ type: "patch", patch: { services: snapshot.services, variants: snapshot.variants } });
  }, []);

  const updateServicePrice = useCallback((serviceId: string, variantId: string | null, price: number) => {
    dispatch({ type: "setServicePrice", serviceId, variantId, price });
  }, []);

  const bookFromWaitlist = useCallback<DemoContextValue["bookFromWaitlist"]>(
    (entryId, professionalId, startsAt) => {
      const s = stateRef.current;
      const entry = s.waitlist.find((w) => w.id === entryId);
      const client = s.clients.find((c) => c.id === entry?.clientId);
      if (!entry || !client) return null;
      const appointment = createAppointment({
        clientName: client.name,
        clientPhone: client.phone,
        professionalId,
        startsAt,
        selections: [{ serviceId: entry.serviceId, variantId: null }],
        channel: "whatsapp",
        createdBy: "staff",
      });
      dispatch({ type: "updateWaitlist", id: entryId, status: "booked" });
      return appointment;
    },
    [createAppointment],
  );

  const recordDeposit = useCallback((appointmentId: string, amount: number, method: string) => {
    const s = stateRef.current;
    dispatch({
      type: "addPayment",
      payment: {
        id: uid("pay"),
        salonId: s.salon.id,
        appointmentId,
        amount,
        kind: "deposit",
        method,
        simulated: true,
      },
    });
    dispatch({ type: "updateAppointment", id: appointmentId, patch: { depositPaid: amount, status: "confirmed" } });
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      ready,
      setRole,
      setCurrentProfessional,
      resetDemo,
      completeOnboarding,
      createAppointment,
      setStatus,
      cancelAppointment,
      rescheduleAppointment,
      setDelay,
      addServiceToAppointment,
      addToWaitlist,
      offerSlot,
      undoOffer,
      renewOffer,
      skipOffer,
      expireOfferNow,
      chargeAppointment,
      issueInvoice,
      saveService,
      adjustPrices,
      restoreCatalog,
      updateServicePrice,
      bookFromWaitlist,
      prepareMessage,
      recordDeposit,
    }),
    [
      state,
      ready,
      setRole,
      setCurrentProfessional,
      resetDemo,
      completeOnboarding,
      createAppointment,
      setStatus,
      cancelAppointment,
      rescheduleAppointment,
      setDelay,
      addServiceToAppointment,
      addToWaitlist,
      offerSlot,
      undoOffer,
      renewOffer,
      skipOffer,
      expireOfferNow,
      chargeAppointment,
      issueInvoice,
      saveService,
      adjustPrices,
      restoreCatalog,
      updateServicePrice,
      bookFromWaitlist,
      prepareMessage,
      recordDeposit,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo debe usarse dentro de <DemoProvider>");
  return ctx;
}
