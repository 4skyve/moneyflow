export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: "var(--card-bg-soft)" }}
    />
  );
}

export default function PageLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-40" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
}
