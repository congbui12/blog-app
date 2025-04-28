import express from "express";
import { createPost, getPostsByUser, updatePost, deletePost } from "../controllers/postController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const postRouter = express.Router();

postRouter.post('/create', isAuthenticated, createPost);
postRouter.get('/my-posts', isAuthenticated, getPostsByUser);
postRouter.put('/update/:id', isAuthenticated, updatePost);
postRouter.delete('/delete/:id', isAuthenticated, deletePost);

export default postRouter;