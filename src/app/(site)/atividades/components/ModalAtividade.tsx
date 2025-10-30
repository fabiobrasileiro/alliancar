import React from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NovaAtividade, Usuario } from "./types";

interface ModalAtividadeProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  atividade: NovaAtividade;
  usuarios: Usuario[];
  onChange: (field: keyof NovaAtividade, value: string) => void;
  onSave: () => void;
}

export const ModalAtividade: React.FC<ModalAtividadeProps> = ({
  isOpen,
  onClose,
  mode,
  atividade,
  usuarios,
  onChange,
  onSave,
}) => {
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg bg-bg">
                <div className="bg-bg px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-white mb-4"
                      >
                        {mode === "create"
                          ? "Nova Atividade"
                          : "Editar Atividade"}
                      </Dialog.Title>

                      <div className="mt-2 space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                          <Label
                            htmlFor="titulo"
                            className="text-sm font-medium"
                          >
                            Título *
                          </Label>
                          <Input
                            type="text"
                            id="titulo"
                            placeholder="Digite o título da atividade"
                            value={atividade.titulo}
                            onChange={(e) => onChange("titulo", e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label
                            htmlFor="descricao"
                            className="text-sm font-medium"
                          >
                            Descrição
                          </Label>
                          <textarea
                            id="descricao"
                            rows={3}
                            className="w-full rounded-md border px-3 py-2 text-sm focus:border-a1 focus:ring-a1 text-white bg-bg text-white placeholder-white"
                            placeholder="Descreva a atividade..."
                            value={atividade.descricao}
                            onChange={(e) =>
                              onChange("descricao", e.target.value)
                            }
                          />
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label
                            htmlFor="afiliado_id"
                            className="text-sm font-medium"
                          >
                            Responsável
                          </Label>
                          <select
                            id="afiliado_id"
                            className="w-full rounded-md border px-3 py-2 text-sm focus:border-a1 focus:a1 text-white"
                            value={atividade.afiliado_id}
                            onChange={(e) =>
                              onChange("afiliado_id", e.target.value)
                            }
                          >
                            <option value="">Selecione um responsável</option>
                            {usuarios.map((usuario) => (
                              <option key={usuario.id} value={usuario.id}>
                                {usuario.nome_completo}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label
                            htmlFor="prazo"
                            className="text-sm font-medium"
                          >
                            Prazo *
                          </Label>
                          <Input
                            type="date"
                            id="prazo"
                            value={atividade.prazo}
                            onChange={(e) => onChange("prazo", e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label
                            htmlFor="prioridade"
                            className="text-sm font-medium"
                          >
                            Prioridade
                          </Label>
                          <select
                            id="prioridade"
                            className="w-full rounded-md border px-3 py-2 text-sm focus:border-a1 focus:ring-a1 text-white bg-bg"
                            value={atividade.prioridade}
                            onChange={(e) =>
                              onChange("prioridade", e.target.value)
                            }
                          >
                            <option value="Alta">Alta</option>
                            <option value="Normal">Normal</option>
                            <option value="Baixa">Baixa</option>
                          </select>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="tipo" className="text-sm font-medium">
                            Tipo
                          </Label>
                          <select
                            id="tipo"
                            className="w-full rounded-md border px-3 py-2 text-sm focus:border-a1 focus:ring-a1 text-white bg-bg"
                            value={atividade.tipo}
                            onChange={(e) => onChange("tipo", e.target.value)}
                          >
                            <option value="Ligar">Ligar</option>
                            <option value="Whatsapp">Whatsapp</option>
                            <option value="Email">Email</option>
                            <option value="Visita">Visita</option>
                            <option value="Previsão de fechamento">
                              Previsão de fechamento
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-background px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-a1 cursor-pointer px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-a1 sm:ml-3 sm:w-auto"
                    onClick={onSave}
                  >
                    {mode === "create"
                      ? "Criar Atividade"
                      : "Salvar Alterações"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md cursor-pointer bg-bg px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-background sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
