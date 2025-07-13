import bcrypt from "bcrypt";
import AppError from "../../utils/AppError.js";
import User from "../../models/User.js";
// import Post from "../../models/Post.js";

const userController = {
    changePassword: async (req, res, next) => {
        const { oldPassword, newPassword } = req.body;
        const user = req.user;
        try {
            let isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
            if (!isOldPasswordCorrect) return next(new AppError('The old password is incorrect', 400));

            if (oldPassword === newPassword) return next(new AppError('The new password must be different from the old password', 400));

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            return res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            console.log('Error while changing the password: ', error);
            return next(error);
        }
    },
    getLikedPosts: async (req, res, next) => {
        const userId = req.user._id;
        try {
            const currentUser = await User.findById(userId).populate('likedPosts'); // either populate or Promise.all()

            const likedList = currentUser.likedPosts;
            if (likedList.length === 0) return res.status(200).json({ message: 'You have not liked any posts', data: [] });

            // const likedPosts = await Promise.all(
            //     likedList.map(postId => Post.findById(postId))
            // );
            return res
                .status(200)
                .json({
                    message: 'Liked posts fetched successfully',
                    user: currentUser.username,
                    totaLikes: likedList.length,
                    data: likedList,
                });
        } catch (error) {
            console.error('Error while fetching liked posts', error);
            return next(error);
        }
    },
}

export default userController;
