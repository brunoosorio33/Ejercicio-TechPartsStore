/**
 * Tests unitarios de la lógica de filtros.
 *
 * No necesitan conexión a MongoDB: solo se prueba `ProductoService.normalizar`.
 */
import test from "node:test";
import assert from "node:assert/strict";
import ProductoService from "../services/ProductoService.js";
import HttpError from "../utils/HttpError.js";

/**
 * Crea un validador reutilizable para `assert.throws`.
 *
 * @param {string} campo - Nombre del campo que debe aparecer en el detalle.
 * @returns {(error: Error) => boolean} Comprobación del error esperado.
 */
const esHttpErrorDeCampo = (campo) => (error) =>
    error instanceof HttpError &&
    error.statusCode === 400 &&
    Object.hasOwn(error.details, campo);

// ---------------------------------------------------------------------------
// Casos válidos
// ---------------------------------------------------------------------------

test("sin parámetros devuelve filtro vacío y límite por defecto", () => {
    const { filtro, limite } = ProductoService.normalizar();

    assert.deepEqual(filtro, {});
    assert.equal(limite, 50);
});

test("construye el filtro con categoría, precio máximo y compatibilidad", () => {
    const { filtro, limite } = ProductoService.normalizar({
        categoria: "Memorias RAM",
        precioMax: "150",
        compatibilidad: "DDR5",
        limit: "10"
    });

    assert.deepEqual(filtro, {
        categoria: "Memorias RAM",
        precio: { $lte: 150 },
        compatibleCon: { $in: ["DDR5"] }
    });
    assert.equal(limite, 10);
});

test("recorta los espacios de compatibilidad", () => {
    const { filtro } = ProductoService.normalizar({ compatibilidad: "  DDR5  " });

    assert.deepEqual(filtro, { compatibleCon: { $in: ["DDR5"] } });
});

// ---------------------------------------------------------------------------
// Casos inválidos: deben lanzar HttpError 400 con el campo afectado
// ---------------------------------------------------------------------------

test("rechaza una categoría inválida", () => {
    assert.throws(
        () => ProductoService.normalizar({ categoria: "Movil" }),
        esHttpErrorDeCampo("categoria")
    );
});

test("rechaza valores no string (inyección de selectores)", () => {
    assert.throws(
        () => ProductoService.normalizar({ categoria: { $ne: null } }),
        esHttpErrorDeCampo("categoria")
    );
});

test("rechaza precioMax no numérico, negativo o vacío", () => {
    for (const precioMax of ["abc", "-1", "", "   "]) {
        assert.throws(
            () => ProductoService.normalizar({ precioMax }),
            esHttpErrorDeCampo("precioMax")
        );
    }
});

test("rechaza compatibilidad vacía", () => {
    assert.throws(
        () => ProductoService.normalizar({ compatibilidad: "   " }),
        esHttpErrorDeCampo("compatibilidad")
    );
});

test("rechaza límites fuera de rango", () => {
    for (const limit of ["0", "101", "2.5", "", "   "]) {
        assert.throws(
            () => ProductoService.normalizar({ limit }),
            esHttpErrorDeCampo("limit")
        );
    }
});
