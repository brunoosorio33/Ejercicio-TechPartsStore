/**
 * Lógica de negocio de los productos.
 *
 * Separa la validación de los parámetros de consulta y el acceso a datos del
 * handler HTTP, de modo que ambas partes se puedan probar por separado.
 */
import Producto, { CATEGORIAS_VALIDAS } from "../models/Producto.js";
import HttpError from "../utils/HttpError.js";

// Límites permitidos para el parámetro `limit`.
const LIMITE_POR_DEFECTO = 50;
const LIMITE_MAXIMO = 100;

// Comprueba que el valor sea un string.
const esTexto = (valor) => typeof valor === "string";

// Comprueba que sea un string con contenido (no vacío ni solo espacios).
const esTextoValido = (valor) => esTexto(valor) && valor.trim() !== "";

class ProductoService {
    /**
     * Valida y normaliza los parámetros de consulta.
     *
     * @param {object} [query={}] - Query params recibidos por el handler.
     * @returns {{filtro: object, limite: number}} Filtro de Mongo y límite.
     * @throws {HttpError} 400 con el detalle de los campos inválidos.
     */
    static normalizar(query = {}) {
        // Destructuring de los parámetros admitidos.
        const { categoria, precioMax, compatibilidad, limit } = query;

        // Acumula los errores para devolverlos todos juntos.
        const errores = {};

        // Filtro que se pasará a Mongoose.
        const filtro = {};

        // --- categoria: debe pertenecer a la lista de categorías válidas ---
        if (categoria !== undefined) {
            if (esTexto(categoria) && CATEGORIAS_VALIDAS.includes(categoria)) {
                filtro.categoria = categoria;
            } else {
                errores.categoria = `categoria debe ser una de: ${CATEGORIAS_VALIDAS.join(", ")}`;
            }
        }

        // --- precioMax: número finito mayor o igual que 0 ---
        if (precioMax !== undefined) {
            const numero = esTextoValido(precioMax) ? Number(precioMax) : NaN;

            if (Number.isFinite(numero) && numero >= 0) {
                filtro.precio = { $lte: numero };
            } else {
                errores.precioMax = "precioMax debe ser un número mayor o igual que 0";
            }
        }

        // --- compatibilidad: texto no vacío; se recortan los espacios ---
        if (compatibilidad !== undefined) {
            if (esTextoValido(compatibilidad)) {
                filtro.compatibleCon = { $in: [compatibilidad.trim()] };
            } else {
                errores.compatibilidad = "compatibilidad debe ser un texto no vacío";
            }
        }

        // --- limit: entero entre 1 y LIMITE_MAXIMO (50 por defecto) ---
        let limite = LIMITE_POR_DEFECTO;

        if (limit !== undefined) {
            const numero = esTextoValido(limit) ? Number(limit) : NaN;

            if (Number.isInteger(numero) && numero >= 1 && numero <= LIMITE_MAXIMO) {
                limite = numero;
            } else {
                errores.limit = `limit debe ser un entero entre 1 y ${LIMITE_MAXIMO}`;
            }
        }

        // Si hubo cualquier error, se lanza un único 400 con todos los campos.
        if (Object.keys(errores).length > 0) {
            throw new HttpError(400, "Parámetros de consulta inválidos", errores);
        }

        return { filtro, limite };
    }

    /**
     * Busca productos aplicando filtro, orden y límite.
     *
     * @param {{filtro: object, limite: number}} opciones - Datos ya normalizados.
     * @returns {Promise<{total: number, limite: number, datos: object[]}>}
     */
    static async buscar({ filtro, limite }) {
        // `lean()` devuelve objetos planos, más ligeros que los documentos Mongoose.
        const datos = await Producto.find(filtro)
            .sort({ precio: 1 })
            .limit(limite)
            .lean();

        return {
            total: datos.length,
            limite,
            datos
        };
    }
}

export default ProductoService;
