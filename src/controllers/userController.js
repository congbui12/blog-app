import AppError from "../utils/AppError.js";
import CustomResponse from "../utils/CustomResponse.js";
import helper from "../utils/helper.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const viewOwnProfile = async (req, res, next) => {
    let id = req.user._id;

    try {
        const data = await User.findById(id).select('-password').lean();
        if (!data) return next(new AppError('Account not found', 404));

        const response = new CustomResponse(res);
        return response.success('Own profile fetched successfully', data);
    } catch (error) {
        console.error('Fetch own profile error: ', error);
        return next(error);
    }
}

const editOwnProfile = async (req, res, next) => {
    let user = req.user;
    const { username, email } = req.body;
    let updatedFields = [];
    const response = new CustomResponse(res);
    let message = '';

    try {
        if (username && username !== user.username) {
            updatedFields.push('username');
            const existingUsername = await User.findOne({ username });
            if (existingUsername) return next(new AppError('Username is already taken', 400));

            user.username = username;
        }

        if (email && email !== user.email) {
            updatedFields.push('email');
            const existingEmail = await User.findOne({ email });
            if (existingEmail) return next(new AppError('Email is already taken', 400));

            const token = crypto.randomBytes(32).toString('hex');
            const tokenExpiry = Date.now() + 15 * 60 * 1000;

            user.confirmEmailToken = token;
            user.confirmEmailTokenExpiry = tokenExpiry;
            user.pendingEmail = email;

            const confirmEmailLink = `${process.env.CLIENT_URL}/api/user/confirm-email?token=${token}`;
            const confirmEmailContent = `
                <p>Click the link below to update your email address</p>
                <a href="${confirmEmailLink}">This link is only available in 15 minutes</a>
            `;

            try {
                await helper.sendEmail(email, 'CONFIRM NEW EMAIL ADDRESS', confirmEmailContent);
            } catch (error) {
                console.error('Send confirmation email error: ', error);
                return next(error);
            }
        }

        if (updatedFields.length === 0) {
            message = 'No changes detected';
            return response.success(message);
        }

        if (updatedFields.includes('email')) {
            await user.save();
            message = updatedFields.length === 1 ? 'A verification email has been sent to your new email address. Please check your inbox to confirm the change'
                : 'Username updated successfully. A verification email has been sent to your new email address. Please check your inbox to confirm the change';
            return response.success(message);
        }

        await user.save();
        message = 'Username updated successfully';
        return response.success(message);
    } catch (error) {
        console.error('Edit own profile error: ', error);
        return next(error);
    }
}

const confirmEmailChange = async (req, res, next) => {
    const { token } = req.query;

    if (!token) return next(new AppError('Confirm email token is required'));

    try {
        const user = await User.findOne({
            confirmEmailToken: token,
            confirmEmailTokenExpiry: { $gt: Date.now() },
        });

        if (!user) return next(new AppError('This link is either invalid or expired', 400));

        user.email = user.pendingEmail;
        user.confirmEmailToken = undefined;
        user.confirmEmailTokenExpiry = undefined;
        user.pendingEmail = undefined;

        await user.save();

        const response = new CustomResponse(res);
        return response.success('Your new email address has been confirmed');
    } catch (error) {
        console.error('Confirm new email address error: ', error);
        return next(error);
    }
}

const changePassword = async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    const isPasswordCorrect = await helper.comparePassword(currentPassword, user.password);
    if (!isPasswordCorrect) return next(new AppError('The current password is incorrect', 400));

    if (currentPassword === newPassword) return next(new AppError('The new password must be different from the old password', 400));

    if (newPassword !== confirmPassword) return next(new AppError('New passwords do not match', 400));

    try {
        user.password = await helper.hashPassword(newPassword);
        await user.save();

        const response = new CustomResponse(res);
        return response.success('Password updated successfully');
    } catch (error) {
        console.log('Change password error: ', error);
        return next(error);
    }
}

const viewOwnPosts = async (req, res, next) => {
    const { sortedBy = 'createdAt', page = 1, limit = 5 } = req.query;
    const id = req.user._id;

    const currentPage = parseInt(page);
    const pageSize = parseInt(limit);

    if (currentPage < 1 || pageSize < 1) {
        return next(new AppError('Page and limit must be greater than 0', 400));
    }

    const maxLimit = 25;
    if (pageSize > maxLimit) return next(new AppError(`Limit must not exceed ${maxLimit}`, 400));

    const skip = (currentPage - 1) * pageSize;
    let query = {
        userId: id,
    }

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
            Post.find(query).populate('userId', 'username').sort(sortQuery).skip(skip).limit(pageSize).lean(),
        ]);

        const pages = Math.ceil(total / pageSize);

        const message = total > 0 ? 'Own posts fetched successfully' : 'No posts available';

        const meta = {
            total,
            sortedBy,
            order: 'desc',
            currentPage,
            pageSize,
            pages,
            hasPrevious: currentPage > 1,
            hasNext: currentPage < pages,
        }

        const response = new CustomResponse(res);
        return response.success(message, posts, meta);
    } catch (error) {
        console.error('Fetch own posts error: ', error);
        return next(error);
    }
}

const viewFavoritePosts = async (req, res, next) => {
    const user = req.user;

    try {
        const favoritePostIds = user.favoritePosts || [];

        const favoritePosts = await Post.find({ _id: { $in: favoritePostIds } }).sort({ createdAt: -1 }).lean();
        const message = favoritePosts.length > 0 ? 'Favorite posts fetched successfully' : 'No favorite posts available';

        const meta = {
            total: favoritePosts.length,
            sortedBy: 'createdAt',
            order: 'desc',
        }

        const response = new CustomResponse(res);
        return response.success(message, favoritePosts, meta);
    } catch (error) {
        console.error('Fetch favorite posts error: ', error);
        return next(error);
    }
}

export default {
    viewOwnProfile,
    editOwnProfile,
    confirmEmailChange,
    changePassword,
    viewOwnPosts,
    viewFavoritePosts,
}
