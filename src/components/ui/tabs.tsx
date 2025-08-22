import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabsProps {
  value: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn("w-full", className)} data-tabs-value={value}>
      {children}
    </div>
  );
}

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "w-full flex flex-wrap items-center gap-1 bg-slate-200 p-2 rounded-md overflow-x-auto",
        className,
      )}
      tabIndex={0}
      {...props}
    />
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  active?: boolean;
}

export function TabsTrigger({
  className,
  value,
  active,
  children,
  ...props
}: TabsTriggerProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "flex flex-grow items-center whitespace-nowrap justify-center h-10 cursor-pointer text-sm font-bold gap-2 px-4 border-none rounded-md bg-transparent hover:text-blue-700",
        active && "bg-white text-blue-700",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  active?: boolean;
}

export function TabsContent({
  className,
  value,
  active,
  ...props
}: TabsContentProps) {
  return (
    <div
      role="tabpanel"
      data-state={active ? "active" : "inactive"}
      className={cn("w-full mt-4 text-md", !active && "hidden", className)}
      tabIndex={0}
      {...props}
    />
  );
}
