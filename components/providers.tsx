"use client";

import { ThemeProvider } from "next-themes";
import { FluidRoot } from "@/components/fluid-root";
import { DemoProvider } from "@/lib/store/demo-store";
import { Toaster } from "@/components/ui/sonner";

/** Tema (sistema por defecto), librería Fluid y datos de demo */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <FluidRoot>
        <DemoProvider>
          {children}
          <Toaster position="top-center" />
        </DemoProvider>
      </FluidRoot>
    </ThemeProvider>
  );
}
