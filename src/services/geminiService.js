/**
 * Serviço de Integração com a API Google Gemini Flash (Visão Multimodal Gratuita)
 * e IA Simulada de Alta Precisão (Fallback para testes sem chave).
 */

// Lista de modelos padrão em ordem de preferência (modelos Flash rápidos e gratuitos)
const DEFAULT_VISION_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-2.5-flash',
  'gemini-2.0-pro-exp',
  'gemini-1.5-pro'
];

/**
 * Extrai e higieniza uma chave de API do Gemini (Google AI Studio).
 * Remove espaços, quebras de linha, aspas ou textos acidentais colados junto (ex: labels da interface).
 */
export function sanitizeGeminiApiKey(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return '';
  
  const trimmed = rawInput.trim();
  
  // Se o usuário colou um bloco de texto com a chave no meio, extrair o token do Google AI Studio (AIzaSy...)
  const match = trimmed.match(/AIzaSy[A-Za-z0-9_-]{33}/);
  if (match) {
    return match[0];
  }

  // Se não encontrar o padrão exato, remove espaços em branco, quebras de linha e aspas
  return trimmed.replace(/["'\s\r\n]/g, '');
}

/**
 * Valida se uma chave da API do Google Gemini é autêntica e está ativa
 * utilizando a API oficial de listagem de modelos (ListModels)
 */
export async function validateGeminiApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('Por favor, digite ou cole a sua chave de API.');
  }

  const cleanKey = sanitizeGeminiApiKey(apiKey);

  // Verificação de segurança: se o usuário colou textos da página ou a chave é inválida
  if (!cleanKey || cleanKey.length < 25 || !cleanKey.startsWith('AIzaSy')) {
    if (apiKey.includes('Armazenamento') || apiKey.includes('navegador') || apiKey.includes('chave') || apiKey.includes(' ')) {
      throw new Error('Você colou um texto da página em vez da Chave de API. A chave do Google AI Studio começa com "AIzaSy" e tem cerca de 39 caracteres.');
    }
    throw new Error('Formato de chave inválido. As chaves do Google AI Studio começam com "AIzaSy" (ex: AIzaSyD...).');
  }

  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`;

  try {
    const res = await fetch(listUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error?.message || '';
      if (res.status === 400 || res.status === 403 || res.status === 401) {
        throw new Error(`Chave de API inválida: ${msg || 'Não autorizada pelo Google AI Studio. Verifique se copiou a chave correta.'}`);
      }
      throw new Error(`Erro ao validar chave (HTTP ${res.status}): ${msg}`);
    }

    const data = await res.json();
    const availableModels = (data.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));

    // Identificar o melhor modelo flash disponível para esta chave
    const preferredModel = availableModels.find(m => m.includes('2.0-flash')) ||
      availableModels.find(m => m.includes('1.5-flash')) ||
      availableModels.find(m => m.includes('flash')) ||
      availableModels[0] ||
      'Gemini Flash';

    return { 
      valid: true, 
      cleanKey,
      models: availableModels,
      activeModel: preferredModel,
      message: `Chave API validada com sucesso! Conectada ao Google Gemini (${preferredModel}).` 
    };
  } catch (err) {
    if (err.message && (err.message.includes('inválida') || err.message.includes('Google AI Studio') || err.message.includes('você colou') || err.message.includes('começam com'))) {
      throw err;
    }
    throw new Error(err.message || 'Não foi possível validar a chave. Verifique sua conexão com a internet.');
  }
}

/**
 * Normaliza e comprime qualquer imagem (HEIC, PNG, WebP, JPEG de alta resolução)
 * para JPEG otimizado a 1024px, ideal para envio à API de Visão do Gemini.
 */
export async function normalizeImageForAi(imageInput) {
  if (!imageInput) return null;

  if (!imageInput.startsWith('data:')) {
    return {
      dataUrl: `data:image/jpeg;base64,${imageInput}`,
      base64: imageInput.trim(),
      mimeType: 'image/jpeg'
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxDim = 1024;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const cleanBase64 = jpegDataUrl.split(';base64,')[1] || '';
        resolve({
          dataUrl: jpegDataUrl,
          base64: cleanBase64.trim(),
          mimeType: 'image/jpeg'
        });
      } catch (err) {
        const clean = imageInput.split(';base64,')[1] || imageInput;
        resolve({
          dataUrl: imageInput,
          base64: clean.trim(),
          mimeType: 'image/jpeg'
        });
      }
    };

    img.onerror = () => {
      const clean = imageInput.split(';base64,')[1] || imageInput;
      resolve({
        dataUrl: imageInput,
        base64: clean.trim(),
        mimeType: 'image/jpeg'
      });
    };

    img.src = imageInput;
  });
}

export async function analyzePlantImage(base64Image, apiKey) {
  const normalized = await normalizeImageForAi(base64Image);
  const cleanBase64 = normalized ? normalized.base64 : (base64Image.split(';base64,')[1] || base64Image).trim();

  if (apiKey && apiKey.trim() !== '') {
    return await fetchGeminiVisionApi(cleanBase64, apiKey.trim());
  } else {
    await new Promise(r => setTimeout(r, 1500));
    return simulateSmartAiAnalysis();
  }
}

async function fetchGeminiVisionApi(base64Data, apiKey) {
  let lastError = null;

  const prompt = `Você é um botânico especialista e taxonomista vegetal de renome, com altíssima precisão botânica.
Sua missão é analisar minuciosamente a fotografia desta planta e identificar a sua espécie exata, preenchendo todos os campos de cuidados botânicos detalhados e o guia completo de COMO TIRAR MUDAS E PROPAGAR A PLANTA PARA CULTIVAR.

Orientações botânicas obrigatórias:
1. Identifique o Nome Popular em português e o Nome Científico binomial (Gênero e espécie).
2. Informe a Origem / Região nativa de onde a planta vem no mundo (ex: Florestas Tropicais da Ásia, América do Sul, México, África Ocidental, etc.).
3. Quantidade de Luz: Classifique o lightType estritamente como "direta", "indireta" ou "sombra".
4. Observações de Luz: Detalhe os cuidados de iluminação (ex: se for sensível, avisar "evitar sol direto porque queima as folhas", horários de sol recomendados, etc.).
5. Rega: Especifique quantas vezes por semana regar (frequencyTimesPerWeek), intervalo em dias (frequencyDays) e a quantidade exata de água (amountMl, ex: "150 - 200 ml").
6. Solo: Especifique a mistura de solo e substrato que ela mais gosta (ex: rico em matéria orgânica, bem drenado, arenoso com perlita, etc.).
7. Temperatura: Faixa de temperatura que ela gosta e tolera (ex: "18°C a 28°C, proteger de geadas").
8. Como Cuidar / Manutenção: Instruções práticas detalhadas de manejo (ex: como e quando retirar folhas secas ou amareladas na base, podas, limpeza de folhas com pano úmido, borrifação de água).
9. Adubação e Nutrição: Tipo de adubo e frequência recomendada.
10. GUIA COMPLETO DE COMO TIRAR MUDAS & PROPAGAÇÃO:
    - method: Método principal para tirar mudas desta espécie (ex: "Estaquia de caule na água", "Divisão de touceiras/rizomas", "Estaquia de folhas", "Brotações laterais", "Alporquia").
    - bestSeason: Melhor época do ano para fazer as mudas (ex: "Primavera e Verão").
    - rootingTime: Tempo médio estimado para enraizar (ex: "2 a 4 semanas", "10 a 20 dias").
    - difficulty: Dificuldade ("Fácil", "Médio" ou "Avançado").
    - stepByStep: Array com 4 a 5 passos práticos numerados ensinando exatamente onde cortar, como preparar o ramo/folha/raiz, onde colocar (água ou substrato) e os cuidados até o pegamento.
    - proTips: Segredo botânico e dica de ouro para a muda não apodrecer e enraizar com sucesso (ex: uso de canela em pó, troca de água, luz indireta, umidade).

Retorne ESTRITAMENTE um JSON puro sem blocos markdown extras:
{
  "commonName": "Nome Popular em Português",
  "scientificName": "Nome Científico (Latim)",
  "origin": "De onde a planta vem (ex: Florestas Tropicais do Sudeste Asiático)",
  "plantType": "Ex: Luz Indireta / Meia Sombra",
  "healthStatus": "Ex: Saudável & Vigorosa",
  "sunlight": {
    "lightType": "indireta",
    "period": "Ex: Luz Indireta Filtrada / Sol da Manhã Suave",
    "hoursPerDay": "Ex: 4 a 6 horas diárias de claridade",
    "notes": "Observações sobre iluminação (ex: Evitar sol direto para não queimar as folhas)"
  },
  "watering": {
    "frequencyTimesPerWeek": 2,
    "frequencyDays": 3,
    "amountMl": "150 - 200 ml",
    "description": "Como e quando regar esta espécie"
  },
  "soilType": "Tipo de solo e substrato que a planta mais gosta",
  "idealTemperature": "Faixa de temperatura recomendada (ex: 18°C a 27°C)",
  "howToCare": "Como cuidar, como retirar folhas secas, podas e limpeza",
  "fertilizer": {
    "type": "Ex: NPK 10-10-10 ou Húmus de Minhoca",
    "frequency": "Ex: A cada 30 dias na Primavera/Verão",
    "notes": "Modo de aplicação"
  },
  "propagation": {
    "method": "Ex: Estaquia de caule na água",
    "bestSeason": "Ex: Primavera e Verão",
    "rootingTime": "Ex: 2 a 3 semanas",
    "difficulty": "Fácil",
    "stepByStep": [
      "1. Escolha um ramo vigoroso e saudável com pelo menos 2 a 3 nós e folhas bem formadas.",
      "2. Faça um corte diagonal limpo 1 cm abaixo de um nó utilizando tesoura esterilizada.",
      "3. Remova as folhas inferiores para que não fiquem submersas e aplique canela em pó no corte.",
      "4. Coloque a base do caule em um recipiente com água limpa em local com boa claridade difusa.",
      "5. Troque a água a cada 2 ou 3 dias. Quando as raízes atingirem 3 a 5 cm, plante em vaso com terra fértil."
    ],
    "proTips": "Use canela em pó como cicatrizante e antifúngico natural. Mantenha em luz indireta quente."
  },
  "careTips": [
    "Dica prática adicional 1",
    "Dica prática adicional 2"
  ],
  "notes": "Observações gerais sobre cultivo"
}`;

  const cleanKey = sanitizeGeminiApiKey(apiKey);
  if (!cleanKey) {
    throw new Error('Chave de API inválida ou ausente.');
  }

  // Tentar descobrir modelos suportados dinamicamente pela chave
  let modelsToTry = [...DEFAULT_VISION_MODELS];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`);
    if (listRes.ok) {
      const data = await listRes.json();
      const available = (data.models || [])
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      
      if (available.length > 0) {
        // Ordena priorizando modelos flash
        const sorted = [
          ...available.filter(m => m.includes('2.0-flash')),
          ...available.filter(m => m.includes('1.5-flash')),
          ...available.filter(m => m.includes('flash') && !m.includes('2.0') && !m.includes('1.5')),
          ...available.filter(m => !m.includes('flash'))
        ];
        modelsToTry = [...new Set([...sorted, ...DEFAULT_VISION_MODELS])];
      }
    }
  } catch (e) {
    // Continua com a lista padrão
  }

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const message = errJson.error?.message || `HTTP ${response.status}`;
        console.warn(`Tentativa com ${model} retornou erro:`, message);
        lastError = new Error(message);
        continue;
      }

      const jsonResponse = await response.json();
      const textOutput = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        continue;
      }

      let parsed = null;
      try {
        parsed = JSON.parse(textOutput);
      } catch (e) {
        const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      }

      if (parsed) {
        // Garantir que propagation venha preenchido
        if (!parsed.propagation || !parsed.propagation.method) {
          parsed.propagation = getDefaultPropagationForPlant(parsed);
        }
        return parsed;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Falha na requisição para modelo ${model}:`, err.message);
    }
  }

  // Se todos os modelos da API falharem por cota ou chave expirada, acionar fallback com aviso
  console.warn('API Gemini indisponível para esta chave, acionando catálogo botânico inteligente.');
  const fallback = simulateSmartAiAnalysis();
  return {
    ...fallback,
    _isFallback: true,
    _apiErrorMessage: lastError?.message
  };
}

/**
 * Gera guia inteligente de mudas para qualquer planta com base em suas características botânicas
 */
export function getDefaultPropagationForPlant(plant) {
  const name = (plant?.commonName || plant?.scientificName || '').toLowerCase();
  const plantType = (plant?.plantType || '').toLowerCase();

  if (name.includes('jiboia') || name.includes('filodendro') || name.includes('monstera') || name.includes('costela')) {
    return {
      method: 'Estaquia de caule com nó na água',
      bestSeason: 'Primavera e Verão',
      rootingTime: '10 a 20 dias',
      difficulty: 'Muito Fácil',
      stepByStep: [
        '1. Escolha uma haste saudável com folhas vistosas e nós bem formados (onde surgem raízes aéreas).',
        '2. Corte cerca de 1 cm abaixo de um nó usando uma tesoura limpa.',
        '3. Remova a folha mais próxima do corte para não ficar submersa.',
        '4. Coloque a ponta cortada em um recipiente com água limpa em local com boa claridade difusa.',
        '5. Troque a água a cada 2 ou 3 dias. Quando as raízes atingirem 4 cm, plante em vaso com substrato fértil.'
      ],
      proTips: 'A água deve cobrir apenas o nó. Não deixe folhas mergulhadas para não apodrecerem.'
    };
  }

  if (name.includes('suculenta') || name.includes('echeveria') || name.includes('cacto') || name.includes('kalanchoe')) {
    return {
      method: 'Estaquia de folhas ou brotações laterais',
      bestSeason: 'Primavera e Verão',
      rootingTime: '2 a 4 semanas',
      difficulty: 'Fácil',
      stepByStep: [
        '1. Destaque delicadamente uma folha saudável da base com leve movimento de torção (a base da folha deve sair inteira).',
        '2. Deixe a folha descansar na sombra por 2 dias para cicatrizar o ferimento.',
        '3. Apoie a folha deitada sobre um substrato arenoso e seco, sem enterrar.',
        '4. Mantenha em local bem iluminado sem sol forte direto e borrife levemente água a cada 3 a 5 dias.',
        '5. Quando a nova mudinha e as raízes rosadas crescerem, a folha-mãe secará e você poderá plantar a muda.'
      ],
      proTips: 'Nunca enterre a folha e evite regar antes das raízes aparecerem para não causar fungos.'
    };
  }

  if (name.includes('espada') || name.includes('sansevieria') || name.includes('dracaena')) {
    return {
      method: 'Divisão de touceiras/rizomas ou Pedaços de folha',
      bestSeason: 'Primavera e Verão',
      rootingTime: '4 a 6 semanas',
      difficulty: 'Fácil',
      stepByStep: [
        '1. Divisão de touceira: ao retirar a planta do vaso, separe um broto lateral que já tenha raízes próprias.',
        '2. Método por folha: corte uma folha em pedaços de 8 a 10 cm.',
        '3. Deixe secar na sombra por 24 horas para cicatrizar.',
        '4. Plante a base do pedaço (respeitando o sentido de crescimento) 2 cm dentro de solo arenoso.',
        '5. Mantenha o solo levemente úmido até brotarem as novas plantas.'
      ],
      proTips: 'Se plantar o pedaço de folha invertido (de cabeça para baixo) ele não cria raiz. Para plantas com borda amarela, use divisão de touceira para manter a variegação.'
    };
  }

  if (name.includes('manjericão') || name.includes('hortelã') || name.includes('alecrim') || name.includes('erva')) {
    return {
      method: 'Estaquia de ponteiros na água',
      bestSeason: 'Primavera e Verão',
      rootingTime: '7 a 14 dias',
      difficulty: 'Muito Fácil',
      stepByStep: [
        '1. Corte um ramo viçoso de cerca de 10 a 12 cm que não esteja florescendo.',
        '2. Retire as folhas dos 5 cm inferiores do ramo.',
        '3. Coloque o caule em um copo com água fresca em local bem iluminado.',
        '4. Troque a água a cada 2 dias para oxigenar.',
        '5. Ao atingir raízes de 2 a 3 cm, plante em vaso com terra rica em composto orgânico.'
      ],
      proTips: 'Evite galhos que já produziram flores, pois eles têm menos energia para emitir raízes novas.'
    };
  }

  // Padrão universal botânico de alta precisão
  return {
    method: 'Estaquia de caule / ramos na água ou substrato',
    bestSeason: 'Primavera e Verão',
    rootingTime: '2 a 4 semanas',
    difficulty: 'Fácil a Médio',
    stepByStep: [
      '1. Escolha um ramo saudável e viçoso com pelo menos 2 a 3 nós e folhas novas.',
      '2. Faça um corte diagonal cerca de 1 cm abaixo do nó com tesoura ou estilete esterilizado.',
      '3. Remova as folhas da parte inferior para direcionar a energia na formação de raízes.',
      '4. Coloque a ponta do corte em água limpa ou em substrato leve e aerado (com perlita e vermiculita).',
      '5. Mantenha em local aquecido, com luz indireta filtrada e umidade constante até o enraizamento.'
    ],
    proTips: 'Passe canela em pó na cicatriz do corte como antifúngico natural e mantenha o ambiente com boa umidade.'
  };
}

// IA Simulada Inteligente com catálogos botânicos detalhados incluindo Como Tirar Mudas
export function simulateSmartAiAnalysis() {
  const SIMULATED_RESULTS = [
    {
      commonName: 'Aglaonema (Café-de-Salão)',
      scientificName: 'Aglaonema commutatum',
      origin: 'Florestas Tropicais do Sudeste Asiático (Tailândia, Filipinas e Malásia)',
      plantType: 'Luz Indireta / Sombra Luminosa',
      healthStatus: 'Saudável & Vistosa',
      sunlight: {
        lightType: 'indireta',
        period: 'Luz Indireta / Sombra Luminosa',
        hoursPerDay: '4 a 6 horas de luz difusa',
        notes: 'Não usar luz natural direta! Evitar sol direto porque queima as folhas e desbota o padrão das cores.'
      },
      watering: {
        frequencyTimesPerWeek: 2,
        frequencyDays: 3,
        amountMl: '150 - 200 ml',
        description: 'Regar cerca de 2 vezes por semana. Deixar os primeiros centímetros de substrato secarem entre as regas.'
      },
      soilType: 'Substrato rico em matéria orgânica, bem aerado e com excelente drenagem (terra vegetal + perlita)',
      idealTemperature: '18°C a 27°C (gosta de clima quente e úmido; evitar temperaturas abaixo de 15°C)',
      howToCare: 'Retirar folhas secas ou amareladas cortando rente à base com tesoura limpa. Limpar a poeira das folhas com pano úmido para facilitar a respiração.',
      fertilizer: {
        type: 'NPK 10-10-10 líquido ou Húmus de Minhoca',
        frequency: 'A cada 30 a 45 dias na Primavera/Verão',
        notes: 'Aplicar após a rega normal.'
      },
      propagation: {
        method: 'Divisão de touceiras ou Estaquia de caule com nó',
        bestSeason: 'Primavera e Verão (clima quente)',
        rootingTime: '3 a 5 semanas',
        difficulty: 'Fácil',
        stepByStep: [
          '1. No replantio, retire a planta do vaso e separe com cuidado as brotações laterais que já tenham raízes.',
          '2. Se usar estaca de caule, corte um pedaço saudável de 10 cm com pelo menos 2 nós.',
          '3. Aplique canela em pó na cicatriz para evitar contaminação por fungos.',
          '4. Plante a muda em substrato leve (terra vegetal + fibra de coco + perlita) levemente umedecido.',
          '5. Deixe em local aquecido com luz difusa até que novas folhas comecem a abrir.'
        ],
        proTips: 'A divisão de touceira é o método mais garantido para Aglaonema, pois a nova muda já inicia com raízes formadas.'
      },
      careTips: [
        'Aprecia borrifação de água nas folhas se a umidade do ar estiver abaixo de 50%.',
        'Manter longe de saídas de ar condicionado.'
      ],
      notes: 'Excelente planta purificadora para apartamentos e escritórios.'
    },
    {
      commonName: 'Jiboia Amarela',
      scientificName: 'Epipremnum aureum',
      origin: 'Ilhas Salomão e Polinésia Francesa',
      plantType: 'Luz Indireta / Meia Sombra',
      healthStatus: 'Vigorosa',
      sunlight: {
        lightType: 'indireta',
        period: 'Luz Indireta / Sol da Manhã Suave',
        hoursPerDay: '4 a 6 horas',
        notes: 'Gosta de muita claridade indireta para manter as folhas manchadas de amarelo. Sol forte do meio-dia queima as folhas.'
      },
      watering: {
        frequencyTimesPerWeek: 2,
        frequencyDays: 3,
        amountMl: '150 - 250 ml',
        description: 'Regar 2 vezes por semana. Deixar a terra superficial secar antes de nova rega.'
      },
      soilType: 'Substrato fértil e leve (terra vegetal com perlita e casca de pinus)',
      idealTemperature: '18°C a 30°C (não tolera geada)',
      howToCare: 'Tirar folhas secas cortando na base. Podar as pontas longas para deixar a planta mais volumosa.',
      fertilizer: {
        type: 'NPK 10-10-10 ou Húmus',
        frequency: 'A cada 30 dias',
        notes: 'Aplicar na primavera/verão.'
      },
      propagation: {
        method: 'Estaquia de caule na água ou substrato',
        bestSeason: 'Qualquer época do ano (ideal Primavera/Verão)',
        rootingTime: '10 a 20 dias',
        difficulty: 'Muito Fácil',
        stepByStep: [
          '1. Escolha uma haste saudável e localize os nós (pequenas elevações ou raízes aéreas no caule).',
          '2. Faça um corte diagonal cerca de 1 cm abaixo de um nó, mantendo 2 a 3 folhas.',
          '3. Retire as folhas mais baixas para que apenas o nó fique em contato com a água.',
          '4. Coloque a estaca em um vidro com água limpa em local com claridade sem sol direto.',
          '5. Troque a água a cada 2 ou 3 dias. Ao atingir 4 cm de raiz, passe para um vaso com terra.'
        ],
        proTips: 'A Jiboia enraíza com extrema facilidade na água. Uma pitada de carvão vegetal na água evita odores.'
      },
      careTips: ['Pode ser cultivada pendente ou em suporte de fibra de coco.'],
      notes: 'Planta clássica e muito fácil de cultivar.'
    },
    {
      commonName: 'Manjericão Verde',
      scientificName: 'Ocimum basilicum',
      origin: 'Regiões Tropicais da Ásia Central e Índia',
      plantType: 'Sol Pleno (Luz Direta)',
      healthStatus: 'Saudável & Vigoroso',
      sunlight: {
        lightType: 'direta',
        period: 'Sol da Manhã Direto',
        hoursPerDay: '5 a 6 horas de sol direto',
        notes: 'Necessita de luz solar direta diária para concentrar seus óleos essenciais e manter o aroma intenso.'
      },
      watering: {
        frequencyTimesPerWeek: 3,
        frequencyDays: 2,
        amountMl: '150 - 200 ml',
        description: 'Regar de 3 a 4 vezes por semana no início da manhã. Manter o solo úmido sem encharcar as raízes.'
      },
      soilType: 'Solo fértil, fofo, rico em húmus e com boa drenagem',
      idealTemperature: '20°C a 30°C (muito sensível ao frio e geadas)',
      howToCare: 'Retirar flores assim que surgirem para manter a força nas folhas. Poda de beliscão (desponte) no topo para ramificar a planta.',
      fertilizer: {
        type: 'Húmus de Minhoca ou Adubo Orgânico Bokashi',
        frequency: 'A cada 20 a 30 dias',
        notes: 'Incorporar na terra superficial.'
      },
      propagation: {
        method: 'Estaquia de galho na água',
        bestSeason: 'Primavera e Verão',
        rootingTime: '7 a 12 dias',
        difficulty: 'Muito Fácil',
        stepByStep: [
          '1. Corte um ramo saudável de 10 a 12 cm de comprimento sem flores.',
          '2. Remova todas as folhas inferiores, deixando apenas 4 folhas no topo.',
          '3. Coloque o galho em um copo com água limpa perto de uma janela bem iluminada.',
          '4. Troque a água a cada 2 dias para manter bem oxigenada.',
          '5. Assim que as raízes atingirem 3 cm, plante em um vasinho com terra bem adubada.'
        ],
        proTips: 'Colher sempre cortando acima de um par de folhas; isso faz a planta soltar dois novos galhos no local!'
      },
      careTips: [
        'Evitar molhar as folhas ao regar no fim da tarde para prevenir fungos.',
        'Colher as folhas de cima para baixo.'
      ],
      notes: 'Planta aromática e culinária essencial.'
    },
    {
      commonName: 'Samambaia Americana',
      scientificName: 'Nephrolepis exaltata',
      origin: 'Florestas Tropicais Úmidas das Américas e Polinésia',
      plantType: 'Sombra / Luz Indireta',
      healthStatus: 'Folhagem Verde Vistosa',
      sunlight: {
        lightType: 'sombra',
        period: 'Sombra Luminosa / Luz Filtrada',
        hoursPerDay: 'Claridade indireta constante',
        notes: 'Nunca expor ao sol direto! O sol direto queima e seca as frondes rapidamente.'
      },
      watering: {
        frequencyTimesPerWeek: 3,
        frequencyDays: 2,
        amountMl: '200 - 300 ml',
        description: 'Regar cerca de 3 vezes por semana mantendo o solo sempre levemente úmido. Nunca deixar secar por completo.'
      },
      soilType: 'Substrato leve com alta retenção de umidade (composto orgânico + fibra de coco + casca de pinus)',
      idealTemperature: '18°C a 26°C (proteger de vento forte e ar condicionado)',
      howToCare: 'Podar e retirar folhas e ramos secos na base para dar espaço aos novos brotos. Borrifar água diariamente nas folhas em dias secos.',
      fertilizer: {
        type: 'Torta de Mamona com Farinha de Osso ou NPK 05-05-05',
        frequency: 'A cada 40 dias',
        notes: 'Aplicar nas laterais do vaso.'
      },
      propagation: {
        method: 'Divisão de touceira ou Estolões (estolhos com mudinhas)',
        bestSeason: 'Início da Primavera',
        rootingTime: '3 a 5 semanas',
        difficulty: 'Médio',
        stepByStep: [
          '1. Retire a samambaia do vaso e visualize onde a touceira se divide naturalmente.',
          '2. Com uma faca limpa, corte a raiz dividindo em 2 ou 3 partes com folhas e raízes saudáveis.',
          '3. Plante cada divisão em um vaso com substrato rico em fibra de coco e matéria orgânica.',
          '4. Regue abundantemente e deixe escorrer todo o excesso de água.',
          '5. Mantenha em local sombreado, quente e sem correntes de vento até novas brotações.'
        ],
        proTips: 'Borrifar água diariamente nas frondes das mudas recém-plantadas nos primeiros 15 dias acelera muito o pegamento.'
      },
      careTips: [
        'Ideal para cultivo em vasos suspensos em varandas protegidas ou banheiros bem iluminados.',
        'Girar o vaso a cada 2 meses para crescimento uniforme.'
      ],
      notes: 'Ajuda a umedecer o ar e trazer sensação de frescor ao ambiente.'
    }
  ];

  return SIMULATED_RESULTS[Math.floor(Math.random() * SIMULATED_RESULTS.length)];
}

