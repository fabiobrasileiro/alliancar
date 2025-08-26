"use client";

import React, { useState } from "react";
import { Bell, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  return (
    <div className="w-full bg--green shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        {/* Logo */}
        <div className="flex gap-4">
          <a
            href="https://app.powercrm.com.br/company/dashboard"
            title="PowerCRM"
          >
            <img src="/cmpnImg?i=1488" alt="PowerCRM" className="h-8" />
          </a>
          {/* Menu */}
          <ul className="flex gap-4 px-4 py-3 text-sm font-medium">
            <li>
              <Link href="/vendas">Vendas</Link>
            </li>
            <li>
              <Link href="/contatos">Contatos</Link>
            </li>
            <li>
              <Link href="/atividades">Atividades</Link>
            </li>
            <li>
              <Link href="/conta">Minha Conta</Link>
            </li>

            {/* Dropdown Relatórios */}
            <li className="relative">
              <p
                onClick={() => setShowReportMenu(!showReportMenu)}
                className="flex items-center gap-1 cursor-pointer"
              >
                Relatórios <ChevronDown className="h-4 w-4" />
              </p>
              {showReportMenu && (
                <Card className="absolute mt-2 w-72 p-4 shadow-lg z-50">
                  <p className="font-semibold mb-3">Relatórios</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/relatorios">Relatórios antigos</Link>
                    </li>
                    <li>
                      <Link href="/relatorios/dinamicos">
                        Relatórios dinâmicos
                      </Link>
                    </li>
                    <li>
                      <Link href="/relatorios/banco">
                        Relatórios de banco de dados
                      </Link>
                    </li>
                  </ul>
                </Card>
              )}
            </li>

            <li>
              <Link href="/financeiro">Financeiro</Link>
            </li>
            <li>
              <Link href="/empresa">Minha Empresa</Link>
            </li>
            <li>
              <Link href="/ferramentas">Ferramentas</Link>
            </li>
          </ul>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
            </Button>
            {showNotifications && (
              <Card className="absolute right-0 mt-2 w-80 p-4 shadow-lg z-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Notificações</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ul className="space-y-3">
                  {/* Aqui você pode mapear as notificações */}
                  <li className="cursor-pointer hover:bg-gray-50 rounded p-2">
                    <h3 className="font-medium">Cotações recebidas</h3>
                    <span className="text-sm text-gray-500">
                      Negociação recebida
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      21/07/2025 - 19:17 | ID: 4715630
                    </div>
                  </li>
                </ul>
                <Button className="w-full mt-3">Ver mais</Button>
              </Card>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <img
              src="https://user.powercrm.com.br/open/userPicture/167902"
              alt="User"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setShowUserMenu(!showUserMenu)}
            />
            {showUserMenu && (
              <Card className="absolute right-0 mt-2 w-64 p-4 shadow-lg z-50">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src="https://user.powercrm.com.br/open/userPicture/167902"
                    alt="User"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">Marcel Araújo</p>
                    <p className="text-sm text-gray-500">
                      omarcelaraujo@gmail.com
                    </p>
                    <p className="text-xs text-gray-400">
                      Último acesso: 22/08/2025 - 10:34
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://powercrm.zendesk.com/hc/pt-br/requests/new"
                      target="_blank"
                      className="block hover:underline"
                    >
                      Central de ajuda
                    </a>
                  </li>
                  <li>
                    <Link href="/logout" className="block hover:underline">
                      Sair
                    </Link>
                  </li>
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
