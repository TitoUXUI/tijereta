import type { ReactNode } from "react";

interface TotalBarProps {
  detail: string;
  total: string;
  children: ReactNode;
}

/** Barra fija con el total y la acción principal: el precio siempre a la vista antes de confirmar */
export function TotalBar({ detail, total, children }: TotalBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-subtle bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{detail}</p>
          <p className="text-xl font-semibold">{total}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
