import React from 'react';
import { Leaf, Plus, Key, Search, Sparkles } from 'lucide-react';

export default function Navbar({ hasApiKey, onAddClick, onOpenKeyModal }) {
  return (
    <header className="navbar">
      <div className="app-container navbar-content">
        <div className="brand">
          <div className="brand-icon">
            <Leaf size={20} />
          </div>
          <div className="brand-info">
            <span className="brand-title">FloraCare</span>
            <span className="brand-subtitle">IA Botânica & Guia</span>
          </div>
        </div>

        <div className="nav-actions">
          <button 
            className={`btn ${hasApiKey ? 'btn-key-active' : 'btn-secondary'} btn-sm nav-btn-key`}
            onClick={onOpenKeyModal}
            title={hasApiKey ? "Chave API Gemini Conectada (Clique para alterar)" : "Modo Simulação Ativo (Clique para configurar chave)"}
          >
            {hasApiKey ? (
              <>
                <span className="status-dot online" />
                <Sparkles size={14} />
                <span className="nav-btn-text-full">IA Gemini Conectada</span>
                <span className="nav-btn-text-short">IA Gemini</span>
              </>
            ) : (
              <>
                <span className="status-dot demo" />
                <Key size={14} />
                <span className="nav-btn-text-full">Modo Simulado</span>
                <span className="nav-btn-text-short">Simulado</span>
              </>
            )}
          </button>

          <button 
            className="btn btn-primary btn-sm nav-btn-add"
            onClick={onAddClick}
          >
            <Plus size={16} />
            <span className="nav-btn-text-full">Nova Planta</span>
            <span className="nav-btn-text-short">Adicionar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
