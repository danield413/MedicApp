/**
 * Configuración global para los tests
 */

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
process.env.PORT = 5000;

// Timeout global para tests
jest.setTimeout(10000);

// Silencia solo console.error durante los tests
const originalError = console.error;
const originalWarn = console.warn;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore?.();
  // Por si quieres restaurar explícitamente:
  console.error = originalError;
  console.warn?.mockRestore?.();
  console.warn = originalWarn;
});
