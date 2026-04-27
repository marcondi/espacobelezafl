import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Clock } from 'lucide-react';
import { CONTACT } from '@/lib/contact';
import logo from '@/assets/logo-fernanda-lima.png';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Fernanda Lima" className="h-12 w-auto bg-background rounded-lg p-1" width={48} height={48} />
              <div>
                <h3 className="font-display text-lg font-semibold">Fernanda Lima</h3>
                <p className="text-xs uppercase tracking-widest text-background/60">Espaço de Beleza</p>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              Sua beleza é nossa especialidade. Atendimento personalizado em Tangará da Serra-MT.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/" className="hover:text-primary transition-smooth">Início</Link></li>
              <li><Link to="/servicos" className="hover:text-primary transition-smooth">Serviços</Link></li>
              <li><Link to="/galeria" className="hover:text-primary transition-smooth">Galeria</Link></li>
              <li><Link to="/equipe" className="hover:text-primary transition-smooth">Equipe</Link></li>
              <li><Link to="/contato" className="hover:text-primary transition-smooth">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="hover:text-primary transition-smooth">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-primary transition-smooth break-all">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{CONTACT.fullAddress}</span>
              </li>
              <li className="flex items-start gap-2">
                <Instagram className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="hover:text-primary transition-smooth">
                  @studiofernandalima
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Horários</h4>
            <ul className="space-y-2 text-sm text-background/70">
              {CONTACT.hours.map((h) => (
                <li key={h.day} className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong className="text-background">{h.day}:</strong> {h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-6 text-center text-sm text-background/60">
          © {new Date().getFullYear()} Espaço de Beleza Fernanda Lima. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
