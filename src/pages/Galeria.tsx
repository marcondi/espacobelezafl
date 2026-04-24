import { services } from '@/lib/services';
import hero from '@/assets/hero-salon.jpg';

export default function Galeria() {
  // Compose a gallery from service images repeated for visual variety
  const images = [
    ...services.map((s) => ({ src: s.image, alt: s.title })),
    ...services.map((s) => ({ src: s.image, alt: s.title })),
    { src: hero, alt: 'Espaço Fernanda Lima' },
  ];

  return (
    <>
      <section className="py-20 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-widest mb-3">
            Trabalhos
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
            Nossa <span className="text-gradient">Galeria</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Inspire-se com algumas de nossas transformações mais marcantes.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className="group aspect-square overflow-hidden rounded-2xl shadow-soft">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
