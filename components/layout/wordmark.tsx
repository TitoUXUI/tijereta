import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

/** Wordmark provisorio: el nombre y el logo no son definitivos */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-xl font-black", className)}>
      <Scissors className="size-5" aria-hidden />
      Tijereta
    </span>
  );
}
