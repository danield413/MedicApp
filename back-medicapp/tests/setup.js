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
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore?.();
  // Por si quieres restaurar explícitamente:
  console.error = originalError;
});
