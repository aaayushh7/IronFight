"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("skeleton rounded-xl", className)} />
  );
}

export function MealCardSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-40" />
        </div>
      </div>
      <Skeleton className="h-4 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="w-28 h-28 rounded-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
