import { check } from "express-validator";

const editProfile = [
    check('username')
        .optional()
        .trim()
        .notEmpty().withMessage('Username is required'),
    check('email')
        .optional()
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
]

const changePassword = [
    check('currentPassword')
        .trim()
        .notEmpty().withMessage('Current password is required'),
    check('newPassword')
        .trim()
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    // .matches(/[a-z]/).withMessage('Must contain a lowercase letter')
    // .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
    // .matches(/[0-9]/).withMessage('Must contain a number')
    // .matches(/[^A-Za-z0-9]/).withMessage('Must contain a special character'),
    check('confirmPassword')
        .trim()
        .notEmpty().withMessage('Confirm password is required')
        .isLength({ min: 6 }).withMessage('Confirm password must be at least 6 characters'),
]

export default {
    editProfile,
    changePassword,
}
