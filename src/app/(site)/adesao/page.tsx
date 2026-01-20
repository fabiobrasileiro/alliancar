"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";


interface Plano {
    id: string;
    nome: string;
    valor: number;
    descricao: string;
}

export default function NegociacaoAdesao() {
    const [planoSelecionado, setPlanoSelecionado] = useState<string>("");
    const [valorPersonalizado, setValorPersonalizado] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState("");

    const supabase = createClient();
    const router = useRouter();

    const planos: Plano[] = [
        {
            id: "plano_basico",
            nome: "Plano Básico",
            valor: 199.99,
            descricao: "Ideal para iniciantes"
        },
        {
            id: "plano_intermediario",
            nome: "Plano Intermediário",
            valor: 249.99,
            descricao: "Para quem já tem experiência"
        },
        {
            id: "plano_avancado",
            nome: "Plano Avançado",
            valor: 299.99,
            descricao: "Para profissionais estabelecidos"
        },
        {
            id: "plano_premium",
            nome: "Plano Premium",
            valor: 349.99,
            descricao: "Solução completa"
        },
        {
            id: "plano_elite",
            nome: "Plano Elite",
            valor: 399.99,
            descricao: "Máximo desempenho"
        },
        {
            id: "plano_maximo",
            nome: "Plano Máximo",
            valor: 449.99,
            descricao: "Nível expert"
        }
    ];

    const handleSalvar = async () => {
        if (!planoSelecionado && !valorPersonalizado) {
            setMensagem("Selecione um plano ou digite um valor personalizado");
            return;
        }

        setLoading(true);
        setMensagem("");

        try {
            // Pega o usuário logado
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setMensagem("Usuário não autenticado");
                return;
            }

            let valorFinal: number;

            if (planoSelecionado) {
                const plano = planos.find(p => p.id === planoSelecionado);
                valorFinal = plano!.valor;
            } else {
                valorFinal = parseFloat(valorPersonalizado.replace(',', '.'));
            }

            if (!Number.isFinite(valorFinal) || valorFinal <= 0) {
                setMensagem("Digite um valor válido para a taxa de ativação");
                return;
            }

            // Busca o afiliado pelo auth_id do usuário logado
            const { data: afiliado, error: afiliadoError } = await supabase
                .from("afiliados")
                .select("id")
                .eq("auth_id", user.id)
                .single();

            if (afiliadoError || !afiliado) {
                console.error("Erro ao localizar afiliado:", afiliadoError);
                setMensagem("Não foi possível localizar seu cadastro de afiliado");
                return;
            }

            // Salva o valor de adesão na tabela afiliados
            const { error } = await supabase
                .from("afiliados")
                .update({
                    valor_adesao: valorFinal,
                    atualizado_em: new Date().toISOString(),
                })
                .eq("id", afiliado.id);

            if (error) throw error;

            setMensagem("Valor de taxa de ativação salvo com sucesso!");

            // Redireciona após 2 segundos
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (error) {
            console.error("Erro ao salvar:", error);
            setMensagem("Erro ao salvar o valor de taxa de ativação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                {/* Cabeçalho */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Negociação de Taxa de Ativação
                    </h1>
                    <p className="text-gray-600">
                        Escolha o valor que deseja cobrar pela taxa de ativação ou digite um valor personalizado
                    </p>
                </div>

                {/* Planos */}
                <div className="space-y-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                        Planos Sugeridos
                    </h2>

                    {planos.map((plano) => (
                        <div
                            key={plano.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${planoSelecionado === plano.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                            onClick={() => {
                                setPlanoSelecionado(plano.id);
                                setValorPersonalizado("");
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 ${planoSelecionado === plano.id
                                                ? "border-blue-500 bg-blue-500"
                                                : "border-gray-300"
                                            }`}
                                    />
                                    <div>
                                        <h3 className="font-medium text-gray-900">{plano.nome}</h3>
                                        <p className="text-sm text-white">{plano.descricao}</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-gray-900">
                                    R$ {plano.valor.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Valor Personalizado */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                        Valor Personalizado
                    </h2>
                    <div className="flex items-center space-x-3">
                        <span className="text-gray-600">R$</span>
                        <input
                            type="text"
                            placeholder="0,00"
                            value={valorPersonalizado}
                            onChange={(e) => {
                                setValorPersonalizado(e.target.value);
                                setPlanoSelecionado("");
                            }}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <p className="text-sm text-white mt-1">
                        Digite o valor que deseja cobrar
                    </p>
                </div>

                {/* Botão Salvar */}
                <button
                    onClick={handleSalvar}
                    disabled={loading || (!planoSelecionado && !valorPersonalizado)}
                    className={`w-full py-3 px-4 rounded-md text-white font-medium ${loading || (!planoSelecionado && !valorPersonalizado)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Salvando..." : "Salvar Valor de Taxa de Ativação"}
                </button>

                {/* Mensagem */}
                {mensagem && (
                    <div
                        className={`mt-4 p-3 rounded-md text-center ${mensagem.includes("sucesso")
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                    >
                        {mensagem}
                    </div>
                )}
            </div>
        </div>
    );
}