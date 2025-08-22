"use client"
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('dados_pessoais');
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    registration: '',
    birthdate: '',
    phone: '',
    mobile: '',
    email: '',
    zipcode: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressState: '',
    addressCity: '',
    currentPassword: '',
    password: '',
    passwordConfirmation: ''
  });

interface FormData {
    name: string;
    fullName: string;
    registration: string;
    birthdate: string;
    phone: string;
    mobile: string;
    email: string;
    zipcode: string;
    address: string;
    addressNumber: string;
    addressComplement: string;
    addressNeighborhood: string;
    addressState: string;
    addressCity: string;
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
}

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev: FormData) => ({
        ...prev,
        [id]: value
    }));
};

  const handleSavePersonalData = () => {
    // Lógica para salvar dados pessoais
    console.log('Dados salvos:', formData);
  };

  const handleSavePassword = () => {
    // Lógica para salvar nova senha
    console.log('Senha alterada');
  };

  return (
    <div className="container mx-auto p-4">
      <h3 className="text-2xl font-bold mb-5">Perfil</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-5">
          <TabsTrigger value="dados_pessoais">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="foto_perfil">Foto de Perfil</TabsTrigger>
          <TabsTrigger value="dados_acesso">Dados de Acesso</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dados_pessoais">
          <div className="mb-4">
            <p className="text-gray-600">Aqui você pode configurar suas informações pessoais.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="dataName">Apelido <span className="text-red-500">*</span></Label>
              <Input
                id="dataName"
                type="text"
                maxLength={256}
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataFullName">Nome Completo <span className="text-red-500">*</span></Label>
              <Input
                id="dataFullName"
                type="text"
                maxLength={256}
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataRegistration">CPF/CNPJ</Label>
              <Input
                id="dataRegistration"
                type="text"
                maxLength={18}
                value={formData.registration}
                onChange={handleInputChange}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataBirthdate">Data de Nascimento <span className="text-red-500">*</span></Label>
              <Input
                id="dataBirthdate"
                type="text"
                maxLength={10}
                value={formData.birthdate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataPhone">Telefone Comercial com DDD</Label>
              <Input
                id="dataPhone"
                type="text"
                maxLength={32}
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataMobile">WhatsApp com DDD<span className="text-red-500">*</span></Label>
              <Input
                id="dataMobile"
                type="text"
                maxLength={32}
                value={formData.mobile}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataEmail">E-mail <span className="text-red-500">*</span></Label>
              <Input
                id="dataEmail"
                type="email"
                maxLength={128}
                value={formData.email}
                onChange={handleInputChange}
                disabled
              />
            </div>
          </div>
          
          <hr className="my-6 border-gray-300" />
          
          <div className="mb-4">
            <h4 className="text-lg font-semibold">Endereço</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="dataZipcode">CEP <span className="text-red-500">*</span></Label>
              <Input
                id="dataZipcode"
                type="text"
                maxLength={10}
                value={formData.zipcode}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataAddress">Endereço <span className="text-red-500">*</span></Label>
              <Input
                id="dataAddress"
                type="text"
                maxLength={512}
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataAddressNumber">Número <span className="text-red-500">*</span></Label>
              <Input
                id="dataAddressNumber"
                type="text"
                maxLength={32}
                value={formData.addressNumber}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataAddressComplement">Complemento</Label>
              <Input
                id="dataAddressComplement"
                type="text"
                maxLength={64}
                value={formData.addressComplement}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataAddressNeighborhood">Bairro <span className="text-red-500">*</span></Label>
              <Input
                id="dataAddressNeighborhood"
                type="text"
                maxLength={64}
                value={formData.addressNeighborhood}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataAddressState">Estado <span className="text-red-500">*</span></Label>
              <Select value={formData.addressState} onValueChange={(value) => setFormData({...formData, addressState: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">Acre</SelectItem>
                  <SelectItem value="AL">Alagoas</SelectItem>
                  <SelectItem value="AP">Amapá</SelectItem>
                  <SelectItem value="AM">Amazonas</SelectItem>
                  <SelectItem value="BA">Bahia</SelectItem>
                  {/* Outros estados aqui */}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataAddressCity">Cidade <span className="text-red-500">*</span></Label>
              <Select value={formData.addressCity} onValueChange={(value) => setFormData({...formData, addressCity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="616">Salvador</SelectItem>
                  <SelectItem value="281">Abaíra</SelectItem>
                  {/* Outras cidades aqui */}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleSavePersonalData} className="mt-4">
            Salvar
          </Button>
        </TabsContent>
        
        <TabsContent value="foto_perfil">
          <div className="mt-5">
            <Label>Faça upload da sua foto de perfil</Label>
            <div className="mt-4">
              <Input
                id="profilePictureInput"
                type="file"
                className="hidden"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <div className="relative w-32 h-32 border rounded-md overflow-hidden">
              <Image width={150} height={150}
                id="profilePictureImg"
                src="/"
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white cursor-pointer">Alterar</span>
              </div>
            </div>
            
            <Button className="mt-4">
              Deletar
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="dados_acesso">
          <div className="mb-6 mt-5">
            <p className="text-gray-600">
              Tenha em mente que ao alterar a sua senha, nós lhe pediremos que defina uma senha de segurança que contenha letras maiúsculas e minúsculas e números. Isso é para a sua própria segurança.
            </p>
          </div>
          
          <div className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirmar Nova Senha</Label>
              <Input
                id="passwordConfirmation"
                type="password"
                value={formData.passwordConfirmation}
                onChange={handleInputChange}
              />
            </div>
            
            <Button onClick={handleSavePassword}>
              Atualizar
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;