import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import passport from "passport";
import passportConfig from "./config/passportConfig.js";
import authRouter from "./routes/authRoute.js";
import postRouter from "./routes/postRoute.js";
import userRouter from "./routes/userRoute.js";
import session from "express-session";
import MongoStore from "connect-mongo";

dotenv.config();
const app = express();

connectDB();

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 20 * 60 * 1000,
        httpOnly: true,
        // name: 'my_session_token'
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 20 * 60
    })
}));

app.use(passport.initialize());
app.use(passport.session());
passportConfig();

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});