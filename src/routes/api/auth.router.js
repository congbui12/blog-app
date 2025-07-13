import express from "express";
import { isAuthenticated } from "../../middleware/check.login.js";
import validateUser from "../../utils/validate.user.js";
import { validateRequest } from "../../middleware/validate.request.js";
import authController from "../../controllers/api/auth.controller.js";

const authRouter = express.Router();

// Combine a validation chain with a reusable validation middleware
authRouter.post('/register', validateUser.register, validateRequest, authController.registerUser);

authRouter.post('/login', validateUser.login, validateRequest, authController.loginUser);

authRouter.post('/logout', isAuthenticated, authController.logoutUser);

authRouter.post('/forgot-password', validateUser.email, validateRequest, authController.forgotPassword);

authRouter.post('/reset-password', validateUser.resetPassword, validateRequest, authController.resetPassword);

export default authRouter;