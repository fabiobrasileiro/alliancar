'use client';

import { MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Footer() {
  return (
    <footer className="w-full bg-bg text-white font-bold text-center py-5 mt-35 bottom-0 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center justify-center gap-2">
        Direitos autorais © 2025 alliancar. Todos os direitos reservados.
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <a
          href="https://web.whatsapp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>WhatsApp</span>
        </a>
        
        {/* Botão de Suporte Bate Papo */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>Suporte Bate Papo</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suporte</DialogTitle>
              <DialogDescription className="text-gray-300 mt-2">
                Fale com um suporte tem alguma dúvida?
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  );
}
