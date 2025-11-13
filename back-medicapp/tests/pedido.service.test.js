/**
 * Tests unitarios para el servicio de pedidos (pedido.service.js)
 * 
 * Estos tests se centran en la lógica de negocio del servicio, mockeando
 * las dependencias externas como la base de datos.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
// Añadimos Usuario al import
const { Pedido, Domiciliario, Usuario } = require('../models/Schema');
const pedidoService = require('../services/pedido.service');

let mongoServer;

// Datos de prueba
const testUsuarioId = new mongoose.Types.ObjectId();

const testPedido = {
  _id: new mongoose.Types.ObjectId(),
  usuario: testUsuarioId,
  medicamentos: [
    {
      medicamento: new mongoose.Types.ObjectId(),
      cantidad: 2
    }
  ],
  estadoPedido: 'pendiente',
  fechaHora: new Date(),
  save: jest.fn().mockResolvedValue(true)
};

const testDomiciliario = {
  _id: new mongoose.Types.ObjectId(),
  nombre: 'Carlos',
  apellidos: 'Dominguez',
  pedidosAsignados: []
};

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
// TESTS PARA getPedidosPendientes
// ============================================================================

describe('pedidoService.getPedidosPendientes', () => {
  test('Debe obtener todos los pedidos pendientes correctamente', async () => {
    const mockPedidos = [
      {
        _id: new mongoose.Types.ObjectId(),
        estadoPedido: 'pendiente',
        fechaHora: new Date('2024-01-01'),
        usuario: { nombre: 'Juan', apellidos: 'Pérez', direccion: 'Calle 1' },
        medicamentos: [{ medicamento: { nombre: 'Ibuprofeno', concentracion: '400mg' }, cantidad: 1 }]
      },
      {
        _id: new mongoose.Types.ObjectId(),
        estadoPedido: 'pendiente',
        fechaHora: new Date('2024-01-02'),
        usuario: { nombre: 'María', apellidos: 'García', direccion: 'Calle 2' },
        medicamentos: [{ medicamento: { nombre: 'Paracetamol', concentracion: '500mg' }, cantidad: 2 }]
      }
    ];

    const sortMock = jest.fn().mockResolvedValue(mockPedidos);
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
    const populateMock2 = jest.fn().mockReturnValue({ populate: populateMock });

    Pedido.find = jest.fn().mockReturnValue({ populate: populateMock2 });

    const result = await pedidoService.getPedidosPendientes();

    expect(Pedido.find).toHaveBeenCalledWith({ estadoPedido: 'pendiente' });
    expect(populateMock2).toHaveBeenCalledWith('usuario', 'nombre apellidos direccion');
    expect(populateMock).toHaveBeenCalledWith('medicamentos.medicamento', 'nombre concentracion');
    expect(sortMock).toHaveBeenCalledWith({ fechaHora: 1 });
    expect(result).toEqual(mockPedidos);
    expect(result).toHaveLength(2);
  });

  test('Debe devolver un array vacío si no hay pedidos pendientes', async () => {
    const sortMock = jest.fn().mockResolvedValue([]);
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
    const populateMock2 = jest.fn().mockReturnValue({ populate: populateMock });

    Pedido.find = jest.fn().mockReturnValue({ populate: populateMock2 });

    const result = await pedidoService.getPedidosPendientes();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  test('Debe ordenar los pedidos por fecha (más antiguos primero)', async () => {
    const mockPedidos = [
      { _id: '1', fechaHora: new Date('2024-01-01') },
      { _id: '2', fechaHora: new Date('2024-01-03') },
      { _id: '3', fechaHora: new Date('2024-01-02') }
    ];

    const sortMock = jest.fn().mockResolvedValue(mockPedidos);
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
    const populateMock2 = jest.fn().mockReturnValue({ populate: populateMock });

    Pedido.find = jest.fn().mockReturnValue({ populate: populateMock2 });

    await pedidoService.getPedidosPendientes();

    expect(sortMock).toHaveBeenCalledWith({ fechaHora: 1 });
  });

  test('Debe popular los datos del usuario y medicamentos', async () => {
    const sortMock = jest.fn().mockResolvedValue([]);
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
    const populateMock2 = jest.fn().mockReturnValue({ populate: populateMock });

    Pedido.find = jest.fn().mockReturnValue({ populate: populateMock2 });

    await pedidoService.getPedidosPendientes();

    expect(populateMock2).toHaveBeenCalledWith('usuario', 'nombre apellidos direccion');
    expect(populateMock).toHaveBeenCalledWith('medicamentos.medicamento', 'nombre concentracion');
  });

  test('Debe lanzar un error si falla la consulta a la base de datos', async () => {
    const populateMock = jest.fn().mockImplementation(() => {
      throw new Error('Database error');
    });

    Pedido.find = jest.fn().mockReturnValue({ populate: populateMock });

    await expect(pedidoService.getPedidosPendientes()).rejects.toThrow('Error al obtener los pedidos pendientes');
  });
});

// ============================================================================
// TESTS PARA aceptarPedido
// ============================================================================

describe('pedidoService.aceptarPedido', () => {
  test('Debe aceptar un pedido correctamente', async () => {
    const pedidoId = testPedido._id.toString();
    const domiciliarioId = testDomiciliario._id.toString();

    const mockPedido = {
      ...testPedido,
      estadoPedido: 'pendiente',
      domiciliario: null,
      save: jest.fn().mockResolvedValue(true)
    };

    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);
    Domiciliario.findByIdAndUpdate = jest.fn().mockResolvedValue(testDomiciliario);

    const result = await pedidoService.aceptarPedido(pedidoId, domiciliarioId);

    expect(Pedido.findById).toHaveBeenCalledWith(pedidoId);
    expect(mockPedido.domiciliario).toBe(domiciliarioId);
    expect(mockPedido.estadoPedido).toBe('en_preparacion');
    expect(mockPedido.save).toHaveBeenCalled();
    expect(Domiciliario.findByIdAndUpdate).toHaveBeenCalledWith(
      domiciliarioId,
      { $push: { pedidosAsignados: mockPedido._id } }
    );
    expect(result).toEqual(mockPedido);
  });

  test('Debe lanzar un error si el pedido no existe', async () => {
    Pedido.findById = jest.fn().mockResolvedValue(null);

    await expect(
      pedidoService.aceptarPedido('id-inexistente', testDomiciliario._id.toString())
    ).rejects.toThrow('El pedido no existe');
  });

  test('Debe lanzar un error si el pedido ya fue aceptado', async () => {
    const mockPedido = {
      ...testPedido,
      estadoPedido: 'en_preparacion',
      domiciliario: new mongoose.Types.ObjectId()
    };

    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);

    await expect(
      pedidoService.aceptarPedido(testPedido._id.toString(), testDomiciliario._id.toString())
    ).rejects.toThrow('Este pedido ya fue aceptado o no está pendiente');
  });

  test('Debe lanzar un error si el pedido no está pendiente', async () => {
    const mockPedido = {
      ...testPedido,
      estadoPedido: 'entregado',
      domiciliario: null
    };

    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);

    await expect(
      pedidoService.aceptarPedido(testPedido._id.toString(), testDomiciliario._id.toString())
    ).rejects.toThrow('Este pedido ya fue aceptado o no está pendiente');
  });

  test('Debe actualizar el domiciliario con el pedido asignado', async () => {
    const pedidoId = testPedido._id.toString();
    const domiciliarioId = testDomiciliario._id.toString();

    const mockPedido = {
      ...testPedido,
      estadoPedido: 'pendiente',
      domiciliario: null,
      save: jest.fn().mockResolvedValue(true)
    };

    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);
    Domiciliario.findByIdAndUpdate = jest.fn().mockResolvedValue(testDomiciliario);

    await pedidoService.aceptarPedido(pedidoId, domiciliarioId);

    expect(Domiciliario.findByIdAndUpdate).toHaveBeenCalledWith(
      domiciliarioId,
      { $push: { pedidosAsignados: mockPedido._id } }
    );
  });

  test('Debe cambiar el estado del pedido a "en_preparacion"', async () => {
    const mockPedido = {
      ...testPedido,
      estadoPedido: 'pendiente',
      domiciliario: null,
      save: jest.fn().mockResolvedValue(true)
    };

    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);
    Domiciliario.findByIdAndUpdate = jest.fn().mockResolvedValue(testDomiciliario);

    await pedidoService.aceptarPedido(
      testPedido._id.toString(),
      testDomiciliario._id.toString()
    );

    expect(mockPedido.estadoPedido).toBe('en_preparacion');
  });

  test('Debe lanzar un error si falla al guardar el pedido', async () => {
    const mockPedido = {
      ...testPedido,
      estadoPedido: 'pendiente',
      domiciliario: null,
      save: jest.fn().mockRejectedValue(new Error('Error al guardar'))
    };

    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);

    await expect(
      pedidoService.aceptarPedido(testPedido._id.toString(), testDomiciliario._id.toString())
    ).rejects.toThrow('Error al guardar');
  });

  test('Debe lanzar un error si falla al actualizar el domiciliario', async () => {
    const mockPedido = {
      ...testPedido,
      estadoPedido: 'pendiente',
      domiciliario: null,
      save: jest.fn().mockResolvedValue(true)
    };

    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);
    Domiciliario.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error al actualizar domiciliario'));

    await expect(
      pedidoService.aceptarPedido(testPedido._id.toString(), testDomiciliario._id.toString())
    ).rejects.toThrow('Error al actualizar domiciliario');
  });
});

// ============================================================================
// TESTS PARA crearPedido
// ============================================================================

describe('pedidoService.crearPedido', () => {
  
  // Mock del prototipo de Pedido para simular 'new Pedido()' y 'save()'
  const saveMock = jest.fn().mockResolvedValue(true);
  const mockPedidoInstance = {
    ...testPedido,
    save: saveMock
  };
  
  beforeEach(() => {
    // Mock de 'new Pedido(datos)'
    jest.spyOn(Pedido.prototype, 'save').mockResolvedValue(mockPedidoInstance);
    // Mock de la actualización del Usuario
    Usuario.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
  });
  
  test('Debe crear un pedido y asignarlo al usuario', async () => {
    const datosPedido = {
      medicamentos: [{ medicamento: new mongoose.Types.ObjectId(), cantidad: 1 }],
      direccionEntrega: 'Calle Falsa 123',
      total: 100
    };

    const mockPedidoCreado = {
      ...datosPedido,
      _id: new mongoose.Types.ObjectId(),
      usuario: testUsuarioId,
      estadoPedido: 'pendiente',
      fechaHora: expect.any(Date),
      save: jest.fn().mockResolvedValue(true)
    };
    
    Pedido.prototype.save = jest.fn().mockResolvedValue(mockPedidoCreado);
    Usuario.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

    const result = await pedidoService.crearPedido(datosPedido, testUsuarioId);

    expect(Pedido.prototype.save).toHaveBeenCalled();
    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(testUsuarioId, {
      $push: { pedidos: result._id }
    });
    
    expect(result.usuario).toBe(testUsuarioId);
    expect(result.estadoPedido).toBe('pendiente');
    expect(result.direccionEntrega).toBe('Calle Falsa 123');
  });

  test('Debe lanzar un error si falla al guardar el pedido', async () => {
    Pedido.prototype.save = jest.fn().mockRejectedValue(new Error('DB Error'));
    
    await expect(pedidoService.crearPedido({}, testUsuarioId))
      .rejects.toThrow('Error al crear el pedido');
  });

   test('Debe lanzar un error si falla al actualizar el usuario', async () => {
    Pedido.prototype.save = jest.fn().mockResolvedValue(testPedido);
    Usuario.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('DB Error User'));
    
    await expect(pedidoService.crearPedido({}, testUsuarioId))
      .rejects.toThrow('Error al crear el pedido');
  });
});

// ============================================================================
// TESTS PARA getPedidosPorUsuario
// ============================================================================

describe('pedidoService.getPedidosPorUsuario', () => {
  test('Debe retornar los pedidos del usuario, populados y ordenados', async () => {
    const mockPedidosUsuario = [
      { ...testPedido, fechaHora: new Date('2024-01-02') },
      { ...testPedido, _id: new mongoose.Types.ObjectId(), fechaHora: new Date('2024-01-01') }
    ];

    const sortMock = jest.fn().mockResolvedValue(mockPedidosUsuario);
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
    const populateMock2 = jest.fn().mockReturnValue({ populate: populateMock });

    Pedido.find = jest.fn().mockReturnValue({ populate: populateMock2 });

    const result = await pedidoService.getPedidosPorUsuario(testUsuarioId);

    expect(Pedido.find).toHaveBeenCalledWith({ usuario: testUsuarioId });
    // CORRECCIÓN: El orden de los populate está invertido
    expect(populateMock2).toHaveBeenCalledWith('domiciliario', 'nombre apellidos');
    expect(populateMock).toHaveBeenCalledWith('medicamentos.medicamento', 'nombre concentracion');
    expect(sortMock).toHaveBeenCalledWith({ fechaHora: -1 });
    expect(result).toEqual(mockPedidosUsuario);
  });

  test('Debe lanzar un error si falla la consulta', async () => {
    Pedido.find = jest.fn().mockImplementation(() => {
      throw new Error('DB Error');
    });

    await expect(pedidoService.getPedidosPorUsuario(testUsuarioId))
      .rejects.toThrow('Error al obtener los pedidos del usuario');
  });
});

// ============================================================================
// TESTS PARA actualizarPedidoUsuario
// ============================================================================

describe('pedidoService.actualizarPedidoUsuario', () => {
  
  test('Debe actualizar un pedido correctamente', async () => {
    const mockPedido = {
      ...testPedido,
      usuario: testUsuarioId,
      save: jest.fn().mockResolvedValue(true)
    };
    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);

    const datosActualizar = {
      direccionEntrega: 'Nueva Direccion 456',
      observaciones: 'Urgente'
    };

    const result = await pedidoService.actualizarPedidoUsuario(testPedido._id, datosActualizar, testUsuarioId);

    expect(Pedido.findById).toHaveBeenCalledWith(testPedido._id);
    expect(result.direccionEntrega).toBe('Nueva Direccion 456');
    expect(result.observaciones).toBe('Urgente');
    expect(mockPedido.save).toHaveBeenCalled();
  });

  test('Debe lanzar error si el pedido no existe', async () => {
    Pedido.findById = jest.fn().mockResolvedValue(null);
    
    await expect(pedidoService.actualizarPedidoUsuario('id-falso', {}, testUsuarioId))
      .rejects.toThrow();
  });

  test('Debe lanzar error si el usuario no es propietario', async () => {
    const otroUsuarioId = new mongoose.Types.ObjectId();
    const mockPedido = { 
      ...testPedido, 
      usuario: otroUsuarioId
    };
    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);

    await expect(pedidoService.actualizarPedidoUsuario(testPedido._id, {}, testUsuarioId))
      .rejects.toThrow();
  });

  test('Debe lanzar error si el pedido no está "pendiente"', async () => {
    const mockPedido = {
      ...testPedido,
      usuario: testUsuarioId,
      estadoPedido: 'en_camino',
      save: jest.fn()
    };
    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);

    await expect(pedidoService.actualizarPedidoUsuario(testPedido._id, {}, testUsuarioId))
      .rejects.toThrow();
  });

  test('Debe actualizar solo los campos proporcionados', async () => {
    const mockPedido = {
      ...testPedido,
      usuario: testUsuarioId,
      direccionEntrega: 'Calle Original',
      observaciones: 'Sin observaciones',
      save: jest.fn().mockResolvedValue(true)
    };
    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);

    const datosActualizar = {
      observaciones: 'Nuevo comentario'
    };

    const result = await pedidoService.actualizarPedidoUsuario(testPedido._id, datosActualizar, testUsuarioId);

    expect(result.observaciones).toBe('Nuevo comentario');
    expect(result.direccionEntrega).toBe('Calle Original'); // No cambió
  });

  test('Debe lanzar error si falla al guardar', async () => {
    const mockPedido = {
      ...testPedido,
      usuario: testUsuarioId,
      save: jest.fn().mockRejectedValue(new Error('DB Error'))
    };
    Pedido.findById = jest.fn().mockResolvedValue(mockPedido);

    await expect(pedidoService.actualizarPedidoUsuario(testPedido._id, {}, testUsuarioId))
      .rejects.toThrow();
  });
});