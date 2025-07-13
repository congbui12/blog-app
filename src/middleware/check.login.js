import AppError from "../utils/AppError.js";

export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return next(new AppError('You are currently not log in', 401));
}