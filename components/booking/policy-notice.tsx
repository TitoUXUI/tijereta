import { Info, ShieldCheck } from "lucide-react";
import { formatARS } from "@/lib/format";

export function PolicyNotice({ cancelHoursBefore }: { cancelHoursBefore: number }) {
  return (
    <div className="flex gap-3 rounded-card border border-info-border bg-info-bg p-3 text-info-fg">
      <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
      <p className="text-sm">
        Podés cancelar o reprogramar sin cargo hasta {cancelHoursBefore} horas antes. Si no podés venir, avisanos y lo resolvemos juntos.
      </p>
    </div>
  );
}

export function DepositNotice({ amount, percent }: { amount: number; percent?: number }) {
  return (
    <div className="flex gap-3 rounded-card border border-warning-border bg-warning-bg p-3 text-warning-fg">
      <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="text-sm">
        <p className="font-semibold">
          Este turno lleva una seña de {formatARS(amount)}
          {percent ? ` (${percent}%)` : ""}
        </p>
        <p>Se descuenta del total el día del turno. Es un servicio largo y la seña nos ayuda a reservarte el tiempo.</p>
      </div>
    </div>
  );
}

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-card border border-dashed border-input bg-sunken p-3 text-xs text-muted-foreground">
      <span className="font-semibold">Modo demo.</span> {children}
    </p>
  );
}
