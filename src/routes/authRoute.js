import express from "express";
import { registerUserValidator, loginUserValidator } from "../validators/userValidator.js";
import { handleValidation } from "../middleware/validationMiddleware.js";
import { registerUser, loginUser } from "../controllers/userController.js";

const authRouter = express.Router();

authRouter.post('/register', registerUserValidator, handleValidation, registerUser);

authRouter.post('/login', loginUserValidator, handleValidation, loginUser);

export default authRouter;