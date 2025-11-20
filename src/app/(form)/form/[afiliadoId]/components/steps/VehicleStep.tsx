import { useState, useEffect } from "react";
import { FormState } from "./types";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface VehicleStepProps {
    form: FormState;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onBack: () => void;
    onNext: () => void;
    onPlanoEncontrado: (plano: any) => void;
}

export default function VehicleStep({ form, onChange, onBack, onNext, onPlanoEncontrado }: VehicleStepProps) {
    const [loadingPlano, setLoadingPlano] = useState(false);
    const [planoEncontrado, setPlanoEncontrado] = useState<any>(null);

    useEffect(() => {
        if (form.vehicleInfo.model && form.vehicleInfo.model.length > 2) {
            const timer = setTimeout(() => {
                buscarPlanoPorModelo(form.vehicleInfo.model);
            }, 500 );
            
            return () => clearTimeout(timer);
        }
    }, [form.vehicleInfo.model]);

    const buscarPlanoPorModelo = async (modelo: string) => {
        setLoadingPlano(true);
        try {
            const { data: planos, error } = await supabase
                .from('insurance_plans')
                .select('*');

            if (error) throw error;

            const plano = planos?.find(plano => 
                plano.vehicles.some((veiculo: string) => 
                    veiculo.toLowerCase().includes(modelo.toLowerCase()) ||
                    modelo.toLowerCase().includes(veiculo.toLowerCase())
                )
            );

            if (plano) {
                setPlanoEncontrado(plano);
                onPlanoEncontrado(plano);
            } else {
                setPlanoEncontrado(null);
                onPlanoEncontrado(null);
            }
        } catch (error) {
            console.error('Erro ao buscar plano:', error);
            setPlanoEncontrado(null);
            onPlanoEncontrado(null);
        } finally {
            setLoadingPlano(false);
        }
    };

    const isFormValid = form.vehicleInfo.plate && 
                       form.vehicleInfo.brand && 
                       form.vehicleInfo.year && 
                       form.vehicleInfo.model && 
                       form.vehicleInfo.state && 
                       form.vehicleInfo.city &&
                       planoEncontrado;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações do Veículo</h3>

            <input
                name="plate"
                placeholder="Placa (XXX0000)"
                value={form.vehicleInfo.plate}
                onChange={onChange}
                maxLength={7}
                className="w-full p-3 border rounded focus:outline-none focus:border-blue-500 placeholder-white text-white"
                required
            />

            <select
                name="vehicleType"
                value={form.vehicleInfo.vehicleType}
                onChange={onChange}
                className="w-full p-3 border rounded focus:outline-none focus:border-blue-500 placeholder-white text-white bg-bg"
                required
            >
                <option value="" className="text-white">Selecione o tipo</option>
                <option value="carro">Carro</option>
                <option value="utilitario">Utilitário</option>
            </select>

            <input
                name="brand"
                placeholder="Marca (ex: Volkswagen, Fiat)"
                value={form.vehicleInfo.brand}
                onChange={onChange}
                className="w-full p-3 border rounded focus:outline-none focus:border-blue-500 placeholder-white"
                required
            />

            <input
                name="year"
                placeholder="Ano (ex: 2020)"
                value={form.vehicleInfo.year}
                onChange={onChange}
                className="w-full p-3 border rounded focus:outline-none focus:border-blue-500 placeholder-white"
                required
            />

            <div className="relative">
                <input
                    name="model"
                    placeholder="Modelo (ex: GOL, COROLLA, CIVIC)"
                    value={form.vehicleInfo.model}
                    onChange={onChange}
                    className="w-full p-3 border rounded focus:outline-none focus:border-blue-500 placeholder-white"
                    required
                />
                {loadingPlano && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>

            {planoEncontrado && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Plano Encontrado!</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Categoria:</strong> {planoEncontrado.category_name}</div>
                        <div><strong>Faixa:</strong> {planoEncontrado.vehicle_range}</div>
                        <div><strong>Adesão:</strong> R$ {planoEncontrado.adesao}</div>
                        <div><strong>Mensalidade:</strong> R$ {planoEncontrado.monthly_payment}</div>
                    </div>
                </div>
            )}

            {form.vehicleInfo.model && !planoEncontrado && !loadingPlano && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    Modelo não encontrado na tabela de planos. Verifique a grafia.
                </div>
            )}

            <select
                name="state"
                value={form.vehicleInfo.state}
                onChange={onChange}
                className="w-full p-3 border rounded focus:outline-none focus:border-blue-500 placeholder-white text-white bg-bg"
                required
            >
                <option value="">Selecione o estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AM">Amazonas</option>
                <option value="AP">Amapá</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
            </select>

            <input
                name="city"
                placeholder="Cidade"
                value={form.vehicleInfo.city}
                onChange={onChange}
                className="w-full p-3 border rounded focus:outline-none focus:border-blue-500 placeholder-white"
                required
            />

            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="isTaxiApp"
                    checked={form.vehicleInfo.isTaxiApp}
                    onChange={onChange}
                    className="mr-2"
                    id="taxiApp"
                />
                <label htmlFor="taxiApp" className="text-sm text-white">
                    Taxi/App (Uber, 99, etc)
                </label>
            </div>

            <textarea
                name="observations"
                placeholder="Observações"
                value={form.vehicleInfo.observations}
                onChange={onChange}
                rows={3}
                className=" text-white w-full p-3 border rounded focus:outline-none focus:border-blue-500 placeholder-white"
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
                    disabled={!isFormValid}
                    className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    Próximo
                </button>
            </div>
        </div>
    );
}