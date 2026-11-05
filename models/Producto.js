import mongoose from "mongoose";

export const CATEGORIAS = Object.freeze({
    PROCESADORES: "Procesadores",
    TARJETAS_GRAFICAS: "Tarjetas Gráficas",
    MEMORIAS_RAM: "Memorias RAM",
    ALMACENAMIENTO: "Almacenamiento"
});

export const CATEGORIAS_VALIDAS = Object.values(CATEGORIAS);

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
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                delete ret.__v;
                return ret;
            }
        }
    }
);

productoSchema.index({ categoria: 1, precio: 1 });
productoSchema.index({ destacado: 1 });

const Producto = mongoose.models.Producto || mongoose.model("Producto", productoSchema);

export default Producto;
