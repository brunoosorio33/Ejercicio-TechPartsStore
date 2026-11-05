import test from "node:test";
import assert from "node:assert/strict";
import {
    construirFiltro,
    ErrorValidacion
} from "../services/productos.service.js";

function esErrorDeCampo(campo) {
    return (error) =>
        error instanceof ErrorValidacion && Object.hasOwn(error.errores, campo);
}

test("sin parámetros devuelve filtro vacío y límite por defecto", () => {
    const { filtro, limite } = construirFiltro();

    assert.deepEqual(filtro, {});
    assert.equal(limite, 50);
});

test("construye el filtro con categoría, precio máximo y compatibilidad", () => {
    const { filtro, limite } = construirFiltro({
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
    const { filtro } = construirFiltro({ compatibilidad: "  DDR5  " });

    assert.deepEqual(filtro, { compatibleCon: { $in: ["DDR5"] } });
});

test("rechaza una categoría inválida", () => {
    assert.throws(
        () => construirFiltro({ categoria: "Movil" }),
        esErrorDeCampo("categoria")
    );
});

test("rechaza valores no string (inyección de selectores)", () => {
    assert.throws(
        () => construirFiltro({ categoria: { $ne: null } }),
        esErrorDeCampo("categoria")
    );
});

test("rechaza precioMax no numérico o negativo", () => {
    for (const precioMax of ["abc", "-1", ""]) {
        assert.throws(
            () => construirFiltro({ precioMax }),
            esErrorDeCampo("precioMax")
        );
    }
});

test("rechaza compatibilidad vacía", () => {
    assert.throws(
        () => construirFiltro({ compatibilidad: "   " }),
        esErrorDeCampo("compatibilidad")
    );
});

test("rechaza límites fuera de rango", () => {
    for (const limit of ["0", "101", "2.5"]) {
        assert.throws(
            () => construirFiltro({ limit }),
            esErrorDeCampo("limit")
        );
    }
});
