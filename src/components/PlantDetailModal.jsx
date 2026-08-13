import React, { useState } from 'react';
import { X, Edit3, Save, Trash2, Droplets, Sun, Sparkles, AlertTriangle, ShieldCheck, Flower, Calendar } from 'lucide-react';

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {isEditing ? 'Editar Informações da Planta' : plant.commonName}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isEditing && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={16} />
                <span>Editar</span>
              </button>
            )}
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* MODO EDIÇÃO MANUAL COMPLETA */}
          {isEditing ? (
            <form onSubmit={handleSaveSubmit}>
              <div className="form-group">
                <label className="form-label">Nome Popular</label>
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

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Frequência de Rega (Dias)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="form-input"
                    value={formData.watering?.frequencyDays || 3}
                    onChange={e => handleNestedChange('watering', 'frequencyDays', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantidade de Água por Rega</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={formData.watering?.amountMl || ''}
                    onChange={e => handleNestedChange('watering', 'amountMl', e.target.value)}
                    placeholder="Ex: 200 ml"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Período de Sol Ideal</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={formData.sunlight?.period || ''}
                    onChange={e => handleNestedChange('sunlight', 'period', e.target.value)}
                    placeholder="Ex: Sol da Manhã / Meia Sombra"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Horas de Sol Diárias</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={formData.sunlight?.hoursPerDay || ''}
                    onChange={e => handleNestedChange('sunlight', 'hoursPerDay', e.target.value)}
                    placeholder="Ex: 4 a 6 horas"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Adubo Recomendado</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={formData.fertilizer?.type || ''}
                  onChange={e => handleNestedChange('fertilizer', 'type', e.target.value)}
                  placeholder="Ex: NPK 10-10-10, Húmus de Minhoca, Bokashi"
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

              <div className="form-group">
                <label className="form-label">Observações e Dicas de Cuidados</label>
                <textarea 
                  className="form-textarea"
                  rows="3"
                  value={Array.isArray(formData.careTips) ? formData.careTips.join('\n') : formData.careTips || ''}
                  onChange={e => handleInputChange('careTips', e.target.value.split('\n'))}
                  placeholder="Digite cada dica em uma nova linha..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
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
            /* MODO VISUALIZAÇÃO DETALHADA */
            <div>
              <div className="preview-img-container">
                <img 
                  src={plant.photoUrl} 
                  alt={plant.commonName} 
                  className="preview-img"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary-900)' }}>
                  {plant.commonName}
                </h2>
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  {plant.scientificName || 'Espécie não cadastrada'}
                </p>
              </div>

              {/* Grid de Cartões de Cuidados */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                
                {/* Cartão de Rega */}
                <div style={{ background: 'var(--accent-water-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: '700', marginBottom: '8px' }}>
                    <Droplets size={20} />
                    <span>Plano de Rega</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <strong>Frequência:</strong> A cada {plant.watering?.frequencyDays || 3} dias
                  </p>
                  <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <strong>Volume:</strong> {plant.watering?.amountMl || 'Moderado'}
                  </p>
                  {plant.watering?.description && (
                    <p style={{ fontSize: '0.8rem', color: '#075985', marginTop: '6px' }}>
                      {plant.watering.description}
                    </p>
                  )}
                </div>

                {/* Cartão de Sol */}
                <div style={{ background: 'var(--accent-sun-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: '700', marginBottom: '8px' }}>
                    <Sun size={20} />
                    <span>Exposição Solar</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <strong>Período:</strong> {plant.sunlight?.period || 'Sol da Manhã / Meia Sombra'}
                  </p>
                  <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <strong>Exposição:</strong> {plant.sunlight?.hoursPerDay || '4 a 6 horas'}
                  </p>
                  {plant.sunlight?.habits && (
                    <p style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '6px' }}>
                      {plant.sunlight.habits}
                    </p>
                  )}
                </div>

                {/* Cartão de Adubação */}
                <div style={{ background: 'var(--accent-fertilizer-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #e9d5ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b21a8', fontWeight: '700', marginBottom: '8px' }}>
                    <Flower size={20} />
                    <span>Adubação & Nutrição</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <strong>Tipo:</strong> {plant.fertilizer?.type || 'NPK Orgânico'}
                  </p>
                  <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <strong>Periodicidade:</strong> {plant.fertilizer?.frequency || 'A cada 30 dias'}
                  </p>
                </div>
              </div>

              {/* Dicas de Cuidados */}
              {plant.careTips && plant.careTips.length > 0 && (
                <div style={{ background: 'var(--primary-50)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                  <h4 style={{ color: 'var(--primary-900)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="var(--primary-600)" />
                    Dicas Práticas de Cultivo
                  </h4>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {plant.careTips.map((tip, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ações da Ficha */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
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
