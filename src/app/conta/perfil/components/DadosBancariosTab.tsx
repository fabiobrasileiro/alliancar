import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banco, NovoBanco } from "./types";
import { ModalContaBancaria } from "./ModalContaBancaria";

interface DadosBancariosTabProps {
  bancos: Banco[];
  onAddBanco: (banco: NovoBanco) => Promise<void>;
  onEditBanco: (id: string, banco: NovoBanco) => Promise<void>;
  onDeleteBanco: (id: string) => Promise<void>;
  onSetPrincipal: (id: string) => Promise<void>;
}

export const DadosBancariosTab: React.FC<DadosBancariosTabProps> = ({
  bancos,
  onAddBanco,
  onEditBanco,
  onDeleteBanco,
  onSetPrincipal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanco, setEditingBanco] = useState<Banco | null>(null);

  const handleSaveBanco = async (bancoData: NovoBanco) => {
    if (editingBanco) {
      await onEditBanco(editingBanco.id, bancoData);
    } else {
      await onAddBanco(bancoData);
    }
    setIsModalOpen(false);
    setEditingBanco(null);
  };

  const handleEdit = (banco: Banco) => {
    setEditingBanco(banco);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta bancária?")) {
      await onDeleteBanco(id);
    }
  };

  return (
    <>
      <div className="mb-6 mt-5">
        <p className="text-gray-600">
          Gerencie suas contas bancárias para recebimento de comissões.
        </p>
      </div>

      {bancos.length > 0 ? (
        <div className="space-y-4">
          {bancos.map((banco) => (
            <div key={banco.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{banco.banco}</h4>
                  <p>Agência: {banco.agencia}-{banco.digito_agencia}</p>
                  <p>Conta: {banco.conta}-{banco.digito_conta}</p>
                  {banco.pix && <p>PIX: {banco.pix}</p>}
                  {banco.principal && (
                    <Badge variant="default" className="mt-2">Principal</Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  {!banco.principal && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetPrincipal(banco.id)}
                    >
                      Tornar Principal
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(banco)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDelete(banco.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhuma conta bancária cadastrada</p>
      )}

      <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
        Adicionar Conta Bancária
      </Button>

      <ModalContaBancaria
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBanco(null);
        }}
        onSave={handleSaveBanco}
        editingBanco={editingBanco}
      />
    </>
  );
};