import User from "../../models/User.js";
import bcrypt from "bcrypt";
import passport from "passport";
import sendEmail from "../../utils/send.email.js";
import crypto from "crypto";
import AppError from "../../utils/AppError.js";
import dotenv from "dotenv";

dotenv.config();

const authController = {
    registerUser: async (req, res, next) => {
        const { username, email, password } = req.body;
        try {
            let existingUsername = await User.findOne({ username });
            if (existingUsername) return next(new AppError('Username is already taken', 400));

            let existingEmail = await User.findOne({ email });
            if (existingEmail) return next(new AppError('Email is already taken', 400));

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({ username, email, password: hashedPassword });
            await newUser.save();

            return res
                .status(201)
                .json({
                    message: 'User registered successfully',
                    user: {
                        username: newUser.username,
                        email: newUser.email,
                    },
                });
        } catch (error) {
            console.error('Registration error: ', error);
            return next(error);
        }
    },
    loginUser: async (req, res, next) => {
        passport.authenticate('local', (err, user, info, status) => {
            if (err) {
                console.error('Passport authentication error: ', err);
                return next(err);
            }
            if (!user) return next(new AppError('Invalid credentials', 400));

            req.logIn(user, (err) => {
                if (err) {
                    console.error('Error during session creation: ', err);
                    return next(err);
                }
                return res.status(200).json({ message: 'Login successfully', user: user.username });
            });
        })(req, res, next);
    },
    logoutUser: async (req, res, next) => {
        req.logout((err) => {
            if (err) {
                console.error('Logout error: ', err);
                return next(err);
            }

            req.session.destroy((err) => {
                if (err) {
                    console.log('Error during session destruction: ', err);
                    return next(err);
                }
                res.clearCookie('connect.sid');
                return res.status(200).json({ message: 'Logout successfully' });
            })
        });
    },
    forgotPassword: async (req, res, next) => {
        const { email } = req.body;

        try {
            const user = await User.findOne({ email });
            if (user) {
                const token = crypto.randomBytes(32).toString('hex');
                const tokenExpiry = Date.now() + 15 * 60 * 1000;   // 15 minutes

                user.resetPasswordToken = token;
                user.resetPasswordTokenExpiry = tokenExpiry;
                await user.save();

                const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

                const resetPasswordContent = `
                    <p>Click the link below to reset your password</p>
                    <a href="${resetPasswordLink}">THIS LINK IS ONLY AVAILABLE IN 15 MINUTES</a>
                `;

                try {
                    await sendEmail(email, 'RESET YOUR PASSWORD', resetPasswordContent);
                } catch (error) {
                    console.error(`Error while sending email: `, error);
                }

                return res.status(200).json({ message: 'If this email is registered, a reset password link has been sent' });
            }
        } catch (error) {
            console.error('Error during password recovery: ', error);
            return next(error);
        }
    },
    resetPassword: async (req, res, next) => {
        const { resetToken, newPassword } = req.body;

        try {
            const user = await User.findOne({
                resetPasswordToken: resetToken,
                resetPasswordTokenExpiry: { $gt: Date.now() }
            });

            if (!user) return next(new AppError('This link is either invalid or expired'));

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedNewPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordTokenExpiry = undefined;
            await user.save();

            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Error while resetting the password: ', error);
            return next(error);
        }
    },
}

export default authController;

