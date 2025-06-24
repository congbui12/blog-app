import User from "../../models/User.js";
import bcrypt from "bcrypt";
import passport from "passport";
import sendEmail from "../../utils/sendEmail.js";
import crypto from "crypto";
import AppError from "../../utils/AppError.js";
import dotenv from "dotenv";

dotenv.config();

const authApi = {
    registerUser: async (req, res, next) => {
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (user) return next(new AppError('User already exists', 400));

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = new User({ email, password: hashedPassword });
            await user.save();
            return res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error('Failed to register a new user: ', error);
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
                return res.status(200).json({ message: 'Login successfully', email: user.email });
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

                user.resetToken = token;
                user.resetTokenExpiry = tokenExpiry;
                await user.save();

                const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

                const resetPasswordContent = `
                    <p>Click the link below to reset your password</p>
                    <a href="${resetPasswordLink}">THIS LINK IS ONLY AVAILABLE IN 15 MINUTES</a>
                `;

                try {
                    await sendEmail(email, 'RESET YOUR PASSWORD', resetPasswordContent);
                } catch (error) {
                    console.error(`Failed to send reset password instruction to email ${email}: `, error);
                }

                return res.status(200).json({ message: 'If this email is registered, a reset password link has been sent' });
            }
        } catch (error) {
            console.error('Email sending unexpected error: ', error);
            return next(error);
        }
    },
    resetPassword: async (req, res, next) => {
        const { resetPWDToken, newPassword } = req.body;

        try {
            const user = await User.findOne({
                resetToken: resetPWDToken,
                resetTokenExpiry: { $gt: Date.now() }
            });

            if (!user) return next(new AppError('The reset password link is either invalid or expired'));

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedNewPassword;
            user.resetToken = undefined;
            user.resetTokenExpiry = undefined;
            await user.save();

            res.status(200).json({ message: 'Your password has been updated successfully' });
        } catch (error) {
            console.error('Password resetting unexpected error: ', error);
            return next(error);
        }
    },
}

export default authApi;

