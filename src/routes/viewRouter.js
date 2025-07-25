import express from "express";
import viewController from "../controllers/viewController.js";

const viewRouter = express.Router();

viewRouter.get('/reset-password', viewController.resetPasswordView);

export default viewRouter;