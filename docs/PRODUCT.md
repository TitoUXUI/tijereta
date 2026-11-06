# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts y Supabase. Definido en `CLAUDE.md`. El diseño vive en Figma (archivo `Tijereta`) y Claude Code lo lee por MCP.

## Users
Seis perfiles, con evidencia de entrevistas (rondas 1 y 2, muestras por debajo de la meta) y una parte sin entrevistar:
- **Dueña en la silla:** salón de 2 a 4 personas, atiende y administra a la vez, contesta mensajes entre clientas. Usa WhatsApp, Instagram, cuaderno y planillas.
- **Dueña que administra:** salón de 6 a 8 personas con recepcionista y contador; está más en la administración que en la silla. Un solo caso, del círculo cercano.
- **Independiente:** trabaja solo, alquila sillón o puesto.
- **Estilista o barbero:** cobra comisión; quiere ver su agenda y lo que hizo sin preguntar.
- **Recepcionista o encargado:** centraliza agenda, mensajes y cambios. **No fue entrevistada**; todo es de segunda mano.
- **Cliente final:** reserva, cancela o reagenda desde un link en el chat, sin cuenta ni app. Dos entrevistas, ambos jóvenes.

Contexto de uso: de pie, entre servicios, en el celular, con luz de local, con las manos ocupadas. Español rioplatense.

## Product Purpose
Una agenda única para todo el equipo de peluquerías, barberías y salones de Argentina, para dejar de cargar los turnos dos veces. Los turnos hoy viven en cuaderno, notas, WhatsApp, Instagram y planillas, y el cliente sigue escribiendo por chat aunque haya un sistema. Éxito `[HIPÓTESIS]`: alta manual de un turno en menos de 30 segundos y primer turno por link en 48 horas.

## Positioning
Un link que se pega en el chat (no lo reemplaza), con alta rápida en la misma agenda. Margen por servicio como diferenciador `[HIPÓTESIS: no verificado en las demos de los competidores]`. Precio fijo en pesos y sin comisiones por cliente.

## Operating Context
- Los turnos llegan por WhatsApp e Instagram; el salón responde mientras atiende.
- Las faltas cuestan de 2 a 8 turnos por semana según el tamaño; el hueco casi no se recupera.
- Los servicios se suman (corte + barba, color + tratamiento) y su duración varía.
- Dos registros paralelos (estilista y dueña) producen dudas de comisiones.
- Tres de cuatro que probaron un sistema o link lo abandonaron o lo complican por la carga doble.

## Capabilities and Constraints
- **Alcance:** todo el producto vive en el PRD (`vault/outputs/prd-tijereta-v1.1-2026-11-05.md`); **se diseña solo el recorrido central de 9 pantallas** (P-03, P-04, P-05, P-06, P-21/22, P-24/25, P-26, P-10, P-20).
- **Integraciones simuladas:** WhatsApp, Mercado Pago, ARCA. El link se pega a mano.
- **Proyecto de portfolio**, no de desarrollo real.
- El cliente final no tiene cuenta ni descarga una app.
- Seña opcional por servicio, solo en servicios largos.
- Roles: dueña, encargado, recepcionista y profesional ven cosas distintas (permisos `[HIPÓTESIS]`).
- Sin definir: nombre definitivo, ARS 30.000 como precio, qué ve la recepcionista en la caja.

## Brand Commitments
Nombre **Tijereta**, provisorio. No hay logo, paleta ni tipografía previos. La dirección visual (cálido y artesanal) se define en DESIGN.md, no acá.

## Evidence on Hand
- Entrevistas: 9 estilistas, 3 dueños, 2 independientes y 2 clientes, en `vault/raw/entrevistas/`. Faltan fecha, método y si las citas son literales.
- Research de escritorio de mercado, usuario, producto y negocio, en `vault/raw/research-agents/`.
- Referencias de Mobbin guardadas en la colección privada `tijereta-benchmark-2026-11`.
- **No hay:** testimonios, clientes reales, reseñas de usuarios de Tijereta, benchmarks de software para peluquerías, precios en pesos de AgendaPro, demos de los competidores.

## Product Principles
1. **Una sola carga.** Todo turno, venga de un link o de un mensaje, vive en una sola agenda.
2. **Entrar por el chat, no reemplazarlo.** El cliente sigue donde ya está.
3. **Quien atiende no escribe.** El producto no suma trabajo manual mientras se está con un cliente.
4. **Ver y cambiar son cosas distintas.** Ver la agenda sin preguntar; cambiar sin depender de mirar el celular.
5. **Sin castigo.** Cancelar, reagendar y la seña con copy amable.

## Accessibility & Inclusion
Contraste WCAG AA, targets de 44 px, labels en todos los inputs. El link público funciona sin cuenta ni app y con conexión móvil limitada. Clientes mayores pueden no usar un link: ofrecer una vía alternativa. Accesibilidad profunda (B3b) sin ejecutar.
