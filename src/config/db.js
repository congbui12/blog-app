import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {

    // Check if it's loaded correctly
    console.log('MongoDB URI: ', process.env.MONGODB_URI);
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in the .env file');
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Database connection failed: ', error);
        process.exit(1);
    }
}