# Tests de Servicio de Autenticación - MedicApp Backend

Este directorio contiene los tests unitarios para el servicio de autenticación (`auth.service.js`).

## 📋 Descripción

Estos tests se centran en la lógica de negocio del servicio, aislando las dependencias externas como la base de datos, `bcrypt` y los helpers de `jwt`.

### Funcionalidades Testeadas

1. **`registerUser`**
   - ✅ Registro exitoso de un nuevo usuario.
   - ✅ Encriptación de la contraseña.
   - ✅ Generación del token JWT.
   - ✅ Rechazo de registro si la cédula ya existe.

2. **`loginUser`**
   - ✅ Login exitoso con credenciales válidas.
   - ✅ Verificación de la contraseña.
   - ✅ Generación del token JWT.
   - ✅ Rechazo de login si el usuario no existe.
   - ✅ Rechazo de login si la contraseña es incorrecta.

3. **`renewToken`**
   - ✅ Renovación exitosa de un token para un usuario autenticado.
   - ✅ Manejo de errores si la generación del token falla.

4. **`updatePassword`**
   - ✅ Actualización exitosa de la contraseña.
   - ✅ Verificación de la contraseña antigua.
   - ✅ Encriptación de la nueva contraseña.
   - ✅ Rechazo si la contraseña antigua es incorrecta.
   - ✅ Manejo de errores si falla el guardado en la base de datos.

## 🚀 Ejecución de Tests

Para ejecutar estos tests, puedes usar los mismos comandos que para los tests de API:

```bash
# Ejecutar todos los tests (incluyendo los de servicio)
npm test

# Ejecutar solo este archivo de test
npm test auth.service.test.js
```

## 🔧 Metodología de Testing

### Mocking

Para aislar el servicio, se utilizan "mocks" (simulaciones) de sus dependencias:

- **`bcryptjs`**: Se mockea para evitar la encriptación real (que es lenta) y controlar los resultados de las comparaciones de contraseñas.
- **`../helpers/jwt`**: Se mockea para controlar la generación de tokens y evitar el uso de secretos reales.
- **`../models/Schema`**: Se utiliza `jest.fn()` para simular los métodos de Mongoose como `findOne` y `save`, permitiendo controlar lo que la "base de datos" devuelve en cada test.

### Base de Datos en Memoria

Aunque los métodos del modelo están mockeados, se mantiene la conexión a una base de datos en memoria (`mongodb-memory-server`) para asegurar un entorno de testing consistente y limpio.

## 📝 Ejemplo de Test Unitario

```javascript
test('Debe hacer login correctamente con credenciales válidas', async () => {
  const cedula = '1234567890';
  const contrasena = 'Password123!';

  // Mock de la base de datos: simula que encuentra un usuario
  Usuario.findOne = jest.fn().mockResolvedValue(testUser);
  
  // Mock de bcrypt: simula que la contraseña es correcta
  bcrypt.compareSync.mockReturnValue(true);

  // Mock de JWT: simula la generación de un token
  generarJWT.mockResolvedValue('test-token');

  // Ejecutar la función del servicio
  const result = await authService.loginUser(cedula, contrasena);

  // Verificar que los mocks fueron llamados y el resultado es correcto
  expect(Usuario.findOne).toHaveBeenCalledWith({ cedula });
  expect(bcrypt.compareSync).toHaveBeenCalledWith(contrasena, testUser.contrasena);
  expect(result).toHaveProperty('token', 'test-token');
});
```

Este enfoque asegura que los tests sean rápidos, predecibles y se centren exclusivamente en la lógica del `auth.service.js`.
