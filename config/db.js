import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

export async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!global._mongoPromise) {
        global._mongoPromise = mongoose.connect(MONGODB_URI).catch((error) => {
            global._mongoPromise = null;
            throw error;
        });
    }

    await global._mongoPromise;

    return mongoose.connection;
}

export async function disconnectDB() {
    if (mongoose.connection.readyState === 0) {
        return;
    }

    await mongoose.disconnect();
    global._mongoPromise = null;
}
