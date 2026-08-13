import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Search, Plus, Leaf, Droplets, Sun, Sparkles, Filter } from 'lucide-react';
import Navbar from './components/Navbar';
import PlantCard from './components/PlantCard';
import PlantDetailModal from './components/PlantDetailModal';
import AddPlantModal from './components/AddPlantModal';
import ApiKeyModal from './components/ApiKeyModal';

import { getStoredPlants, savePlant, deletePlant, markAsWatered, getStoredApiKey } from './services/storageService';

export default function App() {
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'needs_water' | 'watered' | 'sun' | 'shade'

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    loadPlants();
    setHasApiKey(Boolean(getStoredApiKey() && getStoredApiKey().trim() !== ''));
  }, []);

  const loadPlants = async () => {
    const data = await getStoredPlants();
    setPlants(data);
  };

  // Marcar como regada
  const handleWaterPlant = async (plantId) => {
    const updated = await markAsWatered(plantId);
    setPlants(updated);
    if (selectedPlant && selectedPlant.id === plantId) {
      setSelectedPlant(prev => ({ ...prev, lastWatered: new Date().toISOString() }));
    }

    // Efeito Festivo Confetti
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#29b6f6', '#4c966f', '#10b981']
    });
  };

  // Salvar ou Editar planta
  const handleSavePlant = async (plantData) => {
    const updated = await savePlant(plantData);
    setPlants(updated);
  };

  // Excluir planta
  const handleDeletePlant = async (plantId) => {
    const updated = await deletePlant(plantId);
    setPlants(updated);
  };

  // Calcular estatísticas do jardim
  const totalCount = plants.length;
  const now = new Date();
  const needsWaterCount = plants.filter(p => {
    const last = new Date(p.lastWatered);
    const freq = p.watering?.frequencyDays || 3;
    const diffHours = (now - last) / (1000 * 60 * 60);
    return diffHours >= (freq * 24 - 12);
  }).length;

  // Filtragem de plantas
  const filteredPlants = plants.filter(p => {
    // Busca por nome
    const matchesSearch = p.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.scientificName && p.scientificName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    // Filtros por categoria
    if (activeFilter === 'needs_water') {
      const last = new Date(p.lastWatered);
      const freq = p.watering?.frequencyDays || 3;
      const diffHours = (now - last) / (1000 * 60 * 60);
      return diffHours >= (freq * 24 - 12);
    }

    if (activeFilter === 'watered') {
      const last = new Date(p.lastWatered);
      const diffHours = (now - last) / (1000 * 60 * 60);
      return diffHours < 14;
    }

    if (activeFilter === 'sun') {
      return p.sunlight?.period?.toLowerCase().includes('sol') || p.plantType?.toLowerCase().includes('sol');
    }

    if (activeFilter === 'shade') {
      return p.sunlight?.period?.toLowerCase().includes('sombra') || p.plantType?.toLowerCase().includes('sombra');
    }

    return true;
  });

  return (
    <div>
      <Navbar 
        hasApiKey={hasApiKey}
        plantCount={totalCount}
        onAddClick={() => setShowAddModal(true)}
        onOpenKeyModal={() => setShowKeyModal(true)}
      />

      <main className="app-container">
        {/* Banner Hero / Dashboard */}
        <section className="hero-header">
          <div className="hero-text">
            <h1>Meu Jardim Inteligente 🌿</h1>
            <p>Acompanhe o crescimento, adubação e rotina de rega das suas plantas com inteligência artificial.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Plantas Salvas</div>
            </div>

            <div className="stat-card" style={{ background: needsWaterCount > 0 ? 'rgba(239, 68, 68, 0.25)' : undefined }}>
              <div className="stat-value" style={{ color: needsWaterCount > 0 ? '#fca5a5' : '#fff' }}>
                {needsWaterCount}
              </div>
              <div className="stat-label">Sede Hoje</div>
            </div>
          </div>
        </section>

        {/* Toolbar de Pesquisa & Filtros */}
        <section className="toolbar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Buscar planta por nome popular ou científico..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-chips">
            <button 
              className={`chip ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Todas ({totalCount})
            </button>

            <button 
              className={`chip ${activeFilter === 'needs_water' ? 'active' : ''}`}
              onClick={() => setActiveFilter('needs_water')}
            >
              <Droplets size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Precisa de Água ({needsWaterCount})
            </button>

            <button 
              className={`chip ${activeFilter === 'sun' ? 'active' : ''}`}
              onClick={() => setActiveFilter('sun')}
            >
              <Sun size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Sol Pleno
            </button>

            <button 
              className={`chip ${activeFilter === 'shade' ? 'active' : ''}`}
              onClick={() => setActiveFilter('shade')}
            >
              Meia Sombra
            </button>
          </div>
        </section>

        {/* Galeria de Cartões de Plantas */}
        {filteredPlants.length > 0 ? (
          <div className="plant-grid">
            {filteredPlants.map(plant => (
              <PlantCard 
                key={plant.id} 
                plant={plant} 
                onWater={handleWaterPlant}
                onClick={setSelectedPlant}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Leaf className="empty-icon" />
            <h3>Nenhuma planta encontrada</h3>
            <p>Tire uma foto do seu celular ou adicione uma planta manualmente para começar seu diário de cultivo.</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              <span>Adicionar Primeira Planta</span>
            </button>
          </div>
        )}
      </main>

      {/* Modais */}
      {selectedPlant && (
        <PlantDetailModal 
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          onSave={handleSavePlant}
          onDelete={handleDeletePlant}
          onWater={handleWaterPlant}
        />
      )}

      {showAddModal && (
        <AddPlantModal 
          hasApiKey={hasApiKey}
          onClose={() => setShowAddModal(false)}
          onSavePlant={handleSavePlant}
          onOpenKeyModal={() => setShowKeyModal(true)}
        />
      )}

      {showKeyModal && (
        <ApiKeyModal 
          onClose={() => setShowKeyModal(false)}
          onKeySaved={(hasKey) => setHasApiKey(hasKey)}
        />
      )}
    </div>
  );
}
