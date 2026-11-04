import mongoose from "mongoose";
import dotenv from "dotenv";
import Producto from "./models/Producto.js";

dotenv.config();

const productosIniciales = [
    {
        codigo: "PROC001",
        nombre: "AMD Ryzen 5 5600X",
        categoria: "Procesadores",
        precio: 159.99,
        stock: 15,
        destacado: true
    },
    {
        codigo: "PROC002",
        nombre: "Intel Core i7-13700K",
        categoria: "Procesadores",
        precio: 349.99,
        stock: 8,
        destacado: true
    },
    {
        codigo: "GPU001",
        nombre: "NVIDIA RTX 4060",
        categoria: "Tarjetas Gráficas",
        precio: 329.99,
        stock: 12,
        destacado: true
    },
    {
        codigo: "GPU002",
        nombre: "AMD Radeon RX 7600",
        categoria: "Tarjetas Gráficas",
        precio: 269.99,
        stock: 6,
        destacado: false
    },
    {
        codigo: "RAM001",
        nombre: "Corsair Vengeance 16GB DDR4",
        categoria: "Memorias RAM",
        precio: 49.99,
        stock: 25,
        destacado: false
    },
    {
        codigo: "RAM002",
        nombre: "Kingston Fury 32GB DDR5",
        categoria: "Memorias RAM",
        precio: 99.99,
        stock: 10,
        destacado: true
    },
    {
        codigo: "ALM001",
        nombre: "Samsung 990 EVO 1TB",
        categoria: "Almacenamiento",
        precio: 89.99,
        stock: 18,
        destacado: true
    },
    {
        codigo: "ALM002",
        nombre: "Crucial BX500 500GB SSD",
        categoria: "Almacenamiento",
        precio: 39.99,
        stock: 0,
        destacado: false
    }
];

async function limpiarColeccion() {
    try {
        const resultado = await Producto.deleteMany({});
        console.log("Productos eliminados:", resultado.deletedCount);
    } catch (error) {
        console.error("Error al limpiar:", error);
        throw error;
    }
}

async function iniciar() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Conectado a MongoDB");

        await limpiarColeccion();

        const resultado = await Producto.insertMany(productosIniciales);

        console.log("Productos insertados:", resultado.length);

        try {
            await Producto.create({
                nombre: "TEST001",
                categoria: "Movil",
                precio: -20,
                stock: 10,
                destacado: false
            });

            console.log("El producto se ha añadido correctamente");

        } catch (error) {
            console.log("\n--- ERROR VALIDACIÓN DE MONGOOSE ---");

            if (error.name === "ValidationError") {
                Object.values(error.errors).forEach((err) => {
                    console.log(`- Campo [${err.path}]: ${err.message}`);
                });
            } else {
                console.log("Error:", error.message);
            }
        }

    } catch (error) {
        console.error("Error durante el iniciado:", error);

    } finally {
        await mongoose.disconnect();
        console.log("Conexión terminada");
    }
}

iniciar();
