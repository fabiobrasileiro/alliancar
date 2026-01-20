import React, { ReactNode } from "react";
import Sidebar from "./sidebar";
import {
  CreditCard,
  LinkIcon,
  ShoppingCart,
  Target,
  User,
  Users,
} from "lucide-react";

const sidebarLayout = ({ children }: { children: ReactNode }) => {
  const menuItems = [
    // {
    //   id: "minhas-vendas",
    //   label: "Minhas Vendas",
    //   icon: <ShoppingCart className="h-4 w-4" />,
    //   href: "/conta",
    // },
    {
      id: "conta-de-saque",
      label: "Conta de Saque",
      icon: <CreditCard className="h-4 w-4" />,
      href: "/conta/saque",
    },
    {
      id: "perfil",
      label: "Perfil",
      icon: <User className="h-4 w-4" />,
      href: "/conta/perfil",
    },
    {
      id: "hotlinks",
      label: "Hotlinks",
      icon: <LinkIcon className="h-4 w-4" />,
      href: "/conta/hotlink",
    },
    {
      id: "links-personalizados",
      label: "Links personalizados",
      icon: <LinkIcon className="h-4 w-4" />,
      href: "/conta/links-personalizados",
    },
  ];

  return (
    <>
      <div className="flex h-screen">
        <div className="h-screen">
          <Sidebar items={menuItems} title="Minha Conta" />
        </div>

        <div className="w-full">{children}</div>
      </div>
    </>
  );
};

export default sidebarLayout;
