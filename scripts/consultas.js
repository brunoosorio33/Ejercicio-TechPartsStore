/**
 * Consultas de ejemplo sobre el catálogo de productos.
 *
 * Cada consulta se define como un objeto con un título y una función que
 * devuelve la promesa de Mongoose. El bucle final las ejecuta en orden.
 */
import Producto, { CATEGORIAS } from "../models/Producto.js";
import Database from "../config/Database.js";

const consultas = [
    {
        // Tarjetas gráficas que tienen existencias.
        titulo: "A.- Tarjetas gráficas con stock disponible",
        ejecutar: () =>
            Producto.find({
                categoria: CATEGORIAS.TARJETAS_GRAFICAS,
                stock: { $gt: 0 }
            }).lean()
    },
    {
        // Productos con precio menor o igual a 150.
        titulo: "B.- Productos de 150 euros o menos",
        ejecutar: () =>
            Producto.find({ precio: { $lte: 150 } })
                .select("nombre precio categoria -_id")
                .lean()
    },
    {
        // Productos compatibles con alguna de las tecnologías indicadas.
        titulo: "C.- Productos compatibles con DDR5 o AM5",
        ejecutar: () =>
            Producto.find({ compatibleCon: { $in: ["DDR5", "AM5"] } })
                .select("nombre compatibleCon -_id")
                .lean()
    },
    {
        // Los tres productos destacados más caros.
        titulo: "D.- Top 3 productos destacados más caros",
        ejecutar: () =>
            Producto.find({ destacado: true })
                .sort({ precio: -1 })
                .limit(3)
                .select("nombre precio -_id")
                .lean()
    }
];

/**
 * Conecta, ejecuta todas las consultas y cierra la conexión.
 *
 * @returns {Promise<void>}
 */
const ejecutarConsultas = async () => {
    try {
        await Database.connect();
        console.log("==== Laboratorio de consultas de productos ====");

        // `for...of` permite esperar cada consulta antes de pasar a la siguiente.
        for (const { titulo, ejecutar } of consultas) {
            const resultados = await ejecutar();
            console.log(`\n${titulo}: ${resultados.length}`);
            console.table(resultados);
        }

    } catch (error) {
        console.error(`Error en las consultas: ${error.message}`);
        process.exitCode = 1;

    } finally {
        // La desconexión se ejecuta siempre para no dejar el proceso colgado.
        await Database.disconnect();
        console.log("\nSe ha desconectado de MongoDB");
    }
};

// Punto de entrada del script.
ejecutarConsultas();
