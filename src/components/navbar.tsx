"use client";

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Alliancar from "../../public/alliancar.avif"
import { useUser } from '@/context/UserContext';

type ClassValue = string | false | null | undefined;

function classNames(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDateBR(isoString: string): string {
  if (!isoString) return "";

  const date = new Date(isoString);

  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}



export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, perfil, loading } = useUser();


  const navigation = [
    { name: 'Vendas', href: '/vendas', current: false },
    { name: 'Contatos', href: '/contatos', current: false },
    { name: 'Atividades', href: '/atividades', current: false },
    { name: 'Minha Conta', href: '/conta', current: false },
    { name: 'Relatórios', href: '/relatorios', current: false },
    { name: 'Financeiro', href: '/financeiro', current: false },
    // { name: 'Minha Empresa', href: '/empresa', current: false },
    // { name: 'Ferramentas', href: '/ferramentas', current: false },
  ]

  return (
    <Disclosure
      as="nav"
      className="relative bg-jelly-bean-900 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
    >
      <div className="px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center lg:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center  lg:justify-start">
            <div className="flex">
              <Image src={Alliancar} width={150} height={150} alt="Alliancar" />
            </div>
            <div className="hidden sm:ml-6 lg:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current ? 'bg-jelly-bean-950/50 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Notifications */}
            {/* <div className="relative">
              <button
                type="button"
                className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-white"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">View notifications</span>
                <BellIcon aria-hidden="true" className="size-6" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-jelly-bean-900 py-1 outline -outline-offset-1 outline-white/10 shadow-lg">
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <BellIcon className="h-5 w-5 text-gray-300" />
                      <h2 className="text-lg font-semibold text-white">Notificações</h2>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-2">
                    <div className="cursor-pointer hover:bg-white/5 rounded p-2">
                      <h3 className="font-medium text-white">Cotações recebidas</h3>
                      <span className="text-sm text-gray-400">
                        Negociação recebida
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        21/07/2025 - 19:17 | ID: 4715630
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-white/10">
                    <button className="w-full mt-1 rounded-md bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10">
                      Ver mais
                    </button>
                  </div>
                </div>
              )}
            </div> */}

            {/* perfis dropdown */}
            <Menu as="div" className="relative ml-3 ">
              <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ">
                <span className="absolute -inset-1.5" />
                <span className="sr-only ">Open user menu</span>
                <h6 className="size-8 rounded-full bg-jelly-bean-600 outline -outline-offset-1 outline-white/10 text-white flex justify-center items-center font-bold text-sm">{perfil?.nome_completo.toUpperCase().slice(0, 2)}</h6>
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-gray-800 py-1 outline -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10">
                  <h6 className="size-10 rounded-full bg-jelly-bean-600 outline -outline-offset-1 outline-white/10 text-white flex justify-center items-center font-bold text-sm">{perfil?.nome_completo.toUpperCase().slice(0, 2)}</h6>
                  <div>
                    <p className="font-medium text-default">{perfil?.nome_completo}</p>
                    <p className="text-sm text-default">
                      {user?.email}
                    </p>
                    <p className="text-[10px] text-default mt-1">
                      Último acesso: {formatDateBR(user?.last_sign_in_at ?? "")}
                    </p>
                  </div>
                </div>
                {/* <MenuItem>
                  <a
                    href="https://powercrm.zendesk.com/hc/pt-br/requests/new"
                    target="_blank"
                    className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:outline-hidden"
                  >
                    Central de ajuda
                  </a>
                </MenuItem> */}
                <MenuItem>
                  <Link
                    href="/logout"
                    className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:outline-hidden"
                  >
                    Sair
                  </Link>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="lg:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={classNames(
                item.current ? 'bg-jelly-bean-950/50 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}