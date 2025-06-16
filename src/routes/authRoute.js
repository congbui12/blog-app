import express from "express";
import { registerUserValidator, loginUserValidator, emailSentValidator, resetPasswordValidator } from "../utils/userValidator.js";
import { handleValidation } from "../middleware/validationMiddleware.js";
import { registerUser, loginUser, forgotPassword, resetPassword, logoutUser } from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

// combine a validation chain with a reusable validation middleware
authRouter.post('/register', registerUserValidator, handleValidation, registerUser);

authRouter.post('/login', loginUserValidator, handleValidation, loginUser);

authRouter.post('/forgot-password', emailSentValidator, handleValidation, forgotPassword);

authRouter.post('/reset-password', resetPasswordValidator, handleValidation, resetPassword);

authRouter.post('/logout', isAuthenticated, logoutUser);

export default authRouter;