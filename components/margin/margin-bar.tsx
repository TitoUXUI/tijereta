import { cn } from "@/lib/utils";
import type { MarginLevel } from "@/lib/margin";

const FILL: Record<MarginLevel, string> = {
  healthy: "[&::-webkit-progress-value]:bg-success-solid [&::-moz-progress-bar]:bg-success-solid",
  low: "[&::-webkit-progress-value]:bg-warning-solid [&::-moz-progress-bar]:bg-warning-solid",
  loss: "[&::-webkit-progress-value]:bg-danger-solid [&::-moz-progress-bar]:bg-danger-solid",
};

/** Barra de margen: un <progress> nativo, sin estilos en línea */
export function MarginBar({ percent, level, label }: { percent: number; level: MarginLevel; label: string }) {
  return (
    <progress
      aria-label={label}
      value={Math.min(100, Math.max(3, percent))}
      max={100}
      className={cn(
        "h-2 w-full appearance-none overflow-hidden rounded-full border-0 bg-border [&::-webkit-progress-bar]:bg-border [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:rounded-full",
        FILL[level],
      )}
    />
  );
}
