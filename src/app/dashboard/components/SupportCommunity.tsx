import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircleIcon } from "lucide-react";

export default function SupportCommunity() {
  const faqs = [
    {
      question: "Como recebo minhas comissões?",
      answer: "Suas comissões são pagas via PIX toda sexta-feira para vendas aprovadas até a quarta-feira da mesma semana. Certifique-se de ter cadastrado sua chave PIX no painel do afiliado."
    },
    {
      question: "Quando cai o pagamento?",
      answer: "Os pagamentos são processados às quintas-feiras e creditados em sua conta na sexta-feira. Pagamentos de comissões recorrentes ocorrem todo dia 10 de cada mês."
    }
  ];

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
            <p className="font-medium text-sm mb-2">Perguntas Frequentes</p>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start text-sm h-8">
                      {faq.question}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{faq.question}</DialogTitle>
                    </DialogHeader>
                    <p className="py-4">{faq.answer}</p>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}