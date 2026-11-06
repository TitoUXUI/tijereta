"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdjustPriceSheet } from "@/components/margin/adjust-price-sheet";
import { MarginBar } from "@/components/margin/margin-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatARS } from "@/lib/format";
import { MARGIN_LABEL, bestSuggestion, type MarginLevel, type MarginRow } from "@/lib/margin";

const COLOR: Record<MarginLevel, "crystal" | "accent" | "port"> = { healthy: "crystal", low: "accent", loss: "port" };

const FILL: Record<MarginLevel, string> = {
  healthy: "fill-success-solid",
  low: "fill-warning-solid",
  loss: "fill-danger-solid",
};

function rowName(r: MarginRow): string {
  return r.variantName ? `${r.name} · ${r.variantName.toLowerCase()}` : r.name;
}

interface RowProps {
  row: MarginRow;
  commissionPercent: number;
  onAdjust?: (row: MarginRow) => void;
}

function MarginItem({ row, commissionPercent, onAdjust }: RowProps) {
  const suggestion = bestSuggestion(row, commissionPercent);
  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{rowName(row)}</p>
          <p className="text-sm text-muted-foreground">
            Precio {formatARS(row.price)} · insumos {formatARS(row.suppliesCost)} · comisión {formatARS(row.commissionCost)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-[24px] font-bold leading-7">{row.marginPercent}%</span>
          <Badge variant="dot" color={COLOR[row.level]}>{MARGIN_LABEL[row.level]}</Badge>
        </div>
      </div>
      <MarginBar percent={row.marginPercent} level={row.level} label={`Margen de ${rowName(row)}: ${row.marginPercent}%`} />
      {onAdjust ? (
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {suggestion
              ? `Con ${formatARS(suggestion.price)} te queda ${suggestion.targetPercent}%`
              : "Subir el precio solo no alcanza: revisá insumos y comisión"}
          </p>
          <Button type="button" className="h-11 shrink-0" onClick={() => onAdjust(row)}>Ajustar precio</Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Te queda {formatARS(row.margin)} por servicio</p>
      )}
    </li>
  );
}

interface ServiceMarginTableProps {
  rows: MarginRow[];
  averageCommission: number;
}

export function ServiceMarginTable({ rows, averageCommission }: ServiceMarginTableProps) {
  const [adjusting, setAdjusting] = useState<MarginRow | null>(null);
  const loss = rows.filter((r) => r.level === "loss");
  const low = rows.filter((r) => r.level === "low");
  const healthy = rows.filter((r) => r.level === "healthy");
  const chartData = rows.map((r) => ({ name: rowName(r), margin: r.margin, level: r.level }));

  return (
    <div className="flex flex-col gap-8">
      {loss.length > 0 ? (
        <section aria-labelledby="mg-loss">
          <h2 id="mg-loss" className="text-xl font-semibold">
            Perdés plata en {loss.length} {loss.length === 1 ? "servicio" : "servicios"}
          </h2>
          <ul className="divide-y divide-border">
            {loss.map((r) => <MarginItem key={r.id} row={r} commissionPercent={averageCommission} onAdjust={setAdjusting} />)}
          </ul>
        </section>
      ) : null}

      {low.length > 0 ? (
        <section aria-labelledby="mg-low">
          <h2 id="mg-low" className="text-xl font-semibold">Se puede mejorar</h2>
          <ul className="divide-y divide-border">
            {low.map((r) => <MarginItem key={r.id} row={r} commissionPercent={averageCommission} onAdjust={setAdjusting} />)}
          </ul>
        </section>
      ) : null}

      {healthy.length > 0 ? (
        <section aria-labelledby="mg-ok">
          <h2 id="mg-ok" className="text-xl font-semibold">Dejan buen margen</h2>
          <ul className="divide-y divide-border">
            {healthy.map((r) => <MarginItem key={r.id} row={r} commissionPercent={averageCommission} />)}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="mg-chart">
        <h2 id="mg-chart" className="text-xl font-semibold">Lo que te queda por servicio</h2>
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

      <AdjustPriceSheet row={adjusting} commissionPercent={averageCommission} onClose={() => setAdjusting(null)} />
    </div>
  );
}
