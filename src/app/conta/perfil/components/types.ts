export interface FormData {
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
  foto_perfil_url?: string;
}

export interface Endereco {
  id: string;
  afiliado_id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  principal: boolean;
  criado_em: string;
}

export interface Banco {
  id: string;
  afiliado_id: string;
  banco: string;
  agencia: string;
  digito_agencia: string;
  conta: string;
  digito_conta: string;
  pix: string;
  principal: boolean;
  criado_em: string;
  titular: string;
}
export interface Bucket {
  publicUrl: string;
}
// types.ts
export interface Banco {
  id: string;
  afiliado_id: string;
  banco: string;
  agencia: string;
  digito_agencia: string;
  conta: string;
  digito_conta: string;
  pix: string;
  principal: boolean;
  criado_em: string;
}

export interface NovoBanco {
  banco: string;
  agencia: string;
  digito_agencia: string;
  conta: string;
  digito_conta: string;
  chave_pix: string;
  principal: boolean;
  titular: string;
}