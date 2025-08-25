import React, { ReactNode, useState } from 'react';
import {
  CreditCard,
  User,
  Target,
  Users,
  ShoppingCart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Conta from '../app/conta/page'
import Link from 'next/link';

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
}

const Sidebar = ({ menuItems }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Minhas Vendas');

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen">
      <div
        className={`bg-gray-50 border-r transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            {!collapsed && (
              <h3 className="text-lg font-semibold text-gray-800">
                Minha Conta
              </h3>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      activeItem === item.label
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } ${collapsed ? 'justify-center' : ''}`}
                    onClick={(e) => {
                      setActiveItem(item.label);
                    }}
                  >
                    <span className={`${collapsed ? '' : 'mr-3'}`}>
                      {item.icon}
                    </span>
                    {!collapsed && item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <Conta />
    </div>
  );
};

export default Sidebar;
