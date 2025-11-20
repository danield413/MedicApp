/**
 * Tests unitarios para el servicio de citas (citas.service.js)
 * 
 * Estos tests se centran en la lógica de negocio del servicio, mockeando
 * las dependencias externas como la base de datos.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { Cita, Usuario } = require('../models/Schema');
const citasService = require('../services/citas.service');

let mongoServer;

// Datos de prueba
const testUserId = new mongoose.Types.ObjectId().toString();
const testCitaId = new mongoose.Types.ObjectId().toString();

const testCita = {
  _id: testCitaId,
  usuario: testUserId,
  especialidad: 'Cardiología',
  fechaHora: new Date('2025-10-25T10:00:00Z'),
  lugar: 'Hospital Central',
  nombreDoctor: 'Dr. Juan Pérez',
  estado: 'pendiente',
  observaciones: 'Primera consulta',
};

const testCitas = [
  {
    _id: testCitaId,
    usuario: testUserId,
    especialidad: 'Cardiología',
    fechaHora: new Date('2025-10-25T10:00:00Z'),
    lugar: 'Hospital Central',
    nombreDoctor: 'Dr. Juan Pérez',
    estado: 'pendiente',
    observaciones: 'Primera consulta',
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    usuario: testUserId,
    especialidad: 'Oftalmología',
    fechaHora: new Date('2025-11-01T14:30:00Z'),
    lugar: 'Clínica Vista',
    nombreDoctor: 'Dra. María García',
    estado: 'confirmada',
    observaciones: 'Control de visión',
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    usuario: testUserId,
    especialidad: 'Odontología',
    fechaHora: new Date('2025-10-22T09:00:00Z'),
    lugar: 'Dental Center',
    nombreDoctor: 'Dr. Carlos López',
    estado: 'pendiente',
    observaciones: null,
  },
];

/**
 * Configuración antes de todos los tests
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);
});

/**
 * Limpieza después de cada test
 */
afterEach(async () => {
  jest.clearAllMocks();
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

/**
 * Limpieza después de todos los tests
 */
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// ============================================================================
// TESTS PARA getCitasByUser
// ============================================================================

describe('citasService.getCitasByUser', () => {
  test('Debe retornar todas las citas de un usuario ordenadas por fecha', async () => {
    // Mock de la base de datos
    const sortMock = jest.fn().mockReturnThis();
    const leanMock = jest.fn().mockResolvedValue(testCitas);
    
    Cita.find = jest.fn().mockReturnValue({
      sort: sortMock.mockReturnValue({
        lean: leanMock
      })
    });

    const result = await citasService.getCitasByUser(testUserId);

    // Verificar que se llamó a find con el userId correcto
    expect(Cita.find).toHaveBeenCalledWith({ usuario: testUserId });
    
    // Verificar que se ordenó por fechaHora ascendente
    expect(sortMock).toHaveBeenCalledWith({ fechaHora: 1 });
    
    // Verificar que se llamó lean
    expect(leanMock).toHaveBeenCalled();
    
    // Verificar el resultado
    expect(result).toEqual(testCitas);
    expect(result).toHaveLength(3);
  });

  test('Debe retornar un array vacío si el usuario no tiene citas', async () => {
    const sortMock = jest.fn().mockReturnThis();
    const leanMock = jest.fn().mockResolvedValue([]);
    
    Cita.find = jest.fn().mockReturnValue({
      sort: sortMock.mockReturnValue({
        lean: leanMock
      })
    });

    const result = await citasService.getCitasByUser(testUserId);

    expect(Cita.find).toHaveBeenCalledWith({ usuario: testUserId });
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  test('Debe lanzar un error si falla la consulta a la base de datos', async () => {
    const sortMock = jest.fn().mockReturnThis();
    const leanMock = jest.fn().mockRejectedValue(new Error('Database error'));
    
    Cita.find = jest.fn().mockReturnValue({
      sort: sortMock.mockReturnValue({
        lean: leanMock
      })
    });

    await expect(citasService.getCitasByUser(testUserId)).rejects.toThrow('Error al obtener las citas del usuario');
  });

  test('Debe retornar citas en orden ascendente por fecha', async () => {
    const citasDesordenadas = [
      { ...testCitas[1], fechaHora: new Date('2025-11-01T14:30:00Z') },
      { ...testCitas[0], fechaHora: new Date('2025-10-25T10:00:00Z') },
      { ...testCitas[2], fechaHora: new Date('2025-10-22T09:00:00Z') },
    ];

    // Las citas deben venir ordenadas después del sort
    const citasOrdenadas = [
      testCitas[2], // Oct 22
      testCitas[0], // Oct 25
      testCitas[1], // Nov 01
    ];

    const sortMock = jest.fn().mockReturnThis();
    const leanMock = jest.fn().mockResolvedValue(citasOrdenadas);
    
    Cita.find = jest.fn().mockReturnValue({
      sort: sortMock.mockReturnValue({
        lean: leanMock
      })
    });

    const result = await citasService.getCitasByUser(testUserId);

    expect(result).toEqual(citasOrdenadas);
    expect(sortMock).toHaveBeenCalledWith({ fechaHora: 1 });
  });

  test('Debe manejar diferentes estados de citas', async () => {
    const citasConDiferentesEstados = [
      { ...testCitas[0], estado: 'pendiente' },
      { ...testCitas[1], estado: 'confirmada' },
      { ...testCitas[2], estado: 'completada' },
    ];

    const sortMock = jest.fn().mockReturnThis();
    const leanMock = jest.fn().mockResolvedValue(citasConDiferentesEstados);
    
    Cita.find = jest.fn().mockReturnValue({
      sort: sortMock.mockReturnValue({
        lean: leanMock
      })
    });

    const result = await citasService.getCitasByUser(testUserId);

    expect(result).toHaveLength(3);
    expect(result.find(c => c.estado === 'pendiente')).toBeDefined();
    expect(result.find(c => c.estado === 'confirmada')).toBeDefined();
    expect(result.find(c => c.estado === 'completada')).toBeDefined();
  });

  test('Debe incluir todos los campos de la cita', async () => {
    const sortMock = jest.fn().mockReturnThis();
    const leanMock = jest.fn().mockResolvedValue([testCita]);
    
    Cita.find = jest.fn().mockReturnValue({
      sort: sortMock.mockReturnValue({
        lean: leanMock
      })
    });

    const result = await citasService.getCitasByUser(testUserId);

    expect(result[0]).toHaveProperty('_id');
    expect(result[0]).toHaveProperty('usuario');
    expect(result[0]).toHaveProperty('especialidad');
    expect(result[0]).toHaveProperty('fechaHora');
    expect(result[0]).toHaveProperty('lugar');
    expect(result[0]).toHaveProperty('nombreDoctor');
    expect(result[0]).toHaveProperty('estado');
    expect(result[0]).toHaveProperty('observaciones');
  });
});

// ============================================================================
// TESTS PARA createCita
// ============================================================================

describe('citasService.createCita', () => {
  test('Debe crear una nueva cita correctamente', async () => {
    const citaData = {
      especialidad: 'Dermatología',
      fechaHora: new Date('2025-10-30T15:00:00Z'),
      lugar: 'Clínica Piel Sana',
      nombreDoctor: 'Dra. Ana Martínez',
      observaciones: 'Consulta de seguimiento',
    };

    // Mock de Usuario.findByIdAndUpdate
    Usuario.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    const result = await citasService.createCita(testUserId, citaData);

    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
      testUserId,
      { $push: { citas: expect.any(mongoose.Types.ObjectId) } }
    );
    expect(result).toHaveProperty('_id');
    expect(result).toHaveProperty('usuario');
    expect(result.usuario.toString()).toBe(testUserId);
    expect(result).toHaveProperty('especialidad', citaData.especialidad);
    expect(result).toHaveProperty('estado', 'pendiente');
  });

  test('Debe asignar el estado por defecto "pendiente" a una nueva cita', async () => {
    const citaData = {
      especialidad: 'Neurología',
      fechaHora: new Date('2025-11-05T11:00:00Z'),
      lugar: 'Centro Neurológico',
    };

    Usuario.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    const result = await citasService.createCita(testUserId, citaData);

    expect(result).toHaveProperty('estado', 'pendiente');
  });

  test('Debe agregar la referencia de la cita al array de citas del usuario', async () => {
    const citaData = {
      especialidad: 'Pediatría',
      fechaHora: new Date('2025-10-28T16:00:00Z'),
      lugar: 'Hospital Infantil',
      nombreDoctor: 'Dr. Pedro Sánchez',
    };

    Usuario.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    const result = await citasService.createCita(testUserId, citaData);

    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
      testUserId,
      { $push: { citas: result._id } }
    );
  });

  test('Debe lanzar un error de validación si faltan campos requeridos', async () => {
    const citaDataIncompleta = {
      especialidad: 'Urología',
      // Falta fechaHora y lugar (campos requeridos)
    };

    await expect(citasService.createCita(testUserId, citaDataIncompleta)).rejects.toThrow();
  });

  test('Debe crear una cita sin campos opcionales (nombreDoctor, observaciones)', async () => {
    const citaDataMinima = {
      especialidad: 'Medicina General',
      fechaHora: new Date('2025-10-27T08:00:00Z'),
      lugar: 'Centro de Salud',
    };

    Usuario.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    const result = await citasService.createCita(testUserId, citaDataMinima);

    expect(result).toHaveProperty('especialidad', citaDataMinima.especialidad);
    expect(result.fechaHora.toISOString()).toBe(citaDataMinima.fechaHora.toISOString());
    expect(result).toHaveProperty('lugar', citaDataMinima.lugar);
    expect(result.usuario.toString()).toBe(testUserId);
  });

  test('Debe asociar la cita al usuario correcto', async () => {
    const otherUserId = new mongoose.Types.ObjectId().toString();
    const citaData = {
      especialidad: 'Psiquiatría',
      fechaHora: new Date('2025-11-10T13:00:00Z'),
      lugar: 'Clínica Mental',
    };

    Usuario.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    const result = await citasService.createCita(otherUserId, citaData);

    expect(result.usuario.toString()).toBe(otherUserId);
    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
      otherUserId,
      expect.any(Object)
    );
  });

  test('Debe lanzar un error si falla al guardar en la base de datos', async () => {
    const citaData = {
      especialidad: 'Ginecología',
      fechaHora: new Date('2025-11-02T10:00:00Z'),
      lugar: 'Hospital Materno',
    };

    // Mock del método save en el prototype
    const originalSave = Cita.prototype.save;
    Cita.prototype.save = jest.fn().mockRejectedValue(new Error('Database connection error'));

    await expect(citasService.createCita(testUserId, citaData)).rejects.toThrow('Database connection error');
    
    // Restaurar el método original
    Cita.prototype.save = originalSave;
  });

  test('Debe manejar correctamente una fecha en el pasado', async () => {
    const citaData = {
      especialidad: 'Traumatología',
      fechaHora: new Date('2020-01-01T10:00:00Z'), // Fecha en el pasado
      lugar: 'Clínica Trauma',
    };

    Usuario.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    const result = await citasService.createCita(testUserId, citaData);

    expect(result.fechaHora.toISOString()).toBe(citaData.fechaHora.toISOString());
  });

  test('Debe propagar el error si falla la actualización del usuario', async () => {
    const citaData = {
      especialidad: 'Endocrinología',
      fechaHora: new Date('2025-11-08T09:30:00Z'),
      lugar: 'Centro Endocrino',
    };

    // Mock que falla al actualizar el usuario
    Usuario.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('User update failed'));

    await expect(citasService.createCita(testUserId, citaData)).rejects.toThrow('User update failed');
  });

  test('Debe crear citas con diferentes especialidades', async () => {
    const especialidades = ['Cardiología', 'Dermatología', 'Neurología', 'Psiquiatría'];
    
    Usuario.findByIdAndUpdate = jest.fn().mockResolvedValue({});
    
    for (const especialidad of especialidades) {
      const citaData = {
        especialidad,
        fechaHora: new Date('2025-11-15T10:00:00Z'),
        lugar: `Clínica ${especialidad}`,
      };

      const result = await citasService.createCita(testUserId, citaData);

      expect(result).toHaveProperty('especialidad', especialidad);
    }
  });

  test('Debe preservar todas las propiedades proporcionadas en data', async () => {
    const citaDataCompleta = {
      especialidad: 'Reumatología',
      fechaHora: new Date('2025-11-20T14:00:00Z'),
      lugar: 'Hospital Reumatológico',
      nombreDoctor: 'Dr. Luis Ramírez',
      observaciones: 'Paciente con artritis reumatoide',
    };

    Usuario.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    const result = await citasService.createCita(testUserId, citaDataCompleta);

    expect(result.especialidad).toBe(citaDataCompleta.especialidad);
    expect(result.fechaHora.toISOString()).toBe(citaDataCompleta.fechaHora.toISOString());
    expect(result.lugar).toBe(citaDataCompleta.lugar);
    expect(result.nombreDoctor).toBe(citaDataCompleta.nombreDoctor);
    expect(result.observaciones).toBe(citaDataCompleta.observaciones);
  });
});
