import { ErrorResponse } from '@/types';

/**
 * Clase de error personalizada que se alinea con la estructura de errores del backend.
 * Contiene el cuerpo completo de la respuesta de error de la API.
 */
export class ApiError extends Error {
  public readonly body: ErrorResponse;

  constructor(body: ErrorResponse) {
    super(body.message);
    this.name = 'ApiError';
    this.body = body;
  }
}

// Obtiene la URL base de la API desde las variables de entorno.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Intenta refrescar el token de acceso usando el refresh token.
 * Si falla, redirige al login.
 */
const refreshToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const refreshError = new Error('Session expired');
      processQueue(refreshError);
      // Redirige al usuario a la página de login si el refresh token falla.
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }

    processQueue(null);
    return Promise.resolve();
  } finally {
    isRefreshing = false;
  }
};

/**
 * Función genérica para realizar peticiones a la API.
 * Maneja la lógica de refresh token y errores de forma centralizada.
 */
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options?.body instanceof FormData;

  const defaultOptions: RequestInit = {
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorBody: ErrorResponse = await response.json();
      throw new ApiError(errorBody);
    }

    // El backend devuelve 204 No Content en operaciones como logout
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    // Si el error es de tipo 401 (No autenticado), intenta refrescar el token.
    if (error instanceof ApiError && error.body.statusCode === 401) {
      if (isRefreshing) {
        // Si ya hay una petición de refresh en curso, encola la petición actual.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiRequest<T>(endpoint, options));
      }

      isRefreshing = true;

      // Inicia el proceso de refresh token.
      return refreshToken().then(() => apiRequest<T>(endpoint, options));
    }

    // Si es otro tipo de error, simplemente lo relanza.
    throw error;
  }
}

// Objeto exportado con métodos para cada tipo de petición HTTP.
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) => {
    // El navegador se encarga del Content-Type para FormData.
    if (body instanceof FormData) {
      return apiRequest<T>(endpoint, {
        ...options,
        method: 'POST',
        body,
      });
    }
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body || {}),
    });
  },

  put: <T>(endpoint: string, body: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body || {}) }),

  patch: <T>(endpoint: string, body: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body || {}) }),

  del: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};