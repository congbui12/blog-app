import { check } from "express-validator";

const createPost = [
    check('title')
        .trim()
        .notEmpty().withMessage('Title is required'),
    check('content')
        .trim()
        .notEmpty().withMessage('Content is required'),
]

const editPost = [
    check('title')
        .optional()
        .trim()
        .notEmpty().withMessage('Title is required'),
    check('content')
        .optional()
        .trim()
        .notEmpty().withMessage('Content is required'),
]

const handleFavorites = [
    check('action')
        .trim()
        .notEmpty().withMessage('Action is required'),
]

export default {
    createPost,
    editPost,
    handleFavorites,
}
