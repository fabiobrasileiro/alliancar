"use client"
import React from "react";
import { Button } from "@/components/ui/button";

const powerlinks = [
  {
    title: "Cotação",
    url: "https://cotacao.me/dlm5xrlz?id=ADddnAXD",
  },
  {
    title: "Cotação ISA",
    url: "https://alliancarclube.com.br/formulario/?id=ADddnAXD",
  },
  {
    title: "LP ALLIANCAR",
    url: "https://cotacao.me/DOarNyQe?id=ADddnAXD",
  },
];

const affiliateLink = {
  title: "Captação de Afiliados",
  url: "https://app.powercrm.com.br/affiliateFormPage/ADddnAXD",
};


const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    alert("Link copiado!");
};

export default function Powerlinks() {
  return (
    <div className="p-4 space-y-8">
      {/* Título */}
      <div>
        <h3 className="text-2xl font-semibold mb-2">Powerlinks</h3>
        <p>
          Estes são os seus powerlinks, envie ele para seus clientes para receber
          diretamente os pedidos de cotação.
        </p>
      </div>

      {/* Lista de Powerlinks */}
      <div className="space-y-6">
        {powerlinks.map((link, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row border border-gray-300 rounded-lg p-4 gap-4"
          >
            {/* QR code placeholder */}
            <div className="w-36 h-36 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">QR</span>
            </div>

            {/* Info e botão */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-lg">{link.title}</h4>
                <h4 className="text-gray-500 break-all">{link.url}</h4>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => copyToClipboard(link.url)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Copiar Link
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Powerlink para afiliados */}
      <div>
        <h4 className="text-xl font-semibold mb-2">
          Powerlink para cadastro de afiliados
        </h4>
        <p className="mb-4">
          Use o powerlink abaixo para a captação de afiliados. Afiliados são
          pessoas que têm seus próprios powerlinks, mas somente com a função de
          indicar. Eles não vendem. Afiliados cadastrados por você, sempre que
          indicarem alguém este contato chegará para você.
        </p>

        <div className="flex flex-col md:flex-row border border-gray-300 rounded-lg p-4 gap-4">
          {/* QR code placeholder */}
          <div className="w-36 h-36 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">QR</span>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-lg">{affiliateLink.title}</h4>
              <h4 className="text-gray-500 break-all">{affiliateLink.url}</h4>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => copyToClipboard(affiliateLink.url)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Copiar Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}