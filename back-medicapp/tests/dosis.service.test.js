/**
 * Tests para el servicio de dosis (dosis.service.js)
 *
 * Usamos MongoMemoryReplSet para habilitar transacciones en memoria y
 * validar los flujos que usan sesiones/transactions en Mongoose.
 */

const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

const {
  Usuario,
  Medicamento,
  Dosis,
  Formula,
} = require('../models/Schema');

const dosisService = require('../services/dosis.service');

let replset;

beforeAll(async () => {
  // Iniciar un Replica Set en memoria para soportar transacciones
  replset = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  const uri = replset.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
});

afterEach(async () => {
  jest.clearAllMocks();
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    // Limpiar todas las colecciones
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (replset) {
    await replset.stop();
  }
});

// ============================================================================
// Tests para getDosisByUser
// ============================================================================

describe('dosisService.getDosisByUser', () => {
  test('debe retornar dosis del usuario ordenadas y con medicamento populate', async () => {
    const user = await Usuario.create({
      nombre: 'María',
      apellidos: 'Rodríguez',
      cedula: '200000001',
      celular: '3001111111',
      contrasena: 'hash',
    });

    const med1 = await Medicamento.create({ nombre: 'Ibuprofeno', concentracion: '400mg', presentacion: 'Tabletas' });
    const med2 = await Medicamento.create({ nombre: 'Paracetamol', concentracion: '500mg', presentacion: 'Tabletas' });

    const older = new Date(Date.now() - 1000 * 60 * 60); // 1h antes
    const newer = new Date();

    const d1 = await Dosis.create({ medicamento: med1._id, cantidadDiaria: 1, descripcion: 'Mañana', unidadMedida: 'tabletas', frecuencia: 'Diaria', createdAt: older });
    const d2 = await Dosis.create({ medicamento: med2._id, cantidadDiaria: 2, descripcion: 'Noche', unidadMedida: 'tabletas', frecuencia: 'Diaria', createdAt: newer });

    await Formula.create({
      usuario: user._id,
      fechaFormula: new Date(),
      nombreDoctor: 'Autoregistrado',
      especialidad: 'General',
      institucion: 'MedicApp',
      diagnostico: 'Dosis registradas por el usuario',
      dosis: [d1._id, d2._id],
    });

    const result = await dosisService.getDosisByUser(user._id.toString());

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    // Orden descendente por createdAt: newer primero
    expect(new Date(result[0].createdAt) >= new Date(result[1].createdAt)).toBe(true);

    // Populate de medicamento con campos seleccionados
    expect(result[0]).toHaveProperty('medicamento');
    expect(result[0].medicamento).toHaveProperty('nombre');
    expect(result[0].medicamento).toHaveProperty('concentracion');
    expect(result[0].medicamento).toHaveProperty('presentacion');
  });

  test('debe retornar arreglo vacío si el usuario no tiene fórmulas', async () => {
    const user = await Usuario.create({
      nombre: 'Luis',
      apellidos: 'García',
      cedula: '200000002',
      celular: '3002222222',
      contrasena: 'hash',
    });

    const result = await dosisService.getDosisByUser(user._id.toString());
    expect(result).toEqual([]);
  });

  test('debe lanzar error controlado si falla la consulta', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const spy = jest.spyOn(Formula, 'find').mockImplementation(() => {
      throw new Error('DB failure');
    });

    await expect(dosisService.getDosisByUser(userId))
      .rejects
      .toThrow('Error al obtener las dosis');

    spy.mockRestore();
  });
});

// ============================================================================
// Tests para createDosis
// ============================================================================

describe('dosisService.createDosis', () => {
  test('debe crear una dosis y una fórmula por defecto si no existe', async () => {
    const user = await Usuario.create({
      nombre: 'Ana',
      apellidos: 'Gómez',
      cedula: '200000003',
      celular: '3003333333',
      contrasena: 'hash',
    });
    const med = await Medicamento.create({ nombre: 'Amoxicilina', concentracion: '500mg', presentacion: 'Cápsulas' });

    const payload = {
      medicamento: med._id,
      cantidadDiaria: 3,
      descripcion: 'Cada 8 horas',
      unidadMedida: 'cápsulas',
      frecuencia: 'Diaria',
    };

    const creada = await dosisService.createDosis(user._id.toString(), payload);

    expect(creada).toBeTruthy();
    expect(creada).toHaveProperty('_id');
    expect(creada).toHaveProperty('medicamento');
    expect(creada.medicamento).toHaveProperty('nombre', 'Amoxicilina');
    expect(creada).toHaveProperty('cantidadDiaria', 3);

    // Debe existir una fórmula "Autoregistrado" con esta dosis ligada
    const formula = await Formula.findOne({ usuario: user._id, nombreDoctor: 'Autoregistrado' }).lean();
    expect(formula).toBeTruthy();
    expect(formula.dosis.map(String)).toContain(String(creada._id));

    // El usuario debe tener la fórmula añadida
    const userReloaded = await Usuario.findById(user._id).lean();
    expect(userReloaded.formulas.map(String)).toContain(String(formula._id));
  });

  test('debe reutilizar la fórmula existente "Autoregistrado"', async () => {
    const user = await Usuario.create({
      nombre: 'Pedro',
      apellidos: 'López',
      cedula: '200000004',
      celular: '3004444444',
      contrasena: 'hash',
    });
    const med = await Medicamento.create({ nombre: 'Loratadina', concentracion: '10mg', presentacion: 'Tabletas' });

    const existingFormula = await Formula.create({
      usuario: user._id,
      fechaFormula: new Date(),
      nombreDoctor: 'Autoregistrado',
      especialidad: 'General',
      institucion: 'MedicApp',
      diagnostico: 'Dosis registradas por el usuario',
      dosis: [],
    });

    // El usuario ya referencia esta fórmula
    await Usuario.findByIdAndUpdate(user._id, { $addToSet: { formulas: existingFormula._id } });

    const creada = await dosisService.createDosis(user._id.toString(), {
      medicamento: med._id,
      cantidadDiaria: 1,
      descripcion: 'Antes de dormir',
      unidadMedida: 'tableta',
      frecuencia: 'Diaria',
    });

    expect(creada).toBeTruthy();

    // Debe existir una sola fórmula "Autoregistrado"
    const formulas = await Formula.find({ usuario: user._id, nombreDoctor: 'Autoregistrado' });
    expect(formulas).toHaveLength(1);

    const updatedFormula = await Formula.findById(existingFormula._id).lean();
    expect(updatedFormula.dosis.map(String)).toContain(String(creada._id));

    const userReloaded = await Usuario.findById(user._id).lean();
    expect(userReloaded.formulas.map(String)).toContain(String(existingFormula._id));
  });

  test('debe fallar si el medicamento no existe', async () => {
    const user = await Usuario.create({
      nombre: 'Lucía',
      apellidos: 'Rivas',
      cedula: '200000005',
      celular: '3005555555',
      contrasena: 'hash',
    });

    const fakeMedId = new mongoose.Types.ObjectId();

    await expect(
      dosisService.createDosis(user._id.toString(), {
        medicamento: fakeMedId,
        cantidadDiaria: 2,
        descripcion: 'Prueba',
        unidadMedida: 'ml',
        frecuencia: 'Diaria',
      })
    ).rejects.toThrow('El medicamento seleccionado no existe');

    expect(await Dosis.countDocuments()).toBe(0);
    expect(await Formula.countDocuments({ usuario: user._id })).toBe(0);
  });

  test('debe abortar la transacción si falla el guardado de Dosis', async () => {
    const user = await Usuario.create({
      nombre: 'Sofía',
      apellidos: 'Mejía',
      cedula: '200000006',
      celular: '3006666666',
      contrasena: 'hash',
    });
    const med = await Medicamento.create({ nombre: 'Enalapril', concentracion: '5mg', presentacion: 'Tabletas' });

    // Forzar fallo en save() de Dosis
    const saveSpy = jest.spyOn(Dosis.prototype, 'save').mockRejectedValue(new Error('save failed'));

    await expect(
      dosisService.createDosis(user._id.toString(), {
        medicamento: med._id,
        cantidadDiaria: 1,
        descripcion: 'Mañana',
        unidadMedida: 'tableta',
        frecuencia: 'Diaria',
      })
    ).rejects.toThrow('save failed');

    saveSpy.mockRestore();

    // Nada debe haberse persistido debido al rollback
    expect(await Dosis.countDocuments()).toBe(0);
    expect(await Formula.countDocuments({ usuario: user._id })).toBe(0);
  });

  test('debe hacer rollback si falla el guardado de la Fórmula', async () => {
    const user = await Usuario.create({
      nombre: 'Andrés',
      apellidos: 'Vargas',
      cedula: '200000007',
      celular: '3007777777',
      contrasena: 'hash',
    });
    const med = await Medicamento.create({ nombre: 'Metformina', concentracion: '850mg', presentacion: 'Tabletas' });

    // Forzar fallo en save() de Formula
    const formulaSaveSpy = jest.spyOn(Formula.prototype, 'save').mockRejectedValue(new Error('formula save failed'));

    await expect(
      dosisService.createDosis(user._id.toString(), {
        medicamento: med._id,
        cantidadDiaria: 1,
        descripcion: 'Con comida',
        unidadMedida: 'tableta',
        frecuencia: 'Diaria',
      })
    ).rejects.toThrow('formula save failed');

    formulaSaveSpy.mockRestore();

    // Verificar rollback total
    expect(await Dosis.countDocuments()).toBe(0);
    expect(await Formula.countDocuments({ usuario: user._id })).toBe(0);
  });
});
