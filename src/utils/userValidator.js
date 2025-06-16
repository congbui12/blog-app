import { check } from "express-validator";

export const registerUserValidator = [
    check('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

export const loginUserValidator = [
    check('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    check('password').notEmpty().withMessage('Password is required')
]

export const emailSentValidator = [
    check('email')
        .notEmpty().withMessage('Email is required for sending reset password link')
        .isEmail().withMessage('Please provide a valid email address')
]

export const resetPasswordValidator = [
    check('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    check('token')
        .notEmpty().withMessage('Reset token is missing')
]

export const updatePasswordValidator = [
    check('oldPassword')
        .notEmpty().withMessage('Current password is required'),
    check('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    // .matches(/[a-z]/).withMessage('Must contain a lowercase letter')
    // .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
    // .matches(/[0-9]/).withMessage('Must contain a number')
    // .matches(/[^A-Za-z0-9]/).withMessage('Must contain a special character'),
]

export const createPostValidator = [
    check('title').notEmpty().withMessage('Title is required'),
    check('content').notEmpty().withMessage('Content is required')
]

export const updatePostValidator = [
    check('title')
        .optional()
        .notEmpty().withMessage('Title is required'),
    check('content')
        .optional()
        .notEmpty().withMessage('Content is required')
]