import Post from "../models/Post.js";

export const createPost = async (req, res) => {
    const userId = req.user._id;
    const { title, content } = req.body;
    try {
        const newPost = new Post({ title, content, userId });
        await newPost.save();
        return res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Create post failed: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getPostsByUser = async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.user._id }).populate('userId', 'email');
        return res.status(200).json(posts);
    } catch (error) {
        console.error('Get posts by user failed: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const updatePost = async (req, res) => {
    const { title, content } = req.body;
    const postId = req.params.id;
    try {
        const post = await Post.findById(postId);

        if (!post || post.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Post not found or you cannot modify this post' });
        }

        if (title) post.title = title;
        if (content) post.content = content;
        await post.save();
        return res.status(200).json(post);
    } catch (error) {
        console.error('Update post failed: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const deletePost = async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findById(postId);
        if (!post || post.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Post not found or you cannot delete this post' });
        }
        await post.deleteOne();
        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post failed: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
}