/**
 * Tests para el servicio de medicamento (medicamento.service.js)
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { Medicamento } = require('../models/Schema');
const medicamentoService = require('../services/medicamento.service');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  jest.clearAllMocks();
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('medicamentoService.getAllMedicamentos', () => {
  test('debe retornar todos los medicamentos como objetos planos (lean)', async () => {
    await Medicamento.create([
      { nombre: 'Ibuprofeno', concentracion: '400mg', presentacion: 'Tabletas', laboratorio: 'Genfar' },
      { nombre: 'Loratadina', concentracion: '10mg', presentacion: 'Tabletas', laboratorio: 'MK' },
    ]);

    const result = await medicamentoService.getAllMedicamentos();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    // Al usar lean, no debe tener métodos de documento (como save)
    expect(result[0].save).toBeUndefined();
    expect(result[0]).toHaveProperty('nombre');
    expect(result[1]).toHaveProperty('laboratorio');
  });

  test('debe lanzar error controlado ante fallo de DB', async () => {
    const spy = jest.spyOn(Medicamento, 'find').mockImplementation(() => {
      throw new Error('DB down');
    });

    await expect(medicamentoService.getAllMedicamentos())
      .rejects
      .toThrow('Error al obtener los medicamentos de la base de datos');

    spy.mockRestore();
  });
});
