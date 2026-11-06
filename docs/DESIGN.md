# Design

Dirección visual de Tijereta: **bloques de color y tipografía contundente**, a partir de las paletas y tipografías que Nicolás compartió el 2026-11-05 (solo la primera paleta: Port, Tangerine y Crystal Blue; Plus Jakarta Sans como referencia). Reemplaza a la primera dirección ("cálido y artesanal", crema y terracota), que Nicolás descartó por genérica, y a una segunda con las nueve paletas, que le resultó recargada. Fuente de verdad: archivo de Figma `Tijereta`. Tokens en código: `design/tokens.css`. El nombre y el logo son provisorios.

## Mundo visual

Una herramienta de oficio con carácter de póster: bandas de color de ancho completo, títulos macizos y un acento naranja que se ve de lejos. Se usa de pie, entre servicios, con luz de local, así que el contenido de trabajo queda sobre superficies claras y tranquilas, y el color fuerte vive en las bandas, las acciones y los bloques de agenda.

- **Modo:** Operate (app de tarea). La familiaridad pesa más que la expresión.
- **Bandas de color (`Hero Band`):** abren cada pantalla principal. Port (burdeos) para la app del salón, Tangerine para el onboarding y las listas de trabajo, Crystal Blue para el flujo del cliente. Esquinas inferiores de 24 px.
- **Acento:** Tangerine `#E88D59` en la acción principal, con **texto oscuro encima** (no blanco). El acento nunca lleva texto blanco.
- **Referencias de Mobbin** (colección `tijereta-benchmark-2026-11`): tira de días y horarios (Alan, Fresha), hoja inferior (Careem), lista de espera (Fresha), barras simples (Origin).

## Color

**Tres colores, no más**: los de la primera paleta que compartió Nicolás. Dos capas. **Primitivos** (`port`, `tangerine`, `crystal`, cada uno en 10 o 11 pasos) no se usan en componentes. **Semánticos** (`color/bg/*`, `text/*`, `border/*`, `accent/*`, `success|warning|danger|info/*`, `cat/1..6/*`) tienen modo claro y oscuro.

| Color | HEX muestreado | Uso |
| --- | --- | --- |
| Port | `#643438` | Banda de marca, texto (pasos 400 a 900), errores, toasts |
| Tangerine | `#E88D59` | Acción principal, selección, banda de onboarding, avisos |
| Crystal Blue | `#A0BDD6` | Fondo de la app (tinte 50), superficies, banda del cliente, éxito e información, enlaces (paso 800) |

- **Neutros:** el fondo es un tinte muy claro de Crystal Blue (`#F4F8FB`) y el texto sale de Port (`#1F0F10`, `#643438`, `#8E5C61`); no hay gris ni negro puro.
- **Estados con tres colores:** éxito e información son azules (con etiqueta y punto), aviso es naranja, error es burdeos. El color nunca va solo: el margen lleva porcentaje y una etiqueta ("Margen sano", "Margen bajo", "Perdés plata").
- **Bloques de agenda (`cat/1..6`):** tres tintas llenas (Tangerine, Crystal, Port 300) y tres claras, con texto Port 950. Sin franja de color en el borde.
- **Contraste verificado:** texto principal 17,3:1, secundario 9,4:1, terciario 5,1:1, texto oscuro sobre Tangerine 7,4:1, enlace 8,1:1; los pares de estado superan 4,5:1.
- Los otros seis colores de las demás paletas (Aruba, Ganache, Butter, Cress, Rosebloom, Ink Blue) se probaron y se descartaron.

## Tipografía

- **Plus Jakarta Sans** para toda la interfaz (referencia compartida: "friendly & versatile"). Escala fija: 12, 14, 16, 18, 20, 24, 28.
- **Gabarito Black / ExtraBold** para los títulos de las bandas y el wordmark: letras macizas y redondeadas, en la línea de las referencias *General* y *Nexover*. Nunca en etiquetas, botones ni datos.
- Las tipografías *General*, *Megion*, *Nexover* y *Mediate* de las referencias no están instaladas en Figma; Gabarito es el reemplazo. Si Nicolás consigue la licencia de alguna, se cambia solo el valor de `font-family/display`.

## Layout y forma

- Móvil primero (390 px), margen de pantalla de 24 px.
- Targets de 44 px o más; botón principal de 56 px.
- Radios: 8 (tag), 12 (controles), 16 (tarjetas), 24 (hoja inferior y bandas), pill (chips y avatares).
- Navegación inferior de 4 ítems; en escritorio, barra lateral de 240 px.

## Componentes

Atomic design en Figma, todo enlazado a variables. **Atoms:** 30 íconos Lucide, Button (+SM), Icon Button, Status Badge, Channel Tag, Avatar, Chip, Time Slot, Field, Switch, Checkbox, Day Pill, Divider, Wordmark. **Molecules:** 21 (incluye `Hero Band`, con tonos Port, Tangerine y Crystal). **Organisms:** Bottom Nav, Side Nav, Share Link Card, Agenda Grid, Manage Appointment Card, Quick Booking Sheet.

## Movimiento

150 a 250 ms, ease-out exponencial, solo para comunicar estado. Sin coreografías. Respeta `prefers-reduced-motion`.

## No hacer

- No usar un color que no sea un token.
- No poner texto blanco sobre Tangerine; usar `text/on-accent` (Port 900).
- No usar Gabarito en etiquetas, botones ni datos.
- No cubrir una pantalla entera de color fuerte: el color va en bandas, acciones y bloques; el contenido de trabajo va sobre superficies claras.
- No usar tarjetas dentro de tarjetas, ni un borde de color de más de 1 px.
- No inventar un logo definitivo: el wordmark es provisorio.
