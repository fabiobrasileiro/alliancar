'use client';

import { MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Footer() {
  return (
    <footer className="w-full bg-bg text-white py-4 sm:py-5 mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
          {/* Texto de direitos autorais */}
          <div className="text-center">
            <p className="text-sm sm:text-base font-medium text-gray-300">
              Direitos autorais © 2025 alliancar. Todos os direitos reservados.
            </p>
          </div>
          
          {/* Botões de contato */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
            <a
              href="https://web.whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0"
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">WhatsApp</span>
            </a>
            
            {/* Botão de Suporte Bate Papo */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0">
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Suporte Bate Papo</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Suporte</DialogTitle>
                  <DialogDescription className="text-gray-300 mt-2">
                    Fale com um suporte tem alguma dúvida?
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
}
