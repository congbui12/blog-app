import { check } from "express-validator";

const addComment = [
    check('content')
        .trim()
        .notEmpty().withMessage('Content is required'),
]

const editComment = [
    check('newContent')
        .optional()
        .trim()
        .notEmpty().withMessage('Content is required'),
]

export default {
    addComment,
    editComment,
}
