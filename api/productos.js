/**
 * Handler HTTP de la API de productos.
 *
 * Flujo de una petición:
 * 1. Se comprueba que el método sea GET.
 * 2. Se validan y normalizan los parámetros de consulta.
 * 3. Se abre (o reutiliza) la conexión a MongoDB.
 * 4. Se consultan los productos y se devuelve la respuesta JSON.
 */
import Database from "../config/Database.js";
import ProductoService from "../services/ProductoService.js";
import HttpError from "../utils/HttpError.js";

/**
 * Convierte cualquier error en una respuesta HTTP coherente.
 *
 * @param {Error} error - Error capturado en el handler.
 * @param {object} res - Respuesta del runtime serverless.
 * @returns {object} Respuesta JSON con el código HTTP adecuado.
 */
const manejarError = (error, res) => {
    // Errores previstos (validación): conservan su código y el detalle por campo.
    if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
            error: error.message,
            campos: error.details
        });
    }

    // Errores inesperados: se registran en el servidor para poder diagnosticarlos.
    console.error(`Error al consultar el inventario: ${error.message}`);

    const respuesta = {
        error: "Error al consultar el inventario"
    };

    // En desarrollo se añade el detalle técnico; en producción se oculta.
    if (process.env.NODE_ENV !== "production") {
        respuesta.detalle = error.message;
    }

    return res.status(500).json(respuesta);
};

/**
 * Punto de entrada de la función serverless.
 *
 * @param {object} req - Petición con `method` y `query`.
 * @param {object} res - Respuesta con `status`, `json` y `setHeader`.
 * @returns {Promise<object>} Respuesta HTTP.
 */
const handler = async (req, res) => {
    // Solo se permite lectura; para el resto se informa cuál es el método válido.
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({
            error: "Método no permitido. Usa GET."
        });
    }

    try {
        // Valida antes de conectar: si hay un error, no se toca la base de datos.
        const { filtro, limite } = ProductoService.normalizar(req.query);

        // La conexión está cacheada y se reutiliza entre invocaciones serverless.
        await Database.connect();

        // Consulta con filtro, orden por precio y límite ya normalizados.
        const resultado = await ProductoService.buscar({ filtro, limite });

        return res.status(200).json(resultado);

    } catch (error) {
        // Centraliza la traducción de errores a respuestas HTTP.
        return manejarError(error, res);
    }
};

export default handler;
