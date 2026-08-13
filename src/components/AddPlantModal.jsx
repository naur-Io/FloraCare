import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  Edit3, 
  Check, 
  Loader2, 
  Image as ImageIcon, 
  Info,
  Globe,
  Sun,
  Droplets,
  Thermometer,
  Layers,
  Scissors,
  Flower,
  FileText,
  Search,
  ExternalLink
} from 'lucide-react';
import CameraCapture from './CameraCapture';
import { analyzePlantImage } from '../services/geminiService';
import { getStoredApiKey } from '../services/storageService';

export default function AddPlantModal({ onClose, onSavePlant, onOpenKeyModal, hasApiKey }) {
  const [photo, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState('choose_photo'); // 'choose_photo' | 'form'
  const [aiNotice, setAiNotice] = useState(null);
  
  // Dados completos do formulário da planta
  const [plantData, setPlantData] = useState({
    commonName: '',
    scientificName: '',
    origin: '',
    plantType: 'Luz Indireta / Meia Sombra',
    sunlight: {
      lightType: 'indireta', // 'direta' | 'indireta' | 'sombra'
      period: 'Luz Indireta Filtrada / Meia Sombra',
      hoursPerDay: '4 a 6 horas',
      notes: ''
    },
    watering: {
      frequencyTimesPerWeek: 2,
      frequencyDays: 3,
      amountMl: '150 - 200 ml',
      description: 'Regar quando a terra superficial secar.'
    },
    soilType: 'Solo rico em matéria orgânica, leve e com boa drenagem',
    idealTemperature: '18°C a 27°C (clima ameno a quente)',
    howToCare: 'Retirar folhas secas ou amareladas cortando na base com tesoura limpa. Limpar a poeira das folhas periodicamente.',
    fertilizer: {
      type: 'NPK 10-10-10 ou Húmus de Minhoca',
      frequency: 'A cada 30 dias na Primavera/Verão',
      notes: 'Diluir na água da rega'
    },
    careTips: ['Manter em local bem arejado', 'Borrifar água nas folhas se o ar estiver seco'],
    notes: ''
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (capturedBase64) => {
    setPhoto(capturedBase64);
    setShowCamera(false);
  };

  const handleFrequencyTimesChange = (times) => {
    const num = parseInt(times) || 1;
    let days = 3;
    if (num <= 1) days = 7;
    else if (num === 2) days = 3;
    else if (num === 3) days = 2;
    else days = 1;

    setPlantData(prev => ({
      ...prev,
      watering: {
        ...prev.watering,
        frequencyTimesPerWeek: num,
        frequencyDays: days
      }
    }));
  };

  const runAiAnalysis = async () => {
    if (!photo) return;
    setIsAnalyzing(true);
    setAiNotice(null);
    try {
      const apiKey = getStoredApiKey();
      const result = await analyzePlantImage(photo, apiKey);
      
      if (result._isFallback) {
        setAiNotice('Sua chave foi direcionada para a demonstração botânica. Você pode ajustar todos os campos abaixo livremente!');
      }

      setPlantData(prev => ({
        ...prev,
        commonName: result.commonName || prev.commonName || 'Planta Identificada',
        scientificName: result.scientificName || prev.scientificName || '',
        origin: result.origin || prev.origin || '',
        plantType: result.plantType || prev.plantType || 'Luz Indireta / Meia Sombra',
        sunlight: {
          lightType: result.sunlight?.lightType || (result.sunlight?.period?.toLowerCase().includes('direto') ? 'direta' : result.sunlight?.period?.toLowerCase().includes('sombra') ? 'sombra' : 'indireta'),
          period: result.sunlight?.period || prev.sunlight.period,
          hoursPerDay: result.sunlight?.hoursPerDay || prev.sunlight.hoursPerDay,
          notes: result.sunlight?.notes || result.sunlight?.habits || prev.sunlight.notes
        },
        watering: {
          frequencyTimesPerWeek: result.watering?.frequencyTimesPerWeek || (result.watering?.frequencyDays <= 2 ? 3 : result.watering?.frequencyDays <= 4 ? 2 : 1),
          frequencyDays: result.watering?.frequencyDays || prev.watering.frequencyDays,
          amountMl: result.watering?.amountMl || prev.watering.amountMl,
          description: result.watering?.description || prev.watering.description
        },
        soilType: result.soilType || prev.soilType,
        idealTemperature: result.idealTemperature || prev.idealTemperature,
        howToCare: result.howToCare || (Array.isArray(result.careTips) ? result.careTips.join('\n') : prev.howToCare),
        fertilizer: {
          type: result.fertilizer?.type || prev.fertilizer.type,
          frequency: result.fertilizer?.frequency || prev.fertilizer.frequency,
          notes: result.fertilizer?.notes || prev.fertilizer.notes
        },
        careTips: result.careTips || prev.careTips,
        notes: result.notes || prev.notes
      }));

      setStep('form');
    } catch (err) {
      alert(`Não foi possível conectar à IA Gemini (${err.message || 'Erro de conexão'}).\n\nCarregamos os campos para preenchimento manual.`);
      setStep('form');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualEntry = () => {
    setStep('form');
  };

  const openGoogleLens = () => {
    window.open('https://lens.google.com/', '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePlant({
      ...plantData,
      photoUrl: photo || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
      lastWatered: new Date().toISOString()
    });
    onClose();
  };

  return (
    <>
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
          <div className="modal-header">
            <h3 className="modal-title">
              {step === 'choose_photo' ? 'Adicionar Nova Planta' : 'Cadastrar Dados da Planta'}
            </h3>
            <button className="modal-close" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {step === 'choose_photo' ? (
              <div>
                {/* Banner Informativo sobre Modo IA vs Simulação */}
                {hasApiKey ? (
                  <div className="ai-mode-banner active">
                    <Sparkles size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>IA Gemini Flash 100% Gratuita Ativa</strong>
                      <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                        Sua foto será analisada pelo modelo gratuito Gemini 1.5 Flash do Google.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="ai-mode-banner simulated">
                    <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>Modo de Demonstração Botânica</strong>
                      <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                        Você pode usar o catálogo botânico ou{' '}
                        <button 
                          type="button" 
                          className="inline-link-btn" 
                          onClick={() => {
                            onClose();
                            onOpenKeyModal?.();
                          }}
                        >
                          conectar chave gratuita do Gemini
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* Visualizador de Foto Selecionada */}
                {photo ? (
                  <div style={{ width: '100%' }}>
                    <div className="preview-img-container">
                      <img src={photo} alt="Foto da planta" className="preview-img" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                      <button 
                        type="button"
                        className="btn btn-primary"
                        onClick={runAiAnalysis}
                        disabled={isAnalyzing}
                        style={{ width: '100%', padding: '12px 16px', fontSize: '0.95rem' }}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                            <span>Identificando Espécie com IA...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            <span>Identificar com IA Gemini Grátis</span>
                          </>
                        )}
                      </button>

                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={openGoogleLens}
                        style={{ width: '100%', padding: '10px', gap: '8px' }}
                      >
                        <Search size={16} color="#4285F4" />
                        <span>Identificar no Google Lens</span>
                        <ExternalLink size={14} style={{ opacity: 0.6 }} />
                      </button>

                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setPhoto(null)}
                        disabled={isAnalyzing}
                        style={{ width: '100%', padding: '10px' }}
                      >
                        <ImageIcon size={16} />
                        <span>Tirar ou Escolher Outra Foto</span>
                      </button>
                    </div>

                    {/* Dica para iPhone */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#475569', marginBottom: '14px' }}>
                      💡 <strong>Dica no iPhone:</strong> Você também pode abrir a foto no app <em>Fotos</em> do iPhone e tocar no botão ℹ️ (com estrelas/folha) para ver o nome da espécie identificado nativamente pela Apple!
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <button 
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleManualEntry}
                        style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
                      >
                        Ou continuar para preenchimento manual
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Zona de Escolha de Foto (Câmera ou Arquivo) */
                  <div>
                    <div className="upload-zone" onClick={() => setShowCamera(true)}>
                      <Camera className="upload-icon" />
                      <h4 style={{ color: 'var(--primary-900)', marginBottom: '4px' }}>Tirar Foto da Planta</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Use a câmera do celular ou computador para foto instantânea
                      </p>
                    </div>

                    <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                      OU SELECIONE DO SEU DISPOSITIVO
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px', cursor: 'pointer' }}>
                        <Upload size={18} />
                        <span>Escolher Imagem da Galeria</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                          style={{ display: 'none' }}
                        />
                      </label>

                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={openGoogleLens}
                        style={{ width: '100%', justifyContent: 'center', padding: '11px', gap: '8px' }}
                      >
                        <Search size={16} color="#4285F4" />
                        <span>Abrir Google Lens</span>
                        <ExternalLink size={14} style={{ opacity: 0.6 }} />
                      </button>
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                      <button 
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleManualEntry}
                        style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
                      >
                        Cadastrar Planta Manualmente sem Foto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* FORMULÁRIO DE ENTRADA MANUAL COM TODOS OS CAMPOS SOLICITADOS */
              <form onSubmit={handleSubmit} className="plant-manual-form">
                {aiNotice && (
                  <div className="ai-mode-banner simulated" style={{ marginBottom: '10px' }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{aiNotice}</span>
                  </div>
                )}

                {/* 1. IDENTIFICAÇÃO E ORIGEM */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Globe size={18} className="section-icon" />
                    <h4>Identificação & Origem</h4>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nome da Planta / Nome Popular *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={plantData.commonName} 
                        onChange={e => setPlantData({ ...plantData, commonName: e.target.value })}
                        placeholder="Ex: Aglaonema, Jiboia Amarela, Espada de São Jorge"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nome Científico (Botânico)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={plantData.scientificName} 
                        onChange={e => setPlantData({ ...plantData, scientificName: e.target.value })}
                        placeholder="Ex: Aglaonema commutatum"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">De Onde Vem a Planta (Origem Nativa)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={plantData.origin || ''} 
                      onChange={e => setPlantData({ ...plantData, origin: e.target.value })}
                      placeholder="Ex: Florestas Tropicais do Sudeste Asiático (Tailândia, Filipinas)"
                    />
                  </div>
                </div>

                {/* 2. ILUMINAÇÃO & LUZ */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Sun size={18} className="section-icon" color="#d97706" />
                    <h4>Iluminação & Quantidade de Luz</h4>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Quantidade de Luz *</label>
                      <select 
                        className="form-select"
                        value={plantData.sunlight?.lightType || 'indireta'}
                        onChange={e => setPlantData({
                          ...plantData,
                          sunlight: { ...plantData.sunlight, lightType: e.target.value }
                        })}
                      >
                        <option value="direta">☀️ Luz Direta (Sol Pleno / Sol Forte)</option>
                        <option value="indireta">⛅ Luz Indireta (Meia Sombra / Luz Difusa)</option>
                        <option value="sombra">☁️ Sombra (Luz Baixa / Filtrada)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Horas / Período de Exposição</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={plantData.sunlight?.hoursPerDay || ''} 
                        onChange={e => setPlantData({
                          ...plantData,
                          sunlight: { ...plantData.sunlight, hoursPerDay: e.target.value }
                        })}
                        placeholder="Ex: 4 a 6 horas de claridade difusa"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Observações sobre a Iluminação</label>
                    <textarea 
                      className="form-textarea" 
                      rows="2"
                      value={plantData.sunlight?.notes || ''} 
                      onChange={e => setPlantData({
                        ...plantData,
                        sunlight: { ...plantData.sunlight, notes: e.target.value }
                      })}
                      placeholder="Ex: Não usar luz natural direta, evitar sol direto porque queima as folhas..."
                    />
                  </div>
                </div>

                {/* 3. REGA & QUANTIDADE DE ÁGUA */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Droplets size={18} className="section-icon" color="#0284c7" />
                    <h4>Rega & Quantidade de Água</h4>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Frequência (Vezes por semana)</label>
                      <select 
                        className="form-select"
                        value={plantData.watering?.frequencyTimesPerWeek || 2}
                        onChange={e => handleFrequencyTimesChange(e.target.value)}
                      >
                        <option value="1">1 vez por semana (~ a cada 7 dias)</option>
                        <option value="2">2 vezes por semana (~ a cada 3-4 dias)</option>
                        <option value="3">3 vezes por semana (~ a cada 2 dias)</option>
                        <option value="4">4 vezes por semana ou diária</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantidade de Água por Rega</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={plantData.watering?.amountMl || ''} 
                        onChange={e => setPlantData({
                          ...plantData,
                          watering: { ...plantData.watering, amountMl: e.target.value }
                        })}
                        placeholder="Ex: 150 - 200 ml"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Observações e Modo de Rega</label>
                    <textarea 
                      className="form-textarea" 
                      rows="2"
                      value={plantData.watering?.description || ''} 
                      onChange={e => setPlantData({
                        ...plantData,
                        watering: { ...plantData.watering, description: e.target.value }
                      })}
                      placeholder="Ex: Regar quando os primeiros 2cm de solo secarem. Não deixar água acumulada no prato..."
                    />
                  </div>
                </div>

                {/* 4. SOLO, TEMPERATURA & CLIMA */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Layers size={18} className="section-icon" color="#795548" />
                    <h4>Solo & Temperatura</h4>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipo de Solo que ela mais gosta</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={plantData.soilType || ''} 
                      onChange={e => setPlantData({ ...plantData, soilType: e.target.value })}
                      placeholder="Ex: Solo rico em matéria orgânica, bem drenado, com terra vegetal e perlita"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temperatura que a planta gosta (Clima)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={plantData.idealTemperature || ''} 
                      onChange={e => setPlantData({ ...plantData, idealTemperature: e.target.value })}
                      placeholder="Ex: 18°C a 27°C (clima quente e úmido, não tolera frio abaixo de 15°C)"
                    />
                  </div>
                </div>

                {/* 5. COMO CUIDAR, PODAS & RETIRADA DE FOLHAS */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Scissors size={18} className="section-icon" color="#059669" />
                    <h4>Como Cuidar & Manutenção</h4>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Como cuidar (Tirar folhas secas, podas, limpeza)</label>
                    <textarea 
                      className="form-textarea" 
                      rows="3"
                      value={plantData.howToCare || ''} 
                      onChange={e => setPlantData({ ...plantData, howToCare: e.target.value })}
                      placeholder="Ex: Retirar folhas secas ou amareladas cortando na base com tesoura limpa. Limpar o pó das folhas com pano úmido..."
                    />
                  </div>
                </div>

                {/* 6. ADUBAÇÃO & OBSERVAÇÕES EXTRAS */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Flower size={18} className="section-icon" color="#9333ea" />
                    <h4>Adubação & Observações Gerais</h4>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Tipo de Adubo</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={plantData.fertilizer?.type || ''} 
                        onChange={e => setPlantData({
                          ...plantData,
                          fertilizer: { ...plantData.fertilizer, type: e.target.value }
                        })}
                        placeholder="Ex: NPK 10-10-10, Húmus de Minhoca, Bokashi"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Frequência de Adubação</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={plantData.fertilizer?.frequency || ''} 
                        onChange={e => setPlantData({
                          ...plantData,
                          fertilizer: { ...plantData.fertilizer, frequency: e.target.value }
                        })}
                        placeholder="Ex: A cada 30 dias na Primavera/Verão"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Observações Adicionais</label>
                    <textarea 
                      className="form-textarea" 
                      rows="2"
                      value={plantData.notes || ''} 
                      onChange={e => setPlantData({ ...plantData, notes: e.target.value })}
                      placeholder="Ex: Evitar correntes de ar, excelente para purificar o ambiente..."
                    />
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', position: 'sticky', bottom: 0, background: 'var(--surface)', padding: '12px 0', borderTop: '1px solid var(--border-color)' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setStep('choose_photo')}
                  >
                    Voltar
                  </button>

                  <button type="submit" className="btn btn-primary">
                    <Check size={16} />
                    <span>Salvar no Meu Jardim</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
