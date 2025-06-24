import express from "express";
import { isAuthenticated } from "../../middleware/checkLogin.js";
import postApi from "../../controllers/api/postApiController.js";
import userValidation from "../../utils/userValidation.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const postApiRouter = express.Router();

postApiRouter.post('/create', isAuthenticated, userValidation.validateCreatePost, validateRequest, postApi.createPost);
postApiRouter.get('/my-posts', isAuthenticated, postApi.getPostsByUser);
postApiRouter.put('/update/:id', isAuthenticated, userValidation.validateUpdatePost, validateRequest, postApi.updatePost);
postApiRouter.delete('/delete/:id', isAuthenticated, postApi.deletePost);

export default postApiRouter;