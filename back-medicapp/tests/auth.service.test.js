/**
 * Tests unitarios para el servicio de autenticación (auth.service.js)
 * 
 * Estos tests se centran en la lógica de negocio del servicio, mockeando
 * las dependencias externas como la base de datos y los helpers.
 */

const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { Usuario } = require('../models/Schema');
const { generarJWT } = require('../helpers/jwt');
const authService = require('../services/auth.service');

// Mockear dependencias
jest.mock('bcryptjs');
jest.mock('../helpers/jwt');

let mongoServer;

// Datos de prueba
const testUser = {
  id: new mongoose.Types.ObjectId().toString(),
  nombre: 'Juan',
  apellidos: 'Pérez García',
  cedula: '1234567890',
  contrasena: 'hashedPassword123!',
  save: jest.fn().mockResolvedValue(true),
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
// TESTS PARA registerUser
// ============================================================================

describe('authService.registerUser', () => {
  test('Debe registrar un nuevo usuario correctamente', async () => {
    const userData = {
      cedula: '1234567890',
      contrasena: 'Password123!',
      nombre: 'Juan',
      apellidos: 'Pérez',
      celular: '3001234567' // <-- Campo añadido
    };

    // Mock de la base de datos
    Usuario.findOne = jest.fn().mockResolvedValue(null);
    
    // Mock de bcrypt
    bcrypt.genSaltSync.mockReturnValue('salt');
    bcrypt.hashSync.mockReturnValue('hashedPassword');

    // Mock de JWT
    generarJWT.mockResolvedValue('test-token');

    // Mock del constructor y save
    const saveMock = jest.fn().mockResolvedValue(true);
    const userInstance = { ...userData, contrasena: 'hashedPassword', save: saveMock };
    // @ts-ignore
    Usuario.prototype.save = saveMock;
    // @ts-ignore
    jest.spyOn(mongoose, 'model').mockImplementation(() => function() {
      return userInstance;
    });


    const result = await authService.registerUser(userData);

    expect(Usuario.findOne).toHaveBeenCalledWith({ cedula: userData.cedula });
    expect(bcrypt.hashSync).toHaveBeenCalledWith(userData.contrasena, 'salt');
    expect(saveMock).toHaveBeenCalled();
    expect(generarJWT).toHaveBeenCalled();
    expect(result).toHaveProperty('token', 'test-token');
    expect(result).toHaveProperty('usuario');
    expect(result.usuario).toHaveProperty('nombre', userData.nombre);
  });

  test('Debe lanzar un error si el usuario ya existe', async () => {
    const userData = { cedula: '1234567890' };

    // Mock para simular que el usuario ya existe
    Usuario.findOne = jest.fn().mockResolvedValue(testUser);

    await expect(authService.registerUser(userData)).rejects.toThrow('Un usuario ya existe con esa cédula');
  });
});

// ============================================================================
// TESTS PARA loginUser
// ============================================================================

describe('authService.loginUser', () => {
  test('Debe hacer login correctamente con credenciales válidas', async () => {
    const cedula = '1234567890';
    const contrasena = 'Password123!';

    // Mock de la base de datos
    Usuario.findOne = jest.fn().mockResolvedValue(testUser);
    
    // Mock de bcrypt
    bcrypt.compareSync.mockReturnValue(true);

    // Mock de JWT
    generarJWT.mockResolvedValue('test-token');

    const result = await authService.loginUser(cedula, contrasena);

    expect(Usuario.findOne).toHaveBeenCalledWith({ cedula });
    expect(bcrypt.compareSync).toHaveBeenCalledWith(contrasena, testUser.contrasena);
    expect(generarJWT).toHaveBeenCalledWith(testUser.id, testUser.cedula);
    expect(result).toHaveProperty('token', 'test-token');
    expect(result.usuario).toHaveProperty('cedula', cedula);
  });

  test('Debe lanzar un error si el usuario no existe', async () => {
    // Mock para simular que el usuario no existe
    Usuario.findOne = jest.fn().mockResolvedValue(null);

    await expect(authService.loginUser('inexistente', 'password')).rejects.toThrow('Cédula o contraseña incorrectas');
  });

  test('Debe lanzar un error si la contraseña es incorrecta', async () => {
    // Mock para simular contraseña incorrecta
    Usuario.findOne = jest.fn().mockResolvedValue(testUser);
    bcrypt.compareSync.mockReturnValue(false);

    await expect(authService.loginUser(testUser.cedula, 'wrong-password')).rejects.toThrow('Cédula o contraseña incorrectas');
  });
});

// ============================================================================
// TESTS PARA renewToken
// ============================================================================

describe('authService.renewToken', () => {
  test('Debe renovar el token correctamente', async () => {
    // Mock de JWT
    generarJWT.mockResolvedValue('new-test-token');

    const result = await authService.renewToken(testUser);

    expect(generarJWT).toHaveBeenCalledWith(testUser.id, testUser.cedula);
    expect(result).toHaveProperty('token', 'new-test-token');
    expect(result.usuario).toHaveProperty('uid', testUser.id);
  });

  test('Debe lanzar un error si no se puede generar el token', async () => {
    // Mock de JWT para simular un error
    generarJWT.mockRejectedValue(new Error('Error al generar token'));

    await expect(authService.renewToken(testUser)).rejects.toThrow('Error al renovar el token');
  });
});

// ============================================================================
// TESTS PARA updatePassword
// ============================================================================

describe('authService.updatePassword', () => {
  test('Debe actualizar la contraseña correctamente', async () => {
    const oldPassword = 'Password123!';
    const newPassword = 'NewPassword456!';
    const oldHashedPassword = 'oldHashedPassword';

    // Mock de bcrypt
    bcrypt.compareSync.mockReturnValue(true);
    bcrypt.genSaltSync.mockReturnValue('new-salt');
    bcrypt.hashSync.mockReturnValue('new-hashed-password');

    // El objeto usuario tiene un mock de save
    const usuarioConMock = { ...testUser, contrasena: oldHashedPassword, save: jest.fn().mockResolvedValue(true) };

    const result = await authService.updatePassword(usuarioConMock, oldPassword, newPassword);

    expect(bcrypt.compareSync).toHaveBeenCalledWith(oldPassword, oldHashedPassword);
    expect(bcrypt.hashSync).toHaveBeenCalledWith(newPassword, 'new-salt');
    expect(usuarioConMock.save).toHaveBeenCalled();
    expect(usuarioConMock.contrasena).toBe('new-hashed-password');
    expect(result).toEqual({ msg: 'Contraseña actualizada correctamente' });
  });

  test('Debe lanzar un error si la contraseña antigua es incorrecta', async () => {
    // Mock de bcrypt para simular contraseña incorrecta
    bcrypt.compareSync.mockReturnValue(false);

    await expect(authService.updatePassword(testUser, 'wrong-old-password', 'new-password')).rejects.toThrow('La contraseña antigua no es correcta');
  });

  test('Debe lanzar un error si falla al guardar el usuario', async () => {
    bcrypt.compareSync.mockReturnValue(true);
    bcrypt.genSaltSync.mockReturnValue('salt');
    bcrypt.hashSync.mockReturnValue('new-hashed-password');

    // Mock para simular error al guardar
    const usuarioConError = { ...testUser, save: jest.fn().mockRejectedValue(new Error('DB error')) };

    await expect(authService.updatePassword(usuarioConError, 'old-pass', 'new-pass')).rejects.toThrow('DB error');
  });
});
