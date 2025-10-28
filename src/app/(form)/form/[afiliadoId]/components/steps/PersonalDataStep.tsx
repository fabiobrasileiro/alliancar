import { FormState } from "./types";

interface PersonalDataStepProps {
    form: FormState;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNext: () => void;
}

export default function PersonalDataStep({ form, onChange, onNext }: PersonalDataStepProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Pessoais</h3>

            <input
                name="name"
                placeholder="Nome completo"
                value={form.name}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
            />

            <input
                name="email"
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
            />

            <input
                name="cpfCnpj"
                placeholder="CPF ou CNPJ"
                value={form.cpfCnpj}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
            />

            <input
                name="phone"
                placeholder="Telefone"
                value={form.phone}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />

            <input
                name="mobilePhone"
                placeholder="Celular"
                value={form.mobilePhone}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />

            <button
                type="button"
                onClick={onNext}
                className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
            >
                Próximo
            </button>
        </div>
    );
}