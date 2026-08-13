import React from 'react';
import { Leaf, Plus, Key, Search, Sparkles } from 'lucide-react';

export default function Navbar({ plantCount, onAddClick, onOpenKeyModal, searchTerm, setSearchTerm }) {
  return (
    <header className="navbar">
      <div className="app-container navbar-content">
        <div className="brand">
          <div className="brand-icon">
            <Leaf size={22} />
          </div>
          <div>
            <span className="brand-title">FloraCare</span>
            <span className="brand-subtitle">IA Botânica & Guia</span>
          </div>
        </div>

        <div className="nav-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenKeyModal}
            title="Configurar Chave API Gemini"
          >
            <Key size={16} />
            <span>API Gemini</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={onAddClick}
          >
            <Plus size={18} />
            <span>Nova Planta</span>
          </button>
        </div>
      </div>
    </header>
  );
}
