CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,                  -- link público: /reservar/[slug]
  type TEXT NOT NULL DEFAULT 'peluqueria',    -- peluqueria | barberia | mixto
  phone TEXT,
  city TEXT,
  plan TEXT NOT NULL DEFAULT 'free',          -- free | pro
  cancel_hours_before INT DEFAULT 24,         -- plazo para cancelar o reagendar sin cargo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quién entra al salón y con qué rol (dueña, encargado, recepcionista, profesional)
CREATE TABLE salon_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                         -- owner | manager | receptionist | professional
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (salon_id, user_id)
);

CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  member_id UUID REFERENCES salon_members(id),  -- si tiene acceso propio
  name TEXT NOT NULL,
  commission_percent NUMERIC(5,2) DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                         -- ej: Corte, Barba, Color, Tratamiento
  base_duration_min INT NOT NULL,
  price NUMERIC(12,2) NOT NULL,               -- ARS
  requires_deposit BOOLEAN DEFAULT FALSE,     -- seña opcional por servicio
  deposit_percent INT DEFAULT 0,
  can_combine BOOLEAN DEFAULT TRUE,           -- se puede sumar a otro (corte + barba)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_variants (               -- duración y precio según largo, técnica, etc.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                         -- ej: Pelo largo
  extra_duration_min INT DEFAULT 0,
  extra_price NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (                       -- insumos (margen y stock)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  min_stock INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_products (
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC(8,2) NOT NULL,
  PRIMARY KEY (service_id, product_id)
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,                                 -- identifica al cliente; no tiene cuenta
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id),
  professional_id UUID NOT NULL REFERENCES professionals(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,               -- suma de la duración de los ítems
  status TEXT NOT NULL DEFAULT 'pending',     -- pending | confirmed | arrived | done | cancelled | rescheduled | no_show
  channel TEXT NOT NULL DEFAULT 'link',       -- link | whatsapp | instagram | phone | walk_in
  created_by TEXT NOT NULL DEFAULT 'client',  -- client | staff  (alta rápida = staff)
  delay_minutes INT DEFAULT 0,                -- demora real acumulada
  manage_token TEXT UNIQUE NOT NULL,          -- el cliente gestiona su turno sin cuenta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointment_items (              -- servicios sumados: corte + barba, color + tratamiento
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  variant_id UUID REFERENCES service_variants(id),
  duration_min INT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  added_by TEXT DEFAULT 'booking',            -- booking | staff (agregado en el momento)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE waitlist_entries (               -- recuperar huecos
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id),
  service_id UUID REFERENCES services(id),
  preferred_day DATE,
  preferred_from TIME,
  preferred_to TIME,
  status TEXT NOT NULL DEFAULT 'waiting',     -- waiting | offered | booked | expired
  offered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_templates (              -- mensajes preparados para pegar en el chat
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,                         -- booking_link | offer_slot | confirm | late_notice | reschedule
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reminders (                      -- WhatsApp simulado
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,                         -- h24 | h2 | confirmation
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  response TEXT,                              -- confirmed | rescheduled | cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  amount NUMERIC(12,2) NOT NULL,
  kind TEXT NOT NULL,                         -- deposit | full | product
  method TEXT NOT NULL,                       -- cash | transfer | card | mercado_pago
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE commissions (                    -- una por ítem, no por turno
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id),
  item_id UUID NOT NULL REFERENCES appointment_items(id),
  amount NUMERIC(12,2) NOT NULL,
  settled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (                       -- ARCA simulada
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id),
  type TEXT NOT NULL DEFAULT 'C',
  cae TEXT,                                   -- ficticio
  total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
