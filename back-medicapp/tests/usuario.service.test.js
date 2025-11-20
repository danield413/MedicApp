const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const usuarioService = require('../services/usuario.service');
const { Usuario, ResumenMedico } = require('../models/Schema');

let mongoServer;

// Configuración antes de todas las pruebas
beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.error('Error al iniciar MongoDB Memory Server:', error);
    throw error;
  }
}, 60000);

// Limpiar después de cada prueba
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error('Error al limpiar colecciones:', error);
  }
});

// Cerrar conexión después de todas las pruebas
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop({ doCleanup: true });
    }
  } catch (error) {
    console.error('Error al cerrar conexiones:', error);
  }
}, 60000);

describe('Usuario Service Tests', () => {

  describe('actualizarInfoBasica', () => {
    it('debería actualizar información básica del usuario', async () => {
      const usuario = await Usuario.create({
        nombre: 'Pedro',
        apellidos: 'Díaz',
        cedula: '6677889900',
        celular: '3006677889',
        contrasena: 'password654',
        direccion: 'Calle 1 #2-3'
      });

      const datosActualizar = {
        nombre: 'Pedro Antonio',
        direccion: 'Carrera 10 #20-30',
        tipoSangre: 'A+'
      };

      const usuarioActualizado = await usuarioService.actualizarInfoBasica(
        usuario._id,
        datosActualizar
      );

      expect(usuarioActualizado).toBeDefined();
      expect(usuarioActualizado.nombre).toBe('Pedro Antonio');
      expect(usuarioActualizado.direccion).toBe('Carrera 10 #20-30');
      expect(usuarioActualizado.tipoSangre).toBe('A+');
      expect(usuarioActualizado.cedula).toBe('6677889900');
      expect(usuarioActualizado.contrasena).toBeUndefined();
    });

    it('debería lanzar error si el usuario no existe', async () => {
      const usuarioId = new mongoose.Types.ObjectId();
      
      await expect(
        usuarioService.actualizarInfoBasica(usuarioId, { nombre: 'Test' })
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('debería actualizar solo los campos permitidos', async () => {
      const usuario = await Usuario.create({
        nombre: 'Laura',
        apellidos: 'Herrera',
        cedula: '9988776655',
        celular: '3009988776',
        contrasena: 'password987',
        fechaNacimiento: new Date('1995-06-10'),
        ciudadNacimiento: 'Cali'
      });

      const datosActualizar = {
        nombre: 'Laura María',
        apellidos: 'Herrera González',
        celular: '3101234567',
        fechaNacimiento: new Date('1995-06-10'),
        ciudadNacimiento: 'Medellín',
        ciudadResidencia: 'Bogotá',
        direccion: 'Carrera 50 #30-20',
        tipoSangre: 'B+'
      };

      const usuarioActualizado = await usuarioService.actualizarInfoBasica(
        usuario._id,
        datosActualizar
      );

      expect(usuarioActualizado.nombre).toBe('Laura María');
      expect(usuarioActualizado.apellidos).toBe('Herrera González');
      expect(usuarioActualizado.celular).toBe('3101234567');
      expect(usuarioActualizado.ciudadNacimiento).toBe('Medellín');
      expect(usuarioActualizado.ciudadResidencia).toBe('Bogotá');
      expect(usuarioActualizado.direccion).toBe('Carrera 50 #30-20');
      expect(usuarioActualizado.tipoSangre).toBe('B+');
      expect(usuarioActualizado.cedula).toBe('9988776655');
    });

    it('debería ignorar campos que no están en la lista de actualizables', async () => {
      const usuario = await Usuario.create({
        nombre: 'Carlos',
        apellidos: 'Ramírez',
        cedula: '1122334455',
        celular: '3001122334',
        contrasena: 'password789'
      });

      const datosActualizar = {
        nombre: 'Carlos Alberto',
        cedula: '0000000000',
        contrasena: 'nueva_contraseña',
        formulas: ['fake_id'],
        citas: ['fake_id']
      };

      const usuarioActualizado = await usuarioService.actualizarInfoBasica(
        usuario._id,
        datosActualizar
      );

      expect(usuarioActualizado.nombre).toBe('Carlos Alberto');
      expect(usuarioActualizado.cedula).toBe('1122334455');
    });

    it('debería actualizar solo algunos campos sin afectar los demás', async () => {
      const usuario = await Usuario.create({
        nombre: 'Ana',
        apellidos: 'Gómez',
        cedula: '5544332211',
        celular: '3005544332',
        contrasena: 'password321',
        direccion: 'Calle Original',
        tipoSangre: 'O+'
      });

      const datosActualizar = {
        celular: '3109876543'
      };

      const usuarioActualizado = await usuarioService.actualizarInfoBasica(
        usuario._id,
        datosActualizar
      );

      expect(usuarioActualizado.celular).toBe('3109876543');
      expect(usuarioActualizado.nombre).toBe('Ana');
      expect(usuarioActualizado.direccion).toBe('Calle Original');
      expect(usuarioActualizado.tipoSangre).toBe('O+');
    });
  });

  describe('obtenerInfoBasica', () => {
    it('debería obtener la información básica del usuario', async () => {
      const usuario = await Usuario.create({
        nombre: 'María',
        apellidos: 'López Pérez',
        cedula: '9876543210',
        celular: '3009876543',
        contrasena: 'password456',
        fechaNacimiento: new Date('1992-03-20'),
        ciudadNacimiento: 'Cartagena',
        ciudadResidencia: 'Barranquilla',
        direccion: 'Avenida 5 #10-20',
        tipoSangre: 'AB+'
      });

      const infoBasica = await usuarioService.obtenerInfoBasica(usuario._id);

      expect(infoBasica).toBeDefined();
      expect(infoBasica.nombre).toBe('María');
      expect(infoBasica.apellidos).toBe('López Pérez');
      expect(infoBasica.cedula).toBe('9876543210');
      expect(infoBasica.celular).toBe('3009876543');
      expect(infoBasica.tipoSangre).toBe('AB+');
      expect(infoBasica.contrasena).toBeUndefined();
      expect(infoBasica.resumenMedico).toBeUndefined();
    });

    it('debería lanzar error si el usuario no existe', async () => {
      const usuarioId = new mongoose.Types.ObjectId();

      await expect(
        usuarioService.obtenerInfoBasica(usuarioId)
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('debería obtener usuario con campos opcionales vacíos', async () => {
      const usuario = await Usuario.create({
        nombre: 'Roberto',
        apellidos: 'Vargas',
        cedula: '1122998877',
        celular: '3001122998',
        contrasena: 'password357'
      });

      const infoBasica = await usuarioService.obtenerInfoBasica(usuario._id);

      expect(infoBasica).toBeDefined();
      expect(infoBasica.nombre).toBe('Roberto');
      expect(infoBasica.fechaNacimiento).toBeUndefined();
      expect(infoBasica.ciudadNacimiento).toBeUndefined();
      expect(infoBasica.tipoSangre).toBeUndefined();
    });
  });

  describe('actualizarResumenMedico', () => {
    it('debería crear un resumen médico si no existe', async () => {
      const usuario = await Usuario.create({
        nombre: 'Sofía',
        apellidos: 'Ruiz',
        cedula: '4455667788',
        celular: '3004455667',
        contrasena: 'password147'
      });

      const descripcion = 'Paciente con hipertensión controlada. Última medición: 120/80 mmHg.';

      const resumen = await usuarioService.actualizarResumenMedico(
        usuario._id,
        descripcion
      );

      expect(resumen).toBeDefined();
      expect(resumen.descripcion).toBe(descripcion);
      expect(resumen.usuario.toString()).toBe(usuario._id.toString());
      expect(resumen.fechaActualizacion).toBeDefined();
      expect(resumen.fechaActualizacion).toBeInstanceOf(Date);

      const usuarioActualizado = await Usuario.findById(usuario._id);
      expect(usuarioActualizado.resumenMedico).toBeDefined();
      expect(usuarioActualizado.resumenMedico.toString()).toBe(resumen._id.toString());
    });

    it('debería actualizar un resumen médico existente', async () => {
      const usuario = await Usuario.create({
        nombre: 'Diego',
        apellidos: 'Navarro',
        cedula: '7788990011',
        celular: '3007788990',
        contrasena: 'password258'
      });

      const resumenInicial = await ResumenMedico.create({
        usuario: usuario._id,
        descripcion: 'Descripción inicial del historial médico',
        fechaActualizacion: new Date('2024-01-01')
      });

      usuario.resumenMedico = resumenInicial._id;
      await usuario.save();

      const nuevaDescripcion = 'Descripción actualizada: paciente recuperado de cirugía. Control post-operatorio exitoso.';

      const resumenActualizado = await usuarioService.actualizarResumenMedico(
        usuario._id,
        nuevaDescripcion
      );

      expect(resumenActualizado).toBeDefined();
      expect(resumenActualizado.descripcion).toBe(nuevaDescripcion);
      expect(resumenActualizado._id.toString()).toBe(resumenInicial._id.toString());
      expect(resumenActualizado.fechaActualizacion.getTime()).toBeGreaterThan(
        new Date('2024-01-01').getTime()
      );
    });

    it('debería lanzar error si el usuario no existe', async () => {
      const usuarioId = new mongoose.Types.ObjectId();

      await expect(
        usuarioService.actualizarResumenMedico(usuarioId, 'Descripción de prueba')
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('debería actualizar la fecha de actualización cada vez', async () => {
      const usuario = await Usuario.create({
        nombre: 'Valentina',
        apellidos: 'Silva',
        cedula: '2233445566',
        celular: '3002233445',
        contrasena: 'password741'
      });

      const resumen1 = await usuarioService.actualizarResumenMedico(
        usuario._id,
        'Primera descripción'
      );
      const fecha1 = resumen1.fechaActualizacion;

      await new Promise(resolve => setTimeout(resolve, 100));

      const resumen2 = await usuarioService.actualizarResumenMedico(
        usuario._id,
        'Segunda descripción actualizada'
      );
      const fecha2 = resumen2.fechaActualizacion;

      expect(fecha2.getTime()).toBeGreaterThan(fecha1.getTime());
      expect(resumen2.descripcion).toBe('Segunda descripción actualizada');
    });

    it('debería lanzar error con descripción vacía si es requerida', async () => {
      const usuario = await Usuario.create({
        nombre: 'Fernando',
        apellidos: 'Castro',
        cedula: '9900112233',
        celular: '3009900112',
        contrasena: 'password159'
      });

      await expect(
        usuarioService.actualizarResumenMedico(usuario._id, '')
      ).rejects.toThrow();
    });

    it('debería crear resumen médico con descripción válida mínima', async () => {
      const usuario = await Usuario.create({
        nombre: 'Camila',
        apellidos: 'Rojas',
        cedula: '5566778899',
        celular: '3005566778',
        contrasena: 'password246'
      });

      const descripcion = 'Sin antecedentes relevantes';

      const resumen = await usuarioService.actualizarResumenMedico(
        usuario._id,
        descripcion
      );

      expect(resumen).toBeDefined();
      expect(resumen.descripcion).toBe(descripcion);
      expect(resumen.descripcion.length).toBeGreaterThan(0);
    });
  });

  describe('getResumenMedico', () => {
    it('debería obtener el resumen médico del usuario', async () => {
      const usuario = await Usuario.create({
        nombre: 'Ricardo',
        apellidos: 'Mendoza',
        cedula: '3344556677',
        celular: '3003344556',
        contrasena: 'password369'
      });

      const resumen = await ResumenMedico.create({
        usuario: usuario._id,
        descripcion: 'Paciente diabético tipo 2. Tratamiento con Metformina 850mg.',
        fechaActualizacion: new Date()
      });

      usuario.resumenMedico = resumen._id;
      await usuario.save();

      const resumenObtenido = await usuarioService.getResumenMedico(usuario._id);

      expect(resumenObtenido).toBeDefined();
      expect(resumenObtenido.descripcion).toBe('Paciente diabético tipo 2. Tratamiento con Metformina 850mg.');
      expect(resumenObtenido._id.toString()).toBe(resumen._id.toString());
      expect(resumenObtenido.usuario.toString()).toBe(usuario._id.toString());
    });

    it('debería retornar objeto por defecto si no hay resumen médico', async () => {
      const usuario = await Usuario.create({
        nombre: 'Gabriela',
        apellidos: 'Reyes',
        cedula: '4433221100',
        celular: '3004433221',
        contrasena: 'password753'
      });

      const resumenObtenido = await usuarioService.getResumenMedico(usuario._id);

      expect(resumenObtenido).toBeDefined();
      expect(resumenObtenido.descripcion).toBe('');
      expect(resumenObtenido._id).toBeNull();
    });

    it('debería lanzar error si el usuario no existe', async () => {
      const usuarioId = new mongoose.Types.ObjectId();

      await expect(
        usuarioService.getResumenMedico(usuarioId)
      ).rejects.toThrow();
    });

    it('debería retornar el resumen médico populado correctamente', async () => {
      const usuario = await Usuario.create({
        nombre: 'Andrés',
        apellidos: 'Torres',
        cedula: '8899001122',
        celular: '3008899001',
        contrasena: 'password852'
      });

      const resumen = await ResumenMedico.create({
        usuario: usuario._id,
        descripcion: 'Paciente con alergia a la penicilina. Historial de asma.',
        fechaActualizacion: new Date('2024-11-15')
      });

      usuario.resumenMedico = resumen._id;
      await usuario.save();

      const resumenObtenido = await usuarioService.getResumenMedico(usuario._id);

      expect(resumenObtenido).toBeDefined();
      expect(resumenObtenido._id).toBeDefined();
      expect(resumenObtenido.usuario).toBeDefined();
      expect(resumenObtenido.descripcion).toBeTruthy();
      expect(resumenObtenido.fechaActualizacion).toBeInstanceOf(Date);
    });
  });
});