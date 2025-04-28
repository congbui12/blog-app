import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = async () => {

    console.log("MongoDB URI:", process.env.MONGODB_URI);  // Check if it's loaded correctly
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in the .env file");
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected`);
    } catch (error) {
        console.error(`Error: ` + error.message);
        process.exit(1);
    }
}