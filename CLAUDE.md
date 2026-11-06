# Tijereta — gestión para peluquerías argentinas

## Qué es este proyecto

Software de gestión para peluquerías, barberías y salones de Argentina: una agenda única para todo el equipo, que evita cargar los turnos dos veces (turnos, caja, clientes, comisiones y margen por servicio), para dueños, recepcionistas, profesionales e independientes.
Incluye un link que el salón pega en el chat para que el cliente reserve, cancele o reagende sin cuenta ni app. Es un proyecto de portfolio: las integraciones externas son simuladas y se diseña el recorrido central. El nombre es provisorio.

## Stack exacto

- **Framework:** Next.js 14 con App Router
- **Lenguaje:** TypeScript — tipado estricto, sin `any` bajo ninguna circunstancia
- **Estilos:** Tailwind CSS — clases en JSX, nunca CSS inline
- **Componentes:** shadcn/ui — usar siempre como base antes de crear custom
- **Iconos:** Lucide Icons — única librería permitida
- **Gráficos:** Recharts — para reportes de caja, margen y comisiones
- **Auth + DB + Storage:** Supabase
- **WhatsApp (recordatorios):** SIMULADO. Se guarda el mensaje en la tabla `reminders` y se muestra en pantalla; nunca se envía a números reales.
- **Mercado Pago (seña):** SIMULADO. Pantalla de pago ficticia o modo de pruebas; nunca cobrar de verdad.
- **ARCA (facturación):** SIMULADO. Comprobante con CAE ficticio y aviso de "modo demo"; sin conexión a ARCA.
- **Figma:** el diseño se lee desde Figma con el MCP conectado. Antes de construir una pantalla, consultar su diseño en Figma si existe.

## Estructura del proyecto

```
tijereta/
├── app/                        # Rutas Next.js (App Router)
│   ├── (auth)/                 # Registro y login
│   ├── (dashboard)/            # Rutas protegidas: dueña, encargado, recepcionista y profesional
│   ├── reservar/[slug]/        # Reserva pública (el link que se pega en el chat), sin cuenta
│   ├── turno/[token]/          # Gestionar mi turno (cancelar o reagendar)
│   └── api/                    # API routes
├── components/
│   ├── ui/                     # shadcn/ui (no modificar)
│   └── [feature]/              # Componentes del producto
├── lib/
│   ├── supabase.ts             # Cliente Supabase
│   ├── mocks/                  # WhatsApp, Mercado Pago y ARCA simulados
│   └── utils.ts                # Utilidades compartidas
├── types/
│   └── index.ts                # Interfaces TypeScript globales
├── hooks/                      # Custom hooks
├── public/                     # Assets estáticos
├── CLAUDE.md                   # Este archivo
└── [otros archivos de config]
```

## Paleta de colores

Dirección visual **bloques de color y tipografía contundente**, con **tres colores**: Port, Tangerine y Crystal Blue. Definida en Figma (archivo `Tijereta`) y en `design/tokens.css`. Detalle en `DESIGN.md`. Usar siempre los tokens semánticos (`--color-bg-app`, `--color-accent-default`, etc.), nunca un HEX suelto ni un primitivo.

| Rol               | Claro (HEX) | Token CSS                  |
| ----------------- | ----------- | -------------------------- |
| Fondo de la app   | `#F4F8FB`   | `--color-bg-app`           |
| Superficie        | `#FFFFFF`   | `--color-bg-surface`       |
| Banda de marca    | `#643438`   | `--color-bg-brand`         |
| Banda del cliente | `#A0BDD6`   | `--color-bg-highlight`     |
| Acento (primario) | `#E88D59`   | `--color-accent-default`   |
| Texto sobre acento| `#1F0F10`   | `--color-text-on-accent`   |
| Texto principal   | `#1F0F10`   | `--color-text-primary`     |
| Texto secundario  | `#643438`   | `--color-text-secondary`   |
| Enlace y foco     | `#314E6C`   | `--color-text-link`        |
| Éxito / información | `#44688A` | `--color-success-solid`    |
| Aviso             | `#D9743C`   | `--color-warning-solid`    |
| Error             | `#643438`   | `--color-danger-solid`     |

El acento (Tangerine) **no lleva texto blanco**: el texto encima es `--color-text-on-accent` (Port 900). El modo oscuro está definido en los mismos tokens (`[data-theme="dark"]`).

## Tipografía

**Plus Jakarta Sans** para toda la interfaz; **Gabarito Black / ExtraBold** solo en los títulos de las bandas y el wordmark, nunca en etiquetas, botones ni datos. Escala fija (12, 14, 16, 18, 20, 24, 28), no fluida.

| Nivel   | Fuente                    | Tamaño / interlineado | Clase Tailwind sugerida                     |
| ------- | ------------------------- | --------------------- | ------------------------------------------- |
| Display | Gabarito ExtraBold/Black  | 32/40 y 40/48         | `font-display text-[32px] leading-10`       |
| H1      | Plus Jakarta Sans Bold    | 28/32                 | `text-[28px] leading-8 font-bold`           |
| H2      | Plus Jakarta Sans Bold    | 24/28                 | `text-2xl font-bold`                        |
| H3      | Plus Jakarta Sans SemiBold| 20/24                 | `text-xl font-semibold`                     |
| Body    | Plus Jakarta Sans Regular | 16/24                 | `text-base`                                 |
| Caption | Plus Jakarta Sans Regular | 12/16                 | `text-xs text-muted-foreground`             |
| Label   | Plus Jakarta Sans Medium  | 14/20                 | `text-sm font-medium`                       |

## Secciones del proyecto (en orden de construcción)

**Recorrido central (se diseña y se prototipa primero):**

1. [P-03] Onboarding del salón
2. [P-04] Hoy
3. [P-05] Agenda (única, con aviso de demora)
4. [P-06] Nuevo turno (alta rápida, servicios combinados)
5. [P-21] Reserva pública: servicio(s) y profesional
6. [P-22] Reserva pública: fecha, hora, datos y seña opcional
7. [P-24] Gestionar mi turno
8. [P-25] Reagendar: elegir nuevo horario
9. [P-26] Lista de espera
10. [P-10] Costo y margen por servicio
11. [P-20] Mi agenda y mis comisiones (profesional)

**En el PRD, sin diseñar (no construir salvo pedido expreso):** P-01 Landing, P-02 Registro y login (mínimos si el prototipo los necesita), P-07 Clientes, P-08 Ficha de cliente, P-09 Servicios, variantes y precios, P-11 Caja y cobros, P-12 Comisiones, P-13 Stock, P-14 Facturación ARCA (simulada), P-15 Recordatorios y mensajes preparados, P-16 Equipo y roles, P-17 Perfil público y marketplace (simulado), P-18 Plan y suscripción, P-19 Configuración, P-23 Pago de la seña (paso opcional de P-22).

El detalle de cada pantalla (componentes, datos y tablas) está en `vault/outputs/prd-tijereta-v1.1-2026-11-05.md`, sección 3.5.

## Convenciones

**Nomenclatura:**
- Componentes: PascalCase (`AppointmentCard`, `BookingSteps`)
- Funciones y hooks: camelCase (`fetchAppointments`, `useSalon`)
- Archivos de componente: kebab-case (`appointment-card.tsx`)
- Constantes globales: UPPER_SNAKE_CASE (`MAX_FREE_PROFESSIONALS`)
- Rutas Next.js: kebab-case en carpetas

**Estilos:**
- Siempre Tailwind en el JSX, nunca CSS inline
- No usar `@apply` salvo en globals.css para utilidades globales
- No crear clases custom si existe una equivalente en Tailwind

**TypeScript:**
- Tipado estricto: nunca `any`, nunca `as unknown`
- Interfaces para todas las entidades en `/types/index.ts`
- Props de componentes siempre con interface explícita

**Componentes:**
- Usar shadcn/ui como base antes de crear cualquier componente custom
- No modificar archivos dentro de `components/ui/`
- Server Components por defecto; añadir `'use client'` solo cuando sea necesario

**Patrones de UI:**
- Estados vacíos: ícono + una línea de texto + botón principal (ej. "Compartir mi link en el chat")
- Feedback: toast para confirmaciones, error inline bajo el campo, hoja inferior para confirmar cancelaciones
- Animaciones: 200ms, ease-out, sin animaciones decorativas
- Target táctil mínimo: 44×44px (mobile-first)
- Idioma de la interfaz: español rioplatense (vos), tono cercano, sin jerga contable
- Teléfonos con +54 precargado; sin selector de país con cientos de opciones
- Política de cancelación y seña siempre visible antes de confirmar un turno
- Cancelar o reagendar: "Reprogramar" como botón principal y "Cancelar" como secundario, con copy amable
- **Una sola carga:** todo turno, venga del link o de un mensaje, vive en una sola agenda
- **Alta rápida** de un turno que llegó por chat: pocos toques, menos de 30 segundos
- **Mensajes preparados** para pegar en el chat (link de reserva, ofrecer un horario libre, aviso de demora); el link se pega a mano
- Servicios combinados (corte + barba, color + tratamiento) y duración con variantes
- La seña es opcional por servicio, solo en servicios largos, con aviso previo

**Base de datos:**
- RLS activado en todas las tablas de Supabase
- Cada tabla de negocio lleva `salon_id`
- El cliente final no tiene cuenta: accede a su turno con `manage_token`, siempre desde el servidor
- Queries siempre del lado del servidor cuando sea posible
- Nunca exponer claves de Supabase en el cliente

## Comandos del proyecto

- `npm run dev` → servidor de desarrollo en localhost:3000
- `npm run build` → compilar para producción
- `npm run lint` → verificar errores de TypeScript y ESLint
- `npm run type-check` → solo verificación de tipos

## Base de datos — Tablas Supabase

Propuesta derivada del PRD v1.1. El SQL completo está en `vault/outputs/prd-tijereta-v1.1-2026-11-05.md`, sección 2.2. Todas tienen `id` UUID, `created_at` y `updated_at`. Cada tabla de negocio lleva `salon_id`.

- **salons:** `owner_id`, `name`, `slug` UNIQUE (link `/reservar/[slug]`), `type` (peluqueria | barberia | mixto), `plan` (free | pro), `cancel_hours_before`
- **salon_members:** `salon_id`, `user_id`, `role` (owner | manager | receptionist | professional), UNIQUE (salon_id, user_id)
- **professionals:** `salon_id`, `member_id` (si tiene acceso propio), `name`, `commission_percent`, `active`
- **services:** `salon_id`, `name`, `base_duration_min`, `price` (ARS), `requires_deposit`, `deposit_percent`, `can_combine`
- **service_variants:** `service_id`, `name`, `extra_duration_min`, `extra_price`
- **products:** `salon_id`, `name`, `unit_cost`, `stock`, `min_stock`
- **service_products:** `service_id`, `product_id`, `quantity` (clave compuesta)
- **clients:** `salon_id`, `name`, `phone`, `notes` (sin cuenta)
- **appointments:** `salon_id`, `client_id`, `professional_id`, `starts_at`, `ends_at`, `status` (pending | confirmed | arrived | done | cancelled | rescheduled | no_show), `channel` (link | whatsapp | instagram | phone | walk_in), `created_by` (client | staff), `delay_minutes`, `manage_token` UNIQUE
- **appointment_items:** `appointment_id`, `service_id`, `variant_id`, `duration_min`, `price`, `added_by` (booking | staff). Servicios sumados: un turno puede tener varios ítems
- **waitlist_entries:** `salon_id`, `client_id`, `service_id`, `preferred_day`, `preferred_from`, `preferred_to`, `status` (waiting | offered | booked | expired)
- **message_templates:** `salon_id`, `kind` (booking_link | offer_slot | confirm | late_notice | reschedule), `body`
- **reminders** (WhatsApp simulado): `salon_id`, `appointment_id`, `kind` (h24 | h2 | confirmation), `message`, `sent_at`, `response`
- **payments:** `salon_id`, `appointment_id`, `amount`, `kind` (deposit | full | product), `method`
- **commissions:** `salon_id`, `professional_id`, `item_id` (una por ítem, no por turno), `amount`, `settled`
- **invoices** (simulada): `salon_id`, `payment_id`, `type` (A | B | C), `cae` (ficticio), `total`

**Permisos (RLS):** `owner` ve todo; `manager` y `receptionist` ven agenda, clientes y lista de espera, pero **no** costos de insumos, margen ni comisiones `[HIPÓTESIS]`; `professional` ve solo su agenda y sus comisiones; el cliente final accede solo a su turno con `manage_token`.

## Lo que NO debes hacer

- No usar `any` en TypeScript bajo ninguna circunstancia
- No añadir funcionalidades no listadas en las Secciones del proyecto
- No cambiar la librería de iconos (solo Lucide Icons)
- No modificar archivos dentro de `components/ui/`
- No usar CSS inline
- No crear componentes custom si shadcn/ui tiene uno equivalente
- No hacer queries a Supabase desde el cliente cuando pueden hacerse desde el servidor
- No enviar mensajes reales por WhatsApp, no cobrar con Mercado Pago real y no emitir facturas reales de ARCA: todo es simulado
- No presentar una factura simulada como válida: mostrar siempre el aviso de "modo demo"
- No calcular comisiones sin mostrar el detalle por ítem
- No usar un tono de advertencia duro con el cliente final al cancelar
- No pedir cuenta, app ni descarga al cliente final: el link funciona con nombre y teléfono
- No exigir cargar un turno dos veces: todo turno vive en una sola agenda
- No mostrar margen, costos ni comisiones a la recepcionista ni al profesional más allá de lo propio
- No construir pantallas fuera del recorrido central salvo pedido expreso
- No usar un color que no sea un token ni un HEX suelto; no cubrir una pantalla entera de color fuerte (el color va en bandas, acciones y bloques)
- No usar Gabarito en etiquetas, botones ni datos
- No poner texto blanco sobre el acento Tangerine: usar `--color-text-on-accent`
- No inventar un logo ni cambiar el nombre: son provisorios
