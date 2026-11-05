
import Producto from "../models/Producto.js";
import { connectDB } from "../config/db.js";

export default async function handler(req, res) {
    try {
        await connectDB();

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
