import mongoose from "mongoose";

const productosListado = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: [true, "El código es obligatorio"],
            unique: true,
            uppercase: true,
            trim: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true,
            minlength: 4
        },
        categoria: {
            type: String,
            required: true,
            enum: {
                values: [
                    "Procesadores",
                    "Tarjetas Gráficas",
                    "Memorias RAM",
                    "Almacenamiento"
                ],
                message: "{VALUE}, no es una categoría válida"
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
        timestamps: true
    }
);

const Producto = mongoose.models.Producto || mongoose.model("Producto", productosListado);

export default Producto;
