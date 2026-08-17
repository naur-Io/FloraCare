import React, { useState, useEffect } from 'react';
import { X, Key, Check, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, Sparkles, ClipboardPaste } from 'lucide-react';
import { getStoredApiKey, saveApiKey } from '../services/storageService';
import { validateGeminiApiKey, sanitizeGeminiApiKey } from '../services/geminiService';

export default function ApiKeyModal({ onClose, onKeySaved }) {
  const [key, setKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  useEffect(() => {
    const current = getStoredApiKey();
    setKey(current);
    if (current) {
      setFeedback({
        type: 'success',
        message: 'Chave API configurada e ativa no seu navegador.'
      });
    }
  }, []);

  const handleInputChange = (val) => {
    // Se o usuário colou um bloco de texto com a chave dentro, extrair automaticamente a chave limpa
    const clean = sanitizeGeminiApiKey(val);
    if (clean && clean.startsWith('AIzaSy')) {
      setKey(clean);
    } else {
      setKey(val);
    }
    if (feedback) setFeedback(null);
  };

  const handleValidateAndSave = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedKey = sanitizeGeminiApiKey(key) || key.trim();
    if (!trimmedKey) {
      handleRemoveKey();
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateGeminiApiKey(trimmedKey);
      const keyToSave = result.cleanKey || trimmedKey;
      saveApiKey(keyToSave);
      setKey(keyToSave);
      setFeedback({
        type: 'success',
        message: result.message || 'Chave de API validada com sucesso! Conectada ao Google Gemini Flash.'
      });
      onKeySaved?.(true);

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Chave inválida. Verifique se copiou a chave correta do Google AI Studio.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveKey = () => {
    saveApiKey('');
    setKey('');
    setFeedback({
      type: 'success',
      message: 'Chave removida. O app utilizará o Modo de Simulação Botânica.'
    });
    onKeySaved?.(false);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
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
            O FloraCare utiliza a IA multimodal gratuita <strong>Google Gemini Flash</strong> para reconhecer espécies de plantas por foto, indicar cuidados completos e gerar o guia de mudas e cultivo.
          </p>

          <form onSubmit={handleValidateAndSave}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Sua Chave de API (Google AI Studio)</span>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '600' }}
                >
                  <span>Gerar chave grátis</span>
                  <ExternalLink size={11} />
                </a>
              </label>
              
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input"
                  placeholder="AIzaSy..."
                  value={key}
                  onChange={e => handleInputChange(e.target.value)}
                  style={{ paddingRight: '42px', fontFamily: showPassword ? 'monospace' : 'inherit' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? "Ocultar chave" : "Mostrar chave"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Dica: As chaves do Google AI Studio começam com <code>AIzaSy...</code>
              </span>
            </div>

            {/* Banner de Feedback de Validação */}
            {feedback && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px', 
                  padding: '12px 14px', 
                  borderRadius: 'var(--radius-md)', 
                  fontSize: '0.85rem', 
                  marginBottom: '16px',
                  background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                  color: feedback.type === 'success' ? '#065f46' : '#991b1b',
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#10b981' }} />
                ) : (
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
                )}
                <div>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>
                    {feedback.type === 'success' ? 'Chave Válida & Pronta para Uso' : 'Falha na Validação'}
                  </strong>
                  <span>{feedback.message}</span>
                </div>
              </div>
            )}

            <div style={{ background: 'var(--primary-50)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: 'var(--text-main)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '4px' }}>
                <ShieldCheck size={16} color="var(--primary-600)" />
                <span>Privacidade & Armazenamento Local</span>
              </div>
              <p>
                Sua chave fica armazenada <strong>apenas no seu navegador</strong>. Se preferir não usar chave, o app continuará disponível no <strong>Modo Simulação</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
              {Boolean(getStoredApiKey()) && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleRemoveKey} 
                  style={{ color: 'var(--accent-danger)' }}
                  disabled={isValidating}
                >
                  Remover
                </button>
              )}

              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isValidating}
              >
                Cancelar
              </button>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isValidating}
              >
                {isValidating ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    <span>Validando Chave...</span>
                  </>
                ) : feedback?.type === 'success' ? (
                  <>
                    <Check size={16} />
                    <span>Chave Pronta!</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Validar & Salvar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
