import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

const sessionConfig = session({
    // name: 'my-session-cookie',  // Set the cookie name
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 20 * 60,
        autoRemove: 'native',   // Automatically remove expired sessions via TTL index
        crypto: {
            secret: process.env.SESSION_SECRET,
        }
    }),
    cookie: {
        maxAge: 20 * 60 * 1000,
        httpOnly: true,
        secure: false,
    },
})

export default sessionConfig;