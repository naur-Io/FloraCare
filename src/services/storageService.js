import { get, set } from 'idb-keyval';
import { INITIAL_PLANTS } from './mockData';

const PLANTS_STORAGE_KEY = 'floracare_user_plants_v1';
const API_KEY_STORAGE_KEY = 'floracare_gemini_api_key';
const INITIALIZED_FLAG_KEY = 'floracare_has_initialized_v1';

// Sincroniza dados em ambos os armazenamentos (IndexedDB + LocalStorage)
async function persistToAllStorages(plants) {
  // 1. Salvar no IndexedDB
  try {
    await set(PLANTS_STORAGE_KEY, plants);
  } catch (err) {
    console.warn('Falha ao salvar no IndexedDB:', err);
  }

  // 2. Salvar cópia redundante no LocalStorage
  try {
    localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(plants));
    localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
  } catch (err) {
    console.warn('LocalStorage quota ou indisponível:', err);
  }
}

// Carregar todas as plantas salvas pelo usuário
export async function getStoredPlants() {
  const hasInitialized = localStorage.getItem(INITIALIZED_FLAG_KEY) === 'true';

  // 1. Tentar ler do IndexedDB
  try {
    const idbData = await get(PLANTS_STORAGE_KEY);
    if (idbData !== undefined && idbData !== null && Array.isArray(idbData)) {
      return idbData;
    }
  } catch (error) {
    console.warn('IndexedDB não disponível, verificando localStorage:', error);
  }

  // 2. Tentar ler do LocalStorage
  try {
    const localData = localStorage.getItem(PLANTS_STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) {
        // Sincronizar de volta para o IndexedDB
        set(PLANTS_STORAGE_KEY, parsed).catch(() => {});
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Erro ao ler do LocalStorage:', error);
  }

  // 3. Se o usuário já interagiu com o app antes e deletou as plantas, retornar vazio
  if (hasInitialized) {
    return [];
  }

  // 4. Primeiro acesso absoluto: semear com plantas iniciais de demonstração
  await persistToAllStorages(INITIAL_PLANTS);
  return INITIAL_PLANTS;
}

// Salvar ou Atualizar uma Planta
export async function savePlant(plantData) {
  const currentPlants = await getStoredPlants();
  const index = currentPlants.findIndex(p => p.id === plantData.id);

  let updatedPlants;
  if (index >= 0) {
    // Atualizar existente preservando histórico
    updatedPlants = [...currentPlants];
    updatedPlants[index] = { 
      ...updatedPlants[index], 
      ...plantData, 
      updatedAt: new Date().toISOString() 
    };
  } else {
    // Adicionar nova planta no início
    const newPlant = {
      ...plantData,
      id: plantData.id || `plant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      lastWatered: plantData.lastWatered || new Date().toISOString()
    };
    updatedPlants = [newPlant, ...currentPlants];
  }

  await persistToAllStorages(updatedPlants);
  return updatedPlants;
}

// Excluir Planta
export async function deletePlant(plantId) {
  const currentPlants = await getStoredPlants();
  const updatedPlants = currentPlants.filter(p => p.id !== plantId);
  await persistToAllStorages(updatedPlants);
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

  await persistToAllStorages(updatedPlants);
  return updatedPlants;
}

// Gerenciamento da Chave de API Gemini
export function getStoredApiKey() {
  const raw = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  const match = raw.match(/AIzaSy[A-Za-z0-9_-]{33}/);
  if (match) return match[0];
  return raw.trim();
}

export function saveApiKey(key) {
  if (key && typeof key === 'string' && key.trim() !== '') {
    const match = key.match(/AIzaSy[A-Za-z0-9_-]{33}/);
    const clean = match ? match[0] : key.trim();
    localStorage.setItem(API_KEY_STORAGE_KEY, clean);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

// Exportar todos os dados do jardim (Backup)
export async function exportGardenBackup() {
  const plants = await getStoredPlants();
  return JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    plants
  }, null, 2);
}

// Importar dados de backup
export async function importGardenBackup(jsonString) {
  const parsed = JSON.parse(jsonString);
  const plants = Array.isArray(parsed) ? parsed : (parsed.plants || []);
  if (!Array.isArray(plants)) throw new Error('Formato de backup inválido.');
  await persistToAllStorages(plants);
  return plants;
}
