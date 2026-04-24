import { Instagram, Award, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CONTACT } from '@/lib/contact';
import fernanda from '@/assets/fernanda-lima.jpeg';

const values = [
  { icon: Award, title: 'Profissional Especializada', text: 'Anos de experiência em técnicas Diamond, alisamentos, mechas e tratamentos capilares.' },
  { icon: Heart, title: 'Atendimento Personalizado', text: 'Cada cliente recebe uma avaliação individual para um plano único de cuidados.' },
  { icon: Sparkles, title: 'Tecnologia & Resultado', text: 'Ozonioterapia, LED terapia e produtos premium para resultados de excelência.' },
];

export default function Equipe() {
  return (
    <>
      <section className="py-20 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-widest mb-3">
            Quem Somos
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
            Nossa <span className="text-gradient">Equipe</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Conheça quem cuida da sua beleza com dedicação, técnica e carinho.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-4 gradient-primary rounded-3xl opacity-20 blur-2xl" />
              <img
                src={fernanda}
                alt="Fernanda Lima — Proprietária"
                width={600}
                height={800}
                className="relative rounded-3xl shadow-elegant w-full object-cover aspect-[3/4]"
              />
            </div>

            <div>
              <span className="text-primary text-xs uppercase tracking-widest font-medium">
                Proprietária & Cabeleireira
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-6">
                Fernanda <span className="text-gradient">Lima</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Fundadora do Espaço de Beleza Fernanda Lima, em Tangará da Serra-MT, Fernanda é especialista em alisamentos, mechas, tratamentos capilares Diamond e botox capilar.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Com avaliação personalizada para cada cliente, une técnica, tecnologia e cuidado para entregar resultados sofisticados e fios saudáveis.
              </p>
              <Button asChild className="rounded-full gradient-primary border-0">
                <a href={CONTACT.instagram} target="_blank" rel="noreferrer">
                  <Instagram className="mr-2 h-4 w-4" />
                  Siga no Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.title} className="p-8 border-0 shadow-soft text-center bg-card">
                  <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center text-white mx-auto mb-4">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.text}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
