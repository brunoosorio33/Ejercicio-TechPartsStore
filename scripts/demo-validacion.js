/**
 * Demostración de las validaciones del modelo.
 *
 * Crea un producto inválido en memoria y ejecuta `validate()` sin guardarlo,
 * de modo que se pueden ver los mensajes de error sin tocar la base de datos.
 */
import Producto from "../models/Producto.js";

// Producto con categoría inexistente y precio negativo a propósito.
const productoInvalido = new Producto({
    codigo: "TEST001",
    nombre: "Producto de prueba",
    categoria: "Movil",
    precio: -20,
    stock: 10
});

/**
 * Ejecuta la validación y muestra los errores por campo.
 *
 * @returns {Promise<void>}
 */
const demostrarValidacion = async () => {
    try {
        await productoInvalido.validate();

        // Si no hay error, la demostración no está funcionando como se espera.
        console.log("El producto de prueba es válido (no se esperaba).");
        process.exitCode = 1;

    } catch (error) {
        if (error.name === "ValidationError") {
            console.log("--- ERROR DE VALIDACIÓN DE MONGOOSE ---");

            // `error.errors` contiene un error por cada campo inválido.
            Object.values(error.errors).forEach((err) => {
                console.log(`- Campo [${err.path}]: ${err.message}`);
            });
        } else {
            // Cualquier otro tipo de error sí es un fallo inesperado.
            console.error(`Error inesperado: ${error.message}`);
            process.exitCode = 1;
        }
    }
};

// Punto de entrada del script.
demostrarValidacion();
