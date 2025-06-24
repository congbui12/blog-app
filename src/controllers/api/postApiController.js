import Post from "../../models/Post.js";
import AppError from "../../utils/AppError.js";

const postApi = {
    createPost: async (req, res, next) => {
        const userId = req.user._id;
        const { title, content } = req.body;
        try {
            const newPost = new Post({ title, content, userId });
            await newPost.save();

            return res.status(201).json({ message: 'New post created successfully' });
        } catch (error) {
            console.error('Failed to create a new post: ', error);
            return next(error);
        }
    },
    getPostsByUser: async (req, res, next) => {
        try {
            const posts = await Post.find({ userId: req.user._id }).populate('userId', 'email');
            return res.status(200).json(posts);
        } catch (error) {
            console.error(`Failed to get all posts created by user with email ${req.user.email}: `, error);
            return next(error);
        }
    },
    updatePost: async (req, res, next) => {
        const { title, content } = req.body;
        const postId = req.params.id;
        try {
            const post = await Post.findById(postId);

            if (!post) return next(new AppError(`Post with id ${postId} not found`, 404));
            if (post.userId.toString() !== req.user._id.toString()) return next(new AppError('Only the author can modify this post', 400));

            if (title) post.title = title;
            if (content) post.content = content;
            await post.save();

            return res.status(200).json(post);
        } catch (error) {
            console.error(`Failed to update the post with id ${postID}: `, error);
            return next(error);
        }
    },
    deletePost: async (req, res, next) => {
        const postId = req.params.id;
        try {
            const post = await Post.findById(postId);

            if (!post) return next(new AppError(`Post with id ${postId} not found`, 404));
            if (post.userId.toString() !== req.user._id.toString()) return next(new AppError('Only the author can delete this post', 400));

            await post.deleteOne();
            return res.status(204).json({ message: `Post with id ${postId} deleted successfully` });
        } catch (error) {
            console.error(`Failed to delete the post with id ${postID}: `, error);
            return next(error);
        }
    },
}

export default postApi;
