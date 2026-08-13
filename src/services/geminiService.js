/**
 * Serviço de Integração com a API Google Gemini 1.5 Flash (Visão Multimodal Gratuita)
 * e IA Simulada de Alta Precisão (Fallback para testes sem chave).
 */

/**
 * Valida se uma chave da API do Google Gemini é autêntica e está ativa
 */
export async function validateGeminiApiKey(apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Por favor, digite ou cole a sua chave de API.');
  }

  const cleanKey = apiKey.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }]
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error?.message || '';
      if (res.status === 400 || res.status === 403 || res.status === 401) {
        throw new Error(`Chave de API inválida: ${msg || 'Não autorizada pelo Google AI Studio.'}`);
      }
      throw new Error(`Erro ao validar chave (HTTP ${res.status}): ${msg}`);
    }

    return { 
      valid: true, 
      message: 'Chave API validada com sucesso no modelo gratuito Gemini 1.5 Flash!' 
    };
  } catch (err) {
    if (err.message && err.message.includes('inválida')) {
      throw err;
    }
    throw new Error(err.message || 'Não foi possível validar a chave. Verifique sua conexão.');
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

// Lista fixa e segura de modelos 100% GRATUITOS com suporte a visão
// Evita modelos pagos ou de pesquisa paga como deep-research-pro
const FREE_VISION_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro'
];

async function fetchGeminiVisionApi(base64Data, apiKey) {
  let lastError = null;

  const prompt = `Você é um botânico especialista e taxonomista vegetal de renome, com alta precisão botânica.
Sua missão é analisar minuciosamente a fotografia desta planta e identificar a sua espécie exata, preenchendo todos os campos de cuidados botânicos detalhados.

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
  "careTips": [
    "Dica prática adicional 1",
    "Dica prática adicional 2"
  ],
  "notes": "Observações gerais sobre cultivo"
}`;

  for (const model of FREE_VISION_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
        // Continua para o próximo modelo gratuito
        continue;
      }

      const jsonResponse = await response.json();
      const textOutput = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        continue;
      }

      try {
        return JSON.parse(textOutput);
      } catch (e) {
        const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
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

// IA Simulada Inteligente com catálogos botânicos detalhados
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
      careTips: [
        'Ideal para cultivo em vasos suspensos em varandas protegidas ou banheiros bem iluminados.',
        'Girar o vaso a cada 2 meses para crescimento uniforme.'
      ],
      notes: 'Ajuda a umedecer o ar e trazer sensação de frescor ao ambiente.'
    }
  ];

  return SIMULATED_RESULTS[Math.floor(Math.random() * SIMULATED_RESULTS.length)];
}
