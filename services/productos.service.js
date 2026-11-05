import Producto, { CATEGORIAS_VALIDAS } from "../models/Producto.js";

const LIMITE_POR_DEFECTO = 50;
const LIMITE_MAXIMO = 100;

export class ErrorValidacion extends Error {
    constructor(errores) {
        super("Parámetros de consulta inválidos");
        this.name = "ErrorValidacion";
        this.errores = errores;
    }
}

function esTexto(valor) {
    return typeof valor === "string";
}

function validarCategoria(valor, errores) {
    if (valor === undefined) {
        return undefined;
    }

    if (!esTexto(valor) || !CATEGORIAS_VALIDAS.includes(valor)) {
        errores.categoria = `categoria debe ser una de: ${CATEGORIAS_VALIDAS.join(", ")}`;
        return undefined;
    }

    return valor;
}

function validarPrecioMax(valor, errores) {
    if (valor === undefined) {
        return undefined;
    }

    const numero = esTexto(valor) ? Number(valor) : NaN;

    if (!Number.isFinite(numero) || numero < 0) {
        errores.precioMax = "precioMax debe ser un número mayor o igual que 0";
        return undefined;
    }

    return numero;
}

function validarCompatibilidad(valor, errores) {
    if (valor === undefined) {
        return undefined;
    }

    if (!esTexto(valor) || valor.trim() === "") {
        errores.compatibilidad = "compatibilidad debe ser un texto no vacío";
        return undefined;
    }

    return valor.trim();
}

function validarLimite(valor, errores) {
    if (valor === undefined) {
        return LIMITE_POR_DEFECTO;
    }

    const numero = esTexto(valor) ? Number(valor) : NaN;

    if (!Number.isInteger(numero) || numero < 1 || numero > LIMITE_MAXIMO) {
        errores.limit = `limit debe ser un entero entre 1 y ${LIMITE_MAXIMO}`;
        return LIMITE_POR_DEFECTO;
    }

    return numero;
}

export function construirFiltro(query = {}) {
    const errores = {};
    const filtro = {};

    const categoria = validarCategoria(query.categoria, errores);
    const precioMax = validarPrecioMax(query.precioMax, errores);
    const compatibilidad = validarCompatibilidad(query.compatibilidad, errores);
    const limite = validarLimite(query.limit, errores);

    if (categoria !== undefined) {
        filtro.categoria = categoria;
    }

    if (precioMax !== undefined) {
        filtro.precio = { $lte: precioMax };
    }

    if (compatibilidad !== undefined) {
        filtro.compatibleCon = { $in: [compatibilidad] };
    }

    if (Object.keys(errores).length > 0) {
        throw new ErrorValidacion(errores);
    }

    return { filtro, limite };
}

export async function buscarProductos(filtro, limite) {
    return Producto.find(filtro)
        .sort({ precio: 1 })
        .limit(limite)
        .lean();
}
