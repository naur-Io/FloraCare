import React, { useState } from 'react';
import { X, Camera, Upload, Sparkles, Edit3, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { analyzePlantImage } from '../services/geminiService';
import { getStoredApiKey } from '../services/storageService';

export default function AddPlantModal({ onClose, onSavePlant }) {
  const [photo, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState('choose_photo'); // 'choose_photo' | 'form'
  
  // Dados do formulário da planta
  const [plantData, setPlantData] = useState({
    commonName: '',
    scientificName: '',
    plantType: 'Diurna / Sol da Manhã',
    watering: {
      frequencyDays: 3,
      amountMl: '150 - 200 ml',
      description: 'Regar quando a terra superficial secar.'
    },
    sunlight: {
      period: 'Sol da Manhã / Meia Sombra',
      hoursPerDay: '4 a 6 horas',
      habits: 'Ideal para ambientes internos iluminados.'
    },
    fertilizer: {
      type: 'NPK 10-10-10 ou Húmus de Minhoca',
      frequency: 'A cada 30 dias na Primavera',
      notes: 'Adubar nos meses mais quentes.'
    },
    careTips: ['Manter em local bem arejado', 'Borrifar água nas folhas se o ar estiver seco']
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

  const runAiAnalysis = async () => {
    if (!photo) return;
    setIsAnalyzing(true);
    try {
      const apiKey = getStoredApiKey();
      const result = await analyzePlantImage(photo, apiKey);
      
      setPlantData(prev => ({
        ...prev,
        commonName: result.commonName || 'Planta Desconhecida',
        scientificName: result.scientificName || '',
        plantType: result.plantType || 'Diurna / Meia Sombra',
        watering: result.watering || prev.watering,
        sunlight: result.sunlight || prev.sunlight,
        fertilizer: result.fertilizer || prev.fertilizer,
        careTips: result.careTips || prev.careTips
      }));

      setStep('form');
    } catch (err) {
      alert('Não foi possível analisar a imagem. Você pode preencher as informações manualmente!');
      setStep('form');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualEntry = () => {
    setStep('form');
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
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              {step === 'choose_photo' ? 'Adicionar Nova Planta' : 'Revisar & Salvar Planta'}
            </h3>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {step === 'choose_photo' ? (
              <div>
                {/* Visualizador de Foto Selecionada */}
                {photo ? (
                  <div>
                    <div className="preview-img-container">
                      <img src={photo} alt="Foto da planta" className="preview-img" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setPhoto(null)}
                      >
                        <ImageIcon size={16} />
                        <span>Trocar Foto</span>
                      </button>

                      <button 
                        className="btn btn-primary"
                        onClick={runAiAnalysis}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="spinner" />
                            <span>Analisando com IA...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            <span>Ler com IA Gemini</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={handleManualEntry}
                        style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
                      >
                        Ou preencher informações manualmente sem IA
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

                    <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                      <Upload size={18} />
                      <span>Escolher Imagem da Galeria</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        style={{ display: 'none' }}
                      />
                    </label>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                      <button 
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
              /* PASSO DE REVISÃO E EDIÇÃO MANUAL DOS DADOS */
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nome Popular da Planta *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={plantData.commonName} 
                    onChange={e => setPlantData({ ...plantData, commonName: e.target.value })}
                    placeholder="Ex: Jiboia Amarela, Espada de São Jorge"
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
                    placeholder="Ex: Epipremnum aureum"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Frequência de Rega (Dias)</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="form-input" 
                      value={plantData.watering?.frequencyDays || 3} 
                      onChange={e => setPlantData({
                        ...plantData,
                        watering: { ...plantData.watering, frequencyDays: parseInt(e.target.value) || 1 }
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantidade de Água</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={plantData.watering?.amountMl || ''} 
                      onChange={e => setPlantData({
                        ...plantData,
                        watering: { ...plantData.watering, amountMl: e.target.value }
                      })}
                      placeholder="Ex: 200 ml"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Período de Sol</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={plantData.sunlight?.period || ''} 
                      onChange={e => setPlantData({
                        ...plantData,
                        sunlight: { ...plantData.sunlight, period: e.target.value }
                      })}
                      placeholder="Ex: Sol da Manhã / Meia Sombra"
                    />
                  </div>

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
                      placeholder="Ex: NPK 10-10-10, Húmus"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
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
