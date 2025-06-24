import express from "express";
import { isAuthenticated } from "../../middleware/checkLogin.js";
import userValidation from "../../utils/userValidation.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import authApi from "../../controllers/api/authApiController.js";

const authApiRouter = express.Router();

// Combine a validation chain with a reusable validation middleware
authApiRouter.post('/register', userValidation.validateRegister, validateRequest, authApi.registerUser);

authApiRouter.post('/login', userValidation.validateLogin, validateRequest, authApi.loginUser);

authApiRouter.post('/forgot-password', userValidation.validateEmail, validateRequest, authApi.forgotPassword);

authApiRouter.post('/reset-password', userValidation.validateResetPassword, validateRequest, authApi.resetPassword);

authApiRouter.post('/logout', isAuthenticated, authApi.logoutUser);

export default authApiRouter;