import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import AppError from "../utils/AppError.js";
import CustomResponse from "../utils/CustomResponse.js";

const getCommentsByPost = async (req, res, next) => {
    const { slug } = req.params;
    if (!slug) return next(new AppError('Slug is required', 400));

    try {
        const post = await Post.findOne({ slug });
        if (!post) return next(new AppError('Post not found', 404));

        const comments = await Comment.find({ postId: post._id }).populate('userId', 'username').sort({ createdAt: -1 }).lean();
        const message = comments.length === 0 ? 'No comments available' : 'Comments fetched successfully';

        const data = comments.map(comment => {
            let allowedActions = [];
            if (req.isAuthenticated()) {
                let userId = req.user._id;
                if (userId.toString() === comment.userId._id.toString()) {
                    allowedActions.push('edit', 'delete');
                }
            }
            return {
                ...comment,
                allowedActions,
            }
        });
        const meta = {
            total: comments.length,
            sortedBy: 'createdAt',
            order: 'desc',
        }

        const response = new CustomResponse(res);
        return response.success(message, data, meta);
    } catch (error) {
        console.error('Fetch comments error: ', error);
        return next(error);
    }
}

const addComment = async (req, res, next) => {
    const { content } = req.body;
    const { slug } = req.params;
    const userId = req.user._id;

    if (!slug) return next(new AppError('Slug is required', 400));

    try {
        const post = await Post.findOne({ slug });
        if (!post) return next(new AppError('Post not found', 404));

        const newComment = new Comment({ content, postId: post._id, userId });
        await newComment.save();

        const data = await Comment.findById(newComment._id).populate('userId', 'username').lean();
        const response = new CustomResponse(res);
        return response.created('Comment added successfully', data);
    } catch (error) {
        console.error('Add comment error: ', error);
        return next(error);
    }
}

const editComment = async (req, res, next) => {
    const { newContent } = req.body;
    const userId = req.user._id;
    const { id } = req.params;

    if (!id) return next(new AppError('Comment ID is required', 400));

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(`Invalid comment ID: ${id}`, 400));
    }

    try {
        const comment = await Comment.findById(id);
        if (!comment) return next(new AppError('Comment not found', 404));

        if (comment.userId.toString() !== userId.toString()) {
            return next(new AppError('You do not have permission to modify this comment', 403));
        }

        if (newContent && newContent !== comment.content) {
            comment.content = newContent;
            await comment.save();
        }

        const data = await Comment.findById(comment._id).populate('userId', 'username').lean();

        const response = new CustomResponse(res);
        return response.success('Comment updated successfully', data);
    } catch (error) {
        console.error('Edit comment error: ', error);
        return next(error);
    }
}

const deleteComment = async (req, res, next) => {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id) return next(new AppError('Comment ID is required', 400));

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(`Invalid comment ID: ${id}`, 400));
    }
    try {
        const comment = await Comment.findById(id);
        if (!comment) return next(new AppError('Comment not found', 404));

        if (comment.userId.toString() !== userId.toString()) {
            return next(new AppError('You do not have permission to delete this comment', 403));
        }
        await Comment.deleteOne({ _id: comment._id });

        const response = new CustomResponse(res);
        return response.noContent();
    } catch (error) {
        console.error('Delete comment error: ', error);
        return next(error);
    }
}

export default {
    getCommentsByPost,
    addComment,
    editComment,
    deleteComment,
}