/**
 * Simula el envío de un SMS imprimiéndolo en la consola.
 * Ideal para desarrollo y pruebas sin costo.
 */
const enviarSMS = async (celular, mensaje) => {
  console.log('\n=============================================');
  console.log('📨  [SMS SIMULADO]  📨');
  console.log(`📱  Para:    ${celular}`);
  console.log(`💬  Mensaje: ${mensaje}`);
  console.log('=============================================\n');
  
  // Retornamos true para engañar al controlador diciendo que todo salió bien
  return true;
};

module.exports = { enviarSMS };
