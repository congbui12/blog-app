import express from "express";
import checkLogin from "../middleware/checkLogin.js";
import postValidator from "../validators/postValidator.js";
import validateRequest from "../middleware/validateRequest.js";
import postController from "../controllers/postController.js";

const postRouter = express.Router();

postRouter.get('/', postController.viewAllPosts);

postRouter.get('/search', postController.searchPost);

postRouter.post('/', checkLogin('create a post'), postValidator.createPost, validateRequest, postController.createPost);

postRouter.get('/:slug', postController.viewPost);

postRouter.patch('/:slug', checkLogin('edit this post'), postValidator.editPost, validateRequest, postController.editPost);

postRouter.delete('/:slug', checkLogin('delete this post'), postController.deletePost);

postRouter.post('/:slug', checkLogin('make a change to your favorite posts'), postValidator.handleFavorites, validateRequest, postController.handleFavorites);

export default postRouter;