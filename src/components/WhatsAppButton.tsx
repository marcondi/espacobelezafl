import { MessageCircle } from 'lucide-react';
import { CONTACT } from '@/lib/contact';

export default function WhatsAppButton() {
  return (
    <a
      href={CONTACT.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-elegant hover:scale-110 transition-smooth"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
