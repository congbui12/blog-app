import bcrypt from "bcrypt";
import AppError from "../../utils/AppError.js";

const userApi = {
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
            console.log('Failed to update the password: ', error);
            return next(error);
        }
    },
}

export default userApi;
