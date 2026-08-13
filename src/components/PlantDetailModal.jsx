import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Save, 
  Trash2, 
  Droplets, 
  Sun, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Flower, 
  Calendar,
  Globe,
  Thermometer,
  Layers,
  Scissors,
  FileText,
  Clock,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function PlantDetailModal({ plant, onClose, onSave, onDelete, onWater }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...plant });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleFrequencyTimesChange = (times) => {
    const num = parseInt(times) || 1;
    let days = 3;
    if (num <= 1) days = 7;
    else if (num === 2) days = 3;
    else if (num === 3) days = 2;
    else days = 1;

    setFormData(prev => ({
      ...prev,
      watering: {
        ...prev.watering,
        frequencyTimesPerWeek: num,
        frequencyDays: days
      }
    }));
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja remover ${plant.commonName} do seu jardim?`)) {
      onDelete(plant.id);
      onClose();
    }
  };

  // Helper para formatar o badge de tipo de luz
  const getLightInfo = (lightType, period) => {
    const type = lightType || (period?.toLowerCase().includes('direto') ? 'direta' : period?.toLowerCase().includes('sombra') ? 'sombra' : 'indireta');
    if (type === 'direta') {
      return { label: '☀️ Luz Direta (Sol Pleno)', color: '#b45309', bg: '#fef3c7', border: '#fde68a' };
    }
    if (type === 'sombra') {
      return { label: '☁️ Sombra (Luz Baixa / Filtrada)', color: '#374151', bg: '#f3f4f6', border: '#e5e7eb' };
    }
    return { label: '⛅ Luz Indireta (Meia Sombra / Difusa)', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' };
  };

  const lightStyle = getLightInfo(plant.sunlight?.lightType, plant.sunlight?.period);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div className="modal-title">
            {isEditing ? 'Editar Ficha Botânica' : plant.commonName}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!isEditing && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFormData({ ...plant });
                  setIsEditing(true);
                }}
              >
                <Edit3 size={16} />
                <span>Editar</span>
              </button>
            )}
            <button className="modal-close" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* MODO EDIÇÃO MANUAL COMPLETA */}
          {isEditing ? (
            <form onSubmit={handleSaveSubmit} className="plant-manual-form">
              
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
                      value={formData.commonName || ''}
                      onChange={e => handleInputChange('commonName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nome Científico (Botânico)</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.scientificName || ''}
                      onChange={e => handleInputChange('scientificName', e.target.value)}
                      placeholder="Ex: Epipremnum aureum"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">De Onde Vem a Planta (Origem Nativa)</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={formData.origin || ''}
                    onChange={e => handleInputChange('origin', e.target.value)}
                    placeholder="Ex: Sudeste Asiático, Florestas do Brasil, México..."
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
                    <label className="form-label">Quantidade de Luz</label>
                    <select 
                      className="form-select"
                      value={formData.sunlight?.lightType || 'indireta'}
                      onChange={e => handleNestedChange('sunlight', 'lightType', e.target.value)}
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
                      value={formData.sunlight?.hoursPerDay || formData.sunlight?.period || ''}
                      onChange={e => handleNestedChange('sunlight', 'hoursPerDay', e.target.value)}
                      placeholder="Ex: 4 a 6 horas diárias de luz filtrada"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Observações sobre a Iluminação</label>
                  <textarea 
                    className="form-textarea"
                    rows="2"
                    value={formData.sunlight?.notes || ''}
                    onChange={e => handleNestedChange('sunlight', 'notes', e.target.value)}
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
                    <label className="form-label">Frequência (Vezes por Semana)</label>
                    <select 
                      className="form-select"
                      value={formData.watering?.frequencyTimesPerWeek || (formData.watering?.frequencyDays <= 2 ? 3 : formData.watering?.frequencyDays <= 4 ? 2 : 1)}
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
                      value={formData.watering?.amountMl || ''}
                      onChange={e => handleNestedChange('watering', 'amountMl', e.target.value)}
                      placeholder="Ex: 150 - 200 ml"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Observações e Modo de Rega</label>
                  <textarea 
                    className="form-textarea"
                    rows="2"
                    value={formData.watering?.description || ''}
                    onChange={e => handleNestedChange('watering', 'description', e.target.value)}
                    placeholder="Ex: Deixar o solo secar entre as regas..."
                  />
                </div>
              </div>

              {/* 4. SOLO & TEMPERATURA */}
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
                    value={formData.soilType || ''}
                    onChange={e => handleInputChange('soilType', e.target.value)}
                    placeholder="Ex: Solo rico em matéria orgânica, bem drenado, com perlita"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temperatura que a planta gosta (Clima)</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={formData.idealTemperature || ''}
                    onChange={e => handleInputChange('idealTemperature', e.target.value)}
                    placeholder="Ex: 18°C a 27°C (clima quente e úmido, proteger do frio)"
                  />
                </div>
              </div>

              {/* 5. COMO CUIDAR & MANUTENÇÃO */}
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
                    value={formData.howToCare || (Array.isArray(formData.careTips) ? formData.careTips.join('\n') : '')}
                    onChange={e => handleInputChange('howToCare', e.target.value)}
                    placeholder="Ex: Retirar folhas secas ou amareladas na base com tesoura limpa. Limpar o pó das folhas..."
                  />
                </div>
              </div>

              {/* 6. ADUBAÇÃO & OBSERVAÇÕES */}
              <div className="form-section">
                <div className="form-section-header">
                  <Flower size={18} className="section-icon" color="#9333ea" />
                  <h4>Adubação & Observações Adicionais</h4>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo de Adubo</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.fertilizer?.type || ''}
                      onChange={e => handleNestedChange('fertilizer', 'type', e.target.value)}
                      placeholder="Ex: NPK 10-10-10, Húmus de Minhoca"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Frequência de Adubação</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.fertilizer?.frequency || ''}
                      onChange={e => handleNestedChange('fertilizer', 'frequency', e.target.value)}
                      placeholder="Ex: A cada 30 dias na Primavera"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Observações Gerais</label>
                  <textarea 
                    className="form-textarea"
                    rows="2"
                    value={formData.notes || ''}
                    onChange={e => handleInputChange('notes', e.target.value)}
                    placeholder="Outras observações importantes..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px', position: 'sticky', bottom: 0, background: 'var(--surface)', padding: '12px 0', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Save size={16} />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          ) : (
            /* MODO VISUALIZAÇÃO DETALHADA BOTÂNICA */
            <div>
              <div className="preview-img-container">
                <img 
                  src={plant.photoUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'} 
                  alt={plant.commonName} 
                  className="preview-img"
                />
              </div>

              {/* Título & Origem */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: 'var(--primary-900)' }}>
                    {plant.commonName}
                  </h2>
                </div>

                {plant.scientificName && (
                  <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '2px' }}>
                    {plant.scientificName}
                  </p>
                )}

                {plant.origin && (
                  <div className="plant-origin-badge">
                    <Globe size={14} />
                    <span><strong>Origem:</strong> {plant.origin}</span>
                  </div>
                )}
              </div>

              {/* Grid de Cartões de Cuidados Completos */}
              <div className="plant-details-grid">
                
                {/* 1. CARTÃO DE ILUMINAÇÃO */}
                <div className="detail-card detail-card-sun">
                  <div className="detail-card-header sun-header">
                    <Sun size={18} />
                    <span>Iluminação & Luz</span>
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <span 
                      className="badge" 
                      style={{ 
                        background: lightStyle.bg, 
                        color: lightStyle.color, 
                        border: `1px solid ${lightStyle.border}`,
                        fontSize: '0.78rem',
                        padding: '4px 10px'
                      }}
                    >
                      {lightStyle.label}
                    </span>
                  </div>

                  {(plant.sunlight?.hoursPerDay || plant.sunlight?.period) && (
                    <p className="detail-field">
                      <strong>Exposição:</strong> {plant.sunlight?.hoursPerDay || plant.sunlight?.period}
                    </p>
                  )}

                  {(plant.sunlight?.notes || plant.sunlight?.habits) && (
                    <div className="detail-notice detail-notice-sun">
                      <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{plant.sunlight.notes || plant.sunlight.habits}</span>
                    </div>
                  )}
                </div>

                {/* 2. CARTÃO DE REGA */}
                <div className="detail-card detail-card-water">
                  <div className="detail-card-header water-header">
                    <Droplets size={18} />
                    <span>Plano de Rega & Água</span>
                  </div>

                  <p className="detail-field">
                    <strong>Frequência:</strong> {
                      plant.watering?.frequencyTimesPerWeek 
                        ? `${plant.watering.frequencyTimesPerWeek}x por semana (a cada ~${plant.watering?.frequencyDays || 3} dias)` 
                        : `A cada ${plant.watering?.frequencyDays || 3} dias`
                    }
                  </p>

                  <p className="detail-field">
                    <strong>Volume de Água:</strong> {plant.watering?.amountMl || '150 - 200 ml'}
                  </p>

                  {plant.watering?.description && (
                    <p className="detail-subtext water-subtext">
                      {plant.watering.description}
                    </p>
                  )}
                </div>

                {/* 3. CARTÃO DE SOLO & SUBSTRATO */}
                <div className="detail-card detail-card-soil">
                  <div className="detail-card-header soil-header">
                    <Layers size={18} />
                    <span>Solo & Substrato Ideal</span>
                  </div>
                  <p className="detail-subtext soil-subtext">
                    {plant.soilType || 'Substrato leve, rico em matéria orgânica com boa drenagem.'}
                  </p>
                </div>

                {/* 4. CARTÃO DE TEMPERATURA & CLIMA */}
                <div className="detail-card detail-card-temp">
                  <div className="detail-card-header temp-header">
                    <Thermometer size={18} />
                    <span>Temperatura & Clima</span>
                  </div>
                  <p className="detail-subtext temp-subtext">
                    {plant.idealTemperature || '18°C a 28°C (proteger de geadas e frio excessivo)'}
                  </p>
                </div>

                {/* 5. CARTÃO DE COMO CUIDAR & MANUTENÇÃO */}
                <div className="detail-card detail-card-care" style={{ gridColumn: '1 / -1' }}>
                  <div className="detail-card-header care-header">
                    <Scissors size={18} />
                    <span>Como Cuidar & Manutenção (Podas / Folhas Secas)</span>
                  </div>
                  <p className="detail-subtext care-subtext" style={{ whiteSpace: 'pre-line' }}>
                    {plant.howToCare || (Array.isArray(plant.careTips) && plant.careTips.length > 0 ? plant.careTips.join('\n') : 'Retirar folhas secas ou amareladas na base para estimular novos brotos e manter a planta saudável.')}
                  </p>
                </div>

                {/* 6. CARTÃO DE ADUBAÇÃO */}
                {(plant.fertilizer?.type || plant.fertilizer?.frequency) && (
                  <div className="detail-card detail-card-fertilizer" style={{ gridColumn: '1 / -1' }}>
                    <div className="detail-card-header fertilizer-header">
                      <Flower size={18} />
                      <span>Adubação & Nutrição</span>
                    </div>
                    <p className="detail-field">
                      <strong>Tipo de Adubo:</strong> {plant.fertilizer?.type || 'NPK 10-10-10 ou Húmus de Minhoca'}
                    </p>
                    <p className="detail-field">
                      <strong>Periodicidade:</strong> {plant.fertilizer?.frequency || 'A cada 30 dias na Primavera/Verão'}
                    </p>
                    {plant.fertilizer?.notes && (
                      <p className="detail-subtext fertilizer-subtext">
                        {plant.fertilizer.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* 7. OBSERVAÇÕES GERAIS */}
                {plant.notes && (
                  <div className="detail-card detail-card-notes" style={{ gridColumn: '1 / -1' }}>
                    <div className="detail-card-header notes-header">
                      <FileText size={18} />
                      <span>Observações Gerais</span>
                    </div>
                    <p className="detail-subtext">
                      {plant.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Ações da Ficha */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={handleDelete}
                  style={{ color: 'var(--accent-danger)', borderColor: '#fca5a5' }}
                >
                  <Trash2 size={16} />
                  <span>Remover</span>
                </button>

                <button 
                  className="btn btn-accent-water"
                  onClick={() => {
                    onWater(plant.id);
                    onClose();
                  }}
                >
                  <Droplets size={16} />
                  <span>Marcar como Regada Hoje</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
