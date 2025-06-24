import express from "express";
import { isAuthenticated } from "../../middleware/checkLogin.js";
import userValidation from "../../utils/userValidation.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import userApi from "../../controllers/api/userApiController.js";

const userApiRouter = express.Router();

userApiRouter.patch('/change-password', isAuthenticated, userValidation.validateChangePassword, validateRequest, userApi.changePassword);

export default userApiRouter;
