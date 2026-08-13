import React, { useState, useEffect } from 'react';
import { X, Key, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { getStoredApiKey, saveApiKey } from '../services/storageService';

export default function ApiKeyModal({ onClose }) {
  const [key, setKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setKey(getStoredApiKey());
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    saveApiKey(key);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="var(--primary-600)" />
            <span>Configurar Chave API Gemini</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            O FloraCare utiliza o modelo de visão multimodal <strong>Google Gemini 1.5 Flash</strong> para reconhecer plantas através das fotos.
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Sua Chave de API do Google AI Studio</label>
              <input 
                type="password" 
                className="form-input"
                placeholder="AIzaSy..."
                value={key}
                onChange={e => setKey(e.target.value)}
              />
            </div>

            <div style={{ background: 'var(--primary-50)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: 'var(--text-main)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '4px' }}>
                <ShieldCheck size={16} color="var(--primary-600)" />
                <span>Privacidade & Modo Offline</span>
              </div>
              <p>
                Sua chave fica armazenada <strong>apenas no seu navegador</strong>. Se não inserir uma chave, o app continuará funcionando perfeitamente no <strong>Modo de Simulação Botânica</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: '0.825rem', color: 'var(--primary-700)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '600' }}
              >
                <span>Obter chave gratuita no Google AI</span>
                <ExternalLink size={12} />
              </a>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>

                <button type="submit" className="btn btn-primary">
                  {savedSuccess ? (
                    <>
                      <Check size={16} />
                      <span>Salvo!</span>
                    </>
                  ) : (
                    <span>Salvar Chave</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
