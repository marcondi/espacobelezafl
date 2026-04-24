import { Calendar, CreditCard, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { services } from '@/lib/services';
import { CONTACT } from '@/lib/contact';

export default function Servicos() {
  return (
    <>
      {/* Header */}
      <section className="py-20 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-widest mb-3">
            Catálogo
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
            Nossos <span className="text-gradient">Serviços</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Procedimentos exclusivos com tecnologia Diamond, atendimento personalizado e produtos premium para cuidar dos seus fios.
          </p>
        </div>
      </section>

      {/* Important info */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <Card className="p-8 border-primary/20 bg-primary/5 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-display text-2xl font-semibold mb-3">Informações Importantes</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Para procedimentos como alisamentos (orgânicos ou com formol) e mechas, realizamos uma <strong className="text-foreground">pré-avaliação online</strong>. O valor é estimado através de um vídeo enviado via WhatsApp, mostrando bem a parte de trás do cabelo.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  A partir desse vídeo é informada uma base de preço, que pode sofrer ajustes após a avaliação presencial. Para valores exatos, a avaliação deve ser realizada pessoalmente.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Services list */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {services.map((service, idx) => (
              <Card
                key={service.slug}
                className={`overflow-hidden border-0 shadow-soft hover:shadow-elegant transition-smooth grid md:grid-cols-2 gap-0 ${
                  idx % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="relative h-64 md:h-auto md:min-h-[360px]">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-primary text-xs uppercase tracking-widest font-medium mb-2">
                    {service.price}
                  </span>
                  <h3 className="font-display text-3xl font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-5 leading-relaxed">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="rounded-full gradient-primary border-0 self-start">
                    <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar Avaliação
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment & Policy */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="p-8 border-0 shadow-soft bg-card">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center text-white mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-3">Formas de Pagamento</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Aceitamos: <strong className="text-foreground">dinheiro, Pix, cartão de débito e crédito</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                No cartão de crédito, é possível parcelar, com acréscimo de taxa conforme a operadora.
              </p>
            </Card>

            <Card className="p-8 border-0 shadow-soft bg-card">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center text-white mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-3">Política de Agendamento</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Em caso de cancelamento ou remarcação, pedimos a gentileza de avisar com no mínimo <strong className="text-foreground">24 horas de antecedência</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Trabalhamos com tolerância máxima de <strong className="text-foreground">10 minutos de atraso</strong>. Após esse período, o atendimento poderá ser reagendado conforme disponibilidade.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
