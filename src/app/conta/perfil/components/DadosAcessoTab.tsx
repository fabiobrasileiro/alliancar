import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DadosAcessoTabProps {
  formData: {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
  };
  saving: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSavePassword: () => void;
}

export const DadosAcessoTab: React.FC<DadosAcessoTabProps> = ({
  formData,
  saving,
  onInputChange,
  onSavePassword,
}) => {
  return (
    <>
      <div className="mb-6 mt-5">
        <p className="text-gray-600">
          Tenha em mente que ao alterar a sua senha, nós lhe pediremos que
          defina uma senha segura que contenha letras maiúsculas, minúsculas e
          números.
        </p>
      </div>

      <div className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Senha Atual</Label>
          <Input
            id="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Nova Senha</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirmation">Confirmar Nova Senha</Label>
          <Input
            id="passwordConfirmation"
            type="password"
            value={formData.passwordConfirmation}
            onChange={onInputChange}
          />
        </div>

        <Button onClick={onSavePassword} disabled={saving}>
          {saving ? "Atualizando..." : "Atualizar Senha"}
        </Button>
      </div>
    </>
  );
};
