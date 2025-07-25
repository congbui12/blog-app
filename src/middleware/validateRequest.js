import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

export default function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));
        return next(new AppError('Validation error', 400, extractedErrors));
    }
    next();
}