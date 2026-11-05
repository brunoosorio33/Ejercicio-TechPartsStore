/**
 * Conexión a MongoDB mediante Mongoose.
 *
 * La promesa de conexión se guarda en el ámbito del módulo para reutilizarla
 * entre invocaciones serverless y evitar conexiones duplicadas.
 */
import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

// Promesa compartida de la conexión en curso (o ya resuelta).
let connectionPromise = null;

class Database {
    /**
     * Abre la conexión si no está abierta y reutiliza la existente.
     *
     * @returns {Promise<import("mongoose").Connection>} Conexión de Mongoose.
     */
    static async connect() {
        // readyState === 1 significa que Mongoose ya está conectado.
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        // Solo se inicia una conexión; las llamadas concurrentes esperan la misma.
        if (!connectionPromise) {
            connectionPromise = mongoose.connect(MONGODB_URI).catch((error) => {
                // Si la conexión falla, se limpia la caché para permitir reintentos.
                connectionPromise = null;
                throw error;
            });
        }

        await connectionPromise;

        return mongoose.connection;
    }

    /**
     * Cierra la conexión y reinicia la promesa cacheada.
     *
     * @returns {Promise<void>}
     */
    static async disconnect() {
        // readyState === 0 significa que ya está desconectado.
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        connectionPromise = null;
    }
}

export default Database;
