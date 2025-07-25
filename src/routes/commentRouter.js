import express from "express";
import checkLogin from "../middleware/checkLogin.js";
import commentValidator from "../validators/commentValidator.js";
import validateRequest from "../middleware/validateRequest.js";
import commentController from "../controllers/commentController.js";

const commentRouter = express.Router();

commentRouter.get('/:slug', commentController.getCommentsByPost);

commentRouter.post('/:slug', checkLogin('add a new comment'), commentValidator.addComment, validateRequest, commentController.addComment);

commentRouter.patch('/:id', checkLogin('edit this comment'), commentValidator.editComment, validateRequest, commentController.editComment);

commentRouter.delete('/:id', checkLogin('delete this comment'), commentController.deleteComment);

export default commentRouter;