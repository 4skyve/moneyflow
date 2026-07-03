"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TrendChart({ data }: { data: { label: string; pemasukan: number; pengeluaran: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
          formatter={(v) => new Intl.NumberFormat("id-ID").format(Number(v ?? 0))}
        />
        <Bar dataKey="pemasukan" fill="var(--income)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="pengeluaran" fill="var(--expense)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
