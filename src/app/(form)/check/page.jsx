'use client';
import { useState } from 'react';

export default function CreditCardCheckout() {
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  
  const [formData, setFormData] = useState({
    // Dados do cliente (você precisa criar o cliente primeiro no Asaas)
    customerId: 'cus_000007068844', // ← Use o customer ID do seu exemplo
    
    // Dados do pagamento
    value: '100.00', // Valor para teste
    description: 'Teste de pagamento',
    
    // Dados do cartão
    creditCardNumber: '5162306219378829', // Cartão de teste
    creditCardName: 'John Doe',
    creditCardExpiry: '09/26',
    creditCardCcv: '123',
    
    // Dados do titular do cartão
    creditCardHolderName: 'John Doe',
    creditCardHolderEmail: 'john.doe@example.com',
    creditCardHolderCpfCnpj: '86229406594',
    creditCardHolderPostalCode: '41350190',
    creditCardHolderAddressNumber: '123',
    creditCardHolderAddressComplement: '',
    creditCardHolderPhone: '7134321432'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCreditCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPaymentResult(null);
    
    try {
      const paymentPayload = {
        customer: formData.customerId, // ID do cliente no Asaas
        value: parseFloat(formData.value),
        description: formData.description,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        creditCard: {
          holderName: formData.creditCardName,
          number: formData.creditCardNumber.replace(/\D/g, ''),
          expiryMonth: formData.creditCardExpiry.split('/')[0],
          expiryYear: formData.creditCardExpiry.split('/')[1],
          ccv: formData.creditCardCcv
        },
        creditCardHolderInfo: {
          name: formData.creditCardHolderName,
          email: formData.creditCardHolderEmail,
          cpfCnpj: formData.creditCardHolderCpfCnpj.replace(/\D/g, ''),
          postalCode: formData.creditCardHolderPostalCode.replace(/\D/g, ''),
          addressNumber: formData.creditCardHolderAddressNumber,
          addressComplement: formData.creditCardHolderAddressComplement,
          phone: formData.creditCardHolderPhone.replace(/\D/g, '')
        },
        remoteIp: '127.0.0.1'
      };

      console.log('🚀 Enviando pagamento...', paymentPayload);

      const response = await fetch('/api/payments/credit-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error);
      }

      setPaymentResult(result);
      
      if (result.payment.status === 'CONFIRMED') {
        console.log('🎉 Pagamento aprovado!', result.payment);
      }
      
    } catch (error) {
      console.error('❌ Erro no pagamento:', error);
      setPaymentResult({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Pagamento com Cartão</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dados do Pagamento */}
        <div className="space-y-2">
          <h3 className="font-semibold">Dados do Pagamento</h3>
          <input
            type="number"
            name="value"
            placeholder="Valor"
            step="0.01"
            value={formData.value}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="description"
            placeholder="Descrição"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Dados do Cartão */}
        <div className="space-y-2">
          <h3 className="font-semibold">Dados do Cartão</h3>
          <input
            type="text"
            name="creditCardNumber"
            placeholder="Número do cartão"
            value={formData.creditCardNumber}
            onChange={(e) => {
              e.target.value = formatCreditCardNumber(e.target.value);
              handleInputChange(e);
            }}
            maxLength={19}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="creditCardName"
            placeholder="Nome no cartão"
            value={formData.creditCardName}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              name="creditCardExpiry"
              placeholder="MM/AA"
              value={formData.creditCardExpiry}
              onChange={(e) => {
                e.target.value = formatExpiry(e.target.value);
                handleInputChange(e);
              }}
              maxLength={5}
              required
              className="w-1/2 p-2 border rounded"
            />
            <input
              type="text"
              name="creditCardCcv"
              placeholder="CVV"
              maxLength={4}
              value={formData.creditCardCcv}
              onChange={handleInputChange}
              required
              className="w-1/2 p-2 border rounded"
            />
          </div>
        </div>

        {/* Dados do Titular */}
        <div className="space-y-2">
          <h3 className="font-semibold">Dados do Titular</h3>
          <input
            type="text"
            name="creditCardHolderName"
            placeholder="Nome completo"
            value={formData.creditCardHolderName}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="creditCardHolderEmail"
            placeholder="E-mail"
            value={formData.creditCardHolderEmail}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="creditCardHolderCpfCnpj"
            placeholder="CPF/CNPJ"
            value={formData.creditCardHolderCpfCnpj}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              name="creditCardHolderPostalCode"
              placeholder="CEP"
              value={formData.creditCardHolderPostalCode}
              onChange={handleInputChange}
              required
              className="w-1/2 p-2 border rounded"
            />
            <input
              type="text"
              name="creditCardHolderAddressNumber"
              placeholder="Número"
              value={formData.creditCardHolderAddressNumber}
              onChange={handleInputChange}
              required
              className="w-1/2 p-2 border rounded"
            />
          </div>
          <input
            type="text"
            name="creditCardHolderPhone"
            placeholder="Telefone"
            value={formData.creditCardHolderPhone}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Processando...' : 'Pagar'}
        </button>
      </form>

      {paymentResult && (
        <div className={`mt-4 p-4 rounded ${
          paymentResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {paymentResult.success ? (
            <div>
              <p>✅ Pagamento processado com sucesso!</p>
              <p>ID: {paymentResult.payment.id}</p>
              <p>Status: {paymentResult.payment.status}</p>
              <p>Token: {paymentResult.token}</p>
            </div>
          ) : (
            <p>❌ Erro: {paymentResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
}