import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map(err => ({
            field: err.param,
            message: err.msg
        }));
        return next(new AppError(extractedErrors, 400));
    }
    next();
}