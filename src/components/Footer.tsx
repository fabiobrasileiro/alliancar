'use client';

import { MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-bg text-white font-bold text-center py-5 mt-35 bottom-0 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center justify-center gap-2">
        Direitos autorais © 2025 alliancar. Todos os direitos reservados.
      </div>
      <a
        href="https://web.whatsapp.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        <span>WhatsApp</span>
      </a>
    </footer>
  );
}
