const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const {
  Usuario,
  Domiciliario,
  ResumenMedico,
  Familiar,
  Cita,
  Medicamento,
  Dosis,
  Formula,
  Pedido,
  HorarioConsumo,
  Antecedente
} = require('./models/Schema'); // Ajusta la ruta según tu estructura

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

const seedDatabase = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes
    await Usuario.deleteMany({});
    await Domiciliario.deleteMany({});
    await ResumenMedico.deleteMany({});
    await Familiar.deleteMany({});
    await Cita.deleteMany({});
    await Medicamento.deleteMany({});
    await Dosis.deleteMany({});
    await Formula.deleteMany({});
    await Pedido.deleteMany({});
    await HorarioConsumo.deleteMany({});
    await Antecedente.deleteMany({});
    console.log('🗑️  Colecciones limpiadas');

    // Hash de contraseñas
    const hashPassword = await bcrypt.hash('password123', 10);

    // Crear Medicamentos
    const medicamentos = await Medicamento.insertMany([
      {
        nombre: 'Acetaminofén',
        descripcion: 'Analgésico y antipirético',
        concentracion: '500mg',
        presentacion: 'Tabletas',
        laboratorio: 'Genfar'
      },
      {
        nombre: 'Ibuprofeno',
        descripcion: 'Antiinflamatorio no esteroideo',
        concentracion: '400mg',
        presentacion: 'Tabletas',
        laboratorio: 'MK'
      },
      {
        nombre: 'Omeprazol',
        descripcion: 'Inhibidor de la bomba de protones',
        concentracion: '20mg',
        presentacion: 'Cápsulas',
        laboratorio: 'Tecnoquímicas'
      },
      {
        nombre: 'Losartán',
        descripcion: 'Antihipertensivo',
        concentracion: '50mg',
        presentacion: 'Tabletas',
        laboratorio: 'Laproff'
      },
      {
        nombre: 'Metformina',
        descripcion: 'Antidiabético oral',
        concentracion: '850mg',
        presentacion: 'Tabletas',
        laboratorio: 'Genfar'
      }
    ]);
    console.log('💊 Medicamentos creados');

    // Crear Usuarios
    const usuarios = await Usuario.insertMany([
      {
        nombre: 'Juan',
        apellidos: 'Pérez García',
        cedula: '1234567890',
        celular: '3001234567',
        fechaNacimiento: new Date('1985-05-15'),
        ciudadNacimiento: 'Pasto',
        ciudadResidencia: 'Pasto',
        direccion: 'Calle 18 #25-34',
        residencia: 'Casa',
        tipoSangre: 'O+',
        contrasena: hashPassword
      },
      {
        nombre: 'María',
        apellidos: 'López Rodríguez',
        cedula: '9876543210',
        celular: '3109876543',
        fechaNacimiento: new Date('1990-08-22'),
        ciudadNacimiento: 'Pasto',
        ciudadResidencia: 'Pasto',
        direccion: 'Carrera 27 #15-20',
        residencia: 'Apartamento',
        tipoSangre: 'A+',
        contrasena: hashPassword
      },
      {
        nombre: 'Carlos',
        apellidos: 'Gómez Martínez',
        cedula: '5555555555',
        celular: '3205555555',
        fechaNacimiento: new Date('1978-03-10'),
        ciudadNacimiento: 'Ipiales',
        ciudadResidencia: 'Pasto',
        direccion: 'Avenida Colombia #10-15',
        residencia: 'Casa',
        tipoSangre: 'B+',
        contrasena: hashPassword
      }
    ]);
    console.log('👥 Usuarios creados');

    // Crear Familiares
    const familiares = await Familiar.insertMany([
      {
        nombre: 'Ana',
        apellido: 'Pérez',
        cedula: '1111111111',
        celular: '3101111111',
        correo: 'ana.perez@email.com',
        usuario: usuarios[0]._id,
        parentesco: 'Esposa'
      },
      {
        nombre: 'Pedro',
        apellido: 'Pérez',
        cedula: '2222222222',
        celular: '3102222222',
        correo: 'pedro.perez@email.com',
        usuario: usuarios[0]._id,
        parentesco: 'Hijo'
      },
      {
        nombre: 'Luis',
        apellido: 'López',
        cedula: '3333333333',
        celular: '3103333333',
        correo: 'luis.lopez@email.com',
        usuario: usuarios[1]._id,
        parentesco: 'Hermano'
      }
    ]);
    console.log('👨‍👩‍👧‍👦 Familiares creados');

    // Actualizar usuarios con familiares
    await Usuario.findByIdAndUpdate(usuarios[0]._id, {
      $push: { familiares: { $each: [familiares[0]._id, familiares[1]._id] } }
    });
    await Usuario.findByIdAndUpdate(usuarios[1]._id, {
      $push: { familiares: familiares[2]._id }
    });

    // Crear Resúmenes Médicos
    const resumenesMedicos = await ResumenMedico.insertMany([
      {
        usuario: usuarios[0]._id,
        descripcion: 'Paciente con hipertensión controlada. Sin alergias conocidas.',
        fechaActualizacion: new Date()
      },
      {
        usuario: usuarios[1]._id,
        descripcion: 'Paciente sana. Control anual preventivo.',
        fechaActualizacion: new Date()
      },
      {
        usuario: usuarios[2]._id,
        descripcion: 'Paciente diabético tipo 2. En tratamiento con metformina.',
        fechaActualizacion: new Date()
      }
    ]);
    console.log('📋 Resúmenes médicos creados');

    // Actualizar usuarios con resúmenes médicos
    await Usuario.findByIdAndUpdate(usuarios[0]._id, { resumenMedico: resumenesMedicos[0]._id });
    await Usuario.findByIdAndUpdate(usuarios[1]._id, { resumenMedico: resumenesMedicos[1]._id });
    await Usuario.findByIdAndUpdate(usuarios[2]._id, { resumenMedico: resumenesMedicos[2]._id });

    // Crear Antecedentes
    const antecedentes = await Antecedente.insertMany([
      {
        usuario: usuarios[0]._id,
        descripcion: 'Hipertensión arterial diagnosticada hace 5 años',
        tipo: 'personal',
        fechaDiagnostico: new Date('2020-03-15'),
        activo: true
      },
      {
        usuario: usuarios[0]._id,
        descripcion: 'Padre con diabetes tipo 2',
        tipo: 'familiar',
        activo: true
      },
      {
        usuario: usuarios[2]._id,
        descripcion: 'Diabetes mellitus tipo 2',
        tipo: 'personal',
        fechaDiagnostico: new Date('2018-11-20'),
        activo: true
      },
      {
        usuario: usuarios[2]._id,
        descripcion: 'Apendicectomía',
        tipo: 'quirurgico',
        fechaDiagnostico: new Date('2010-07-10'),
        activo: false
      }
    ]);
    console.log('🏥 Antecedentes creados');

    // Actualizar usuarios con antecedentes
    await Usuario.findByIdAndUpdate(usuarios[0]._id, {
      $push: { antecedentes: { $each: [antecedentes[0]._id, antecedentes[1]._id] } }
    });
    await Usuario.findByIdAndUpdate(usuarios[2]._id, {
      $push: { antecedentes: { $each: [antecedentes[2]._id, antecedentes[3]._id] } }
    });

    // Crear Dosis
    const dosis = await Dosis.insertMany([
      {
        medicamento: medicamentos[3]._id, // Losartán
        cantidadDiaria: 1,
        descripcion: 'Una tableta cada 24 horas',
        unidadMedida: 'tableta',
        frecuencia: 'cada 24 horas'
      },
      {
        medicamento: medicamentos[4]._id, // Metformina
        cantidadDiaria: 2,
        descripcion: 'Una tableta cada 12 horas con las comidas',
        unidadMedida: 'tableta',
        frecuencia: 'cada 12 horas'
      },
      {
        medicamento: medicamentos[0]._id, // Acetaminofén
        cantidadDiaria: 3,
        descripcion: 'Una tableta cada 8 horas',
        unidadMedida: 'tableta',
        frecuencia: 'cada 8 horas'
      }
    ]);
    console.log('💉 Dosis creadas');

    // Crear Fórmulas Médicas
    const formulas = await Formula.insertMany([
      {
        usuario: usuarios[0]._id,
        fechaFormula: new Date('2025-09-01'),
        nombreDoctor: 'Dr. Andrés Fernández',
        especialidad: 'Cardiología',
        institucion: 'Hospital San Pedro',
        dosis: [dosis[0]._id],
        diagnostico: 'Hipertensión arterial esencial',
        vigenciaHasta: new Date('2026-09-01')
      },
      {
        usuario: usuarios[2]._id,
        fechaFormula: new Date('2025-08-15'),
        nombreDoctor: 'Dra. Patricia Moreno',
        especialidad: 'Endocrinología',
        institucion: 'Clínica Los Andes',
        dosis: [dosis[1]._id],
        diagnostico: 'Diabetes mellitus tipo 2',
        vigenciaHasta: new Date('2026-08-15')
      }
    ]);
    console.log('📝 Fórmulas médicas creadas');

    // Actualizar usuarios con fórmulas
    await Usuario.findByIdAndUpdate(usuarios[0]._id, { $push: { formulas: formulas[0]._id } });
    await Usuario.findByIdAndUpdate(usuarios[2]._id, { $push: { formulas: formulas[1]._id } });

    // Crear Citas
    const citas = await Cita.insertMany([
      {
        usuario: usuarios[0]._id,
        especialidad: 'Cardiología',
        fechaHora: new Date('2025-10-20T10:00:00'),
        lugar: 'Hospital San Pedro - Consultorio 301',
        nombreDoctor: 'Dr. Andrés Fernández',
        estado: 'confirmada',
        observaciones: 'Control de rutina'
      },
      {
        usuario: usuarios[1]._id,
        especialidad: 'Medicina General',
        fechaHora: new Date('2025-10-18T14:30:00'),
        lugar: 'Centro de Salud Norte',
        nombreDoctor: 'Dr. Carlos Ruiz',
        estado: 'pendiente'
      },
      {
        usuario: usuarios[2]._id,
        especialidad: 'Endocrinología',
        fechaHora: new Date('2025-10-25T09:00:00'),
        lugar: 'Clínica Los Andes - Piso 2',
        nombreDoctor: 'Dra. Patricia Moreno',
        estado: 'confirmada',
        observaciones: 'Control de diabetes'
      }
    ]);
    console.log('📅 Citas creadas');

    // Actualizar usuarios con citas
    await Usuario.findByIdAndUpdate(usuarios[0]._id, { $push: { citas: citas[0]._id } });
    await Usuario.findByIdAndUpdate(usuarios[1]._id, { $push: { citas: citas[1]._id } });
    await Usuario.findByIdAndUpdate(usuarios[2]._id, { $push: { citas: citas[2]._id } });

    // Crear Horarios de Consumo
    const horariosConsumo = await HorarioConsumo.insertMany([
      {
        usuario: usuarios[0]._id,
        medicamento: medicamentos[3]._id, // Losartán
        fechaHora: new Date('2025-10-16T08:00:00'),
        descripcion: 'Tomar en ayunas con un vaso de agua',
        frecuencia: 'Diaria',
        duracion: '6 meses',
        recordatorio: true
      },
      {
        usuario: usuarios[2]._id,
        medicamento: medicamentos[4]._id, // Metformina
        fechaHora: new Date('2025-10-16T08:00:00'),
        descripcion: 'Tomar con el desayuno',
        frecuencia: 'Cada 12 horas',
        duracion: 'Indefinido',
        recordatorio: true
      },
      {
        usuario: usuarios[2]._id,
        medicamento: medicamentos[4]._id, // Metformina
        fechaHora: new Date('2025-10-16T20:00:00'),
        descripcion: 'Tomar con la cena',
        frecuencia: 'Cada 12 horas',
        duracion: 'Indefinido',
        recordatorio: true
      }
    ]);
    console.log('⏰ Horarios de consumo creados');

    // Actualizar usuarios con horarios de consumo
    await Usuario.findByIdAndUpdate(usuarios[0]._id, { $push: { horariosConsumo: horariosConsumo[0]._id } });
    await Usuario.findByIdAndUpdate(usuarios[2]._id, {
      $push: { horariosConsumo: { $each: [horariosConsumo[1]._id, horariosConsumo[2]._id] } }
    });

    // Crear Domiciliarios
    const domiciliarios = await Domiciliario.insertMany([
      {
        nombre: 'Roberto',
        apellidos: 'Sánchez Torres',
        cedula: '7777777777',
        placaVehiculo: 'ABC123'
      },
      {
        nombre: 'Diana',
        apellidos: 'Muñoz Castillo',
        cedula: '8888888888',
        placaVehiculo: 'XYZ789'
      }
    ]);
    console.log('🛵 Domiciliarios creados');

    // Crear Pedidos
    const pedidos = await Pedido.insertMany([
      {
        usuario: usuarios[0]._id,
        fechaHora: new Date('2025-10-15T10:00:00'),
        estadoPedido: 'entregado',
        medicamentos: [
          { medicamento: medicamentos[3]._id, cantidad: 2 }, // Losartán
          { medicamento: medicamentos[2]._id, cantidad: 1 }  // Omeprazol
        ],
        domiciliario: domiciliarios[0]._id,
        direccionEntrega: 'Calle 18 #25-34',
        total: 45000,
        observaciones: 'Dejar con portería si no hay nadie'
      },
      {
        usuario: usuarios[2]._id,
        fechaHora: new Date('2025-10-16T09:30:00'),
        estadoPedido: 'en_camino',
        medicamentos: [
          { medicamento: medicamentos[4]._id, cantidad: 3 } // Metformina
        ],
        domiciliario: domiciliarios[1]._id,
        direccionEntrega: 'Avenida Colombia #10-15',
        total: 60000
      },
      {
        usuario: usuarios[1]._id,
        fechaHora: new Date('2025-10-16T11:00:00'),
        estadoPedido: 'pendiente',
        medicamentos: [
          { medicamento: medicamentos[0]._id, cantidad: 1 }, // Acetaminofén
          { medicamento: medicamentos[1]._id, cantidad: 1 }  // Ibuprofeno
        ],
        direccionEntrega: 'Carrera 27 #15-20',
        total: 25000
      }
    ]);
    console.log('📦 Pedidos creados');

    // Actualizar usuarios con pedidos
    await Usuario.findByIdAndUpdate(usuarios[0]._id, { $push: { pedidos: pedidos[0]._id } });
    await Usuario.findByIdAndUpdate(usuarios[2]._id, { $push: { pedidos: pedidos[1]._id } });
    await Usuario.findByIdAndUpdate(usuarios[1]._id, { $push: { pedidos: pedidos[2]._id } });

    // Actualizar domiciliarios con pedidos asignados
    await Domiciliario.findByIdAndUpdate(domiciliarios[0]._id, { $push: { pedidosAsignados: pedidos[0]._id } });
    await Domiciliario.findByIdAndUpdate(domiciliarios[1]._id, { $push: { pedidosAsignados: pedidos[1]._id } });

    console.log('\n✨ Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${usuarios.length} usuarios`);
    console.log(`   - ${familiares.length} familiares`);
    console.log(`   - ${medicamentos.length} medicamentos`);
    console.log(`   - ${pedidos.length} pedidos`);
    console.log(`   - ${citas.length} citas`);
    console.log(`   - ${formulas.length} fórmulas`);
    console.log(`   - ${domiciliarios.length} domiciliarios`);
    console.log(`   - ${horariosConsumo.length} horarios de consumo`);
    console.log(`   - ${antecedentes.length} antecedentes`);
    console.log(`   - ${resumenesMedicos.length} resúmenes médicos`);
    console.log(`   - ${dosis.length} dosis`);

    console.log('\n🔐 Credenciales de prueba:');
    console.log('   Cédula: 1234567890 | Password: password123');
    console.log('   Cédula: 9876543210 | Password: password123');
    console.log('   Cédula: 5555555555 | Password: password123');

  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
};

// Ejecutar seed
seedDatabase();