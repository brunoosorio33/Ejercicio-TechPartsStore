/**
 * Error HTTP tipado.
 *
 * Permite distinguir los errores previstos (por ejemplo, parámetros inválidos)
 * de los errores inesperados y transportar el código HTTP y el detalle por campo.
 */
class HttpError extends Error {
    /**
     * @param {number} statusCode - Código HTTP que se devolverá al cliente.
     * @param {string} message - Mensaje legible del error.
     * @param {object} [details={}] - Detalle por campo (usado en errores 400).
     */
    constructor(statusCode, message, details = {}) {
        // Inicializa la clase base Error con el mensaje.
        super(message);

        this.name = "HttpError";
        this.statusCode = statusCode;
        this.details = details;
    }
}

export default HttpError;
