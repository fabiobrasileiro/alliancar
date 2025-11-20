import { FormState } from "./types";

interface PaymentStepProps {
    form: FormState;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBack: () => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
}

export default function PaymentStep({ form, onChange, onBack, onSubmit, loading }: PaymentStepProps) {
    const isFormValid = form.creditCard.holderName && 
                       form.creditCard.number && 
                       form.creditCard.expiryMonth && 
                       form.creditCard.expiryYear && 
                       form.creditCard.ccv;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pagamento</h3>

            <input
                name="holderName"
                placeholder="Nome no cartão"
                value={form.creditCard.holderName}
                onChange={onChange}
                className="w-full p-3 border placeholder-white rounded focus:outline-none focus:border-blue-500"
                required
            />

            <input
                name="number"
                placeholder="Número do cartão"
                value={form.creditCard.number}
                onChange={onChange}
                className="w-full p-3 border placeholder-white rounded focus:outline-none focus:border-blue-500"
                required
            />

            <div className="grid grid-cols-3 gap-3">
                <input
                    name="expiryMonth"
                    placeholder="Mês (MM)"
                    value={form.creditCard.expiryMonth}
                    onChange={onChange}
                    className="p-3 border placeholder-white rounded focus:outline-none focus:border-blue-500"
                    required
                />

                <input
                    name="expiryYear"
                    placeholder="Ano (AAAA)"
                    value={form.creditCard.expiryYear}
                    onChange={onChange}
                    className="p-3 border placeholder-white rounded focus:outline-none focus:border-blue-500"
                    required
                />

                <input
                    name="ccv"
                    placeholder="CVV"
                    value={form.creditCard.ccv}
                    onChange={onChange}
                    className="p-3 border placeholder-white rounded focus:outline-none focus:border-blue-500"
                    required
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-600"
                >
                    Voltar
                </button>

                <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="flex-1 bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                    {loading ? "Processando..." : "Finalizar Pagamento"}
                </button>
            </div>
        </div>
    );
}