# Tijereta

Prototipo de portfolio: una sola agenda para todo el equipo de peluquerías y barberías argentinas. El turno se carga una vez, venga del link que el salón pega en el chat o de un mensaje, y vive en la misma agenda.

> Nombre y logo provisorios. WhatsApp, Mercado Pago y ARCA están **simulados**: no se envía, cobra ni factura nada.

## Probarlo

```bash
npm install
npm run dev
```

Abrí http://localhost:3000. La pantalla de inicio tiene un acceso por cada recorrido. Los datos de ejemplo se guardan en el navegador (localStorage) y se regeneran cada día; "Reiniciar demo" los restaura.

## Recorrido central

| Pantalla | Ruta |
| --- | --- |
| P-03 Onboarding del salón | `/onboarding` |
| P-04 Hoy | `/hoy` |
| P-05 Agenda del equipo, con aviso de demora | `/agenda` |
| P-06 Nuevo turno (alta rápida, servicios combinados) | botón "Nuevo turno" |
| P-21 / P-22 Reserva pública, con seña opcional | `/reservar/estudio-lupe` |
| P-24 Gestionar mi turno | `/turno/[token]` |
| P-25 Reagendar | `/turno/[token]/reagendar` |
| P-26 Lista de espera | `/espera` |
| P-10 Costo y margen por servicio (solo dueña) | `/margen` |
| P-20 Mi agenda y mis comisiones (profesional) | `/mi-agenda` |

La barra "Modo demo" cambia el rol (dueña, recepción, profesional) para ver qué ve cada persona: el margen solo lo ve la dueña y la profesional ve únicamente lo suyo.

## Stack

Next.js 14 (App Router), TypeScript estricto, Tailwind CSS, shadcn/ui, Lucide, Recharts. Los tokens de diseño están en `app/tokens.css` y se mapean a Tailwind en `tailwind.config.ts`. Decisiones visuales en `docs/DESIGN.md`; contexto de producto en `docs/PRODUCT.md`.

## Datos

La capa de datos (`lib/store/demo-store.tsx`) guarda en el navegador y tiene la misma forma que las tablas de `supabase/schema.sql`, así que se puede reemplazar por consultas del servidor sin tocar las pantallas. En una versión real, el acceso del cliente final a su turno por `manage_token` tiene que resolverse siempre del lado del servidor.

## Comandos

- `npm run dev`: servidor de desarrollo
- `npm run build`: compilar
- `npm run lint`: ESLint
- `npm run type-check`: solo tipos
