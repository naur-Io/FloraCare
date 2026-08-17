import React from 'react';
import { Droplets, Sun, AlertCircle, CheckCircle2, Clock, Globe, Sprout } from 'lucide-react';

export default function PlantCard({ plant, onWater, onClick }) {
  // Cálculo de dias até a próxima rega
  const lastWateredDate = new Date(plant.lastWatered);
  const freqDays = plant.watering?.frequencyDays || 3;
  const nextWaterDate = new Date(lastWateredDate.getTime() + freqDays * 86400000);
  
  const now = new Date();
  const diffHours = (nextWaterDate - now) / (1000 * 60 * 60);
  const needsWater = diffHours <= 0;

  // Formatar status de rega
  let waterStatusText = '';
  let isWateredToday = false;

  const hoursSinceLastWater = (now - lastWateredDate) / (1000 * 60 * 60);
  if (hoursSinceLastWater < 14) {
    isWateredToday = true;
    waterStatusText = 'Regada Hoje';
  } else if (needsWater) {
    const daysOverdue = Math.abs(Math.floor(diffHours / 24));
    waterStatusText = daysOverdue > 0 ? `Atrasada (${daysOverdue}d)` : 'Precisa de Água Hoje!';
  } else {
    const daysLeft = Math.ceil(diffHours / 24);
    waterStatusText = `Regar em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`;
  }

  const handleWaterClick = (e) => {
    e.stopPropagation();
    onWater(plant.id);
  };

  // Determinar rótulo de luz
  const lightType = plant.sunlight?.lightType || (plant.sunlight?.period?.toLowerCase().includes('direto') ? 'direta' : plant.sunlight?.period?.toLowerCase().includes('sombra') ? 'sombra' : 'indireta');
  const getLightBadge = () => {
    if (lightType === 'direta') {
      return { text: 'Sol Direto', className: 'badge-sun-direct' };
    }
    if (lightType === 'sombra') {
      return { text: 'Sombra', className: 'badge-shade' };
    }
    return { text: 'Luz Indireta', className: 'badge-sun-indirect' };
  };

  const lightBadge = getLightBadge();
  const propagationMethod = plant.propagation?.method;

  return (
    <div className="plant-card" onClick={() => onClick(plant)}>
      <div className="card-img-wrapper">
        <img 
          src={plant.photoUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80'} 
          alt={plant.commonName} 
          className="card-img"
          loading="lazy"
        />
        <div className="badge-overlay">
          <span className={`badge ${lightBadge.className}`}>
            <Sun size={12} />
            {lightBadge.text}
          </span>

          {needsWater && !isWateredToday && (
            <span className="badge badge-urgent">
              <AlertCircle size={12} />
              Regar Hoje
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{plant.commonName}</h3>
        <p className="card-subtitle">{plant.scientificName || 'Espécie botânica'}</p>

        {plant.origin && (
          <div className="card-origin-snippet" title={plant.origin}>
            <Globe size={12} />
            <span>{plant.origin}</span>
          </div>
        )}

        {propagationMethod && (
          <div className="card-propagation-snippet" title={`Como tirar mudas: ${propagationMethod}`}>
            <Sprout size={12} color="#059669" />
            <span>Muda: {propagationMethod}</span>
          </div>
        )}

        <div className="care-mini-info">
          <div className="care-item" title="Volume de água">
            <Droplets size={14} color="#0284c7" />
            <span>{plant.watering?.amountMl || '150 - 200 ml'}</span>
          </div>
          <div className="care-item" title="Frequência de rega">
            <Clock size={14} color="#059669" />
            <span>
              {plant.watering?.frequencyTimesPerWeek 
                ? `${plant.watering.frequencyTimesPerWeek}x / semana` 
                : `A cada ${plant.watering?.frequencyDays || 3}d`}
            </span>
          </div>
        </div>

        <div className="card-footer">
          <div className={`water-status ${needsWater && !isWateredToday ? 'needs-water' : 'watered'}`}>
            {isWateredToday ? (
              <CheckCircle2 size={14} />
            ) : needsWater ? (
              <AlertCircle size={14} />
            ) : (
              <Clock size={14} />
            )}
            <span>{waterStatusText}</span>
          </div>

          <button
            className={`btn btn-sm ${isWateredToday ? 'btn-secondary' : 'btn-accent-water'}`}
            onClick={handleWaterClick}
            title="Marcar como regada agora"
          >
            <Droplets size={14} />
            <span>{isWateredToday ? 'Regada' : 'Regar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

