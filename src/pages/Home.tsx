import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Sparkles, Heart, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CONTACT } from '@/lib/contact';
import { services } from '@/lib/services';
import hero from '@/assets/hero-salon.jpg';

const stats = [
  { value: '500+', label: 'Clientes Satisfeitas' },
  { value: '12+', label: 'Anos de Experiência' },
  { value: '15+', label: 'Serviços Especializados' },
  { value: '98%', label: 'Avaliações Positivas' },
];

const testimonials = [
  {
    name: 'Derlinda Vieira Lima Cazeli',
    role: 'Cliente',
    text: 'Há quase seis anos confio meus cuidados à Fernanda e posso afirmar que ela é uma profissional excepcional. Seu trabalho é realizado com excelência, agilidade e muita dedicação, refletindo diretamente nos resultados que alcancei ao longo desse período. Além dos cuidados com os cabelos e unhas, ela também compartilha seu conhecimento por meio de cursos de cabeleireiro, manicure e depilação, formando novos profissionais com a mesma competência que demonstra diariamente. O que mais admiro na Fernanda é a combinação entre profissionalismo, honestidade, caráter e determinação. Sou muito grata por todo o cuidado e carinho que sempre recebi. Desejo que ela continue alcançando ainda mais sucesso, pois é uma profissional que realmente faz a diferença na vida de seus clientes.',
  },
  {
    name: 'Bruna  Bulhões',
    role: 'Cliente',
    text: 'Sou cliente da Fernanda há mais de cinco anos e, desde o primeiro atendimento, encontrei muito mais do que cuidados com os cabelos: encontrei atenção, dedicação e profissionalismo. Ao longo desse período, passei por diversas mudanças de visual e sempre me senti segura, graças ao conhecimento técnico e à confiança que ela transmite. Desde a época em que utilizava mega hair até a transição para cortes mais curtos, a Fernanda acompanhou cada etapa com excelência. Hoje mantenho meus cabelos saudáveis, hidratados, brilhantes e leves, resultado de um trabalho realizado com produtos de qualidade e muito cuidado. Recomendo o Espaço Fernanda Lima pela estrutura acolhedora, pelo conforto do ambiente e, principalmente, pela competência e dedicação da profissional Fernanda.',
  },
  {
    name: 'Solange Aparecida de Lima Silva',
    role: 'Cliente',
    text: 'Gostaria de expressar minha gratidão ao Espaço Fernanda Lima pelo excelente trabalho realizado ao longo de mais de oito anos. Durante todo esse período, a Fernanda sempre cuidou dos meus cabelos com dedicação, competência e um alto padrão de qualidade. Seu profissionalismo, atenção aos detalhes e compromisso com a satisfação dos clientes fazem toda a diferença nos resultados alcançados. Tenho total confiança em seu trabalho e posso afirmar que minha experiência sempre foi extremamente positiva. Parabenizo a Fernanda pela excelência dos serviços prestados e desejo que continue sendo abençoada e alcançando cada vez mais sucesso em sua trajetória profissional.',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <img
          src={hero}
          alt="Espaço de Beleza Fernanda Lima"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <span className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            Especialistas em Beleza
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Sua Beleza é Nossa
            <br />
            <span className="text-gradient bg-gradient-to-r from-primary-glow to-primary bg-clip-text text-transparent">
              Especialidade
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
            Transforme seu visual com nossos profissionais especializados. Excelência em cada serviço, cuidado em cada detalhe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full gradient-primary border-0 shadow-elegant text-base h-14 px-8">
              <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Agora
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-foreground text-base h-14 px-8">
              <Link to="/servicos">
                Ver Serviços
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">{s.value}</div>
                <div className="text-sm md:text-base text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-widest mb-3">
              <Heart className="h-4 w-4" /> Nossos Serviços
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Serviços <span className="text-gradient">Especializados</span>
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
              Uma gama completa de serviços de beleza com técnicas modernas e produtos premium
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <Card key={service.slug} className="group overflow-hidden border-0 shadow-soft hover:shadow-elegant transition-smooth bg-card">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                  />
                  <div className="absolute top-4 right-4 bg-background/95 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-primary">
                    {service.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{service.short}</p>
                  <Link
                    to="/servicos"
                    className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all"
                  >
                    Saiba mais <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-full gradient-primary border-0 shadow-soft">
              <Link to="/servicos">
                Ver Todos os Serviços
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery teaser */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-widest mb-3">
              <Award className="h-4 w-4" /> Nossos Trabalhos
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Transformações <span className="text-gradient">Incríveis</span>
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
              Veja algumas de nossas transformações mais incríveis
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.slice(0, 4).flatMap((s) => [s, s]).map((s, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-2xl group">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/galeria">
                Ver Galeria Completa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-widest mb-3">
              <Star className="h-4 w-4" /> Depoimentos
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              O Que Nossas <span className="text-gradient">Clientes Dizem</span>
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
              A satisfação das nossas clientes é nossa maior conquista
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-8 border-0 shadow-soft bg-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-20 text-center text-white shadow-elegant">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Pronta para Sua Transformação?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Agende seu horário e descubra por que somos referência em beleza e cuidados estéticos
              </p>
              <Button asChild size="lg" variant="secondary" className="rounded-full bg-white text-primary hover:bg-white/90 text-base h-14 px-8">
                <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
                  <Calendar className="mr-2 h-5 w-5" />
                  Agendar Agora
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
