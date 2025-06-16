import express from "express";
import { updatePassword } from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { updatePasswordValidator } from "../utils/userValidator.js";
import { handleValidation } from "../middleware/validationMiddleware.js";

const userRouter = express.Router();

userRouter.patch('/update-password', isAuthenticated, updatePasswordValidator, handleValidation, updatePassword);

export default userRouter;
