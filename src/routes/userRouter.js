import express from "express";
import checkLogin from "../middleware/checkLogin.js";
import userValidator from "../validators/userValidator.js";
import validateRequest from "../middleware/validateRequest.js";
import userController from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/me', checkLogin('view your profile'), userController.viewOwnProfile);

userRouter.patch('/me', checkLogin('edit your profile'), userValidator.editProfile, validateRequest, userController.editOwnProfile);

userRouter.get('/confirm-email', userController.confirmEmailChange);

userRouter.patch('/me/password', checkLogin('change your password'), userValidator.changePassword, validateRequest, userController.changePassword);

userRouter.get('/me/posts', checkLogin('view your posts'), userController.viewOwnPosts);

userRouter.get('/me/favorites', checkLogin('view your favorite posts'), userController.viewFavoritePosts);

export default userRouter;
