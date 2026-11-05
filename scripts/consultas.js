import Producto, { CATEGORIAS } from "../models/Producto.js";
import { connectDB, disconnectDB } from "../config/db.js";

async function ejecutarConsultas() {
    try {
        await connectDB();

        console.log("==== Laboratorio de consultas de productos ====");

        // Consulta 1
        const tarjetasGraficas = await Producto.find({
            categoria: CATEGORIAS.TARJETAS_GRAFICAS,
            stock: { $gt: 0 }
        }).lean();

        console.log("\nA.- Tarjetas gráficas con stock disponible:", tarjetasGraficas.length);
        console.table(tarjetasGraficas);

        // Consulta 2
        const productosEconomicos = await Producto.find({
            precio: { $lte: 150 }
        })
            .select("nombre precio categoria -_id")
            .lean();

        console.log("\nB.- Productos de 150 euros o menos:");
        console.table(productosEconomicos);

        // Consulta 3
        const productosCompatibles = await Producto.find({
            compatibleCon: { $in: ["DDR5", "AM5"] }
        })
            .select("nombre compatibleCon -_id")
            .lean();

        console.log("\nC.- Productos compatibles con DDR5 o AM5:");
        console.table(productosCompatibles);

        // Consulta 4
        const productosDestacados = await Producto.find({ destacado: true })
            .sort({ precio: -1 })
            .limit(3)
            .select("nombre precio -_id")
            .lean();

        console.log("\nD.- Top 3 productos destacados más caros:");
        console.table(productosDestacados);

    } catch (error) {
        console.error("Error en las consultas:", error.message);
        process.exitCode = 1;

    } finally {
        await disconnectDB();
        console.log("\nSe ha desconectado de MongoDB");
    }
}

ejecutarConsultas();
