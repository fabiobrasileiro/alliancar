import { FormState } from "./types";

interface AddressStepProps {
    form: FormState;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function AddressStep({ form, onChange, onBack, onNext }: AddressStepProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Endereço</h3>

            <input
                name="address"
                placeholder="Endereço"
                value={form.address}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />

            <div className="grid grid-cols-2 gap-3">
                <input
                    name="addressNumber"
                    placeholder="Número"
                    value={form.addressNumber}
                    onChange={onChange}
                    className="p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />

                <input
                    name="province"
                    placeholder="Bairro"
                    value={form.province}
                    onChange={onChange}
                    className="p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
            </div>

            <input
                name="postalCode"
                placeholder="CEP"
                value={form.postalCode}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />

            <input
                name="complement"
                placeholder="Complemento"
                value={form.complement}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-600"
                >
                    Voltar
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
                >
                    Próximo
                </button>
            </div>
        </div>
    );
}