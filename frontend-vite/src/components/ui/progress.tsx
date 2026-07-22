import React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  max?: number;
}

function Progress({ value, className, indicatorClassName, max = 100 }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn("h-2 w-full rounded-full bg-secondary overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500 ease-out", indicatorClassName || "bg-primary")}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export { Progress };
