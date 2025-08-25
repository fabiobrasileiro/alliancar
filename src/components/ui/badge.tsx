import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "blue" | "red" | "green" | "gray";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-200 text-slate-700",
  blue: "bg-blue-600 text-white",
  red: "bg-red-500 text-white",
  green: "bg-green-500 text-white",
  gray: "bg-slate-500 text-white",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-5 h-4 px-1 rounded-md text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
