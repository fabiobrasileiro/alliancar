import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircleIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

export default function SupportCommunity() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      question: "Como recebo minhas comissões?",
      answer:
        "Suas comissões são pagas via PIX toda sexta-feira para vendas aprovadas até a quarta-feira da mesma semana. Certifique-se de ter cadastrado sua chave PIX no painel do afiliado.",
    },
    {
      question: "Quando cai o pagamento?",
      answer:
        "Os pagamentos são processados às quintas-feiras e creditados em sua conta na sexta-feira. Pagamentos de comissões recorrentes ocorrem todo dia 10 de cada mês.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suporte e Comunidade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 px-5 mb-12">
          <Button className="w-full">
            <HelpCircleIcon className="h-4 w-4 mr-2" /> Abrir Chamado
          </Button>

          <Button variant="outline" className="w-full">
            Grupo no WhatsApp
          </Button>

          <div>
            <p className="font-medium text-sm mb-3">Perguntas Frequentes</p>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium">{faq.question}</span>
                    {openItems.includes(index) ? (
                      <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  
                  {openItems.includes(index) && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}