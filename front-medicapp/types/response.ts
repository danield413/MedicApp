// types/response.ts

/**
 * Define la estructura de una respuesta de error de la API,
 * coincidiendo con el AllExceptionsFilter del backend.
 */
export interface ErrorResponse {
  status: 'error';
  statusCode: number;
  errorCode: string;
  message: string;
  details?: {
    fields?: string[] | Record<string, any>;
    [key: string]: any;
  };
  path: string;
  timestamp: string;
}

/**
 * Define la estructura de una respuesta exitosa de la API.
 * El tipo T es genérico para adaptarse a cualquier tipo de dato.
 */
export interface SuccessResponse<T> {
  status: 'success';
  statusCode: number;
  message: string;
  data: T;
}
