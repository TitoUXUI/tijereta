const ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatARS(value: number): string {
  return ARS.format(value);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDayLong(iso: string): string {
  const text = new Date(iso).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDayShort(date: Date): string {
  return date.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "");
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function dayKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  return dayKey(a) === dayKey(b);
}

/** Convierte "2026-11-06" + "14:30" a un ISO local */
export function toISO(day: string, hhmm: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0).toISOString();
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

/** Normaliza lo que escribe la persona al formato +54 9 11 xxxx xxxx */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return `+54 9 ${digits}`.trim();
}
