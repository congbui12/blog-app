import { check } from "express-validator";

const validateUser = {
    register: [
        check('username')
            .notEmpty().withMessage('Username is required')
            .isLength({ min: 6, max: 20 }).withMessage('Username must be between 6 and 20 characters')
            .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
        check('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide a valid email address'),
        check('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    login: [
        check('login').notEmpty().withMessage('Login is required'),
        check('password').notEmpty().withMessage('Password is required')
    ],
    email: [
        check('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide a valid email address')
    ],
    resetPassword: [
        check('resetToken')
            .notEmpty().withMessage('Reset token is missing'),
        check('newPassword')
            .notEmpty().withMessage('New password is required')
            .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    ],
    changePassword: [
        check('oldPassword')
            .notEmpty().withMessage('Current password is required'),
        check('newPassword')
            .notEmpty().withMessage('New password is required')
            .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
        // .matches(/[a-z]/).withMessage('Must contain a lowercase letter')
        // .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
        // .matches(/[0-9]/).withMessage('Must contain a number')
        // .matches(/[^A-Za-z0-9]/).withMessage('Must contain a special character'),
    ],
    createPost: [
        check('title').notEmpty().withMessage('Title is required'),
        check('content').notEmpty().withMessage('Content is required')
    ],
    editPost: [
        check('title')
            .optional()
            .notEmpty().withMessage('Title is required'),
        check('content')
            .optional()
            .notEmpty().withMessage('Content is required')
    ],
}

export default validateUser;