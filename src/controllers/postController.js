import Post from "../models/Post.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import CustomResponse from "../utils/CustomResponse.js";
import helper from "../utils/helper.js";

const viewAllPosts = async (req, res, next) => {
    const { sortedBy = 'createdAt', page = 1, limit = 5 } = req.query;
    const currentPage = parseInt(page);
    const pageSize = parseInt(limit);

    if (currentPage < 1 || pageSize < 1) {
        return next(new AppError('Page and limit must be greater than 0', 400));
    }

    const maxLimit = 25;
    if (pageSize > maxLimit) return next(new AppError(`Limit must not exceed ${maxLimit}`, 400));

    const skip = (currentPage - 1) * pageSize;
    let query = {};

    let sortQuery;
    switch (sortedBy) {
        case 'likeCount':
            sortQuery = { likeCount: -1 };
            break;
        case 'viewCount':
            sortQuery = { viewCount: -1 };
            break;
        default:
            sortQuery = { createdAt: -1 };
            break;
    }

    try {
        const [total, posts] = await Promise.all([
            Post.countDocuments(query),
            Post.find(query).sort(sortQuery).skip(skip).limit(pageSize).lean(),
        ]);

        const pages = Math.ceil(total / pageSize);

        const message = total === 0 ? 'No posts available' : 'All posts fetched successfully';

        const meta = {
            total,
            sortedBy,
            order: 'desc',
            currentPage: currentPage,
            perPage: pageSize,
            pages,
            hasPrevious: currentPage > 1,
            hasNext: currentPage < pages,
        }

        const response = new CustomResponse(res);
        return response.success(message, posts, meta);
    } catch (error) {
        console.error('Fetch all posts error: ', error);
        return next(error);
    }
}

const searchPost = async (req, res, next) => {
    const { term } = req.query;
    let query = {};

    if (term) {
        const regex = new RegExp(term, 'i');
        query = {
            ...query,
            $or: [
                { title: regex },
                { content: regex },
            ],
        }
    }

    try {
        const [total, posts] = await Promise.all([
            Post.countDocuments(query),
            Post.find(query).sort({ createdAt: -1 }).lean(),
        ]);

        const message = total === 0 ? 'No matching posts available' : 'Matching posts retrieved successfully';

        const meta = {
            total,
            sortedBy: 'latest',
            order: 'desc',
            keyword: term || 'all',
        }

        const response = new CustomResponse(res);
        return response.success(message, posts, meta);
    } catch (error) {
        console.log('Search post error: ', error);
        return next(error);
    }
}

const viewPost = async (req, res, next) => {
    const { slug } = req.params;
    const allowedActions = [];

    if (!slug) return next(new AppError('Slug is required', 400));

    try {
        const post = await Post.findOne({ slug });
        if (!post) return next(new AppError('Post not found', 404));

        // Check if user is logged in
        if (req.isAuthenticated()) {
            allowedActions.push('comment');

            // Check if user have already liked the post
            const postId = post._id.toString();
            const favoritePostIds = new Set(req.user.favoritePosts.map(id => id.toString()));

            if (!favoritePostIds.has(postId)) {
                allowedActions.push('like');
            } else {
                allowedActions.push('dislike');
            }

            if (req.user._id.toString() === post.userId.toString()) {
                allowedActions.push('edit', 'delete');
            }

            post.viewCount += 1;
            await post.save();
        }

        const data = await Post.findById(post._id).populate('userId', 'username').lean();
        const meta = {
            allowedActions,
        }
        const response = new CustomResponse(res);
        return response.success('Post accessed successfully', data, meta);
    } catch (error) {
        console.error('Access post error: ', error);
        return next(error);
    }
}

const createPost = async (req, res, next) => {
    const userId = req.user._id;
    const { title, content } = req.body;

    try {
        const slug = await helper.generateSlug(title);
        const newPost = new Post({ title, content, slug, userId });
        await newPost.save();

        const data = await Post.findById(newPost._id).populate('userId', 'username').lean();
        const response = new CustomResponse(res);
        return response.created('Post created successfully', data);
    } catch (error) {
        console.error('Create post error: ', error);
        return next(error);
    }
}

const editPost = async (req, res, next) => {
    const { title, content } = req.body;
    const { slug } = req.params;

    if (!slug) return next(new AppError('Slug is required', 400));

    try {
        const post = await Post.findOne({ slug });
        if (!post) return next(new AppError('Post not found', 404));

        if (post.userId.toString() !== req.user._id.toString()) {
            return next(new AppError('You do not have permission to modify this post', 403));
        }

        if (title && title !== post.title) {
            post.title = title;
            post.slug = await helper.generateSlug(title);
        }
        if (content && content !== post.content) post.content = content;
        await post.save();

        const data = await Post.findById(post._id).populate('userId', 'username').lean();
        const response = new CustomResponse(res);
        return response.success('Post updated successfully', data);
    } catch (error) {
        console.error('Edit post error: ', error);
        return next(error);
    }
}

const deletePost = async (req, res, next) => {
    const { slug } = req.params;

    if (!slug) return next(new AppError('Slug is required', 400));

    try {
        const post = await Post.findOne({ slug });
        if (!post) return next(new AppError('Post not found', 404));

        if (post.userId.toString() !== req.user._id.toString()) {
            return next(new AppError('You do not have permission to delete this post', 403));
        }

        await Post.deleteOne({ _id: post._id });

        const response = new CustomResponse(res);
        return response.noContent();
    } catch (error) {
        console.error('Delete post error: ', error);
        return next(error);
    }
}

const handleFavorites = async (req, res, next) => {
    const { action } = req.body;
    const { slug } = req.params;
    const userId = req.user._id;
    const response = new CustomResponse(res);

    if (!slug) return next(new AppError('Slug is required', 400));

    if (action && !['add', 'remove'].includes(action)) {
        return next(new AppError('Invalid action: Use "add" or "remove"', 400));
    }

    try {
        const post = await Post.findOne({ slug });
        if (!post) return next(new AppError('Post not found', 404));

        const postId = post._id.toString();
        const favoritePostIds = new Set(req.user.favoritePosts.map(id => id.toString()));

        if (favoritePostIds.has(postId)) {
            if (action === 'add') {
                return response.success('This post is already in your favorites');
            }
            await Promise.all([
                Post.updateOne(
                    { _id: post._id },
                    { $inc: { likeCount: -1 } },
                ),
                User.updateOne(
                    { _id: userId },
                    { $pull: { favoritePosts: post._id } },
                ),
            ]);
            return response.success('Post removed from favorites');
        }

        if (!favoritePostIds.has(postId)) {
            if (action === 'remove') {
                return response.success('This post is no longer in your favorites');
            }

            await Promise.all([
                Post.updateOne(
                    { _id: post._id },
                    { $inc: { likeCount: 1 } },
                ),
                User.updateOne(
                    { _id: userId },
                    { $addToSet: { favoritePosts: post._id } },
                ),
            ]);
            return response.success('Post added to favorites');
        }

    } catch (error) {
        console.error('Handle favorites error: ', error);
        return next(error);
    }
}

export default {
    viewAllPosts,
    searchPost,
    viewPost,
    createPost,
    editPost,
    deletePost,
    handleFavorites,
}
