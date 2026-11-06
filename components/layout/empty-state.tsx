import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  text: string;
  action?: ReactNode;
}

/** Ícono + una línea de texto + botón principal */
export function EmptyState({ icon: Icon, text, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-input p-8 text-center">
      <Icon className="size-8 text-tertiary" aria-hidden />
      <p className="text-base text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}
