/**
 * Carga y validación de las variables de entorno.
 *
 * Se centraliza aquí para que el resto del proyecto importe siempre valores
 * ya validados y no dependa directamente de `process.env`.
 */
import dotenv from "dotenv";

// `quiet` evita que dotenv imprima su mensaje informativo en cada arranque.
dotenv.config({ quiet: true });

// Destructuring de `process.env`: solo interesa la URI de MongoDB.
const { MONGODB_URI } = process.env;

// Validación temprana: sin URI no tiene sentido continuar la ejecución.
if (!MONGODB_URI || !MONGODB_URI.trim()) {
    throw new Error(
        "Falta MONGODB_URI en el entorno. Crea un archivo .env con MONGODB_URI=<cadena de conexión>."
    );
}

// Se exporta como named export para que Database.js la importe.
export { MONGODB_URI };
