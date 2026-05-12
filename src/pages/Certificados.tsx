
import { Award } from 'lucide-react';

const certificados = [
  {
    id: 'hair-brasil',
    titulo: 'Curso Profissional de Cabeleireira',
    instituicao: 'Instituto Profissionalizante Hair Brasil',
    descricao: '260 horas de formação profissional — Jan a Jul de 2015',
    imagem: '/certificados/cert-hair-brasil.jpg',
  },
  {
    id: 'labday',
    titulo: 'Labday — Cor, Mechas e Tratamentos',
    instituicao: 'London Education',
    descricao: '8 horas — 30/05/2015 — Tangará da Serra/MT',
    imagem: '/certificados/cert-labday.jpg',
  },
  {
    id: 'mechas',
    titulo: 'Curso de Mechas',
    instituicao: 'London Education',
    descricao: '8 horas — 26/06/2017 — Tangará da Serra/MT',
    imagem: '/certificados/cert-mechas.jpg',
  },
  {
    id: 'london-concept',
    titulo: 'London Concept',
    instituicao: 'London Education',
    descricao: '8 horas — 03/10/2016 — Tangará da Serra/MT',
    imagem: '/certificados/cert-london-concept.jpg',
  },
  {
    id: 'liso3x1',
    titulo: 'Liso 3x1 — Várias Técnicas',
    instituicao: 'Curso Online',
    descricao: 'Especialista em Alisamento Orgânico — 2023',
    imagem: '/certificados/cert-liso3x1.jpg',
  },
  {
    id: 'alongamento-unhas',
    titulo: 'Alongamento de Unhas — Gel, Fibra de Vidro e Porcelana',
    instituicao: 'Ateliê das Unhas — Tangará da Serra/MT',
    descricao: '12 horas práticas — Jul de 2019',
    imagem: '/certificados/cert-alongamento-unhas.jpg',
  },
];

export default function Certificados() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-secondary/60 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Award className="h-4 w-4" />
            Formação Profissional
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Certificados &amp; <span className="text-gradient">Qualificações</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Anos de dedicação e aperfeiçoamento constante para oferecer o melhor em cada atendimento.
          </p>
        </div>
      </section>

      {/* Grid de certificados */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificados.map((cert) => (
              <div
                key={cert.id}
                className="group bg-card rounded-2xl overflow-hidden shadow-soft border border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                {/* Imagem do certificado */}
                <div className="overflow-hidden bg-muted">
                  <img
                    src={cert.imagem}
                    alt={cert.titulo}
                    className="w-full object-contain max-h-80 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="p-5">
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                    {cert.instituicao}
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground mt-1 mb-2 leading-snug">
                    {cert.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground">{cert.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
