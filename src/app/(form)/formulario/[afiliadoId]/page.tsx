"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

// Tipagens
interface CreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement: string;
  phone: string;
  mobilePhone: string;
}

interface FormState {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  mobilePhone: string;
  address: string;
  addressNumber: string;
  complement: string;
  province: string;
  postalCode: string;
  value: string;
  description: string;
  creditCard: CreditCard;
  creditCardHolderInfo: CreditCardHolderInfo;
}

export default function CheckoutPage() {
  const { afiliadoId } = useParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState<FormState>({
    name: "fabio",
    email: "",
    cpfCnpj: "",
    phone: "",
    mobilePhone: "",
    address: "",
    addressNumber: "",
    complement: "",
    province: "",
    postalCode: "",
    value: "150",
    description: "Assinatura Plano Pró",
    creditCard: {
      holderName: "",
      number: "",
      expiryMonth: "",
      expiryYear: "",
      ccv: "",
    },
    creditCardHolderInfo: {
      name: "",
      email: "",
      cpfCnpj: "",
      postalCode: "",
      addressNumber: "",
      addressComplement: "",
      phone: "",
      mobilePhone: "",
    },
  });

  // handleChange seguro
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
    path?: "creditCard" | "creditCardHolderInfo"
  ) {
    const { name, value } = e.target;

    if (path) {
      setForm((prev) => ({
        ...prev,
        [path]: {
          ...(prev[path] as Record<string, any>),
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  // submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, afiliadoId }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ success: false, message: "Erro ao processar checkout" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Checkout</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Dados pessoais */}
        <input
          name="name"
          placeholder="Nome completo"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="cpfCnpj"
          placeholder="CPF ou CNPJ"
          value={form.cpfCnpj}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="phone"
          placeholder="Telefone"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="mobilePhone"
          placeholder="Celular"
          value={form.mobilePhone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Endereço */}
        <input
          name="address"
          placeholder="Endereço"
          value={form.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            name="addressNumber"
            placeholder="Número"
            value={form.addressNumber}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="province"
            placeholder="Bairro"
            value={form.province}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>
        <input
          name="postalCode"
          placeholder="CEP"
          value={form.postalCode}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="complement"
          placeholder="Complemento"
          value={form.complement}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="value"
          placeholder="Valor"
          value={form.value}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        {/* Cartão de crédito */}
        <h3 className="text-lg font-semibold mt-4">Cartão de crédito</h3>
        <input
          name="holderName"
          placeholder="Nome no cartão"
          value={form.creditCard.holderName}
          onChange={(e) => handleChange(e, "creditCard")}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="number"
          placeholder="Número do cartão"
          value={form.creditCard.number}
          onChange={(e) => handleChange(e, "creditCard")}
          className="w-full border p-2 rounded"
          required
        />
        <div className="flex gap-2">
          <input
            name="expiryMonth"
            placeholder="Mês"
            value={form.creditCard.expiryMonth}
            onChange={(e) => handleChange(e, "creditCard")}
            className="w-1/2 p-2 border rounded"
            required
          />
          <input
            name="expiryYear"
            placeholder="Ano"
            value={form.creditCard.expiryYear}
            onChange={(e) => handleChange(e, "creditCard")}
            className="w-1/2 p-2 border rounded"
            required
          />
        </div>
        <input
          name="ccv"
          placeholder="CVV"
          value={form.creditCard.ccv}
          onChange={(e) => handleChange(e, "creditCard")}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded mt-4"
        >
          {loading ? "Processando..." : "Finalizar pagamento"}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
