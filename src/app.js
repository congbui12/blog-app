import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import mongoConnect from "./config/mongoConnect.js";
import passportConfig from "./config/passportConfig.js";
import sessionConfig from "./config/sessionConfig.js";
import errorHandler from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/authRouter.js";
import postRouter from "./routes/postRouter.js";
import userRouter from "./routes/userRouter.js";
import commentRouter from "./routes/commentRouter.js";
import viewRouter from "./routes/viewRouter.js";

const app = express();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');  // Set 'view engine' to ejs
app.set('views', path.join(__dirname, 'views'));    // Set 'views' folder

mongoConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (CSS, JS, images)

passportConfig();   // before passport.initialize()
app.use(sessionConfig); // before passport.session()

app.use(passport.initialize());
app.use(passport.session());

app.use('/view', viewRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/comment', commentRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});