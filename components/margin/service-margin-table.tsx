"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { formatARS } from "@/lib/format";
import { MARGIN_LABEL, type MarginLevel, type MarginRow } from "@/lib/margin";
import { cn } from "@/lib/utils";

const TONE: Record<MarginLevel, string> = {
  healthy: "bg-success-bg text-success-fg border-success-border",
  low: "bg-warning-bg text-warning-fg border-warning-border",
  loss: "bg-danger-bg text-danger-fg border-danger-border",
};

const FILL: Record<MarginLevel, string> = {
  healthy: "fill-success-solid",
  low: "fill-warning-solid",
  loss: "fill-danger-solid",
};

function rowName(r: MarginRow): string {
  return r.variantName ? `${r.name} · ${r.variantName.toLowerCase()}` : r.name;
}

export function ServiceMarginTable({ rows, averageCommission }: { rows: MarginRow[]; averageCommission: number }) {
  const chartData = rows.map((r) => ({ name: rowName(r), margin: r.margin, level: r.level }));

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="margin-chart" className="rounded-card border border-subtle bg-surface p-4">
        <h2 id="margin-chart" className="text-xl font-semibold">Lo que te queda por servicio</h2>
        <p className="text-sm text-muted-foreground">Precio menos insumos y comisión promedio ({Math.round(averageCommission)}%).</p>
        <div className="mt-4 h-72 w-full" role="img" aria-label="Gráfico de barras con el margen en pesos de cada servicio">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} className="text-xs" />
              <YAxis type="category" dataKey="name" width={120} className="text-xs" />
              <Tooltip formatter={(v) => formatARS(Number(v))} cursor={false} />
              <Bar dataKey="margin" radius={4}>
                {chartData.map((d) => (
                  <Cell key={d.name} className={FILL[d.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section aria-labelledby="margin-list" className="flex flex-col gap-2">
        <h2 id="margin-list" className="text-xl font-semibold">Detalle</h2>
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.id} className="rounded-card border border-subtle bg-surface p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-semibold">{rowName(r)}</p>
                <span className={cn("rounded-tag border px-2 py-1 text-xs font-medium", TONE[r.level])}>
                  {MARGIN_LABEL[r.level]} · {r.marginPercent}%
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                <div><dt className="text-muted-foreground">Precio</dt><dd className="font-medium">{formatARS(r.price)}</dd></div>
                <div><dt className="text-muted-foreground">Insumos</dt><dd className="font-medium">{formatARS(r.suppliesCost)}</dd></div>
                <div><dt className="text-muted-foreground">Comisión</dt><dd className="font-medium">{formatARS(r.commissionCost)}</dd></div>
                <div><dt className="text-muted-foreground">Te queda</dt><dd className="font-semibold">{formatARS(r.margin)}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
