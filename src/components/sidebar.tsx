'use client'
import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  User,
  Link,
  Target,
  Users,
  ShoppingCart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Conta from '../app/conta/page'

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Minhas Vendas');


  const menuItems = [
    {
      id: 'minhas-vendas',
      label: 'Minhas Vendas',
      icon: <ShoppingCart className="h-4 w-4" />,
      href: '/internal/mySales'
    },
    {
      id: 'conta-saque',
      label: 'Conta de Saque Iugu',
      icon: <CreditCard className="h-4 w-4" />,
      href: '/internal/iuguBeneficiaryPanel'
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: <User className="h-4 w-4" />,
      href: '/internal/myAccount'
    },
    {
      id: 'powerlinks',
      label: 'Powerlinks',
      icon: <Link className="h-4 w-4" />,
      href: '/internal/hotlink'
    },
    {
      id: 'metas',
      label: 'Minhas Metas',
      icon: <Target className="h-4 w-4" />,
      href: '/internal/myGoals'
    },
    {
      id: 'afiliados',
      label: 'Meus Afiliados',
      icon: <Users className="h-4 w-4" />,
      href: '/internal/myAffiliate',
      active: true
    }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-gray-50 border-r transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}
        style={{ marginLeft: '-15px !important' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {!collapsed && (
              <h3 className="text-lg font-semibold text-gray-800">Minha Conta</h3>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      activeItem === item.label || item.active
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } ${collapsed ? 'justify-center' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveItem(item.label);
                    }}
                  >
                    <span className={`${collapsed ? '' : 'mr-3'}`}>
                      {item.icon}
                    </span>
                    {!collapsed && item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      {/* <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {activeItem}
        </h1>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-600">
            Conteúdo da página {activeItem} será exibido aqui.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Esta é uma demonstração do sidebar colapsável. Clique no ícone no canto superior para expandir/recolher.
          </p>
        </div>
      </div> */}
        <Conta />
    </div>
  );
};

export default Sidebar;