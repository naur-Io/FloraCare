// Base de plantas iniciais de alta qualidade com imagens botânicas
export const INITIAL_PLANTS = [
  {
    id: 'plant-jiboia-01',
    commonName: 'Jiboia Amarela',
    scientificName: 'Epipremnum aureum',
    photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    plantType: 'Diurna / Meia Sombra',
    healthStatus: 'Excelente (Folhas Vicosas)',
    lastWatered: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 dia atrás
    watering: {
      frequencyDays: 3,
      amountMl: '150 - 200 ml',
      description: 'Regar quando a camada superficial do solo (2cm) estiver secando.'
    },
    sunlight: {
      period: 'Luz Indireta Forte / Sol da Manhã',
      hoursPerDay: '4 a 6 horas',
      habits: 'Planta de ambiente interno, não suporta sol forte das 12h às 15h.'
    },
    fertilizer: {
      type: 'NPK 10-10-10 ou Húmus de Minhoca',
      frequency: 'A cada 30 dias na Primavera e Verão',
      notes: 'Diluir adubo líquido na água da rega durante o crescimento ativo.'
    },
    careTips: [
      'Limpar o pó das folhas quinzenalmente com pano úmido para melhorar a fotossíntese.',
      'Planta tóxica para animais domésticos se mastigada. Manter em vasos suspensos.'
    ]
  },
  {
    id: 'plant-espada-02',
    commonName: 'Espada de São Jorge',
    scientificName: 'Dracaena trifasciata',
    photoUrl: 'https://images.unsplash.com/photo-1599598425947-23429810a91e?auto=format&fit=crop&w=800&q=80',
    plantType: 'Resistente (Sol / Sombra)',
    healthStatus: 'Saudável',
    lastWatered: new Date(Date.now() - 86400000 * 6).toISOString(), // 6 dias atrás -> precisa de água hoje!
    watering: {
      frequencyDays: 7,
      amountMl: '100 - 150 ml',
      description: 'Tolera seca. Deixe o solo secar completamente entre as regas.'
    },
    sunlight: {
      period: 'Adapta-se ao Sol Direto ou Sombra',
      hoursPerDay: '3 a 8 horas',
      habits: 'Muito versátil, aguenta ambientes de ar condicionado.'
    },
    fertilizer: {
      type: 'Adubo Orgânico Bokashi ou Casca de Ovo moída',
      frequency: 'A cada 60 dias',
      notes: 'Não exige muita adubação. Evite excesso de nitrogênio.'
    },
    careTips: [
      'Cuidado com o encharcamento da raiz, use vaso com furos e boa drenagem.',
      'Excelente purificadora do ar segundo estudos da NASA.'
    ]
  },
  {
    id: 'plant-suculenta-03',
    commonName: 'Suculenta Echeveria',
    scientificName: 'Echeveria elegans',
    photoUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    plantType: 'Diurna / Sol Pleno',
    healthStatus: 'Saudável',
    lastWatered: new Date(Date.now() - 86400000 * 2).toISOString(),
    watering: {
      frequencyDays: 5,
      amountMl: '50 - 80 ml',
      description: 'Regar apenas no substrato, sem molhar o centro da roseta.'
    },
    sunlight: {
      period: 'Sol Pleno Direto',
      hoursPerDay: '6+ horas',
      habits: 'Necessita de muito sol para manter a forma compacta e cor viva.'
    },
    fertilizer: {
      type: 'Adubo Específico para Cactos e Suculentas (NPK 04-14-08)',
      frequency: 'A cada 45 dias no verão',
      notes: 'Substrato bem arenoso com perlita ou areia grossa.'
    },
    careTips: [
      'Gosta de circulação de ar. Evite pratos acumuladores de água sob o vaso.'
    ]
  }
];
