import { FormState } from "./types";

interface VehicleStepProps {
    form: FormState;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function VehicleStep({ form, onChange, onBack, onNext }: VehicleStepProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações do Veículo</h3>

            <input
                name="plate"
                placeholder="Placa (XXX0000)"
                value={form.vehicleInfo.plate}
                onChange={onChange}
                maxLength={7}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
            />

            <select
                name="vehicleType"
                value={form.vehicleInfo.vehicleType}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
            >
                <option value="">Selecione o tipo</option>
                <option value="1">Carro ou utilitário pequeno</option>
                <option value="2">Moto</option>
                <option value="3">Caminhão ou micro-ônibus</option>
            </select>

            <select
                name="brand"
                value={form.vehicleInfo.brand}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
            >
                <option value="">Selecione a marca</option>
            </select>

            <select
                name="year"
                value={form.vehicleInfo.year}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
            >
                <option value="">Selecione o ano</option>
            </select>

            <select
                name="model"
                value={form.vehicleInfo.model}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
            >
                <option value="">Selecione o modelo</option>
            </select>

            <select
                name="state"
                value={form.vehicleInfo.state}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
            >
                <option value="">Selecione o estado</option>
                <option value="1">Acre</option>
                <option value="2">Alagoas</option>
                <option value="3">Amazonas</option>
                <option value="4">Amapá</option>
                <option value="5">Bahia</option>
            </select>

            <select
                name="city"
                value={form.vehicleInfo.city}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
            >
                <option value="">Selecione a cidade</option>
            </select>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="isTaxiApp"
                    checked={form.vehicleInfo.isTaxiApp}
                    onChange={onChange}
                    className="mr-2"
                    id="taxiApp"
                />
                <label htmlFor="taxiApp" className="text-sm">
                    Taxi/App (Uber, 99, etc)
                </label>
            </div>

            <textarea
                name="observations"
                placeholder="Observações"
                value={form.vehicleInfo.observations}
                onChange={onChange}
                rows={3}
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