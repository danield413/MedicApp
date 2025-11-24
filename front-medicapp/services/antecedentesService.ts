import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export type TipoAntecedente = 'personal' | 'familiar' | 'quirurgico' | 'alergico' | 'toxico';

export interface Antecedente {
  _id?: string;
  usuario?: string;
  descripcion: string;
  tipo: TipoAntecedente;
  fechaDiagnostico?: Date | string | null;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AntecedenteResponse {
  success: boolean;
  data?: Antecedente | Antecedente[];
  message?: string;
}

// Obtener antecedentes de un usuario
export const getAntecedentesByUsuario = async (usuarioId: string, token: string): Promise<Antecedente[]> => {
  console.log("usuarioId antecedentes service", usuarioId)
  try {
    const response = await axios.get<AntecedenteResponse>(
      `${API_URL}/antecedentes/${usuarioId}`,
     
    );
    console.log("response antecedentes", response.data)
    return response.data.data as Antecedente[];
  } catch (error) {
    console.error('Error al obtener antecedentes:', error);
    throw error;
  }
};

// Crear un nuevo antecedente
export const createAntecedente = async (
  usuarioId: string,
  antecedente: Omit<Antecedente, '_id' | 'usuario' | 'createdAt' | 'updatedAt'>,
  token: string
): Promise<Antecedente> => {
  try {
    const response = await axios.post<AntecedenteResponse>(
      `${API_URL}/antecedentes/${usuarioId}`,
      antecedente,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data as Antecedente;
  } catch (error) {
    console.error('Error al crear antecedente:', error);
    throw error;
  }
};

// Actualizar un antecedente
export const updateAntecedente = async (
  antecedenteId: string,
  antecedente: Partial<Antecedente>,
  token: string
): Promise<Antecedente> => {
  try {
    const response = await axios.put<AntecedenteResponse>(
      `${API_URL}/antecedentes/${antecedenteId}`,
      antecedente,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data as Antecedente;
  } catch (error) {
    console.error('Error al actualizar antecedente:', error);
    throw error;
  }
};

// Eliminar un antecedente
export const deleteAntecedente = async (antecedenteId: string, token: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_URL}/antecedentes/${antecedenteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (error) {
    console.error('Error al eliminar antecedente:', error);
    throw error;
  }
};