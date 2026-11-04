
import mongoose from "mongoose";
import Producto from "../models/Producto.js";

export default async function handler(req, res) {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const { categoria, precioMax, compatibilidad } = req.query;

        const filtro = {};

        if (categoria) {
            filtro.categoria = categoria;
        }

        if (precioMax) {
            filtro.precio = { $lte: Number(precioMax) };
        }

        if (compatibilidad) {
            filtro.compatibleCon = { $in: [compatibilidad] };
        }

        const productos = await Producto.find(filtro)
            .sort({ precio: 1 });

        return res.status(200).json({
            total: productos.length,
            filtrosAplicados: filtro,
            datos: productos
        });

    } catch (error) {
        return res.status(500).json({
            error: "Error al consultar el inventario",
            detalle: error.message
        });
    }
}
