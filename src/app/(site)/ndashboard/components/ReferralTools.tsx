import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon, DownloadIcon, LockIcon } from "lucide-react";

interface ReferralToolsProps {
  linkAfiliado: string;
  qrCode: string;
  onCopyLink: () => void;
  // onShare: (platform: string) => void;
}

export default function ReferralTools({
  linkAfiliado,
  qrCode,
  onCopyLink,
  // onShare
}: ReferralToolsProps) {
  return (
    <Card className="px-5 mb-8">
      <CardHeader>
        <CardTitle>Ferramentas de Indicação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 px-5 mb-12 relative">
          {/* Overlay de bloqueio para todo o conteúdo */}
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 rounded-lg flex flex-col items-center justify-center">
            <LockIcon className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-xl text-gray-600 font-semibold">Em breve</span>
            <p className="text-gray-500 mt-2 text-center max-w-md">
              Nossas ferramentas de indicação estarão disponíveis em breve
            </p>
          </div>

          {/* Conteúdo original (bloqueado) */}
          <div className="opacity-50 pointer-events-none">
            <div>
              <Label htmlFor="affiliate-link">Seu link exclusivo</Label>
              <div className="flex mt-1">
                <Input id="affiliate-link" value={linkAfiliado} readOnly />
                <Button variant="outline" className="ml-2" onClick={onCopyLink}>
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="border rounded-lg p-4 flex flex-col items-center">
                <div className="bg-white p-2 rounded">
                  <img src={qrCode} alt="QR Code" className="h-32 w-32" />
                </div>
                <p className="mt-2 text-sm text-gray-600">QR Code</p>
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Compartilhar</p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    Instagram
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    Facebook
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Materiais para download</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" className="justify-start">
                  <DownloadIcon className="h-4 w-4 mr-2" /> Banners
                </Button>
                <Button variant="outline" className="justify-start">
                  <DownloadIcon className="h-4 w-4 mr-2" /> Vídeos
                </Button>
                <Button variant="outline" className="justify-start">
                  <DownloadIcon className="h-4 w-4 mr-2" /> Textos Prontos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}