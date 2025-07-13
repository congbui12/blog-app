import express from "express";
import { isAuthenticated } from "../../middleware/check.login.js";
import validateUser from "../../utils/validate.user.js";
import { validateRequest } from "../../middleware/validate.request.js";
import userController from "../../controllers/api/user.controller.js";

const userRouter = express.Router();

userRouter.patch('/change-password', isAuthenticated, validateUser.changePassword, validateRequest, userController.changePassword);

userRouter.get('/liked-posts', isAuthenticated, userController.getLikedPosts);

export default userRouter;
