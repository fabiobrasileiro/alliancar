"use client";

import React, { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface SidebarProps {
  title: string;
  items: SidebarItem[];
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ title, items, className }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-slate-50 border rounded-md h-screen ${collapsed ? "w-14" : "w-64"} shrink-0 transition-all ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3 border-b">
        {!collapsed && (
          <h3 className="font-semibold text-slate-700 text-base">{title}</h3>
        )}
        <button
          type="button"
          className="p-1 rounded-md hover:bg-slate-200"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-700" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          )}
        </button>
      </div>

      <nav className="p-2">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    isActive
                      ? "bg-white shadow-sm text-slate-800"
                      : "text-slate-600 hover:bg-slate-100"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  {item.icon && (
                    <span className="text-slate-500">{item.icon}</span>
                  )}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
