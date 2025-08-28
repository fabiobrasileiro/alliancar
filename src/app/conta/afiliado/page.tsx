"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PerfilPage() {
   
  return (
    <div className="flex">


      {/* Conteúdo */}
      <div className="flex-1 p-6">
        <h3 className="text-xl font-semibold mb-6">Perfil</h3>

        <Tabs defaultValue="dados_pessoais" className="w-full">
          <TabsList>
            <TabsTrigger value="dados_pessoais">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="foto_perfil">Foto de Perfil</TabsTrigger>
            <TabsTrigger value="dados_acesso">Dados de Acesso</TabsTrigger>
          </TabsList>

          {/* Aba Dados Pessoais */}
          <TabsContent value="dados_pessoais">
            <p className="mb-4 text-gray-600">
              Aqui você pode configurar suas informações pessoais.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Apelido *</Label>
                <Input type="text" maxLength={256} />
              </div>
              <div>
                <Label>Nome Completo *</Label>
                <Input type="text" maxLength={256} />
              </div>
              <div>
                <Label>CPF/CNPJ</Label>
                <Input type="text" maxLength={18} disabled />
              </div>
              <div>
                <Label>Data de Nascimento *</Label>
                <Input type="text" maxLength={10} />
              </div>
              <div>
                <Label>Telefone Comercial</Label>
                <Input type="text" maxLength={32} />
              </div>
              <div>
                <Label>WhatsApp *</Label>
                <Input type="text" maxLength={32} />
              </div>
              <div>
                <Label>E-mail *</Label>
                <Input type="email" disabled />
              </div>
            </div>

            <hr className="my-6" />

            <h4 className="text-lg font-bold mb-4">Endereço</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>CEP *</Label>
                <Input type="text" maxLength={10} />
              </div>
              <div>
                <Label>Endereço *</Label>
                <Input type="text" maxLength={512} />
              </div>
              <div>
                <Label>Número *</Label>
                <Input type="text" maxLength={32} />
              </div>
              <div>
                <Label>Complemento</Label>
                <Input type="text" maxLength={64} />
              </div>
              <div>
                <Label>Bairro *</Label>
                <Input type="text" maxLength={64} />
              </div>
              <div>
                <Label>Estado *</Label>
                <select className="form-select w-full rounded-md border px-3 py-2">
                  <option>Selecione o estado</option>
                  <option>Bahia</option>
                  <option>São Paulo</option>
                  <option>Rio de Janeiro</option>
                </select>
              </div>
              <div>
                <Label>Cidade *</Label>
                <select className="form-select w-full rounded-md border px-3 py-2">
                  <option>Selecione a cidade</option>
                  <option>Salvador</option>
                  <option>Feira de Santana</option>
                  <option>Vitória da Conquista</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* Aba Foto de Perfil */}
          <TabsContent value="foto_perfil">
            <p className="text-gray-600">Upload da sua foto de perfil em breve.</p>
          </TabsContent>

          {/* Aba Dados de Acesso */}
          <TabsContent value="dados_acesso">
            <p className="text-gray-600">Aqui você poderá alterar sua senha e dados de acesso.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
