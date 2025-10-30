import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full h-11 rounded-md border px-3 text-sm text-white placeholder-white focus:outline-none focus:border-a1 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
