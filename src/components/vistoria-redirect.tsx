"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ExternalLink, CheckCircle } from 'lucide-react';

interface VistoriaRedirectProps {
  vistoriaData: any;
  paymentData: any;
  onRedirect?: () => void;
}

export default function VistoriaRedirect({ vistoriaData, paymentData, onRedirect }: VistoriaRedirectProps) {
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (vistoriaData?.vistoriaUrl) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleRedirect();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [vistoriaData]);

  const handleRedirect = () => {
    setRedirecting(true);
    
    // Abre em nova aba
    window.open(vistoriaData.vistoriaUrl, '_blank');
    
    // Chama callback se fornecido
    onRedirect?.();
    
    setRedirecting(false);
  };

  if (!vistoriaData?.vistoriaUrl) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Preparando vistoria...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          Pagamento Confirmado!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">✅ Pagamento processado com sucesso</p>
          <p className="text-sm text-gray-600 mb-4">
            Agora vamos iniciar o processo de vistoria do seu veículo
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 text-center">
            Redirecionando para vistoria em {countdown} segundos...
          </p>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleRedirect}
            disabled={redirecting}
            className="w-full"
            size="lg"
          >
            {redirecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Redirecionando...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Ir para Vistoria Agora
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Você será redirecionado para o sistema de vistoria do veículo
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Resumo do Pedido:</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Placa:</span>
              <span className="font-mono">{vistoriaData.dados?.placa}</span>
            </div>
            <div className="flex justify-between">
              <span>Veículo:</span>
              <span>{vistoriaData.dados?.veiculo?.nome}</span>
            </div>
            <div className="flex justify-between">
              <span>Nº do Pedido:</span>
              <span>{paymentData.payment?.id}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}