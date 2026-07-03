"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FilterSelect({
  name,
  label,
  options,
  current,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  current?: string;
  query?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    router.push(`/transactions?${params.toString()}`);
  }

  return (
    <select
      defaultValue={current ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-full px-3 py-1.5 border outline-none"
      style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text)" }}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
