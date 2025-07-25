import { check } from "express-validator";

const register = [
    check('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 6, max: 20 }).withMessage('Username must be between 6 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    check('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const login = [
    check('login')
        .trim()
        .notEmpty().withMessage('Login is required'),
    check('password')
        .trim()
        .notEmpty().withMessage('Password is required'),
]

const email = [
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
]

const resetPassword = [
    check('resetPasswordToken')
        .trim()
        .notEmpty().withMessage('Reset password token is required'),
    check('newPassword')
        .trim()
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
]

export default {
    register,
    login,
    email,
    resetPassword,
}