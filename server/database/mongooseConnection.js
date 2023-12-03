// Importando mongoose
import mongoose from 'mongoose';
// Importando logger
import log from '../config/winston';

// Creando la funcion de conexion
export default async function connectWithRetry(mongoUrl) {
  try {
    await mongoose.connect(mongoUrl);
    log.info('🔥 Se conecto con MongoDB');
  } catch (error) {
    log.error(`💔 No se logro la conexion a la db 💔: ${error.message}`);
    log.info('Intentando la conexion en 30 segundos');
    setTimeout(() => connectWithRetry(mongoUrl), 30000);
  }
}
