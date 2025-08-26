"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/login";
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}


