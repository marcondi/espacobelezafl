import { Phone, Mail, MapPin, Clock, MessageCircle, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CONTACT } from '@/lib/contact';

export default function Contato() {
  return (
    <>
      <section className="py-20 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-widest mb-3">
            Fale Conosco
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
            Entre em <span className="text-gradient">Contato</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Estamos prontas para cuidar de você. Agende seu horário ou tire suas dúvidas pelos canais abaixo.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="p-8 border-0 shadow-soft bg-card">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center text-white mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">WhatsApp</h3>
              <p className="text-muted-foreground mb-4">Resposta rápida para agendamentos e avaliações online.</p>
              <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">
                {CONTACT.phone}
              </a>
              <Button asChild className="rounded-full gradient-primary border-0 mt-4 w-full">
                <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
                  Abrir conversa
                </a>
              </Button>
            </Card>

            <Card className="p-8 border-0 shadow-soft bg-card">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center text-white mb-4">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">Telefone</h3>
              <p className="text-muted-foreground mb-4">Ligue diretamente para falar com a equipe.</p>
              <a href={`tel:${CONTACT.phoneRaw}`} className="text-primary font-medium hover:underline">
                {CONTACT.phone}
              </a>
              <Button asChild variant="outline" className="rounded-full mt-4 w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <a href={`tel:${CONTACT.phoneRaw}`}>Ligar agora</a>
              </Button>
            </Card>

            <Card className="p-8 border-0 shadow-soft bg-card">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center text-white mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">E-mail</h3>
              <p className="text-muted-foreground mb-4">Envie sua mensagem ou pedido de orçamento.</p>
              <a href={`mailto:${CONTACT.email}`} className="text-primary font-medium hover:underline break-all">
                {CONTACT.email}
              </a>
            </Card>

            <Card className="p-8 border-0 shadow-soft bg-card">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center text-white mb-4">
                <Instagram className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">Instagram</h3>
              <p className="text-muted-foreground mb-4">Acompanhe nossas transformações e novidades.</p>
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">
                @studiofernandalima
              </a>
            </Card>
          </div>

          {/* Address & hours */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-6">
            <Card className="p-8 border-0 shadow-soft bg-card">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center text-white mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-3">Endereço</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                {CONTACT.address}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {CONTACT.city} — CEP {CONTACT.cep}
              </p>
            </Card>

            <Card className="p-8 border-0 shadow-soft bg-card">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center text-white mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-3">Horário de Atendimento</h3>
              <ul className="space-y-2 text-muted-foreground">
                {CONTACT.hours.map((h) => (
                  <li key={h.day} className="flex justify-between border-b border-border pb-2 last:border-0">
                    <span className="font-medium text-foreground">{h.day}</span>
                    <span>{h.time}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Map */}
          <div className="max-w-5xl mx-auto mt-6">
            <Card className="overflow-hidden border-0 shadow-soft">
              <iframe
                title="Mapa"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  CONTACT.fullAddress,
                )}&output=embed`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
