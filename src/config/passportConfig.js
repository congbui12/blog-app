import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/User.js";

export default function passportConfig() {

    // After login, Passport saves the user ID
    passport.serializeUser((user, done) => {
        // stored in req.session.passport.user, can use user._id
        done(null, user.id);
    });

    // On future requests, Passport reads that ID and fetches the full user
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);

            // stored in req.user
            done(null, user);
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

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Invalid credentials' });
                }
                return done(null, user);
            } catch (error) {
                console.error('Authentication failed: ', error);
                return done(error);
            }
        }
    ));
}