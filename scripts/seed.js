import Producto, { CATEGORIAS } from "../models/Producto.js";
import { connectDB, disconnectDB } from "../config/db.js";

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

const FORZAR = process.argv.includes("--force");

async function reemplazarProductos() {
    const eliminados = await Producto.deleteMany({});
    console.log("Productos eliminados:", eliminados.deletedCount);

    const insertados = await Producto.insertMany(productosIniciales);
    console.log("Productos insertados:", insertados.length);
}

async function sincronizarProductos() {
    const operaciones = productosIniciales.map((producto) => ({
        updateOne: {
            filter: { codigo: producto.codigo },
            update: { $set: producto },
            upsert: true
        }
    }));

    const resultado = await Producto.bulkWrite(operaciones);

    console.log("Productos insertados:", resultado.upsertedCount);
    console.log("Productos actualizados:", resultado.modifiedCount);
    console.log("Sin cambios:", resultado.matchedCount - resultado.modifiedCount);
}

async function iniciar() {
    try {
        await connectDB();
        console.log("Conectado a MongoDB");

        if (FORZAR) {
            console.log("Modo --force: se vaciará la colección antes de insertar.");
            await reemplazarProductos();
        } else {
            console.log("Modo seguro: se insertarán o actualizarán productos sin borrar nada.");
            console.log("Usa --force para vaciar la colección antes de insertar.");
            await sincronizarProductos();
        }

    } catch (error) {
        console.error("Error durante el seeding:", error.message);
        process.exitCode = 1;

    } finally {
        await disconnectDB();
        console.log("Conexión terminada");
    }
}

iniciar();
