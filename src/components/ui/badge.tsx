import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "blue" | "red" | "green" | "gray";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-jelly-bean-300 text-jelly-bean-50",
  blue: "bg-jelly-bean-100 text-white",
  red: "bg-red-300 text-white",
  green: "bg-green-300 text-white",
  gray: "bg-slate-300 text-white",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-5 h-4 px-1 rounded-md text-xs font-medium text-jelly-bean-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
