export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-xl font-semibold" style={{ color: "var(--text)" }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
