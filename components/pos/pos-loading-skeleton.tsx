import { Skeleton } from "@/components/ui/skeleton";

export function PosLoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="shadcn-card rounded-2xl p-4">
          <Skeleton className="mb-4 h-32 w-full rounded-xl" />
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="mb-4 h-4 w-1/2" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
