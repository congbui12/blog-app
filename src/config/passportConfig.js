import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/User.js";

export default function passportConfig() {

    // After login, Passport saves the user ID
    passport.serializeUser((user, done) => {
        done(null, user.id);    // stored in req.session.passport.user, can use user._id
    });

    // On future requests, Passport reads that ID and fetches the full user
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);   // stored in req.user
        } catch (error) {
            done(error);
        }
    });

    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, { message: 'Email not found' });
                }

                const isPasswordMatch = await bcrypt.compare(password, user.password);
                if (!isPasswordMatch) {
                    return done(null, false, { message: 'Invalid credentials' });
                }
                return done(null, user);
            } catch (error) {
                console.error('Authentication error: ', error);
                return done(error);
            }
        }
    ));
}