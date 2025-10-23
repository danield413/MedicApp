/**
 * Tests para el servicio de historial (historial.service.js)
 *
 * Se usa mongodb-memory-server para pruebas de integración ligeras
 * con los modelos reales de Mongoose y verificar populate/ordenamiento.
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const {
  Usuario,
  Medicamento,
  RegistroConsumo,
} = require('../models/Schema');

const historialService = require('../services/historial.service');

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

describe('historialService.getHistorialConsumoRealByUser', () => {
  test('debe retornar el historial ordenado y con medicamento populate', async () => {
    // Crear datos base
    const user = await Usuario.create({
      nombre: 'Ana',
      apellidos: 'Gómez',
      cedula: '100000001',
      celular: '300000001',
      contrasena: 'hash',
    });

    const med1 = await Medicamento.create({ nombre: 'Ibuprofeno', concentracion: '400mg', presentacion: 'Tabletas' });
    const med2 = await Medicamento.create({ nombre: 'Paracetamol', concentracion: '500mg', presentacion: 'Tabletas' });

    const older = new Date(Date.now() - 1000 * 60 * 60); // 1h antes
    const newer = new Date();

    await RegistroConsumo.create([
      { usuario: user._id, medicamento: med1._id, fechaHoraToma: older, descripcion: 'Después de almuerzo' },
      { usuario: user._id, medicamento: med2._id, fechaHoraToma: newer, descripcion: 'Antes de dormir' },
    ]);

    const result = await historialService.getHistorialConsumoRealByUser(user._id.toString());

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    // Debe venir ordenado desc por fechaHoraToma (newer primero)
    expect(new Date(result[0].fechaHoraToma) >= new Date(result[1].fechaHoraToma)).toBe(true);

    // Medicamento populate con campos seleccionados
    expect(result[0]).toHaveProperty('medicamento');
    expect(result[0].medicamento).toHaveProperty('nombre');
    expect(result[0].medicamento).toHaveProperty('concentracion');
    expect(result[0].medicamento).toHaveProperty('presentacion');
  });

  test('debe lanzar error si la consulta falla', async () => {
    const userId = new mongoose.Types.ObjectId().toString();

    // Simular fallo en find()
    const spy = jest.spyOn(RegistroConsumo, 'find').mockImplementation(() => {
      throw new Error('DB failure');
    });

    await expect(historialService.getHistorialConsumoRealByUser(userId))
      .rejects
      .toThrow('Error al obtener el historial de consumo real');

    spy.mockRestore();
  });
});

describe('historialService.addRegistroConsumo', () => {
  test('debe crear un registro y actualizar historial del usuario', async () => {
    const user = await Usuario.create({
      nombre: 'Carlos',
      apellidos: 'Pérez',
      cedula: '100000002',
      celular: '300000002',
      contrasena: 'hash',
    });

    const med = await Medicamento.create({ nombre: 'Amoxicilina', concentracion: '500mg', presentacion: 'Cápsulas' });

    const payload = {
      medicamento: med._id,
      fechaHoraToma: new Date('2025-01-01T10:00:00Z'),
      descripcion: 'Con el desayuno',
    };

    const creado = await historialService.addRegistroConsumo(user._id.toString(), payload);

    expect(creado).toBeTruthy();
    expect(creado).toHaveProperty('_id');
    expect(creado).toHaveProperty('medicamento');
    expect(creado.medicamento).toHaveProperty('nombre', 'Amoxicilina');
    expect(new Date(creado.fechaHoraToma).toISOString()).toBe('2025-01-01T10:00:00.000Z');

    // Usuario debe tener el id del registro en historialConsumo
    const userReloaded = await Usuario.findById(user._id).lean();
    expect(userReloaded.historialConsumo).toBeTruthy();
    expect(userReloaded.historialConsumo.map(String)).toContain(String(creado._id));
  });

  test('debe fallar si el medicamento no existe', async () => {
    const user = await Usuario.create({
      nombre: 'Laura',
      apellidos: 'Rojas',
      cedula: '100000003',
      celular: '300000003',
      contrasena: 'hash',
    });

    const fakeMedId = new mongoose.Types.ObjectId();

    await expect(
      historialService.addRegistroConsumo(user._id.toString(), {
        medicamento: fakeMedId,
        fechaHoraToma: new Date(),
        descripcion: 'Prueba',
      })
    ).rejects.toThrow('El medicamento seleccionado no existe');
  });

  test('debe propagar error si falla el guardado del registro', async () => {
    const user = await Usuario.create({
      nombre: 'Marta',
      apellidos: 'López',
      cedula: '100000004',
      celular: '300000004',
      contrasena: 'hash',
    });

    const med = await Medicamento.create({ nombre: 'Loratadina', concentracion: '10mg', presentacion: 'Tabletas' });

    // Espiar el método save del prototipo y forzar fallo
    const saveSpy = jest.spyOn(RegistroConsumo.prototype, 'save').mockRejectedValue(new Error('save failed'));

    await expect(
      historialService.addRegistroConsumo(user._id.toString(), {
        medicamento: med._id,
        fechaHoraToma: new Date(),
        descripcion: 'Noche',
      })
    ).rejects.toThrow('save failed');

    saveSpy.mockRestore();
  });
});
