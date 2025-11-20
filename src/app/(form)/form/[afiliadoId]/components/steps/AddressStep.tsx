import { FormState } from "./types";

interface AddressStepProps {
    form: FormState;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function AddressStep({ form, onChange, onBack, onNext }: AddressStepProps) {
    const isFormValid = form.street && form.addressNumber && form.province && form.postalCode;

    const baseInput = "w-full p-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:border-blue-500 placeholder-gray-400";

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Endereço</h3>

            <input
                name="street"
                placeholder="Rua"
                value={form.street}
                onChange={onChange}
                className={baseInput}
                required
            />

            <div className="grid grid-cols-2 gap-3">
                <input
                    name="addressNumber"
                    placeholder="Número"
                    value={form.addressNumber}
                    onChange={onChange}
                    className={baseInput}
                    required
                />

                <input
                    name="complement"
                    placeholder="Complemento"
                    value={form.complement}
                    onChange={onChange}
                    className={baseInput}
                />
            </div>

            <input
                name="province"
                placeholder="Bairro"
                value={form.province}
                onChange={onChange}
                className={baseInput}
                required
            />

            <input
                name="postalCode"
                placeholder="CEP"
                value={form.postalCode}
                onChange={onChange}
                className={baseInput}
                required
            />

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
                    onClick={onNext}
                    disabled={!isFormValid}
                    className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    Próximo
                </button>
            </div>
        </div>
    );
}