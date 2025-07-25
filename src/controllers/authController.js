import User from "../models/User.js";
import passport from "passport";
import crypto from "crypto";
import AppError from "../utils/AppError.js";
import CustomResponse from "../utils/CustomResponse.js";
import helper from "../utils/helper.js";
import dotenv from "dotenv";

dotenv.config();

const register = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const [existingUsername, existingEmail] = await Promise.all([
            User.findOne({ username }),
            User.findOne({ email }),
        ]);

        if (existingUsername) return next(new AppError('Username is already taken', 400));

        if (existingEmail) return next(new AppError('Email is already taken', 400));

        const hashedPassword = await helper.hashPassword(password);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });
        await newUser.save();

        const response = new CustomResponse(res);
        const data = await User.findById(newUser._id).select({ password: 0 }).lean();
        return response.created('User registered successfully', data);
    } catch (error) {
        console.error('Registration error: ', error);
        return next(error);
    }
}

const login = async (req, res, next) => {
    passport.authenticate('local', (err, user, info, status) => {
        if (err) {
            console.error('Passport authentication error: ', err);
            return next(err);
        }
        if (!user) return next(new AppError('Invalid credentials', 400));

        req.logIn(user, async (err) => {
            if (err) {
                console.error('Create session error : ', err);
                return next(err);
            }

            const response = new CustomResponse(res);
            const data = await User.findById(user._id).select({ password: 0 }).lean();
            return response.success('Login successfully', data);
        });
    })(req, res, next);
}

const logout = async (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error: ', err);
            return next(err);
        }

        req.session.destroy((err) => {
            if (err) {
                console.log('Destroy session error: ', err);
                return next(err);
            }
            res.clearCookie('connect.sid');

            const response = new CustomResponse(res);
            return response.success('Logout successfully');
        })
    });
}

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            const tokenExpiry = Date.now() + 15 * 60 * 1000;   // 15 minutes

            user.resetPasswordToken = token;
            user.resetPasswordTokenExpiry = tokenExpiry;
            await user.save();

            const resetPasswordLink = `${process.env.CLIENT_URL}/view/reset-password?token=${token}`;

            const resetPasswordContent = `
                <p>Click the link below to reset your password</p>
                <a href="${resetPasswordLink}">This link is available in 15 minutes</a>
            `;

            try {
                await helper.sendEmail(email, 'RESET YOUR PASSWORD', resetPasswordContent);
            } catch (error) {
                console.error(`Send reset password email error: `, error);
            }

            const response = new CustomResponse(res);
            return response.success('If this email is registered, a reset password link has been sent');
        }
    } catch (error) {
        console.error('Password recovery error: ', error);
        return next(error);
    }
}

const resetPassword = async (req, res, next) => {
    const { resetPasswordToken, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordTokenExpiry: { $gt: Date.now() },
        });

        if (!user) return next(new AppError('This link is either invalid or expired', 400));

        user.password = await helper.hashPassword(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiry = undefined;
        await user.save();

        const response = new CustomResponse(res);
        return response.success('Password updated successfully');
    } catch (error) {
        console.error('Password reset error: ', error);
        return next(error);
    }
}

export default {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
}

