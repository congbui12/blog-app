import express from "express";
import { isAuthenticated } from "../../middleware/check.login.js";
import validateUser from "../../utils/validate.user.js";
import { validateRequest } from "../../middleware/validate.request.js";
import postController from "../../controllers/api/post.controller.js";


const postRouter = express.Router();

postRouter.get('/', postController.getAllPosts);

postRouter.get('/search', postController.searchPost);

postRouter.get('/user/me', isAuthenticated, postController.getMyPosts);

postRouter.post('/', isAuthenticated, validateUser.createPost, validateRequest, postController.createPost);

postRouter.get('/:slug', postController.openPost);

postRouter.put('/:slug', isAuthenticated, validateUser.editPost, validateRequest, postController.editPost);

postRouter.delete('/:slug', isAuthenticated, postController.deletePost);

postRouter.patch('/:slug/like', isAuthenticated, postController.addToLikeList);

postRouter.patch('/:slug/dislike', isAuthenticated, postController.removeFromLikeList);

export default postRouter;