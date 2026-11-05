import Producto from "../models/Producto.js";

async function demostrarValidacion() {
    const producto = new Producto({
        codigo: "TEST001",
        nombre: "Producto de prueba",
        categoria: "Movil",
        precio: -20,
        stock: 10
    });

    try {
        await producto.validate();
        console.log("El producto de prueba es válido (no se esperaba).");
        process.exitCode = 1;

    } catch (error) {
        if (error.name === "ValidationError") {
            console.log("--- ERROR DE VALIDACIÓN DE MONGOOSE ---");
            Object.values(error.errors).forEach((err) => {
                console.log(`- Campo [${err.path}]: ${err.message}`);
            });
        } else {
            console.error("Error inesperado:", error.message);
            process.exitCode = 1;
        }
    }
}

demostrarValidacion();
