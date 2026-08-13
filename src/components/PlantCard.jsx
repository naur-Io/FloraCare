import React from 'react';
import { Droplets, Sun, Sparkles, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

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
          {plant.sunlight?.period && (
            <span className="badge badge-sun">
              <Sun size={12} />
              {plant.sunlight.period.split('/')[0]}
            </span>
          )}

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
        <p className="card-subtitle">{plant.scientificName || 'Espécie não especificada'}</p>

        <div className="care-mini-info">
          <div className="care-item">
            <Droplets size={14} color="#0284c7" />
            <span>{plant.watering?.amountMl || 'Frequente'}</span>
          </div>
          <div className="care-item">
            <Sun size={14} color="#f59e0b" />
            <span>{plant.plantType || 'Meia Sombra'}</span>
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
