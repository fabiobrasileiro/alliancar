import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface FotoPerfilTabProps {
  fotoPerfilUrl: string;
  onUploadFoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFoto: () => void;
}

export const FotoPerfilTab: React.FC<FotoPerfilTabProps> = ({
  fotoPerfilUrl,
  onUploadFoto,
  onDeleteFoto,
}) => {
  return (
    <>
      <div className="mt-5">
        <Label>Faça upload da sua foto de perfil</Label>
        <div className="mt-4">
          <Input
            id="fotoPerfilInput"
            type="file"
            accept="image/*"
            onChange={onUploadFoto}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="relative w-32 h-32 border rounded-md overflow-hidden">
          <Image
            width={128}
            height={128}
            src={fotoPerfilUrl || "/placeholder-avatar.png"}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
          {fotoPerfilUrl && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span
                className="text-white cursor-pointer text-sm"
                onClick={() =>
                  document.getElementById("fotoPerfilInput")?.click()
                }
              >
                Alterar
              </span>
            </div>
          )}
        </div>

        {fotoPerfilUrl && (
          <Button className="mt-4" variant="default" onClick={onDeleteFoto}>
            Remover Foto
          </Button>
        )}
      </div>
    </>
  );
};
