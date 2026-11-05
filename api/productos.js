import { connectDB } from "../config/db.js";
import {
    construirFiltro,
    buscarProductos,
    ErrorValidacion
} from "../services/productos.service.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({
            error: "Método no permitido. Usa GET."
        });
    }

    try {
        const { filtro, limite } = construirFiltro(req.query);

        await connectDB();

        const productos = await buscarProductos(filtro, limite);

        return res.status(200).json({
            total: productos.length,
            limite,
            datos: productos
        });

    } catch (error) {
        if (error instanceof ErrorValidacion) {
            return res.status(400).json({
                error: error.message,
                campos: error.errores
            });
        }

        console.error("Error al consultar el inventario:", error);

        const respuesta = {
            error: "Error al consultar el inventario"
        };

        if (process.env.NODE_ENV !== "production") {
            respuesta.detalle = error.message;
        }

        return res.status(500).json(respuesta);
    }
}
