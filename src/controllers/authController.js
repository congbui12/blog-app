import User from "../models/User.js";
import bcrypt from "bcrypt";
import passport from "passport";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

export const registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ email, password: hashedPassword });
        await user.save();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Register user failed: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Server error: ', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login failed: ', err);
                return res.status(500).json({ message: 'Login failed' });
            }
            return res.status(200).json({ message: 'Login successfully', user });
        });
    })(req, res, next);
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Generate token and expiry only if user exists
            const token = crypto.randomBytes(32).toString('hex');
            const tokenExpiry = Date.now() + 15 * 60 * 1000;

            existingUser.resetToken = token;
            existingUser.resetTokenExpiry = tokenExpiry;
            await existingUser.save();
            const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

            // Send reset link email (ignore send errors silently)
            try {
                await sendEmail(email, 'Reset password', `Click on this link to reset your password: ${resetLink}`);
            } catch (emailError) {
                console.log('Failed to send reset email: ', emailError);
                // not return error here for security
            }
        }

        return res.status(200).json({ message: 'If this email is registered, a reset link has been sent' });

    } catch (error) {
        console.log('Email sending error: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Token is invalid or expired' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return res.status(200).json({ message: 'Reset password successfully' });
    } catch (error) {
        console.error('Reset password failed: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout failed: ', err);
            return res.status(500).json({ message: 'Logout failed' });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('Destroy session failed: ', err);
                return res.status(500).json({ message: 'Destroying session failed' });
            }
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Logout successfully' });
        })
    });
}