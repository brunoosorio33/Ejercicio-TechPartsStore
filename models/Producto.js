/**
 * Modelo Mongoose de productos.
 *
 * Define el esquema, las validaciones, las categorías permitidas y los índices
 * que usan las consultas de la API.
 */
import mongoose from "mongoose";

// Fuente única de verdad para las categorías: evita duplicar strings.
const CATEGORIAS = Object.freeze({
    PROCESADORES: "Procesadores",
    TARJETAS_GRAFICAS: "Tarjetas Gráficas",
    MEMORIAS_RAM: "Memorias RAM",
    ALMACENAMIENTO: "Almacenamiento"
});

// Array derivado que se reutiliza en el enum y en las validaciones de la API.
const CATEGORIAS_VALIDAS = Object.values(CATEGORIAS);

// Esquema principal con las reglas de validación de cada campo.
const productoSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: [true, "El código es obligatorio"],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [3, "El código debe tener al menos 3 caracteres"]
        },
        nombre: {
            type: String,
            required: [true, "El nombre es obligatorio"],
            trim: true,
            minlength: [4, "El nombre debe tener al menos 4 caracteres"]
        },
        categoria: {
            type: String,
            required: [true, "La categoría es obligatoria"],
            enum: {
                values: CATEGORIAS_VALIDAS,
                message: "{VALUE} no es una categoría válida"
            }
        },
        precio: {
            type: Number,
            required: true,
            min: [0, "El precio no puede ser negativo"]
        },
        stock: {
            type: Number,
            required: true,
            min: [0, "El stock no puede ser negativo"],
            validate: {
                validator: Number.isInteger,
                message: "El stock debe ser un número entero"
            }
        },
        compatibleCon: {
            type: [String],
            default: []
        },
        destacado: {
            type: Boolean,
            default: false
        }
    },
    {
        // Añade automáticamente createdAt y updatedAt.
        timestamps: true,
        toJSON: {
            // Oculta el campo interno de versión al serializar a JSON.
            transform: (_doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Índice compuesto para acelerar los filtros por categoría y precio.
productoSchema.index({ categoria: 1, precio: 1 });

// Índice para la consulta de productos destacados.
productoSchema.index({ destacado: 1 });

// Reutiliza el modelo si ya existe: evita OverwriteModelError en serverless.
const Producto =
    mongoose.models.Producto || mongoose.model("Producto", productoSchema);

export { CATEGORIAS, CATEGORIAS_VALIDAS };
export default Producto;
