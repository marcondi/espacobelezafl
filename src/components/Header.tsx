import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Phone, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/lib/contact';
import logo from '@/assets/logo-fernanda-lima.png';

const navItems = [
  { to: '/', label: 'Início' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/galeria', label: 'Galeria' },
  { to: '/equipe', label: 'Equipe' },
  { to: '/contato', label: 'Contato' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src={logo} alt="Fernanda Lima" className="h-12 w-auto" width={48} height={48} />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold text-gradient">Fernanda Lima</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Espaço de Beleza</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-smooth hover:text-primary ${
                  isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <a
            href={`tel:${CONTACT.phoneRaw}`}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            <Phone className="h-4 w-4 text-primary" />
            {CONTACT.phone}
          </a>
          <Button asChild className="rounded-full gradient-primary border-0 shadow-soft">
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
              Agendar
            </a>
          </Button>
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2 text-base font-medium ${isActive ? 'text-primary' : 'text-foreground'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href={`tel:${CONTACT.phoneRaw}`}
              className="flex items-center gap-2 py-2 text-sm text-foreground"
            >
              <Phone className="h-4 w-4 text-primary" />
              {CONTACT.phone}
            </a>
            <Button asChild className="rounded-full gradient-primary border-0 mt-2">
              <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
                Agendar pelo WhatsApp
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
