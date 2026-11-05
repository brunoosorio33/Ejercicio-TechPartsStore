/**
 * Script de carga de datos iniciales.
 *
 * Dos modos:
 * - Por defecto: inserta o actualiza por `codigo` sin borrar nada (seguro e idempotente).
 * - Con `--force`: vacía la colección y vuelve a insertar los productos (destructivo).
 */
import Producto, { CATEGORIAS } from "../models/Producto.js";
import Database from "../config/Database.js";

// Datos de ejemplo que se cargan en la base de datos.
const productosIniciales = [
    {
        codigo: "PROC001",
        nombre: "AMD Ryzen 5 5600X",
        categoria: CATEGORIAS.PROCESADORES,
        precio: 159.99,
        stock: 15,
        destacado: true
    },
    {
        codigo: "PROC002",
        nombre: "Intel Core i7-13700K",
        categoria: CATEGORIAS.PROCESADORES,
        precio: 349.99,
        stock: 8,
        destacado: true
    },
    {
        codigo: "GPU001",
        nombre: "NVIDIA RTX 4060",
        categoria: CATEGORIAS.TARJETAS_GRAFICAS,
        precio: 329.99,
        stock: 12,
        destacado: true
    },
    {
        codigo: "GPU002",
        nombre: "AMD Radeon RX 7600",
        categoria: CATEGORIAS.TARJETAS_GRAFICAS,
        precio: 269.99,
        stock: 6,
        destacado: false
    },
    {
        codigo: "RAM001",
        nombre: "Corsair Vengeance 16GB DDR4",
        categoria: CATEGORIAS.MEMORIAS_RAM,
        precio: 49.99,
        stock: 25,
        destacado: false
    },
    {
        codigo: "RAM002",
        nombre: "Kingston Fury 32GB DDR5",
        categoria: CATEGORIAS.MEMORIAS_RAM,
        precio: 99.99,
        stock: 10,
        destacado: true
    },
    {
        codigo: "ALM001",
        nombre: "Samsung 990 EVO 1TB",
        categoria: CATEGORIAS.ALMACENAMIENTO,
        precio: 89.99,
        stock: 18,
        destacado: true
    },
    {
        codigo: "ALM002",
        nombre: "Crucial BX500 500GB SSD",
        categoria: CATEGORIAS.ALMACENAMIENTO,
        precio: 39.99,
        stock: 0,
        destacado: false
    }
];

// `--force` activa el modo destructivo (borrar y volver a insertar).
const FORZAR = process.argv.includes("--force");

class Seeder {
    /**
     * Modo destructivo: vacía la colección y vuelve a insertar los datos.
     *
     * @returns {Promise<void>}
     */
    static async reemplazar() {
        const { deletedCount } = await Producto.deleteMany({});
        console.log(`Productos eliminados: ${deletedCount}`);

        const insertados = await Producto.insertMany(productosIniciales);
        console.log(`Productos insertados: ${insertados.length}`);
    }

    /**
     * Modo seguro: inserta o actualiza cada producto por su `codigo`.
     *
     * @returns {Promise<void>}
     */
    static async sincronizar() {
        // Cada operación busca por `codigo` y hace upsert con los datos del producto.
        const operaciones = productosIniciales.map((producto) => ({
            updateOne: {
                filter: { codigo: producto.codigo },
                update: { $set: producto },
                upsert: true
            }
        }));

        // `timestamps: false` evita actualizar `updatedAt` si no cambió ningún dato,
        // de modo que los contadores reflejen cambios reales.
        const { upsertedCount, modifiedCount, matchedCount } =
            await Producto.bulkWrite(operaciones, { timestamps: false });

        console.log(`Productos insertados: ${upsertedCount}`);
        console.log(`Productos actualizados: ${modifiedCount}`);
        console.log(`Sin cambios: ${matchedCount - modifiedCount}`);
    }

    /**
     * Orquesta la ejecución del seeding y gestiona la conexión.
     *
     * @param {object} [opciones={}] - Opciones de ejecución.
     * @param {boolean} [opciones.forzar=false] - Activa el modo destructivo.
     * @returns {Promise<void>}
     */
    static async ejecutar({ forzar = false } = {}) {
        try {
            await Database.connect();
            console.log("Conectado a MongoDB");

            if (forzar) {
                console.log("Modo --force: se vaciará la colección antes de insertar.");
                await Seeder.reemplazar();
            } else {
                console.log("Modo seguro: se insertarán o actualizarán productos sin borrar nada.");
                console.log("Usa --force para vaciar la colección antes de insertar.");
                await Seeder.sincronizar();
            }
        } catch (error) {
            // Marca el proceso como fallido y muestra solo el mensaje.
            console.error(`Error durante el seeding: ${error.message}`);
            process.exitCode = 1;
        } finally {
            // La conexión se cierra siempre, haya error o no.
            await Database.disconnect();
            console.log("Conexión terminada");
        }
    }
}

// Punto de entrada del script.
Seeder.ejecutar({ forzar: FORZAR });
