import mongoose from "mongoose";
import dotenv from "dotenv";
import AppError from "../utils/AppError.js";

dotenv.config();

export const connectDB = async () => {

    // console.log('MongoDB URI: ', process.env.MONGODB_URI);  // Check if it's loaded correctly

    if (!process.env.MONGODB_URI) throw new AppError('MONGODB_URI is not defined in the .env file');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Connect to MongoDB error: ', error);
        process.exit(1);
    }
}