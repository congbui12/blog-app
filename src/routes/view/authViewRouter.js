import express from "express";
import authView from "../../controllers/view/authViewController.js";

const authViewRouter = express.Router();

authViewRouter.get('/reset-password', authView.resetPWDForm);

export default authViewRouter;