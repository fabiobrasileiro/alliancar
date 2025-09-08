import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { NewActivityForm, Usuario } from "./types";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  formData: NewActivityForm;
  onFormChange: (field: keyof NewActivityForm, value: string) => void;
  onSubmit: () => void;
  usuarios: Usuario[];
}

export default function ActivityModal({
  isOpen,
  onClose,
  mode,
  formData,
  onFormChange,
  onSubmit,
  usuarios,
}: ActivityModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {mode === "create" ? "Nova Atividade" : "Editar Atividade"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                  >
                    ✕
                  </Button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                  }}
                  className="space-y-4"
                >
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="titulo" className="text-sm font-medium">
                      Título *
                    </Label>
                    <Input
                      type="text"
                      id="titulo"
                      placeholder="Título da atividade"
                      value={formData.titulo}
                      onChange={(e) => onFormChange("titulo", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="descricao" className="text-sm font-medium">
                      Descrição *
                    </Label>
                    <textarea
                      id="descricao"
                      placeholder="Descrição da atividade"
                      value={formData.descricao}
                      onChange={(e) => onFormChange("descricao", e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="tipo" className="text-sm font-medium">
                      Tipo *
                    </Label>
                    <select
                      id="tipo"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-jelly-bean-500 focus:ring-jelly-bean-500"
                      value={formData.tipo}
                      onChange={(e) =>
                        onFormChange(
                          "tipo",
                          e.target.value as NewActivityForm["tipo"],
                        )
                      }
                      required
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

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="prioridade" className="text-sm font-medium">
                      Prioridade *
                    </Label>
                    <select
                      id="prioridade"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-jelly-bean-500 focus:ring-jelly-bean-500"
                      value={formData.prioridade}
                      onChange={(e) =>
                        onFormChange(
                          "prioridade",
                          e.target.value as NewActivityForm["prioridade"],
                        )
                      }
                      required
                    >
                      <option value="Normal">Normal</option>
                      <option value="Alta">Alta</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="responsavel" className="text-sm font-medium">
                      Responsável *
                    </Label>
                    <select
                      id="responsavel"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-jelly-bean-500 focus:ring-jelly-bean-500"
                      value={formData.responsavel}
                      onChange={(e) => {
                        const selectedUser = usuarios.find(
                          (u) => u.id === e.target.value,
                        );
                        onFormChange("responsavel", e.target.value);
                        onFormChange(
                          "responsavel_name",
                          selectedUser?.nome_completo || "",
                        );
                      }}
                      required
                    >
                      <option value="">Selecione um responsável</option>
                      {usuarios?.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nome_completo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="prazo" className="text-sm font-medium">
                      Prazo *
                    </Label>
                    <Input
                      type="date"
                      id="prazo"
                      value={formData.prazo}
                      onChange={(e) => onFormChange("prazo", e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-jelly-bean-600 hover:bg-jelly-bean-700"
                    >
                      {mode === "create" ? "Criar" : "Salvar"} Atividade
                    </Button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
