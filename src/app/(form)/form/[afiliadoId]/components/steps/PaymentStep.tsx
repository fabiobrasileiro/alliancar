import { FormState, InsurancePlan } from "./types";

interface PaymentStepProps {
    form: FormState;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBack: () => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    plano: InsurancePlan | null;
}

export default function PaymentStep({ form, onChange, onBack, onSubmit, loading, plano }: PaymentStepProps) {
    const handlePaymentMethodChange = (method: string) => {
        const event = {
            target: {
                name: "paymentMethod",
                value: method
            }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
    };

    const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onChange(e); // Envia o evento original para o onChange do MultiStepForm
    };

    const isFormValid = form.paymentMethod;

    const baseInput = "w-full p-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:border-blue-500 placeholder-gray-400";

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Pagamento</h3>

            {/* Resumo do valor */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-4">Resumo do Pagamento</h4>
                
                <div className="space-y-3">
                    <div className="flex justify-between text-white">
                        <span>Adesão:</span>
                        <span className="font-semibold">R$ {plano?.adesao?.toFixed(2) || '0,00'}</span>
                    </div>
                    
                    <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between text-white text-lg font-bold">
                            <span>Total a pagar:</span>
                            <span>R$ {plano?.adesao?.toFixed(2) || '0,00'}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-800 text-sm text-center">
                        💡 Este é o valor da sua adesão. O valor da mensalidade será cobrado 30 dias após o pagamento.
                    </p>
                </div>
            </div>

            {/* Métodos de pagamento */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-4">Forma de Pagamento</h4>
                
                <div className="space-y-4">
                    {/* PIX */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        form.paymentMethod === "PIX" 
                            ? "border-green-500 bg-green-900 bg-opacity-20" 
                            : "border-gray-600 hover:border-green-400 hover:bg-gray-700"
                    }`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="PIX"
                            checked={form.paymentMethod === "PIX"}
                            onChange={() => handlePaymentMethodChange("PIX")}
                            className="mr-3 w-5 h-5 text-green-500"
                        />
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <span className="text-white font-medium text-lg">PIX</span>
                                <p className="text-green-400 text-sm mt-1">● Pagamento instantâneo</p>
                            </div>
                            <div className="text-green-400 font-semibold">
                                QR Code
                            </div>
                        </div>
                    </label>

                    {/* Boleto Bancário */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        form.paymentMethod === "BOLETO" 
                            ? "border-orange-500 bg-orange-900 bg-opacity-20" 
                            : "border-gray-600 hover:border-orange-400 hover:bg-gray-700"
                    }`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="BOLETO"
                            checked={form.paymentMethod === "BOLETO"}
                            onChange={() => handlePaymentMethodChange("BOLETO")}
                            className="mr-3 w-5 h-5 text-orange-500"
                        />
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <span className="text-white font-medium text-lg">Boleto Bancário</span>
                                <p className="text-orange-400 text-sm mt-1">● Pagamento em até 3 dias úteis</p>
                            </div>
                            <div className="text-orange-400 font-semibold">
                                PDF
                            </div>
                        </div>
                    </label>

                    {/* Cartão de Crédito */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        form.paymentMethod === "CREDIT_CARD" 
                            ? "border-blue-500 bg-blue-900 bg-opacity-20" 
                            : "border-gray-600 hover:border-blue-400 hover:bg-gray-700"
                    }`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="CREDIT_CARD"
                            checked={form.paymentMethod === "CREDIT_CARD"}
                            onChange={() => handlePaymentMethodChange("CREDIT_CARD")}
                            className="mr-3 w-5 h-5 text-blue-500"
                        />
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <span className="text-white font-medium text-lg">Cartão de Crédito</span>
                                <p className="text-blue-400 text-sm mt-1">● Parcelamento em até 12x</p>
                            </div>
                            <div className="text-blue-400 font-semibold">
                                💳
                            </div>
                        </div>
                    </label>
                </div>

                {/* Formulário do Cartão de Crédito (aparece apenas quando selecionado) */}
                {form.paymentMethod === "CREDIT_CARD" && (
                    <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-500">
                        <h5 className="text-white font-semibold mb-4">Dados do Cartão</h5>
                        
                        <div className="space-y-4">
                            {/* Nome do Titular */}
                            <div>
                                <label className="text-white text-sm mb-2 block">Nome do Titular</label>
                                <input
                                    type="text"
                                    name="creditCard.holderName"
                                    placeholder="Como está no cartão"
                                    value={form.creditCard.holderName}
                                    onChange={handleCreditCardChange}
                                    className={baseInput}
                                    required
                                />
                            </div>

                            {/* Número do Cartão */}
                            <div>
                                <label className="text-white text-sm mb-2 block">Número do Cartão</label>
                                <input
                                    type="text"
                                    name="creditCard.number"
                                    placeholder="0000 0000 0000 0000"
                                    value={form.creditCard.number}
                                    onChange={handleCreditCardChange}
                                    maxLength={19}
                                    className={baseInput}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {/* Mês de Validade */}
                                <div>
                                    <label className="text-white text-sm mb-2 block">Mês</label>
                                    <input
                                        type="text"
                                        name="creditCard.expiryMonth"
                                        placeholder="MM"
                                        value={form.creditCard.expiryMonth}
                                        onChange={handleCreditCardChange}
                                        maxLength={2}
                                        className={baseInput}
                                        required
                                    />
                                </div>

                                {/* Ano de Validade */}
                                <div>
                                    <label className="text-white text-sm mb-2 block">Ano</label>
                                    <input
                                        type="text"
                                        name="creditCard.expiryYear"
                                        placeholder="AA"
                                        value={form.creditCard.expiryYear}
                                        onChange={handleCreditCardChange}
                                        maxLength={2}
                                        className={baseInput}
                                        required
                                    />
                                </div>

                                {/* CVV */}
                                <div>
                                    <label className="text-white text-sm mb-2 block">CVV</label>
                                    <input
                                        type="text"
                                        name="creditCard.ccv"
                                        placeholder="000"
                                        value={form.creditCard.ccv}
                                        onChange={handleCreditCardChange}
                                        maxLength={3}
                                        className={baseInput}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Botões de Navegação */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-600 transition-colors"
                >
                    Voltar
                </button>

                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={loading || !isFormValid}
                    className="flex-1 bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                    {loading ? "Processando..." : `Finalizar com ${getPaymentMethodName(form.paymentMethod)}`}
                </button>
            </div>
        </div>
    );
}

// Função auxiliar para mostrar o nome do método de pagamento no botão
function getPaymentMethodName(method: string): string {
    switch (method) {
        case 'PIX':
            return 'PIX';
        case 'BOLETO':
            return 'Boleto';
        case 'CREDIT_CARD':
            return 'Cartão';
        default:
            return 'Pagamento';
    }
}