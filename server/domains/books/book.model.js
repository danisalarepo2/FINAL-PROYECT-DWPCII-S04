// importando mongoose
import mongoose from 'mongoose';
// Desestructurando la funcion Schema Special
const { Schema } = mongoose;

// Construir un Schema
const bookSchema = new Schema({
  name: {
    type: String,
    // siempre se ocupa que no quieras un espacio vacio
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Compilando el esquema para
// generar un modelo
export default mongoose.model('book', bookSchema);
