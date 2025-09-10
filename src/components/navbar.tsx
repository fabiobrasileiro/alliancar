"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Alliancar from "../../public/alliancar.avif"
import { useUser } from '@/context/UserContext';
import { Button } from "./ui/button";
import { CopyIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

type ClassValue = string | false | null | undefined;

function classNames(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
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
  const supabase = createClient();
  const { user, perfil } = useUser();
  const [loading, setLoading] = useState(true);
  const [perfilData, setPerfilData] = useState<any>(null);

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !authUser) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data: perfilResponse, error: perfilError } = await supabase
        .from("afiliados")
        .select("*")
        .eq("auth_id", authUser.id)
        .single();

      if (perfilError) {
        console.error("Erro ao buscar perfil:", perfilError);
        return;
      }

      if (perfilResponse) {
        setPerfilData(perfilResponse);
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado para a área de transferência!");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", current: false },
    { name: "Vendas", href: "/vendas", current: false },
    { name: "Contatos", href: "/contatos", current: false },
    { name: "Atividades", href: "/atividades", current: false },
    { name: "Minha Conta", href: "/conta", current: false },
    { name: "Relatórios", href: "/relatorios", current: false },
  ];
  const navigationAfiliado = [
    { name: "Dashboard", href: "/dashboard", current: false },
    { name: "Vendas", href: "/vendas", current: false },
    { name: "Contatos", href: "/contatos", current: false },
    { name: "Atividades", href: "/atividades", current: false },
    { name: "Minha Conta", href: "/conta", current: false },
  ];

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
              <Bars3Icon
                aria-hidden="true"
                className="block size-6 group-data-open:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden size-6 group-data-open:block"
              />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center lg:justify-start">
            <div className="flex">
              <Link href='/'>
                <Image src={Alliancar} width={150} height={150} alt="Alliancar" />
              </Link>
            </div>
            <div className="hidden sm:ml-6 lg:block">
              <div className="flex space-x-4">
                {perfil?.tipo === 'administrador' ? (
                  navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-jelly-bean-950/50 text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))
                ) : (
                  navigationAfiliado.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-jelly-bean-950/50 text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="flex items-center">
              <Button
                variant="default"
                className="mr-4 hidden md:flex"
                onClick={() => copyToClipboard('/')}
              >
                <CopyIcon className="mr-2 h-4 w-4" /> Copiar Link
              </Button>
            </div>

            {/* afiliados dropdown */}
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <h6 className="size-8 rounded-full bg-jelly-bean-600 outline -outline-offset-1 outline-white/10 text-white flex justify-center items-center font-bold text-sm">
                  {perfilData?.nome_completo?.toUpperCase().slice(0, 2) || perfil?.nome_completo?.toUpperCase().slice(0, 2) || "US"}
                </h6>
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-gray-50 py-1 outline -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10">

                  <div>
                    <p className="font-medium text-white">{perfilData?.nome_completo || perfil?.nome_completo || "Usuário"}</p>
                    <p className="text-sm text-gray-300">
                      {user?.email}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Último acesso: {formatDateBR(user?.last_sign_in_at ?? "")}
                    </p>
                  </div>
                </div>

                <MenuItem>
                  <Link
                    href="/logout"
                    className="block px-4 py-2 text-sm text-jelly-bean-600 data-focus:bg-white/5 data-focus:outline-hidden"
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
                item.current
                  ? "bg-jelly-bean-950/50 text-white"
                  : "text-gray-300 hover:bg-white/5 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium",
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}