"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CalendarDays,
  Hourglass,
  Percent,
  Tag,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/layout/wordmark";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function navFor(role: Role): NavItem[] {
  if (role === "professional") {
    return [{ href: "/mi-agenda", label: "Mi agenda", icon: CalendarDays }];
  }
  const base: NavItem[] = [
    { href: "/hoy", label: "Hoy", icon: CalendarCheck },
    { href: "/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/espera", label: "Espera", icon: Hourglass },
  ];
  if (role === "owner") {
    base.push({ href: "/servicios", label: "Servicios", icon: Tag });
    base.push({ href: "/margen", label: "Margen", icon: Percent });
  }
  base.push({ href: "/caja", label: "Caja", icon: Wallet });
  return base;
}

export function homeFor(role: Role): string {
  return role === "professional" ? "/mi-agenda" : "/hoy";
}

export function AppNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navFor(role);

  return (
    <>
      {/* Escritorio: barra lateral */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-6 border-r border-subtle bg-surface p-4 md:flex">
        <Wordmark className="px-2 pt-2 text-brand" />
        <nav aria-label="Principal" className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-touch items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors duration-base ease-out",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-sunken",
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto px-2 text-xs text-tertiary">Prototipo de portfolio. Nombre y logo provisorios.</p>
      </aside>

      {/* Móvil: navegación inferior */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-subtle bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-base ease-out",
                active ? "text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full",
                  active && "bg-accent",
                )}
              >
                <item.icon className="size-5" aria-hidden />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

