import { get, set } from 'idb-keyval';
import { INITIAL_PLANTS } from './mockData';

const PLANTS_STORAGE_KEY = 'floracare_user_plants_v1';
const API_KEY_STORAGE_KEY = 'floracare_gemini_api_key';

// Carregar todas as plantas (com fallback para plantas iniciais se vazio)
export async function getStoredPlants() {
  try {
    const data = await get(PLANTS_STORAGE_KEY);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    // Salvar mock inicial se for o primeiro acesso
    await set(PLANTS_STORAGE_KEY, INITIAL_PLANTS);
    return INITIAL_PLANTS;
  } catch (error) {
    console.error('Erro ao ler do IndexedDB, usando localStorage fallback:', error);
    const localData = localStorage.getItem(PLANTS_STORAGE_KEY);
    if (localData) return JSON.parse(localData);
    localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(INITIAL_PLANTS));
    return INITIAL_PLANTS;
  }
}

// Salvar ou Atualizar uma Planta
export async function savePlant(plantData) {
  const currentPlants = await getStoredPlants();
  const index = currentPlants.findIndex(p => p.id === plantData.id);

  let updatedPlants;
  if (index >= 0) {
    // Atualizar existente
    updatedPlants = [...currentPlants];
    updatedPlants[index] = { ...updatedPlants[index], ...plantData, updatedAt: new Date().toISOString() };
  } else {
    // Adicionar nova
    const newPlant = {
      ...plantData,
      id: plantData.id || `plant-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastWatered: plantData.lastWatered || new Date().toISOString()
    };
    updatedPlants = [newPlant, ...currentPlants];
  }

  try {
    await set(PLANTS_STORAGE_KEY, updatedPlants);
  } catch (e) {
    localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(updatedPlants));
  }
  return updatedPlants;
}

// Excluir Planta
export async function deletePlant(plantId) {
  const currentPlants = await getStoredPlants();
  const updatedPlants = currentPlants.filter(p => p.id !== plantId);
  try {
    await set(PLANTS_STORAGE_KEY, updatedPlants);
  } catch (e) {
    localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(updatedPlants));
  }
  return updatedPlants;
}

// Marcar como Regada Hoje
export async function markAsWatered(plantId) {
  const currentPlants = await getStoredPlants();
  const updatedPlants = currentPlants.map(p => {
    if (p.id === plantId) {
      return {
        ...p,
        lastWatered: new Date().toISOString()
      };
    }
    return p;
  });
  try {
    await set(PLANTS_STORAGE_KEY, updatedPlants);
  } catch (e) {
    localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(updatedPlants));
  }
  return updatedPlants;
}

// Gerenciamento da Chave de API Gemini
export function getStoredApiKey() {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function saveApiKey(key) {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}
