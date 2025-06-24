import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import passport from "passport";
import passportConfig from "./config/passportConfig.js";
import authApiRouter from "./routes/api/authApiRouter.js";
import postApiRouter from "./routes/api/postApiRouter.js";
import userApiRouter from "./routes/api/userApiRouter.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import errorHandler from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import authViewRouter from "./routes/view/authViewRouter.js";

const app = express();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');  // Set 'view engine' to ejs
app.set('views', path.join(__dirname, 'views'));    // Set 'views' folder

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (CSS, JS, images)

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

app.use('/auth', authViewRouter);
app.use('/api/auth', authApiRouter);
app.use('/api/user', userApiRouter);
app.use('/api/post', postApiRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});