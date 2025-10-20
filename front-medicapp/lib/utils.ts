// lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina y fusiona clases de Tailwind CSS de forma segura,
 * evitando conflictos y aplicando las clases correctamente.
 * @param inputs - Clases a combinar.
 * @returns Una cadena de texto con las clases finales.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
