import dotenv from "dotenv";

dotenv.config({ quiet: true });

const uri = process.env.MONGODB_URI;

if (!uri || uri.trim() === "") {
    throw new Error(
        "Falta MONGODB_URI en el entorno. Crea un archivo .env con MONGODB_URI=<cadena de conexión>."
    );
}

export const MONGODB_URI = uri;
