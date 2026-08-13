// Base de dados inicial botânica enriquecida com todos os campos detalhados
export const INITIAL_PLANTS = [
  {
    id: 'plant-aglaonema-01',
    commonName: 'Aglaonema (Café-de-Salão)',
    scientificName: 'Aglaonema commutatum',
    origin: 'Florestas Tropicais do Sudeste Asiático (Tailândia, Malásia e Filipinas)',
    photoUrl: 'https://images.unsplash.com/photo-1617173944883-6ffbd35d584d?auto=format&fit=crop&w=800&q=80',
    plantType: 'Luz Indireta / Sombra Luminosa',
    healthStatus: 'Excelente (Folhas Vistosas)',
    lastWatered: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 dia atrás
    sunlight: {
      lightType: 'indireta', // 'direta' | 'indireta' | 'sombra'
      period: 'Luz Indireta Filtrada / Sombra Luminosa',
      hoursPerDay: '4 a 6 horas de claridade difusa',
      notes: 'Não usar luz natural direta! Evitar sol direto a todo custo porque queima severamente as folhas e desbota o padrão das cores.'
    },
    watering: {
      frequencyTimesPerWeek: 2,
      frequencyDays: 3,
      amountMl: '150 - 200 ml',
      description: 'Regar 2 vezes por semana. Deixar a camada superficial de 2 cm do solo secar levemente entre as regas. Evitar deixar água parada no prato.'
    },
    soilType: 'Solo rico em matéria orgânica, leve, aerado e com excelente drenagem (mistura de terra vegetal, fibra de coco e perlita)',
    idealTemperature: '20°C a 28°C (clima quente e úmido; não tolera geadas, ar condicionado direto ou frio abaixo de 15°C)',
    howToCare: 'Retirar folhas secas ou amareladas cortando rente à base com tesoura esterilizada. Limpar o pó das folhas periodicamente com esponja ou pano macio úmido para desobstruir os estômatos.',
    fertilizer: {
      type: 'NPK 10-10-10 líquido diluído ou Húmus de Minhoca',
      frequency: 'A cada 30 a 45 dias na Primavera e Verão',
      notes: 'Suspender a adubação nos meses mais frios de inverno.'
    },
    careTips: [
      'Gosta de umidade ambiente média a alta; borrifar água nas folhas nos dias mais secos.',
      'Planta tóxica para cães e gatos se ingerida, manter fora do alcance de pets.'
    ],
    notes: 'Excelente planta para purificação de ambientes internos de acordo com estudos da NASA.'
  },
  {
    id: 'plant-jiboia-02',
    commonName: 'Jiboia Amarela',
    scientificName: 'Epipremnum aureum',
    origin: 'Ilhas Salomão e Polinésia Francesa (Pacífico Sul)',
    photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    plantType: 'Luz Indireta / Meia Sombra',
    healthStatus: 'Excelente Vigor',
    lastWatered: new Date(Date.now() - 86400000 * 2).toISOString(),
    sunlight: {
      lightType: 'indireta',
      period: 'Luz Indireta Forte / Sol da Manhã Suave',
      hoursPerDay: '4 a 6 horas',
      notes: 'Prefere luz difusa abundante para manter a variegação amarela das folhas. Sol forte do meio-dia queima as folhas.'
    },
    watering: {
      frequencyTimesPerWeek: 2,
      frequencyDays: 3,
      amountMl: '150 - 250 ml',
      description: 'Regar cerca de 2 vezes por semana. Verificar com o dedo se o substrato está seco antes de regar.'
    },
    soilType: 'Substrato fértil e bem drenável (composto orgânico com casca de pinus moída e perlita)',
    idealTemperature: '18°C a 30°C (aprecia ambientes quentes; proteger de ventos gelados)',
    howToCare: 'Remover folhas secas na base com tesoura limpa. Podar as pontas longas quando desejar estimular brotações laterais e folhagem mais cheia.',
    fertilizer: {
      type: 'NPK 10-10-10 foliar ou Húmus de Minhoca',
      frequency: 'A cada 30 dias na Primavera e Verão',
      notes: 'Adicionar adubo orgânico ao redor da borda do vaso.'
    },
    careTips: [
      'Pode ser cultivada pendente ou conduzida em tutor de fibra de coco.',
      'Limpar a poeira das folhas quinzenalmente para melhorar a fotossíntese.'
    ],
    notes: 'Planta de crescimento rápido e muito resistente para interiores.'
  },
  {
    id: 'plant-espada-03',
    commonName: 'Espada de São Jorge',
    scientificName: 'Dracaena trifasciata',
    origin: 'África Ocidental Tropical (Nigéria e Congo)',
    photoUrl: 'https://images.unsplash.com/photo-1599598425947-23429810a91e?auto=format&fit=crop&w=800&q=80',
    plantType: 'Adaptável (Sol Pleno / Sombra)',
    healthStatus: 'Saudável & Robusta',
    lastWatered: new Date(Date.now() - 86400000 * 6).toISOString(), // 6 dias atrás -> precisa de rega
    sunlight: {
      lightType: 'indireta', // Adapta-se a direta, indireta ou sombra
      period: 'Adapta-se ao Sol Direto, Meia Sombra ou Sombra',
      hoursPerDay: '3 a 8 horas',
      notes: 'Extremamente tolerante: vive bem sob sol direto, luz filtrada ou cantos com menor claridade.'
    },
    watering: {
      frequencyTimesPerWeek: 1,
      frequencyDays: 7,
      amountMl: '100 - 150 ml',
      description: 'Regar apenas 1 vez por semana no verão ou a cada 10-15 dias no inverno. O solo deve secar 100% entre as regas.'
    },
    soilType: 'Solo arenoso de drenagem rápida (mistura para cactos e suculentas com areia grossa)',
    idealTemperature: '15°C a 32°C (altamente resistente à seca e variações de temperatura)',
    howToCare: 'Tirar folhas secas ou danificadas cortando rente ao solo. Limpar a lâmina das folhas com pano seco ou levemente úmido.',
    fertilizer: {
      type: 'Adubo Orgânico Bokashi ou Farinha de Casca de Ovo',
      frequency: 'A cada 60 a 90 dias',
      notes: 'Exige pouca fertilização; evitar excesso de nitrogênio.'
    },
    careTips: [
      'Cuidado redobrado com excesso de água, que apodrece o rizoma.',
      'Uma das melhores espécies para purificar o ar no quarto.'
    ],
    notes: 'Altamente resistente e de baixíssima manutenção.'
  },
  {
    id: 'plant-suculenta-04',
    commonName: 'Suculenta Echeveria Rosa',
    scientificName: 'Echeveria elegans',
    origin: 'Regiões Semiáridas do México (América do Norte)',
    photoUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    plantType: 'Sol Pleno (Luz Direta)',
    healthStatus: 'Saudável',
    lastWatered: new Date(Date.now() - 86400000 * 4).toISOString(),
    sunlight: {
      lightType: 'direta',
      period: 'Sol Direto Pleno',
      hoursPerDay: '6+ horas diárias de sol direto',
      notes: 'Precisa de sol direto para manter o formato compacto de roseta e a coloração azulada/rosada viva.'
    },
    watering: {
      frequencyTimesPerWeek: 1,
      frequencyDays: 6,
      amountMl: '50 - 80 ml',
      description: 'Regar a cada 5 a 7 dias, molhando apenas o solo ao redor sem deixar água acumulada no centro da roseta.'
    },
    soilType: 'Substrato bem arenoso, poroso e mineral (50% terra vegetal + 50% areia grossa de construção ou perlita)',
    idealTemperature: '16°C a 30°C (não tolera geadas prolongadas nem ambientes fechados e úmidos)',
    howToCare: 'Retirar as folhas secas inferiores com pinça ou com a mão delicadamente para prevenir proliferação de fungos ou cochonilhas.',
    fertilizer: {
      type: 'Adubo específico para Cactos e Suculentas (NPK 04-14-08)',
      frequency: 'A cada 45 dias durante os meses quentes',
      notes: 'Aplicar sempre no solo úmido.'
    },
    careTips: [
      'Garantir vaso com orifício de drenagem generoso.',
      'Não molhar as folhas para não remover a cera protetora natural (prina).'
    ],
    notes: 'Ideal para parapeitos de janelas ensolaradas e varandas.'
  }
];
