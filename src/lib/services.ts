import alisamento from '@/assets/service-alisamento.jpg';
import mechas from '@/assets/service-mechas.jpg';
import tratamento from '@/assets/service-tratamento.jpg';
import botox from '@/assets/service-botox.jpg';
import noiva from '@/assets/service-noiva.jpg';
import correcao from '@/assets/service-correcao.jpg';

export type Service = {
  slug: string;
  title: string;
  short: string;
  description: string;
  details: string[];
  image: string;
  price: string;
};

export const services: Service[] = [
  {
    slug: 'alisamentos-diamond',
    title: 'Alisamentos Diamond',
    short: 'Alinhamento perfeito com tecnologia Diamond',
    description:
      'Nossos alisamentos são desenvolvidos com tecnologia Diamond, proporcionando alinhamento perfeito, brilho intenso e resultado sofisticado, sempre com atendimento personalizado.',
    details: [
      'Alisamento Orgânico Diamond — alinhamento capilar com leveza, movimento natural e controle de volume.',
      'Alisamento Diamond com Formol — alta performance, ideal para cabelos loiros e com mechas, garantindo alinhamento intenso e preservação da cor.',
      'Incluso: tratamento personalizado, alinhamento de pontas, neutralização da raiz, ozonioterapia, LED terapia e finalização profissional.',
    ],
    image: alisamento,
    price: 'Sob avaliação',
  },
  {
    slug: 'mechas-luzes',
    title: 'Mechas e Luzes',
    short: 'Técnicas mão livre, papel e touca personalizadas',
    description:
      'Mechas e luzes utilizando técnicas como mão livre, papel e touca, sempre de forma personalizada e exclusiva. Cada procedimento respeita a estrutura, o volume e o comprimento do cabelo.',
    details: [
      'Avaliação personalizada conforme volume e tamanho dos fios.',
      'Pode incluir tratamentos e pré-químicas para garantir saúde e resistência dos fios.',
      'Resultado harmonioso e de alta qualidade.',
    ],
    image: mechas,
    price: 'Sob avaliação',
  },
  {
    slug: 'tratamentos-diamond',
    title: 'Tratamentos Diamond',
    short: 'Hidratação, nutrição, reconstrução e detox',
    description:
      'Linha completa de tratamentos capilares com tecnologia Diamond: hidratação profunda, nutrição, reconstrução e detox capilar — todos com ozonioterapia para potencialização dos resultados.',
    details: [
      'Hidratação — devolve água e nutrientes essenciais, combate ressecamento e frizz.',
      'Nutrição — repõe lipídios, deixa o cabelo alinhado, disciplinado e com brilho intenso.',
      'Reconstrução — repõe massa capilar, fortalece a estrutura e reduz a quebra.',
      'Detox Capilar — desintoxica o couro cabeludo, ideal para descamações e oleosidade.',
    ],
    image: tratamento,
    price: 'Sob avaliação',
  },
  {
    slug: 'botox-diamond',
    title: 'Botox Diamond',
    short: 'Botox capilar orgânico ou com formol',
    description:
      'Trabalhamos com duas opções de botox capilar: orgânico e com formol, escolhidos de acordo com a necessidade de cada cliente. Alinha os fios, reduz volume e controla o frizz.',
    details: [
      'Excelente opção para manutenção do alisamento, prolongando o efeito liso.',
      'Atua na reposição de massa, devolvendo brilho, maciez e hidratação.',
      'Cabelo mais saudável, resistente e com aspecto renovado.',
    ],
    image: botox,
    price: 'Sob avaliação',
  },
  {
    slug: 'correcao-de-cor',
    title: 'Correção de Cor',
    short: 'Ajuste de tonalidades e cobertura de brancos',
    description:
      'Procedimento completo e personalizado para ajustar tonalidades, corrigir manchas e uniformizar a cor dos fios, podendo incluir cobertura de brancos no mesmo atendimento.',
    details: [
      'Inclui tratamento capilar personalizado.',
      'Finalização com ozonioterapia para potencializar os resultados.',
      'Escova para um acabamento impecável.',
      'Coloração pode ser trazida pela cliente ou indicada pelo espaço.',
    ],
    image: correcao,
    price: 'Sob avaliação',
  },
  {
    slug: 'dia-da-noiva',
    title: 'Dia da Noiva',
    short: 'Pacote exclusivo para o seu dia inesquecível',
    description:
      'Seu dia inesquecível, pensado nos mínimos detalhes para você. Selecione os procedimentos de sua preferência e criamos um plano exclusivo com valor personalizado.',
    details: [
      'Escalda-pés relaxante.',
      'Tratamento personalizado, incluso ozonioterapia + finalização.',
      'Designer de sobrancelha (com ou sem henna).',
      'Depilação de buço.',
      'Maquiagem completa.',
    ],
    image: noiva,
    price: 'Pacote personalizado',
  },
];
