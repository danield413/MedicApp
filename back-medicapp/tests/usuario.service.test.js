// back-medicapp/tests/usuario.service.test.js
const mongoose = require('mongoose');
const { Usuario, ResumenMedico } = require('../models/Schema');
const usuarioService = require('../services/usuario.service');

// Mockear los modelos
jest.mock('../models/Schema', () => ({
  Usuario: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  ResumenMedico: {
    findById: jest.fn(),
  },
}));

// Mockear el 'save' del prototipo de ResumenMedico
const mockResumenMedicoSave = jest.fn().mockResolvedValue(true);
ResumenMedico.prototype.save = mockResumenMedicoSave;


describe('usuarioService', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Tests para actualizarInfoBasica ---
  describe('actualizarInfoBasica', () => {
    test('Debe actualizar la información básica del usuario', async () => {
      const usuarioId = new mongoose.Types.ObjectId().toString();
      const datos = {
        nombre: 'Juan',
        apellidos: 'Perez',
        celular: '3001234567',
        direccion: 'Calle 123'
      };
      const mockUsuarioActualizado = { _id: usuarioId, ...datos };

      // Simular el encadenamiento de .select()
      Usuario.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsuarioActualizado)
      });

      const result = await usuarioService.actualizarInfoBasica(usuarioId, datos);

      expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
        usuarioId,
        { $set: expect.any(Object) },
        { new: true, runValidators: true }
      );
      expect(Usuario.findByIdAndUpdate().select).toHaveBeenCalledWith('-contrasena');
      expect(result).toEqual(mockUsuarioActualizado);
    });

    test('Debe lanzar un error si el usuario no se encuentra', async () => {
      Usuario.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(usuarioService.actualizarInfoBasica('id-falso', {}))
        .rejects.toThrow('Usuario no encontrado');
    });
  });

  // --- Tests para actualizarResumenMedico ---
  describe('actualizarResumenMedico', () => {
    const usuarioId = new mongoose.Types.ObjectId().toString();
    const mockUsuario = {
      _id: usuarioId,
      resumenMedico: new mongoose.Types.ObjectId().toString(),
      save: jest.fn().mockResolvedValue(true)
    };

    test('Debe actualizar un resumen médico existente', async () => {
      const descripcion = 'Nueva descripción';
      const mockResumen = {
        _id: mockUsuario.resumenMedico,
        usuario: usuarioId,
        descripcion: 'Vieja',
        fechaActualizacion: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      Usuario.findById.mockResolvedValue(mockUsuario);
      ResumenMedico.findById.mockResolvedValue(mockResumen);

      const result = await usuarioService.actualizarResumenMedico(usuarioId, descripcion);

      expect(Usuario.findById).toHaveBeenCalledWith(usuarioId);
      expect(ResumenMedico.findById).toHaveBeenCalledWith(mockUsuario.resumenMedico);
      expect(mockResumen.descripcion).toBe(descripcion); // Verifica que se cambió
      expect(mockResumen.save).toHaveBeenCalled(); // Verifica que se guardó
      expect(result).toEqual(mockResumen);
    });

    test('Debe crear un resumen médico si no existe', async () => {
      const descripcion = 'Descripción inicial';
      const mockUsuarioSinResumen = {
        _id: usuarioId,
        resumenMedico: null,
        save: jest.fn().mockResolvedValue(true)
      };
      
      const mockNuevoResumen = {
        _id: new mongoose.Types.ObjectId(),
        usuario: usuarioId,
        descripcion: descripcion,
        fechaActualizacion: expect.any(Date),
        save: mockResumenMedicoSave // Usa el mock del prototipo
      };

      // Mockear 'new ResumenMedico()'
      // Cuando se llame a new ResumenMedico, jest usará esta implementación
      jest.spyOn(ResumenMedico.prototype, 'constructor').mockImplementation(() => mockNuevoResumen);
      
      Usuario.findById.mockResolvedValue(mockUsuarioSinResumen);
      ResumenMedico.findById.mockResolvedValue(null); // No encuentra resumen
      mockResumenMedicoSave.mockResolvedValue(mockNuevoResumen); // El save devuelve el doc

      const result = await usuarioService.actualizarResumenMedico(usuarioId, descripcion);
      
      expect(Usuario.findById).toHaveBeenCalledWith(usuarioId);
      expect(ResumenMedico.findById).toHaveBeenCalledWith(null);
      expect(mockResumenMedicoSave).toHaveBeenCalled(); // Se llamó a save() en la nueva instancia
      expect(mockUsuarioSinResumen.resumenMedico).toBe(result._id); // Se asignó el ID al usuario
      expect(mockUsuarioSinResumen.save).toHaveBeenCalled(); // Se guardó el usuario
      expect(result.descripcion).toBe(descripcion);
    });
  });
  
  // --- Tests para getResumenMedico ---
  describe('getResumenMedico', () => {
     test('Debe devolver el resumen médico populado', async () => {
        const usuarioId = new mongoose.Types.ObjectId().toString();
        const mockResumen = { _id: new mongoose.Types.ObjectId(), descripcion: 'Test' };
        const mockUsuario = {
            _id: usuarioId,
            resumenMedico: mockResumen
        };
        
        Usuario.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockUsuario)
        });
        
        const result = await usuarioService.getResumenMedico(usuarioId);
        
        expect(Usuario.findById).toHaveBeenCalledWith(usuarioId);
        expect(Usuario.findById().populate).toHaveBeenCalledWith('resumenMedico');
        expect(result).toEqual(mockResumen);
     });
     
     test('Debe devolver un objeto vacío si no hay resumen', async () => {
        const usuarioId = new mongoose.Types.ObjectId().toString();
        const mockUsuario = { _id: usuarioId, resumenMedico: null };
        
        Usuario.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockUsuario)
        });
        
        const result = await usuarioService.getResumenMedico(usuarioId);
        
        expect(result).toEqual({ descripcion: '', _id: null });
     });
  });
});