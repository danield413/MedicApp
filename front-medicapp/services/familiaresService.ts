import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Familiar {
  _id?: string;
  nombre: string;
  apellido: string;
  cedula: string;
  celular: string;
  correo: string;
  usuario?: string;
  parentesco: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FamiliarResponse {
  success: boolean;
  data?: Familiar | Familiar[];
  message?: string;
}

// Obtener familiares de un usuario
export const getFamiliaresByUsuario = async (usuarioId: string, token: string): Promise<Familiar[]> => {
  try {
    const response = await axios.get<FamiliarResponse>(
      `${API_URL}/familiares/${usuarioId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data as Familiar[];
  } catch (error) {
    console.error('Error al obtener familiares:', error);
    throw error;
  }
};

// Crear un nuevo familiar
export const createFamiliar = async (
  usuarioId: string,
  familiar: Omit<Familiar, '_id' | 'usuario' | 'createdAt' | 'updatedAt'>,
  token: string
): Promise<Familiar> => {
  try {
    const response = await axios.post<FamiliarResponse>(
      `${API_URL}/familiares/${usuarioId}`,
      familiar,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data as Familiar;
  } catch (error) {
    console.error('Error al crear familiar:', error);
    throw error;
  }
};

// Actualizar un familiar
export const updateFamiliar = async (
  familiarId: string,
  familiar: Partial<Familiar>,
  token: string
): Promise<Familiar> => {
  try {
    const response = await axios.put<FamiliarResponse>(
      `${API_URL}/familiares/${familiarId}`,
      familiar,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data as Familiar;
  } catch (error) {
    console.error('Error al actualizar familiar:', error);
    throw error;
  }
};

// Eliminar un familiar
export const deleteFamiliar = async (familiarId: string, token: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_URL}/familiares/${familiarId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (error) {
    console.error('Error al eliminar familiar:', error);
    throw error;
  }
};