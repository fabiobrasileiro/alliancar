'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Mail, Phone, Clock } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdate = "28 de Setembro de 2025";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Em uma implementação real, você geraria um PDF aqui
    const content = document.getElementById('privacy-content')?.innerText;
    const blob = new Blob([content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'politica-de-privacidade.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidade
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Última atualização: {lastUpdate}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              privacidade@empresa.com
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-4 justify-center mb-8">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Imprimir
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <Card id="privacy-content">
            <CardContent className="p-8 space-y-8">
              {/* Introdução */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
                <p className="text-gray-700 leading-relaxed">
                  Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos 
                  suas informações quando você utiliza nossos serviços. Estamos comprometidos em proteger 
                  sua privacidade e garantir a segurança de seus dados pessoais.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Ao utilizar nossos serviços, você concorda com a coleta e uso de informações de 
                  acordo com esta política.
                </p>
              </section>

              {/* Informações Coletadas */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informações que Coletamos</h2>
                
                <h3 className="text-xl font-medium text-gray-800 mb-3">2.1. Informações Pessoais</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Nome completo e informações de contato</li>
                  <li>Endereço de e-mail e telefone</li>
                  <li>Informações de cadastro e perfil</li>
                  <li>Dados de pagamento e transações</li>
                  <li>Documentos de identificação quando necessário</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">2.2. Informações de Uso</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Endereço IP e informações do dispositivo</li>
                  <li>Logs de acesso e atividade</li>
                  <li>Cookies e tecnologias similares</li>
                  <li>Preferências e configurações</li>
                </ul>
              </section>

              {/* Uso das Informações */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Como Usamos suas Informações</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Fornecer, operar e manter nossos serviços</li>
                  <li>Melhorar e personalizar a experiência do usuário</li>
                  <li>Processar transações e enviar notificações</li>
                  <li>Enviar comunicações de marketing (com seu consentimento)</li>
                  <li>Cumprir obrigações legais e regulatórias</li>
                  <li>Prevenir fraudes e garantir a segurança</li>
                </ul>
              </section>

              {/* Compartilhamento de Dados */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartilhamento de Dados</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Podemos compartilhar suas informações nas seguintes situações:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Com prestadores de serviços que nos auxiliam na operação</li>
                  <li>Para cumprir obrigações legais ou ordens judiciais</li>
                  <li>Em caso de fusão, aquisição ou venda de ativos</li>
                  <li>Com seu consentimento explícito</li>
                  <li>Para proteger nossos direitos, propriedade ou segurança</li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies e Tecnologias Similares</h2>
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar 
                  tráfego e personalizar conteúdo. Você pode controlar o uso de cookies através das 
                  configurações do seu navegador.
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Tipos de cookies que utilizamos:</h4>
                  <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4">
                    <li>Cookies essenciais (funcionamento do site)</li>
                    <li>Cookies de desempenho (análise de uso)</li>
                    <li>Cookies de funcionalidade (preferências)</li>
                    <li>Cookies de marketing (personalização)</li>
                  </ul>
                </div>
              </section>

              {/* Segurança */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Segurança dos Dados</h2>
                <p className="text-gray-700 leading-relaxed">
                  Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger 
                  suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4 ml-4">
                  <li>Criptografia de dados em trânsito e em repouso</li>
                  <li>Controles de acesso baseados em função</li>
                  <li>Monitoramento contínuo de segurança</li>
                  <li>Backups regulares e planos de recuperação</li>
                </ul>
              </section>

              {/* Seus Direitos */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Seus Direitos</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  De acordo com a LGPD, você tem os seguintes direitos:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Acesso e Correção</h4>
                      <p className="text-sm text-gray-700">
                        Direito de acessar e corrigir suas informações pessoais
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Exclusão</h4>
                      <p className="text-sm text-gray-700">
                        Direito de solicitar a exclusão de seus dados
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Portabilidade</h4>
                      <p className="text-sm text-gray-700">
                        Direito de receber seus dados em formato estruturado
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Revogação</h4>
                      <p className="text-sm text-gray-700">
                        Direito de revogar consentimentos a qualquer momento
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Retenção de Dados */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Retenção de Dados</h2>
                <p className="text-gray-700 leading-relaxed">
                  Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir as 
                  finalidades descritas nesta política, a menos que um período de retenção mais longo 
                  seja exigido ou permitido por lei.
                </p>
              </section>

              {/* Transferência Internacional */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Transferência Internacional de Dados</h2>
                <p className="text-gray-700 leading-relaxed">
                  Seus dados podem ser processados em servidores localizados fora do país onde você 
                  reside. Garantimos que todas as transferências internacionais cumprem com as leis 
                  de proteção de dados aplicáveis.
                </p>
              </section>

              {/* Contato */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contato do Encarregado de Dados</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">E-mail</p>
                          <p className="text-gray-700">privacidade@empresa.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">Telefone</p>
                          <p className="text-gray-700">(11) 9999-9999</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Endereço para correspondência:</p>
                        <p className="text-gray-700">
                          Av. Paulista, 1000 - Bela Vista<br />
                          São Paulo - SP, 01310-100
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Alterações */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Alterações nesta Política</h2>
                <p className="text-gray-700 leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você 
                  sobre quaisquer alterações significativas através dos canais apropriados e 
                  atualizaremos a data de "Última atualização" no topo desta política.
                </p>
              </section>

              {/* Rodapé */}
              <section className="pt-8 border-t">
                <p className="text-center text-gray-600 text-sm">
                  Esta política é efetiva a partir de {lastUpdate}
                </p>
              </section>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
}