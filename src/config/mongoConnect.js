import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoConnect = async () => {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined in the .env file');
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error: ', error);
        process.exit(1);
    }
}

export default mongoConnect;