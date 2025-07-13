import Post from "../../models/Post.js";
import User from "../../models/User.js";
import AppError from "../../utils/AppError.js";
import createSlug from "../../utils/create.slug.js";

const postController = {
    getAllPosts: async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        if (page < 1 || limit < 1) {
            return next(new AppError('Page and limit must be greater than 0', 400));
        }

        const skip = (page - 1) * limit;
        let sort = { createdAt: -1 };
        switch (req.query.orderBy) {
            case 'like':
                sort = { likeCount: -1 }
                break;
            case 'view':
                sort = { viewCount: -1 }
                break;
            default:
                sort = { createdAt: -1 }
                break;
        }
        try {
            const totalPosts = await Post.countDocuments();
            if (totalPosts === 0) return res.status(200).json({ message: 'Fetching all posts: No post found', data: [] });

            const totalPages = Math.ceil(totalPosts / limit);

            const allPosts = await Post.find().sort(sort).skip(skip).limit(limit);
            return res
                .status(200)
                .json({
                    message: 'All posts fetched successfully',
                    data: allPosts,
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        totalPosts: totalPosts,
                        limit: limit,
                    },
                });
        } catch (error) {
            console.error('Error while fetching all posts: ', error);
            return next(error);
        }
    },
    searchPost: async (req, res, next) => {
        const { keyword } = req.query;
        try {
            const regex = new RegExp(keyword, 'i');
            const filteredPosts = await Post.find({
                $or: [
                    { title: regex },
                    { content: regex }
                ]
            });

            if (filteredPosts.length === 0) return res.status(200).json({ message: 'Searching post: No matching post', data: [] })
            return res.status(200).json({ message: 'Matching posts retrieved successfully', data: filteredPosts });

        } catch (error) {
            console.log('Error during post searching', error);
            return next(error);
        }
    },
    getMyPosts: async (req, res, next) => {
        const authorId = req.user._id;
        try {
            const myPosts = await Post.find({ userId: authorId }).populate('userId', 'username');
            if (myPosts.length === 0) return next(new AppError('You have not created any post', 200));
            return res.status(200).json({ message: 'Posts fetched successfully', data: myPosts });
        } catch (error) {
            console.error(`Error while fetching all posts created by user ${req.user.username}: `, error);
            return next(error);
        }
    },
    createPost: async (req, res, next) => {
        const userId = req.user._id;
        const { title, content } = req.body;
        const slug = createSlug(title);
        try {
            const newPost = new Post({ title, content, slug, userId });
            await newPost.save();
            await newPost.populate('userId', 'username');
            return res
                .status(201)
                .json({
                    message: 'Post created successfully',
                    data: newPost,
                });
        } catch (error) {
            console.error('Error during post creation: ', error);
            return next(error);
        }
    },
    openPost: async (req, res, next) => {
        const slug = req.params.slug;
        let allowEdit = false;
        let allowDelete = false;
        let allowLike = false;
        try {
            let existingPost = await Post.findOne({ slug });
            if (!existingPost) return next(new AppError('Open post: Post not found', 404));

            // Check if user is logged in
            if (req.isAuthenticated()) {

                // Check if user 've already liked the post

                const postIdStr = existingPost._id.toString();
                const likeSet = new Set(req.user.likedPosts.map(id => id.toString));
                if (!likeSet.has(postIdStr)) {
                    allowLike = true;
                }

                await Post.updateOne(
                    { _id: existingPost._id },
                    { $inc: { viewCount: 1 } },  // Increase the view count by 1
                    { timestamps: true },
                );

                if (req.user._id.toString() === existingPost.userId.toString()) {
                    allowEdit = true;
                    allowDelete = true;
                }
            }

            existingPost = await Post.findById(existingPost._id).populate('userId', 'username');

            return res
                .status(200)
                .json({
                    message: 'Post fetched successfully',
                    data: existingPost,
                    allowLike,
                    allowEdit,
                    allowDelete,
                });
        } catch (error) {
            console.error('Error while fetching the post: ', error);
            return next(error);
        }
    },
    editPost: async (req, res, next) => {
        const { title, content } = req.body;
        const slug = req.params.slug;
        try {
            const post = await Post.findOne({ slug });

            if (!post) return next(new AppError('Edit post: Post not found', 404));
            if (post.userId.toString() !== req.user._id.toString()) return next(new AppError('Only the author can modify this post', 400));

            if (title && title !== post.title.toString()) {
                post.title = title;
                post.slug = createSlug(title);
            }
            if (content) post.content = content;
            await post.save();

            return res.status(200).json({ message: 'Post editted successfully', data: post });
        } catch (error) {
            console.error('Error while editting the post: ', error);
            return next(error);
        }
    },
    deletePost: async (req, res, next) => {
        const slug = req.params.slug;
        try {
            const post = await Post.findOne({ slug });

            if (!post) return next(new AppError('Delete post: Post not found', 404));
            if (post.userId.toString() !== req.user._id.toString()) return next(new AppError('Only the author can delete this post', 400));

            await Post.deleteOne({ _id: post._id });
            return res.status(204).json({ message: `Post ${post.title} deleted successfully` });
        } catch (error) {
            console.error('Error while deleting the post: ', error);
            return next(error);
        }
    },
    addToLikeList: async (req, res, next) => {
        const slug = req.params.slug;
        const userId = req.user._id;
        try {
            const post = await Post.findOne({ slug });
            if (!post) return next(new AppError('Add to like list: Post not found', 404));

            const postIdStr = post._id.toString();
            const likeSet = new Set(req.user.likedPosts.map(id => id.toString()));
            if (likeSet.has(postIdStr)) {
                return res
                    .status(200)
                    .json({
                        message: 'You have already liked this post.'
                    });
            }

            await Promise.all([
                Post.updateOne(
                    { _id: post._id },
                    { $inc: { likeCount: 1 } },
                    { timestamps: true }
                ),
                User.updateOne(
                    { _id: userId },
                    { $addToSet: { likedPosts: post._id } },
                    { timestamps: true }
                ),
            ]);
            return res
                .status(200)
                .json({
                    message: `Post ${post.title} added to like list of user ${req.user.username}`,
                    postId: post._id,
                    userId,
                });

        } catch (error) {
            console.error('Error while adding post to like list: ', error);
            return next(error);
        }
    },
    removeFromLikeList: async (req, res, next) => {
        const slug = req.params.slug;
        const userId = req.user._id;
        try {
            const post = await Post.findOne({ slug });
            if (!post) return next(new AppError('Remove from like list: Post not found', 404));

            const postIdStr = post._id.toString();
            const likeSet = new Set(req.user.likedPosts.map(id => id.toString()));
            if (!likeSet.has(postIdStr)) {
                return res
                    .status(200)
                    .json({
                        message: 'This post is no longer in your like list.'
                    });
            }

            await Promise.all([
                Post.updateOne(
                    { _id: post._id },
                    { $inc: { likeCount: -1 } },
                    { timestamps: true }
                ),
                User.updateOne(
                    { _id: userId },
                    { $pull: { likedPosts: post._id } },
                    { timestamps: true }
                ),
            ]);
            return res
                .status(200)
                .json({
                    message: `Post ${post.title} removed from like list of user ${req.user.username}`,
                    postId: post._id,
                    userId,
                });

        } catch (error) {
            console.error('Error while removing post from like list: ', error);
            return next(error);
        }
    },
}

export default postController;
