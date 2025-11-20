const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const formulaService = require('../services/formula.service');
const { Formula, Usuario, Dosis, Medicamento } = require('../models/Schema');

let mongoServer;

// Configuración antes de todas las pruebas
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Limpiar después de cada prueba
afterEach(async () => {
  await Formula.deleteMany({});
  await Usuario.deleteMany({});
  await Dosis.deleteMany({});
  await Medicamento.deleteMany({});
});

// Cerrar conexión después de todas las pruebas
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Formula Service Tests', () => {
  
  describe('createFormula', () => {
    it('debería crear una fórmula médica exitosamente', async () => {
      // Crear usuario de prueba
      const usuario = await Usuario.create({
        nombre: 'Juan',
        apellidos: 'Pérez',
        cedula: '1234567890',
        celular: '3001234567',
        contrasena: 'password123'
      });

      // Crear medicamento de prueba
      const medicamento = await Medicamento.create({
        nombre: 'Ibuprofeno',
        descripcion: 'Analgésico',
        concentracion: '400mg',
        presentacion: 'Tabletas'
      });

      // Datos de la fórmula
      const formulaData = {
        usuario: usuario._id,
        fechaFormula: new Date(),
        nombreDoctor: 'Dr. García',
        especialidad: 'Medicina General',
        institucion: 'Hospital Central',
        dosisData: [{
          medicamento: medicamento._id,
          cantidadDiaria: 3,
          descripcion: 'Cada 8 horas',
          unidadMedida: 'tabletas',
          frecuencia: 'Cada 8 horas'
        }],
        diagnostico: 'Dolor de cabeza',
        vigenciaHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      const formula = await formulaService.createFormula(formulaData);

      expect(formula).toBeDefined();
      expect(formula.usuario._id.toString()).toBe(usuario._id.toString());
      expect(formula.nombreDoctor).toBe('Dr. García');
      expect(formula.especialidad).toBe('Medicina General');
      expect(formula.dosis).toHaveLength(1);
    });

    it('debería lanzar error si el usuario no existe', async () => {
      const formulaData = {
        usuario: new mongoose.Types.ObjectId(),
        nombreDoctor: 'Dr. García',
        especialidad: 'Medicina General',
        institucion: 'Hospital Central'
      };

      await expect(formulaService.createFormula(formulaData))
        .rejects.toThrow('Usuario no encontrado');
    });

    it('debería crear fórmula con dosis existentes', async () => {
      const usuario = await Usuario.create({
        nombre: 'María',
        apellidos: 'López',
        cedula: '9876543210',
        celular: '3009876543',
        contrasena: 'password456'
      });

      const medicamento = await Medicamento.create({
        nombre: 'Paracetamol',
        concentracion: '500mg'
      });

      const dosis = await Dosis.create({
        medicamento: medicamento._id,
        cantidadDiaria: 2,
        descripcion: 'Cada 12 horas'
      });

      const formulaData = {
        usuario: usuario._id,
        nombreDoctor: 'Dr. Martínez',
        especialidad: 'Pediatría',
        institucion: 'Clínica San Juan',
        dosis: [dosis._id]
      };

      const formula = await formulaService.createFormula(formulaData);

      expect(formula.dosis).toHaveLength(1);
      expect(formula.dosis[0]._id.toString()).toBe(dosis._id.toString());
    });
  });

  describe('getAllFormulas', () => {
    it('debería listar todas las fórmulas', async () => {
      const usuario = await Usuario.create({
        nombre: 'Carlos',
        apellidos: 'Ramírez',
        cedula: '1122334455',
        celular: '3001122334',
        contrasena: 'password789'
      });

      await Formula.create({
        usuario: usuario._id,
        fechaFormula: new Date(),
        nombreDoctor: 'Dr. Sánchez',
        especialidad: 'Cardiología',
        institucion: 'Hospital del Corazón'
      });

      await Formula.create({
        usuario: usuario._id,
        fechaFormula: new Date(),
        nombreDoctor: 'Dr. Torres',
        especialidad: 'Neurología',
        institucion: 'Clínica Neurológica'
      });

      const formulas = await formulaService.getAllFormulas();

      expect(formulas).toHaveLength(2);
      expect(formulas[0].nombreDoctor).toBeDefined();
    });

    it('debería retornar array vacío si no hay fórmulas', async () => {
      const formulas = await formulaService.getAllFormulas();
      expect(formulas).toEqual([]);
    });
  });

  describe('getFormulaById', () => {
    it('debería obtener una fórmula por ID', async () => {
      const usuario = await Usuario.create({
        nombre: 'Ana',
        apellidos: 'Gómez',
        cedula: '5544332211',
        celular: '3005544332',
        contrasena: 'password321'
      });

      const formula = await Formula.create({
        usuario: usuario._id,
        fechaFormula: new Date(),
        nombreDoctor: 'Dr. Vega',
        especialidad: 'Ginecología',
        institucion: 'Hospital Materno'
      });

      const formulaObtenida = await formulaService.getFormulaById(formula._id);

      expect(formulaObtenida).toBeDefined();
      expect(formulaObtenida._id.toString()).toBe(formula._id.toString());
      expect(formulaObtenida.nombreDoctor).toBe('Dr. Vega');
    });

    it('debería retornar null si la fórmula no existe', async () => {
      const formulaId = new mongoose.Types.ObjectId();
      const formula = await formulaService.getFormulaById(formulaId);
      expect(formula).toBeNull();
    });
  });

  describe('getFormulasByUsuario', () => {
    it('debería obtener todas las fórmulas de un usuario', async () => {
      const usuario = await Usuario.create({
        nombre: 'Pedro',
        apellidos: 'Díaz',
        cedula: '6677889900',
        celular: '3006677889',
        contrasena: 'password654'
      });

      await Formula.create({
        usuario: usuario._id,
        fechaFormula: new Date(),
        nombreDoctor: 'Dr. Castro',
        especialidad: 'Dermatología',
        institucion: 'Clínica Dermatológica'
      });

      await Formula.create({
        usuario: usuario._id,
        fechaFormula: new Date(),
        nombreDoctor: 'Dr. Morales',
        especialidad: 'Oftalmología',
        institucion: 'Centro Oftalmológico'
      });

      const formulas = await formulaService.getFormulasByUsuario(usuario._id);

      expect(formulas).toHaveLength(2);
      expect(formulas[0].usuario.toString()).toBe(usuario._id.toString());
    });

    it('debería retornar array vacío si el usuario no tiene fórmulas', async () => {
      const usuario = await Usuario.create({
        nombre: 'Laura',
        apellidos: 'Herrera',
        cedula: '9988776655',
        celular: '3009988776',
        contrasena: 'password987'
      });

      const formulas = await formulaService.getFormulasByUsuario(usuario._id);
      expect(formulas).toEqual([]);
    });
  });

  describe('updateFormula', () => {
    it('debería actualizar una fórmula existente', async () => {
      const usuario = await Usuario.create({
        nombre: 'Sofía',
        apellidos: 'Ruiz',
        cedula: '4455667788',
        celular: '3004455667',
        contrasena: 'password147'
      });

      const formula = await Formula.create({
        usuario: usuario._id,
        fechaFormula: new Date(),
        nombreDoctor: 'Dr. Ortiz',
        especialidad: 'Psiquiatría',
        institucion: 'Centro de Salud Mental'
      });

      const datosActualizados = {
        diagnostico: 'Ansiedad',
        vigenciaHasta: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      };

      const formulaActualizada = await formulaService.updateFormula(
        formula._id,
        datosActualizados
      );

      expect(formulaActualizada.diagnostico).toBe('Ansiedad');
      expect(formulaActualizada.vigenciaHasta).toBeDefined();
    });

    it('debería actualizar fórmula con nuevas dosis', async () => {
      const usuario = await Usuario.create({
        nombre: 'Diego',
        apellidos: 'Navarro',
        cedula: '7788990011',
        celular: '3007788990',
        contrasena: 'password258'
      });

      const medicamento = await Medicamento.create({
        nombre: 'Amoxicilina',
        concentracion: '500mg'
      });

      const formula = await Formula.create({
        usuario: usuario._id,
        fechaFormula: new Date(),
        nombreDoctor: 'Dr. Flores',
        especialidad: 'Medicina General',
        institucion: 'Hospital General'
      });

      const datosActualizados = {
        dosisData: [{
          medicamento: medicamento._id,
          cantidadDiaria: 3,
          descripcion: 'Cada 8 horas durante 7 días'
        }]
      };

      const formulaActualizada = await formulaService.updateFormula(
        formula._id,
        datosActualizados
      );

      expect(formulaActualizada.dosis).toHaveLength(1);
    });

    it('debería retornar null si la fórmula no existe', async () => {
      const formulaId = new mongoose.Types.ObjectId();
      const formulaActualizada = await formulaService.updateFormula(
        formulaId,
        { diagnostico: 'Test' }
      );
      expect(formulaActualizada).toBeNull();
    });
  });

  describe('deleteFormula', () => {
    it('debería eliminar una fórmula y sus dosis asociadas', async () => {
      const usuario = await Usuario.create({
        nombre: 'Ricardo',
        apellidos: 'Mendoza',
        cedula: '3344556677',
        celular: '3003344556',
        contrasena: 'password369'
      });

      const medicamento = await Medicamento.create({
        nombre: 'Loratadina',
        concentracion: '10mg'
      });

      const dosis = await Dosis.create({
        medicamento: medicamento._id,
        cantidadDiaria: 1,
        descripcion: 'Una vez al día'
      });

      const formula = await Formula.create({
        usuario: usuario._id,
        fechaFormula: new Date(),
        nombreDoctor: 'Dr. Reyes',
        especialidad: 'Alergología',
        institucion: 'Clínica de Alergias',
        dosis: [dosis._id]
      });

      usuario.formulas.push(formula._id);
      await usuario.save();

      const formulaEliminada = await formulaService.deleteFormula(formula._id);

      expect(formulaEliminada).toBeDefined();
      
      const formulaVerificacion = await Formula.findById(formula._id);
      expect(formulaVerificacion).toBeNull();

      const dosisVerificacion = await Dosis.findById(dosis._id);
      expect(dosisVerificacion).toBeNull();

      const usuarioActualizado = await Usuario.findById(usuario._id);
      expect(usuarioActualizado.formulas).not.toContain(formula._id);
    });

    it('debería retornar null si la fórmula no existe', async () => {
      const formulaId = new mongoose.Types.ObjectId();
      const resultado = await formulaService.deleteFormula(formulaId);
      expect(resultado).toBeNull();
    });

    it('debería eliminar fórmula sin dosis asociadas', async () => {
      const usuario = await Usuario.create({
        nombre: 'Valentina',
        apellidos: 'Silva',
        cedula: '2233445566',
        celular: '3002233445',
        contrasena: 'password741'
      });

      const formula = await Formula.create({
        usuario: usuario._id,
        fechaFormula: new Date(),
        nombreDoctor: 'Dr. Vargas',
        especialidad: 'Medicina Familiar',
        institucion: 'Centro de Salud'
      });

      const formulaEliminada = await formulaService.deleteFormula(formula._id);

      expect(formulaEliminada).toBeDefined();
      
      const formulaVerificacion = await Formula.findById(formula._id);
      expect(formulaVerificacion).toBeNull();
    });
  });
});