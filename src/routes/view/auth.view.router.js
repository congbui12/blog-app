import express from "express";
import authView from "../../controllers/view/auth.view.controller.js";

const authViewRouter = express.Router();

authViewRouter.get('/reset-password', authView.resetPasswordForm);

export default authViewRouter;