import express from "express";
import checkLogin from "../middleware/checkLogin.js";
import authValidator from "../validators/authValidator.js";
import validateRequest from "../middleware/validateRequest.js";
import authController from "../controllers/authController.js";

const authRouter = express.Router();

// Combine a validation chain with a reusable validation middleware
authRouter.post('/register', authValidator.register, validateRequest, authController.register);

authRouter.post('/login', authValidator.login, validateRequest, authController.login);

authRouter.post('/logout', checkLogin('logout'), authController.logout);

authRouter.post('/forgot-password', authValidator.email, validateRequest, authController.forgotPassword);

authRouter.post('/reset-password', authValidator.resetPassword, validateRequest, authController.resetPassword);

export default authRouter;